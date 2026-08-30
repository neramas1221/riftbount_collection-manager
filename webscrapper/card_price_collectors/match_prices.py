"""Match downloaded Cardmarket Price Guide + Product Catalogue files against
your live Spring Boot all_cards data, and write out per-variant price matches.

Why this isn't a plain join: Cardmarket's product export gives a card name and
an opaque numeric idExpansion (no collector number, no set name). Your
all_cards table keys on cardName + cardSet + collectorNumber, and separates
variants (isAlternative / isOverNumbered / isSignature) into their own rows.
So this script:

  1. Joins price_guide.json -> products_singles.json on idProduct (trivial).
  2. Maps each Cardmarket idExpansion to one of your CardSet rows using the
     cardMarketId array your /api/card-sets endpoint now returns. Any
     idExpansion not present on any CardSet is skipped and logged to
     unmatched_expansions.csv rather than guessed.
  3. Your all_cards rows encode their variant as a trailing "(...)" suffix
     in the name itself -- "Card Name (Alternate Art)", "(Overnumbered)",
     "(Signature)", "(Ultimate)", "(Metal)", and presumably others not seen
     yet. Not all of these have a matching boolean flag (e.g. "(Ultimate)"
     has alternative/overNumbered/signature all false), so the suffix TEXT
     itself -- not the flags -- is what identifies a variant. Any trailing
     "(...)" is stripped before matching against Cardmarket (whose names
     never carry one). Ordering is only ever "normal print is cheapest";
     when a card has 2+ non-normal variants (e.g. both Alternate Art and
     Ultimate), there's no reliable way to know which is pricier without
     card-specific knowledge, so those are logged to variant_mismatches.csv
     instead of guessed.
  4. Some promo prints of a card live under a *different* CardSet than the
     card's mainline set (e.g. "Renata Glasc - Chem-Baroness (Metal)" is
     filed under "Riftbound Organized Play Promotional Cards" while the
     plain card is under "Spiritforged"). When a (name, mapped-set) group
     has more Cardmarket products than all_cards rows, this looks for the
     shortfall among rows of the same base name sitting in any CardSet whose
     name contains "Promotional", and pulls those in if the count then
     lines up exactly.

Usage:
    python match_prices.py --price-guide price_guide_22.json --products products_singles_22.json
"""
from __future__ import annotations

import difflib
import json
import re
from collections import defaultdict
from dataclasses import dataclass
from datetime import datetime, timezone

import requests

# Matches a trailing "(...)" group, e.g. " (Alternate Art)", " (Ultimate)".
VARIANT_SUFFIX_RE = re.compile(r"\s*\(([^()]+)\)\s*$")


def extract_variant_suffix(name: str) -> str | None:
    m = VARIANT_SUFFIX_RE.search(name)
    return m.group(1).strip().lower() if m else None


def strip_variant_suffix(name: str) -> str:
    return VARIANT_SUFFIX_RE.sub("", name)


def normalize_name(name: str) -> str:
    name = strip_variant_suffix(name)
    name = name.replace("â", "'").replace("’", "'")
    name = re.sub(r"[^a-z0-9]", "", name.lower())
    return name


def variant_key(card: dict) -> str:
    suffix = extract_variant_suffix(card["cardName"])
    return suffix if suffix else "normal"


def _collector_sort_key(collector_number: str) -> tuple[int, int | str]:
    """Sorts collector numbers ascending numerically when possible, so the
    base print's number always sorts before the separate Overnumbered/
    Signature slot's (higher) number."""
    try:
        return (0, int(collector_number))
    except (TypeError, ValueError):
        return (1, collector_number)


# Sentinel set name for Cardmarket products whose idExpansion isn't mapped to
# any CardSet -- matched by name across your whole all_cards table instead of
# a specific set, since we don't know which set to look in.
UNKNOWN_SET_SENTINEL = "__unknown_set__"

# The one combination of 2+ variants with a known, reliable price
# relationship: Normal is cheapest, Signature is the priciest chase print,
# Overnumbered sits between them. Any other multi-variant combination (e.g.
# Alternate Art + Ultimate) has no established ordering and gets flagged for
# manual review instead of guessed.
KNOWN_VARIANT_ORDER = {"normal": 0, "overnumbered": 1, "signature": 2}


@dataclass
class CardmarketProduct:
    id_product: int
    name: str
    id_expansion: int
    id_metacard: int
    avg: float | None = None
    avg7: float | None = None
    avg30: float | None = None
    trend: float | None = None


def load_price_guide(path: str) -> dict[int, dict]:
    data = json.loads(open(path, encoding="utf-8").read())
    return {row["idProduct"]: row for row in data["priceGuides"]}


def load_products(path: str, prices: dict[int, dict]) -> list[CardmarketProduct]:
    data = json.loads(open(path, encoding="utf-8").read())
    products = []
    for row in data["products"]:
        price = prices.get(row["idProduct"], {})
        products.append(
            CardmarketProduct(
                id_product=row["idProduct"],
                name=row["name"],
                id_expansion=row["idExpansion"],
                id_metacard=row["idMetacard"],
                avg=price.get("avg"),
                avg7=price.get("avg7"),
                avg30=price.get("avg30"),
                trend=price.get("trend"),
            )
        )
    return products


def dedupe_by_metacard(products: list[CardmarketProduct]) -> list[CardmarketProduct]:
    """Cardmarket sometimes lists every variant of a card once per Vendetta
    expansion half (idExpansion 6587 and 6588), so a card with N real
    variants shows up as 2*N raw products, all sharing one idMetacard --
    confirmed directly: Jayce, Brilliant Inventor has 4 raw products (2 real
    variants x 2 expansion halves), Riven, Shattered the same. Collapsing
    the whole idMetacard group down to one product is wrong in that case --
    it would erase real variants, not just the duplicate listing. What's
    actually safe to collapse: when a group's members split evenly into two
    (or more) same-sized clusters by idExpansion, that's the full variant
    set being doubled per expansion half, so keep just one cluster's worth
    (whichever has the most real price data) instead of all of them."""
    by_metacard: dict[int, list[CardmarketProduct]] = defaultdict(list)
    for prod in products:
        by_metacard[prod.id_metacard].append(prod)

    deduped = []
    for group in by_metacard.values():
        by_expansion: dict[int, list[CardmarketProduct]] = defaultdict(list)
        for prod in group:
            by_expansion[prod.id_expansion].append(prod)
        cluster_sizes = {len(cluster) for cluster in by_expansion.values()}
        if len(by_expansion) > 1 and len(cluster_sizes) == 1:
            best_cluster = max(by_expansion.values(), key=lambda cluster: sum(p.avg is not None for p in cluster))
            deduped.extend(best_cluster)
        else:
            deduped.extend(group)
    return deduped


def fetch_all_cards(api_base: str) -> tuple[list[dict], dict[int, str], dict[int, list[str]]]:
    sets = requests.get(f"{api_base}/api/card-sets", timeout=10).json()
    set_names = {s["id"]: s["setName"] for s in sets}
    # A cardMarketId can be shared by more than one CardSet (the three promo
    # sets all carry the same [6322, 6483]), so this has to keep every
    # candidate set name rather than letting the last one processed clobber
    # the others.
    expansion_map: dict[int, list[str]] = defaultdict(list)
    for s in sets:
        for cm_id in s.get("cardMarketId") or []:
            expansion_map[cm_id].append(s["setName"])
    cards = requests.get(f"{api_base}/api/all-card", timeout=10).json()
    return cards, set_names, expansion_map


def match_cards(base_url: str, product_guide: str, price_guide: str) -> None:
    prices = load_price_guide(price_guide)
    cm_products = load_products(product_guide, prices)
    all_cards, set_names, expansion_map = fetch_all_cards(base_url)

    # Index your cards by (normalized name, set name) -> list of card dicts,
    # by normalized name alone (any set) for the promo-shortfall fallback,
    # and by normalized name restricted to promo sets for the unmapped-
    # expansion fallback (that one has to be scoped to promo sets only --
    # unlike the shortfall fallback, there's no already-matched set to add
    # to, so pooling every set's printings together would double count
    # variants that are already being matched against their own expansion).
    cards_by_key: dict[tuple[str, str], list[dict]] = defaultdict(list)
    cards_by_name_any_set: dict[str, list[dict]] = defaultdict(list)
    cards_by_name_promo_only: dict[str, list[dict]] = defaultdict(list)
    for card in all_cards:
        set_name = set_names.get(card["cardSet"])
        if set_name is None:
            continue
        norm_name = normalize_name(card["cardName"])
        cards_by_key[(norm_name, set_name)].append(card)
        cards_by_name_any_set[norm_name].append(card)
        if "promotional" in set_name.lower():
            cards_by_name_promo_only[norm_name].append(card)

    # Group Cardmarket products by (normalized name, mapped set name). When
    # an idExpansion is ambiguous (shared by multiple CardSets, e.g. the
    # three promo sets), try each candidate against what's actually in your
    # DB rather than committing to one arbitrarily -- otherwise a real card
    # filed under set B gets grouped under set A just because A happened to
    # be processed first/last when building expansion_map.
    cm_by_key: dict[tuple[str, str], list[CardmarketProduct]] = defaultdict(list)
    unmatched_expansions: dict[int, dict] = {}
    for prod in cm_products:
        candidate_sets = expansion_map.get(prod.id_expansion)
        norm_name = normalize_name(prod.name)
        if not candidate_sets:
            # This idExpansion isn't registered on any CardSet at all -- still
            # log it so the set mapping gets fixed eventually, but don't give
            # up on pricing the card: if a card with this name exists
            # anywhere in your DB, match against it directly rather than
            # requiring the set to be known first.
            entry = unmatched_expansions.setdefault(
                prod.id_expansion, {"idExpansion": prod.id_expansion, "sample_name": prod.name, "count": 0}
            )
            entry["count"] += 1
            if norm_name in cards_by_name_promo_only:
                cm_by_key[(norm_name, UNKNOWN_SET_SENTINEL)].append(prod)
            continue
        set_name = next((c for c in candidate_sets if (norm_name, c) in cards_by_key), candidate_sets[0])
        cm_by_key[(norm_name, set_name)].append(prod)

    matched_rows = []
    mismatch_rows = []

    for key, raw_cm_list in cm_by_key.items():
        cm_list = dedupe_by_metacard(raw_cm_list)
        if key[1] == UNKNOWN_SET_SENTINEL:
            card_list = cards_by_name_promo_only.get(key[0])
        else:
            card_list = cards_by_key.get(key)
        if card_list is None:
            # try fuzzy match within the same mapped set as a fallback
            norm_name, set_name = key
            candidates = [k for k in cards_by_key if k[1] == set_name]
            best = difflib.get_close_matches(norm_name, [c[0] for c in candidates], n=1, cutoff=0.85)
            if best:
                card_list = cards_by_key[(best[0], set_name)]
            else:
                mismatch_rows.append(
                    {
                        "card_name": cm_list[0].name,
                        "set_name": set_name,
                        "reason": "no matching all_cards row",
                        "num_allcard_variants": 0,
                        "num_cardmarket_products": len(cm_list),
                        "cardmarket_id_products": ",".join(str(p.id_product) for p in cm_list),
                    }
                )
                continue

        used_promo_fallback = False
        if len(card_list) < len(cm_list):
            # Shortfall: look for the missing variant(s) sitting under a promo
            # CardSet instead of the mapped set (e.g. a "(Metal)" promo print).
            norm_name = key[0]
            needed = len(cm_list) - len(card_list)
            already_ids = {c["id"] for c in card_list}
            promo_candidates = [
                c
                for c in cards_by_name_any_set.get(norm_name, [])
                if c["id"] not in already_ids and "promotional" in set_names.get(c["cardSet"], "").lower()
            ]
            if len(promo_candidates) == needed:
                card_list = card_list + promo_candidates
                used_promo_fallback = True

        if len(card_list) != len(cm_list):
            mismatch_rows.append(
                {
                    "card_name": cm_list[0].name,
                    "set_name": key[1],
                    "reason": "variant count mismatch",
                    "num_allcard_variants": len(card_list),
                    "existing_variants": ",".join(sorted(variant_key(c) for c in card_list)),
                    "num_cardmarket_products": len(cm_list),
                    "cardmarket_id_products": ",".join(str(p.id_product) for p in cm_list),
                }
            )
            continue

        # Split the group into clusters by collector number. Alternate Art
        # always shares its Normal print's number; Overnumbered and
        # Signature always share a separate, distinct number of their own.
        # That split is exactly where Cardmarket's price jumps happen too
        # (confirmed against real data: Irelia, Fervent's 4 products split
        # into a ~$17-19 pair and a $160-837 pair, lining up perfectly with
        # her two collector numbers) -- so prices only need to be compared
        # *within* a cluster, never across clusters. That's what lets Baron
        # Nashor-style cases resolve too: Alternate Art and Ultimate end up
        # in different clusters and never have to be ranked against each
        # other at all.
        clusters_by_collector: dict[str, list[dict]] = defaultdict(list)
        for c in card_list:
            clusters_by_collector[c["collectorNumber"]].append(c)
        ordered_collectors = sorted(clusters_by_collector, key=_collector_sort_key)

        # A single cluster can still be internally ambiguous (e.g. its own
        # Alternate Art + Ultimate sharing one collector number) -- flag the
        # whole group rather than guess within it.
        ambiguous = any(
            len([c for c in cluster if variant_key(c) != "normal"]) > 1
            and not {variant_key(c) for c in cluster} <= KNOWN_VARIANT_ORDER.keys()
            for cluster in clusters_by_collector.values()
        )
        if ambiguous:
            mismatch_rows.append(
                {
                    "card_name": cm_list[0].name,
                    "set_name": key[1],
                    "reason": "multiple unranked special variants",
                    "num_allcard_variants": len(card_list),
                    "existing_variants": ",".join(sorted(variant_key(c) for c in card_list)),
                    "num_cardmarket_products": len(cm_list),
                    "cardmarket_id_products": ",".join(str(p.id_product) for p in cm_list),
                }
            )
            continue

        # Cardmarket doesn't carry a collector number, so line its products
        # up with your clusters by price: sort everything ascending and hand
        # out chunks matching each cluster's size, in ascending-collector-
        # number order. This only assumes each cluster as a *group* gets
        # pricier as collector number increases -- never that two variants
        # in different clusters are individually ranked against each other.
        sorted_cm = sorted(cm_list, key=lambda p: (p.avg is None, p.avg or 0))
        cm_index = 0
        for collector_number in ordered_collectors:
            cluster = clusters_by_collector[collector_number]
            cm_chunk = sorted_cm[cm_index : cm_index + len(cluster)]
            cm_index += len(cluster)

            sorted_cluster_cards = sorted(cluster, key=lambda c: KNOWN_VARIANT_ORDER.get(variant_key(c), 99))

            for card, prod in zip(sorted_cluster_cards, cm_chunk):
                matched_rows.append(
                    {
                        "all_card_id": card["id"],
                        "card_name": card["cardName"],
                        "set_name": set_names.get(card["cardSet"], key[1]),
                        "collector_number": card["collectorNumber"],
                        "variant": variant_key(card),
                        "cross_set_promo_match": used_promo_fallback,
                        "cardmarket_id_product": prod.id_product,
                        "avg": prod.avg,
                        "avg7": prod.avg7,
                        "avg30": prod.avg30,
                        "trend": prod.trend,
                        "matched_at": datetime.now(timezone.utc).isoformat(),
                    }
                )

    return matched_rows

