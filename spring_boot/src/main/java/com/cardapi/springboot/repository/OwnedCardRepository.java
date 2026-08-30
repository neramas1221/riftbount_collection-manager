package com.cardapi.springboot.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.cardapi.springboot.entity.OwnedCard;

@Repository
public interface OwnedCardRepository extends JpaRepository<OwnedCard, Integer> {
    
    Optional<OwnedCard> findByAllCardId(int allCardId);
}