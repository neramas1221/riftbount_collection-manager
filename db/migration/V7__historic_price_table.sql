CREATE TABLE historic_prices(
    id SERIAL PRIMARY key,
    card_id INTEGER NOT NULL,
    date_time Date NOT NULL,
    price FLOAT,
    CONSTRAINT fk_card_id
        foreign key(card_id)
        references all_cards(id)
);