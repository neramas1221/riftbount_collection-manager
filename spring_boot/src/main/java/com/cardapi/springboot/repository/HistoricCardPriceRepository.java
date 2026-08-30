package com.cardapi.springboot.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.cardapi.springboot.entity.HistoricPrices;

@Repository
public interface HistoricCardPriceRepository extends JpaRepository<HistoricPrices, Integer> {
    
}
