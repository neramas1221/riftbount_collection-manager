package com.cardapi.springboot.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.cardapi.springboot.entity.CardRarity;

@Repository
public interface CardRarityRepository extends JpaRepository<CardRarity, Integer> {
    Optional<CardRarity> findByRarity(String rarity);
    Optional<CardRarity> findByRarityIgnoreCase(String rarity);
}