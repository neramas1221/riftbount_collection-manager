package com.cardapi.springboot.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.cardapi.springboot.entity.AllCard;

@Repository
public interface AllCardRepository extends JpaRepository<AllCard, Integer> {
    
}
