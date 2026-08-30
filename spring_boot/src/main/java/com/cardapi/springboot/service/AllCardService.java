package com.cardapi.springboot.service;

import java.util.Optional;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import com.cardapi.springboot.dto.AllCardRequest;
import com.cardapi.springboot.dto.AllCardResponse;
import com.cardapi.springboot.entity.AllCard;
import com.cardapi.springboot.entity.CardColour;
import com.cardapi.springboot.entity.CardRarity;
import com.cardapi.springboot.entity.CardSet;
import com.cardapi.springboot.entity.CardType;
import com.cardapi.springboot.entity.SuperType;
import com.cardapi.springboot.repository.AllCardRepository;
import com.cardapi.springboot.repository.CardColourRepository;
import com.cardapi.springboot.repository.CardRarityRepository;
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
    private final CardRarityRepository cardRarityRepository;

    public List<AllCardResponse> getAllCard() {
            return repository.findAll().stream()
                .map(this::mapToResponse) // Much cleaner now!
                .collect(Collectors.toList());
        }

    public AllCardResponse createAllCard(AllCardRequest request){
        Optional<AllCard> existing = repository.findByRiftBoundId(request.getRiftBoundId());

        if (existing.isPresent()){
            return mapToResponse(existing.get());
        }


        CardSet set = setRepository.findById(request.getCardSet()).orElseThrow();
        CardType type = typeRepository.findById(request.getCardType()).orElseThrow();
        CardColour colour = colourRepository.findById(request.getCardColour()).orElseThrow();

        SuperType superType = request.getSuperType() != null
                ? superTypeRepository.findById(request.getSuperType()).orElse(null)
                : null;
        CardRarity cardRarity = cardRarityRepository.findById(request.getCardRarity()).orElseThrow();
        AllCard newCard = AllCard.builder()
                    .cardName(request.getCardName())
                    .cardSet(set)
                    .isOverNumbered(request.isOverNumbered())
                    .isAlternative(request.isAlternative())
                    .cardType(type)
                    .cardColour(colour)
                    .isToken(request.getIsToken())
                    .collectorNumber(request.getCollectorNumber())
                    .cardPrice(request.getCardPrice())
                    .energy(request.getEnergy())
                    .might(request.getMight())
                    .power(request.getPower())
                    .subType(request.getSubType())
                    .isSignature(request.isSignature())
                    .superType(superType)
                    .cardRarity(cardRarity)
                    .cardImageUrl(request.getCardImageUrl())
                    .riftBoundId(request.getRiftBoundId())
                    .build();

        AllCard savedCard = repository.save(newCard);

        return mapToResponse(savedCard);
    }

    public List<AllCardResponse> getCardsByColour(String colourName) {
        return repository.findByCardColour_ColourIgnoreCase(colourName).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<AllCardResponse> getCardByName(String cardName){
        return repository.findByCardNameIgnoreCase(cardName).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<AllCardResponse> getCardsBySet(String cardSet){
        return repository.findByCardSet(cardSet).stream()
                         .map(this::mapToResponse)
                         .collect(Collectors.toList());
    }

    public List<AllCardResponse> searchCards(UserCardFilterRequest filter){
        Specification<AllCard> spec = AllCardSpecification.buildFilterSpec(filter);
        
        return repository.findAll(spec).stream()
                .map(this::mapToResponse) 
                .collect(Collectors.toList());
    }

    public Float getCardPriceById(Integer id){
        return repository.findById(id)
                         .map(AllCard::getCardPrice)
                         .orElseThrow(() -> new RuntimeException("Couldnt find price for card with id: " + id));
    }

    public void updateCardPrice(@PathVariable Integer id, @RequestParam Float cardPrice){

        if (cardPrice != null && cardPrice == 0.0){
            return;
        }

        AllCard card = repository.findById(id).orElseThrow(() -> new RuntimeException("No id for card: " + id));
        card.setCardPrice(cardPrice);
        repository.save(card);
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
            card.getSuperType() != null ? card.getSuperType().getId() : null,
            card.getCardRarity().getId(),
            card.getCardImageUrl(),
            card.getRiftBoundId()
        );
    }
}
