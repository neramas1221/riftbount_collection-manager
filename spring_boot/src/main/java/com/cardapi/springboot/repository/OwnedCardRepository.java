package com.cardapi.springboot.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.cardapi.springboot.entity.OwnedCard;

@Repository
public interface OwnedCardRepository extends JpaRepository<OwnedCard, Integer> {
    
    Optional<OwnedCard> findByAllCardId(int allCardId);

    @Modifying
    @Query(value = """
        INSERT INTO owned_cards (all_cards_id , quantity) 
        VALUES (:allCardId, :quantity) 
        ON CONFLICT (all_cards_id) 
        DO UPDATE SET quantity = EXCLUDED.quantity
        """, nativeQuery = true)
    void upsertCardQuantity(
        @Param("allCardId") Integer allCardId,
        @Param("quantity") int quantity
    );
}