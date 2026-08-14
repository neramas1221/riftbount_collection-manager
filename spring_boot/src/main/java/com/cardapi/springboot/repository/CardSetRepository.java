package com.cardapi.springboot.repository;

import com.cardapi.springboot.entity.CardSet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CardSetRepository extends JpaRepository<CardSet, Integer>{
    
}