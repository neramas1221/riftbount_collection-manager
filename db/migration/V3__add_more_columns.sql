CREATE TABLE sub_types (
    id SERIAL PRIMARY key,
    sub_type VARCHAR(20) NOT NULL
);

ALTER TABLE all_cards
ADD COLUMN energy INTEGER,
ADD COLUMN might INTEGER,
ADD COLUMN power INTEGER,
ADD COLUMN subtype_id INTEGER,
ADD COLUMN is_signiture BOOLEAN NOT NULL,
ADD CONSTRAINT fk_sub_type_id
    foreign key (subtype_id)
    references sub_types(id);

ALTER TABLE card_sets 
ADD COLUMN total_collector_num INTEGER NOT NULL; 
