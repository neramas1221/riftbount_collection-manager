package com.cardapi.springboot.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.cardapi.springboot.dto.AllCardRequest;
import com.cardapi.springboot.dto.AllCardResponse;
import com.cardapi.springboot.entity.AllCard;
import com.cardapi.springboot.entity.CardColour;
import com.cardapi.springboot.entity.CardSet;
import com.cardapi.springboot.entity.CardType;
import com.cardapi.springboot.entity.SubType;
import com.cardapi.springboot.repository.AllCardRepository;
import com.cardapi.springboot.repository.CardColourRepository;
import com.cardapi.springboot.repository.CardSetRepository;
import com.cardapi.springboot.repository.CardTypeRepository;
import com.cardapi.springboot.repository.SubTypeRepository;
import com.cardapi.springboot.specification.AllCardSpecification;
import com.cardapi.springboot.dto.UserCardFilterRequest;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AllCardService {
    private final AllCardRepository repository;
    private final CardSetRepository setRepository;
    private final CardTypeRepository typeRepository;
    private final CardColourRepository colourRepository;
    private final SubTypeRepository subTypeRepository;

    public List<AllCardResponse> getAllCard() {
            return repository.findAll().stream()
                .map(this::mapToResponse) // Much cleaner now!
                .collect(Collectors.toList());
        }

    public AllCardResponse createAllCard(AllCardRequest request){
        CardSet set = setRepository.findById(request.getCardSet()).orElseThrow();
        CardType type = typeRepository.findById(request.getCardType()).orElseThrow();
        CardColour colour = colourRepository.findById(request.getCardColour()).orElseThrow();
        SubType subType = subTypeRepository.findById(request.getCardSet()).orElseThrow();
        
        AllCard newCard = new AllCard();
        newCard.setCardName(request.getCardName());
        newCard.setCardSet(set);
        newCard.setOverNumbered(request.getIsOverNumbered());
        newCard.setAlternative(request.getIsAlternative());
        newCard.setCardType(type);
        newCard.setCardColour(colour);
        newCard.setIsToken(request.getIsToken());
        newCard.setCollectorNumber(request.getCollectorNumber());
        newCard.setCardPrice(request.getCardPrice());
        newCard.setEnergy(request.getEnergy());
        newCard.setMight(request.getMight());
        newCard.setPower(request.getPower());
        newCard.setSubType(subType);
        newCard.setSignature(request.getIsSignature());

        AllCard savedCard = repository.save(newCard);

        return new AllCardResponse(savedCard.getId(), 
            savedCard.getCardName(), 
            savedCard.getCardSet().getId(), 
            savedCard.isOverNumbered(), 
            savedCard.isAlternative(), 
            savedCard.getCardType().getId(), 
            savedCard.getCardColour().getId(), 
            savedCard.getIsToken(), 
            savedCard.getCollectorNumber(), 
            savedCard.getCardPrice(),
            savedCard.getEnergy(),
            savedCard.getMight(),
            savedCard.getPower(),
            savedCard.getSubType().getId(),
            savedCard.isSignature()); 
    }

    public List<AllCard> getCardsByColour(String colourName) {
        return repository.findByCardColour_ColourIgnoreCase(colourName);
    }

    public List<AllCard> getCardByName(String cardName){
        return repository.findByCardName_CardNameIgnoreCase(cardName);
    }

    public List<AllCardResponse> searchCards(UserCardFilterRequest filter){
        Specification<AllCard> spec = AllCardSpecification.buildFilterSpec(filter);
        
        return repository.findAll(spec).stream()
                .map(this::mapToResponse) 
                .collect(Collectors.toList());
    }

    private AllCardResponse mapToResponse(AllCard card) {
        return new AllCardResponse(
            card.getId(), 
            card.getCardName(), 
            card.getCardSet().getId(),
            card.isOverNumbered(), 
            card.isAlternative(), 
            card.getCardType().getId(),
            card.getCardColour().getId(),
            card.getIsToken(), 
            card.getCollectorNumber(), 
            card.getCardPrice(),
            card.getEnergy(),
            card.getMight(),
            card.getPower(),
            card.getSubType().getId(),
            card.isSignature()
        );
    }
}
