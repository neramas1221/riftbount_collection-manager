package com.cardapi.springboot.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.cardapi.springboot.entity.AllCard;

@Repository
public interface AllCardRepository extends JpaRepository<AllCard, Integer>, JpaSpecificationExecutor<AllCard> {
    List<AllCard> findByCardColour_ColourIgnoreCase(String colourName);
    List<AllCard> findByCardNameIgnoreCase(String cardName);
    Optional<AllCard> findByCardSet_IdAndCardNameAndCollectorNumberAndIsAlternativeAndIsOverNumberedAndIsSignature(int cardSetId, String cardName, String collectorNumber, 
                                                                                                        boolean isAlteranative, boolean isOverNumbered, 
                                                                                                        boolean isSignature);
    Optional<AllCard> findByCardSet(String cardSet);
    Optional<AllCard> findByRiftBoundId(String riftBoundId);
}
