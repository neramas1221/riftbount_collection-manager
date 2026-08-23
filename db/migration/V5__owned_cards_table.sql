CREATE TABLE owned_cards (
    ADD COLUMN id SERIAL PRIMARY key,
    ADD COLUMN all_cards_id INTEGER NOT NULL,
    ADD COLUMN quantity INTEGER NOT NULL,
    CONSTRAINT fk_all_card_ids
    foreign key (all_cards_id)
    references all_cards(id);
)