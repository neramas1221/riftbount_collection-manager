package com.cardapi.springboot.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.cardapi.springboot.entity.AllCard;

@Repository
public interface AllCardRepository extends JpaRepository<AllCard, Integer>, JpaSpecificationExecutor<AllCard> {
    List<AllCard> findByCardColour_ColourIgnoreCase(String colourName);
    List<AllCard> findByCardName_CardNameIgnoreCase(String cardName);
}
