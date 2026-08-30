from card_price_collectors.card_market import get_card_market_data, update_card_price
from card_price_collectors.match_prices import match_cards
import card_price_collectors.config as config


def populate_prices(card_id: int, price: float):
    update_card_price(card_id, price)

def price_creater():
    get_card_market_data()
    card_data = match_cards(config.base_url, config.card_market_data[0][1], config.card_market_data[1][1])
    print(card_data)
    for card in card_data:
        card_price = 0.0 if card["avg30"] is None else card["avg30"]
        print(card)
        populate_prices(card["all_card_id"], card_price)

if __name__ == "__main__":
    price_creater()