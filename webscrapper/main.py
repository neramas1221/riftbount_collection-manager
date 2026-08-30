from populators.collectors import get_all_cards
from populators.populator import populate
from card_price_collectors.price_creater import price_creater

import argparse

def main(force: bool):
    get_all_cards(force)
    populate()
    price_creater()

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--force", required=False, default=False)
    args = vars(parser.parse_args())
    main(args.get("force"))