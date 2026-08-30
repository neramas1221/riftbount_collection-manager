CREATE TABLE owned_cards (
    id SERIAL PRIMARY key,
    all_cards_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    CONSTRAINT fk_all_card_ids
    foreign key (all_cards_id)
    references all_cards(id)
);