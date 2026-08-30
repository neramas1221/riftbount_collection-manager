import requests
import card_price_collectors.config as cfg

def _get_card_market_data(url: str, file_name: str):
    with requests.get(url=url, stream=True) as r:
        r.raise_for_status()
        with open(file_name, "wb") as f:
            for chunk in r.iter_content(8192):
                f.write(chunk)


def get_card_market_data():
    for url, file_name in cfg.card_market_data:
        _get_card_market_data(url, file_name)


def _update_card_price(id: int, price: float):
    print(price)
    res = requests.patch(f"{cfg.base_url}/api/all-card/{id}/card-price", params={"cardPrice": price})
    print(res)


def update_card_price(id: int, price: float):
    _update_card_price(id, price)


if __name__ == "__main":
    get_card_market_data()