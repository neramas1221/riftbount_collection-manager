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
import com.cardapi.springboot.entity.SuperType;
import com.cardapi.springboot.repository.AllCardRepository;
import com.cardapi.springboot.repository.CardColourRepository;
import com.cardapi.springboot.repository.CardSetRepository;
import com.cardapi.springboot.repository.CardTypeRepository;
import com.cardapi.springboot.repository.SuperTypeRepository;
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
    private final SuperTypeRepository superTypeRepository;

    public List<AllCardResponse> getAllCard() {
            return repository.findAll().stream()
                .map(this::mapToResponse) // Much cleaner now!
                .collect(Collectors.toList());
        }

    public AllCardResponse createAllCard(AllCardRequest request){
        CardSet set = setRepository.findById(request.getCardSet()).orElseThrow();
        CardType type = typeRepository.findById(request.getCardType()).orElseThrow();
        CardColour colour = colourRepository.findById(request.getCardColour()).orElseThrow();
        SuperType superType = superTypeRepository.findById(request.getSuperType()).orElseThrow();
        
        AllCard newCard = new AllCard();
        newCard.setCardName(request.getCardName());
        newCard.setCardSet(set);
        newCard.setOverNumbered(request.isOverNumered());
        newCard.setAlternative(request.isAlternative());
        newCard.setCardType(type);
        newCard.setCardColour(colour);
        newCard.setIsToken(request.getIsToken());
        newCard.setCollectorNumber(request.getCollectorNumber());
        newCard.setCardPrice(request.getCardPrice());
        newCard.setEnergy(request.getEnergy());
        newCard.setMight(request.getMight());
        newCard.setPower(request.getPower());
        newCard.setSubType(request.getSubType());
        newCard.setSignature(request.isSignature());
        newCard.setSuperType(superType);

        AllCard savedCard = repository.save(newCard);

        return mapToResponse(savedCard);
    }

    public List<AllCardResponse> getCardsByColour(String colourName) {
        return repository.findByCardColour_ColourIgnoreCase(colourName).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<AllCardResponse> getCardByName(String cardName){
        return repository.findByCardName_CardNameIgnoreCase(cardName).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
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
            card.getSubType(), 
            card.isSignature(),
            card.getSuperType().getId()
        );
    }
}
