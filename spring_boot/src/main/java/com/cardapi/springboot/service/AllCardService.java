package com.cardapi.springboot.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.cardapi.springboot.dto.AllCardRequest;
import com.cardapi.springboot.dto.AllCardResponse;
import com.cardapi.springboot.entity.AllCard;
import com.cardapi.springboot.entity.CardColour;
import com.cardapi.springboot.entity.CardSet;
import com.cardapi.springboot.entity.CardType;
import com.cardapi.springboot.repository.AllCardRepository;
import com.cardapi.springboot.repository.CardColourRepository;
import com.cardapi.springboot.repository.CardSetRepository;
import com.cardapi.springboot.repository.CardTypeRepository;

@Service
public class AllCardService {
    private final AllCardRepository repository;
    private final CardSetRepository setRepository;
    private final CardTypeRepository typeRepository;
    private final CardColourRepository colourRepository;

    public AllCardService(AllCardRepository repository, 
                          CardSetRepository setRepository,
                          CardTypeRepository typeRepository, 
                          CardColourRepository colourRepository) {
        this.repository = repository;
        this.setRepository = setRepository;
        this.typeRepository = typeRepository;
        this.colourRepository = colourRepository;
    }

    public List<AllCardResponse> getAllCard(){
        return repository.findAll().stream()
            .map(card -> new AllCardResponse(
                card.getId(), 
                card.getCardName(), 
                card.getCardSet().getId(),
                card.getIsOverNumbered(), 
                card.getIsAlternative(), 
                card.getCardType().getId(),
                card.getCardColour().getId(),
                card.getIsToken(), 
                card.getCollectorNumber(), 
                card.getCardPrice(),
                card.getEnergy(),
                card.getMight(),
                card.getPower(),
                card.getSubType().getId(),
                card.getIsSignature()
            ))
            .collect(Collectors.toList());
    }

    public AllCardResponse createAllCard(AllCardRequest request){
        CardSet set = setRepository.findById(request.getCardSet()).orElseThrow();
        CardType type = typeRepository.findById(request.getCardType()).orElseThrow();
        CardColour colour = colourRepository.findById(request.getCardColour()).orElseThrow();
        AllCard newCard = new AllCard();
        newCard.setCardName(request.getCardName());
        newCard.setCardSet(set);
        newCard.setIsOverNumbered(request.getIsOverNumbered());
        newCard.setIsAlternative(request.getIsAlternative());
        newCard.setCardType(type);
        newCard.setCardColour(colour);
        newCard.setIsToken(request.getIsToken());
        newCard.setCollectorNumber(request.getCollectorNumber());
        newCard.setCardPrice(request.getCardPrice());

        AllCard savedCard = repository.save(newCard);

        return new AllCardResponse(savedCard.getId(), 
            savedCard.getCardName(), 
            savedCard.getCardSet().getId(), 
            savedCard.getIsOverNumbered(), 
            savedCard.getIsAlternative(), 
            savedCard.getCardType().getId(), 
            savedCard.getCardColour().getId(), 
            savedCard.getIsToken(), 
            savedCard.getCollectorNumber(), 
            savedCard.getCardPrice(),
            savedCard.getEnergy(),
            savedCard.getMight(),
            savedCard.getPower(),
            savedCard.getSubType().getId(),
            savedCard.getIsSignature()); 
    }
}
