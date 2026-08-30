import requests
from populators import config
import glob
import time
import json
import itertools
import shutil
import os
import tqdm


def _get_sets():
    set_data = requests.get(f"{config.base_url}/sets").json()["items"]

    for set_info in tqdm.tqdm(set_data):
        max_pages = 1
        
        all_cards = []
        current_page = 1
        set_id = set_info["set_id"]
        while current_page <= max_pages:
            res = requests.get(f"{config.base_url}{config.card_url}?set_id={set_id}&page={current_page}").json()

            if current_page == 1:
                max_pages = res.get("pages", 1)

            for item in tqdm.tqdm(res.get("items", []), leave=False, desc="Card loop" ):
                all_cards.append(item)
                
            current_page += 1
            time.sleep(0.1)

        card_dict = all_cards
        
        filepath = os.path.join(config.DATA_DIR, f"{set_id}_all_card_sets.json")
        with open(filepath, "w") as f:
            json.dump(card_dict, f, indent=4)


def _get_all_domains():
    results = requests.get(config.base_url + "/index/domains").json()

    domains = results["values"]

    all_domains = set(domains)
    pairs = itertools.combinations(all_domains, 2)

    final_domains = [{"domain": dom} for dom in all_domains]

    for pair in pairs:
        if "Colorless" not in pair:
            final_domains.append({"domain": f"{pair[0]}-{pair[1]}"})
            final_domains.append({"domain": f"{pair[1]}-{pair[0]}"})

    filepath = os.path.join(config.DATA_DIR, "domains.json")
    with open(filepath, "w") as f:
        json.dump(final_domains, f, indent=4)


def _get_card_rarities():
    results = requests.get(config.base_url + "/index/rarities").json()

    card_rarities = results["values"]

    filepath = os.path.join(config.DATA_DIR, "card_rarities.json")
    with open(filepath, "w") as f:
        json.dump(card_rarities, f, indent=4)


def _get_card_types():
    results = requests.get(config.base_url + "/index/card-types").json()

    types = results["values"]

    filepath = os.path.join(config.DATA_DIR, "types.json")
    with open(filepath, "w") as f:
        json.dump(types, f, indent=4)


def _get_card_super_types():
    results = requests.get(config.base_url + "/index/card-supertypes").json()

    super_types = results["values"]

    filepath = os.path.join(config.DATA_DIR, "super_type.json")
    with open(filepath, "w") as f:
        json.dump(super_types, f, indent=4)


def _populate_card_market_ids():
    ids = {
        "Unleashed": [6491],
       "Vendetta": [6587, 6588]
    }

    with open(f"{config.DATA_DIR}/set_fixing.json", "w") as f:
        json.dump(ids, f)


def check_if_data_exists():
    print("Getting sets...")
    _get_sets()
    print("Getting domains...")
    _get_all_domains()
    print("Getting rarities...")
    _get_card_rarities()
    print("Getting super types...")
    _get_card_super_types()
    print("Getting types...")
    _get_card_types()
    _populate_card_market_ids()


def get_all_cards(force: bool = False):
    if os.path.exists(config.DATA_DIR) and force:
        shutil.rmtree(config.DATA_DIR)

    os.makedirs(config.DATA_DIR, exist_ok=True)
    check_if_data_exists()