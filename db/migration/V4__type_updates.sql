CREATE TABLE super_types (
    id SERIAL PRIMARY key,
    super_type VARCHAR(50) NOT NULL
);

ALTER TABLE all_cards 
DROP CONSTRAINT fk_sub_type_id;

ALTER TABLE all_cards 
DROP COLUMN subtype_id;

DROP TABLE sub_types;

ALTER TABLE all_cards 
ADD COLUMN subtypes TEXT[];

CREATE INDEX idx_all_cards_subtypes ON all_cards USING GIN (subtypes);

ALTER TABLE all_cards
ADD COLUMN super_type_id INTEGER,
ADD CONSTRAINT sk_super_type_id
    foreign key (super_type_id)
    references super_types(id);

ALTER TABLE all_cards 
RENAME COLUMN is_signiture TO is_signature;