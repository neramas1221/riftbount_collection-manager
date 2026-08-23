package com.cardapi.springboot.repository;

import com.cardapi.springboot.entity.CardType;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CardTypeRepository extends JpaRepository<CardType, Integer> {
    Optional<CardType> findByCardType(String cardType);
}