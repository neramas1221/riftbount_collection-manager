CREATE TABLE card_types (
    id SERIAL PRIMARY KEY,
    type VARCHAR (50) UNIQUE NOT NULL
);

CREATE TABLE card_sets (
    id SERIAL PRIMARY KEY,
    set_name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE colours (
    id SERIAL PRIMARY KEY,
    colour VARCHAR(20) UNIQUE NOT NULL
);

CREATE TABLE all_cards (
    id SERIAL PRIMARY KEY,
    card_name TEXT NOT NULL,
    set_id INTEGER NOT NULL,
    is_over_numbered BOOLEAN NOT NULL,
    is_alternative BOOLEAN NOT NULL,
    type_id INTEGER NOT NULL,
    colour_id INTEGER NOT NULL,
    is_token INTEGER NOT NULL,
    collector_number TEXT NOT NULL,
    recent_price FLOAT NOT NULL,
    CONSTRAINT kf_set_id
        foreign key (set_id) 
        references card_sets(id),
    CONSTRAINT kf_type_id
        foreign key (type_id) 
        references card_types(id),
    CONSTRAINT fk_colour 
        foreign key (colour_id) 
        references colours(id) 
);