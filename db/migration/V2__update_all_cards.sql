CREATE TABLE rarites (
    id SERIAL PRIMARY KEY,
    rarite VARCHAR(50)
);

ALTER TABLE all_cards
ADD COLUMN rarity_id INTEGER;

ALTER TABLE all_cards
ADD CONSTRAINT fk_rarity
    foreign key (rarity_id)
    references rarites(id);

ALTER TABLE all_cards
ADD COLUMN card_image_url TEXT;
