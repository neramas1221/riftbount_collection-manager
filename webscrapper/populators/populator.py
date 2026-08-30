import requests
import json
from populators import config
import urllib
import glob
import tqdm
from datetime import datetime


def _populate_sets(set_name: str, card_count: int, card_market_id: list[int]):
    try:
        payload = {"setName": set_name, "totalCollectorNum": card_count, "cardMarketId": card_market_id}
        res = requests.post(f"{config.card_api_url}/card-sets", json=payload)
        res.raise_for_status()
    except requests.exceptions.HTTPError as e:
        print(f"HTTP error occurred: {e}")
        raise
    except requests.exceptions.RequestException as e:
        print(f"Request error occurred: {e}")
        raise


def _populate_type(card_type: str):
    try:
        payload = {"type": card_type}
        res = requests.post(f"{config.card_api_url}/card-types", json=payload)
        res.raise_for_status()
    except requests.exceptions.HTTPError as e:
        print(f"A HTTP error occured: {e}")
        raise
    except requests.exceptions.RequestException as e:
        print(f"Request error occured: {e}")
        raise


def _populate_super_type(super_type: str):
    try:
        payload = {"superTypeName": super_type}
        res = requests.post(f"{config.card_api_url}/super-types", json=payload)
        res.raise_for_status()
    except requests.exceptions.HTTPError as e:
        print(f"A HTTP error occured: {e}")
        raise
    except requests.exceptions.RequestException as e:
        print(f"Request error occured: {e}")
        raise


def _populate_domains(domain_colour: str):
    try:
        payload = {"colour": domain_colour}
        res = requests.post(f"{config.card_api_url}/card-colour", json=payload)
    except requests.exceptions.HTTPError as e:
        print(f"A HTTP error occured: {e}")
        raise
    except requests.exceptions.RequestException as e:
        print(f"Request error occured: {e}")
        raise


def _populate_rarities(rarity: str):
    try:
        payload = {"rarity": rarity}
        res = requests.post(f"{config.card_api_url}/card-raritys", json=payload)
    except requests.exceptions.HTTPError as e:
        print(f"A HTTP error occured: {e}")
        raise
    except requests.exceptions.RequestException as e:
        print(f"Request error occured: {e}")
        raise


def populate_meta_data():
    with open("datasets/super_type.json", "r") as f:
        super_types = json.load(f)

    for sup_type in super_types:
        _populate_super_type(sup_type)

    with open("datasets/types.json", "r") as f:
        types = json.load(f)

    for t in types:
        _populate_type(t)

    with open("datasets/domains.json", "r") as f:
        domains = json.load(f)

    for domain in domains:
        _populate_domains(domain["domain"])

    with open("datasets/card_rarities.json", "r") as f:
        raritys = json.load(f)

    for rarity in raritys:
        _populate_rarities(rarity)

    set_data = requests.get(f"{config.base_url}/sets").json()
    with open("datasets/set_fixing.json", "r") as f:
        set_fixes = json.load(f)

    for set_info in set_data["items"]:
        if set_info["name"] in set_fixes.keys():
            _populate_sets(set_info["name"], set_info["card_count"], set_fixes[set_info["name"]])
        else:
            if type(set_info["cardmarket_id"]) != list:
                id_list = [int(set_info["cardmarket_id"])]
            else:
                id_list = [int(i) for i in set_info["cardmarket_id"]]
            _populate_sets(set_info["name"], set_info["card_count"], id_list)


def _get_cardset(card_set_name: str):
    try:
        if card_set_name == "Proving Grounds":
            card_set_name = "Origins: Proving Grounds"
        res = requests.get(f"{config.card_api_url}/card-sets/{card_set_name}")
        res.raise_for_status()
        return res.json()
    except requests.exceptions.HTTPError as e:
        print(f"Error: {e}")
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")


def _get_cardtype(card_type: str):
    try:
        res = requests.get(f"{config.card_api_url}/card-types/{card_type}")
        res.raise_for_status()
        return res.json()
    except requests.exceptions.HTTPError as e:
        print(f"Error: {e}")
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")


def _get_cardcolour(card_colour: list[str]):
    def _combine_domain(domain_list):
        domain = "-".join(domain_list)
        return urllib.parse.quote(domain, safe='')
    if len(card_colour) > 1:
        colour_str = _combine_domain(card_colour)
    else:
        colour_str = card_colour[0]

    try:
        res = requests.get(f"{config.card_api_url}/card-colour/{colour_str}/id")
        res.raise_for_status()
        return res.json()
    except requests.exceptions.HTTPError as e:
        print(f"Error: {e}")
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")


def _get_supertype(super_type: str):
    try:
        res = requests.get(f"{config.card_api_url}/super-types/name/{super_type}")
        res.raise_for_status()
        return res.json()
    except requests.exceptions.HTTPError as e:
        print(f"Error: {e}")
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")


def _get_rarity(card_rarity: str):
    try:
        res = requests.get(f"{config.card_api_url}/card-raritys/{card_rarity}")
        res.raise_for_status()
        return res.json()
    except requests.exceptions.HTTPError as e:
        print(f"Error: {e}")
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")


def _populate_card(card: dict):
    try:
        res = requests.post(f"{config.card_api_url}/all-card", json=card)
        res.raise_for_status()
        return res.json()
    except requests.exceptions.HTTPError as e:
        print(f"Error: {e}")
        raise
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")
        raise


def _check_over_numbered(card_dict: dict):
    for cards in card_dict:
        if "Overnumbered" in cards: 
            if not cards.replace("Overnumbered", "Signature") in card_dict:
                new_payload = card_dict[cards]
                new_payload["cardName"] = cards.replace("Overnumbered", "Signature")
                new_payload["isOverNumbered"] = False
                new_payload["isSignature"] = True
                _populate_card(new_payload)


def _filter_cards(cardset: list[dict]):
    clean_cards = {}
    for card_data in cardset:
        riftbound_id = card_data["riftbound_id"]
        if riftbound_id not in clean_cards:
            clean_cards[riftbound_id] = card_data
            continue

        stored = clean_cards[riftbound_id]
        stored_has_name = stored["metadata"]["clean_name"] is not None
        new_has_name = card_data["metadata"]["clean_name"] is not None

        if new_has_name and not stored_has_name:
            clean_cards[riftbound_id] = card_data
        elif stored_has_name and not new_has_name:
            pass
        else:
            stored_updated_on = datetime.fromisoformat(stored["metadata"]["updated_on"])
            new_updated_on = datetime.fromisoformat(card_data["metadata"]["updated_on"])
            if stored_updated_on < new_updated_on:
                clean_cards[riftbound_id] = card_data

    return clean_cards

def populate_cards():
    for json_file in tqdm.tqdm(glob.glob("datasets/*_sets.json")):
        with open(json_file, "r") as f:
            card_set = json.load(f)

        filtered_cards = _filter_cards(card_set)
        
        for card_data in filtered_cards.values():
            try:
                payload = {"cardName": card_data["name"],
                        "cardSet": _get_cardset(card_data["set"]["label"]),
                        "isOverNumbered": card_data["metadata"]["overnumbered"],
                        "isAlternative": card_data["metadata"]["alternate_art"],
                        "cardType": _get_cardtype(card_data["classification"]["type"]),
                        "cardColour": _get_cardcolour(card_data["classification"]["domain"]),
                        "isToken": 0,
                        "collectorNumber": card_data["collector_number"],
                        "cardPrice": 0.0,
                        "energy": card_data["attributes"]["energy"],
                        "might": card_data["attributes"]["might"],
                        "power": card_data["attributes"]["power"],
                        "subType": card_data["tags"],
                        "isSignature": card_data["metadata"]["signature"],
                        "superType": _get_supertype(card_data["classification"]["supertype"])["id"] if card_data["classification"]["supertype"] else None,
                        "cardRarity": _get_rarity(card_data["classification"]["rarity"]),
                        "cardImageUrl": card_data["media"]["image_url"],
                        "riftBoundId": card_data["riftbound_id"]
                }

                _populate_card(payload)

            except ValueError as e:
                print(f"Error: {e}\n{card_data['name']}")
                raise


def populate():
    print("Populating meta data...")
    populate_meta_data()
    print("populating cards...")
    populate_cards()