ALTER TABLE owned_cards
ADD CONSTRAINT uq_owned_cards_all_card_id Unique
(all_cards_id);