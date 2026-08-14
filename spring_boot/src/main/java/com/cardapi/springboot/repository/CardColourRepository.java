package com.cardapi.springboot.repository;

import com.cardapi.springboot.entity.CardColour;
import org.springframework.stereotype.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

@Repository
public interface CardColourRepository extends JpaRepository<CardColour, Integer> {

    Optional<CardColour> findByColour(String colour);
    
}