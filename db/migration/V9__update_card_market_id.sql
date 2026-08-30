ALTER TABLE card_sets
ALTER COLUMN card_market_set_id TYPE INTEGER[]
USING CASE
    WHEN card_market_set_id IS NOT NULL THEN ARRAY[card_market_set_id]
    ELSE NULL
END;