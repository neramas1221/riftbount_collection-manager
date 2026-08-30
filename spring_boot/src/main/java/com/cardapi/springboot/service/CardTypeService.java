package com.cardapi.springboot.service;

import com.cardapi.springboot.dto.CardTypeResponse;
import com.cardapi.springboot.dto.CardTypeRequest;
import com.cardapi.springboot.entity.CardType;
import com.cardapi.springboot.repository.CardTypeRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CardTypeService {
    private final CardTypeRepository repository;

    public List<CardTypeResponse> getAllCardType(){
        return repository.findAll().stream()
            .map(card -> new CardTypeResponse(card.getId(), card.getType()))
            .collect(Collectors.toList());
    }

    public CardTypeResponse createCardType(CardTypeRequest request) {
        CardType existingCardType = repository.findByTypeIgnoreCase(request.getType()).orElse(null);
        if (existingCardType != null){
            return mapToResponse(existingCardType);
        }

        CardType newCardType = CardType.builder()
                                .type(request.getType())
                                .build();

        CardType savedCardType = repository.save(newCardType);

        return mapToResponse(savedCardType);
    }

    public Integer getCardTypeByName(String cardType){
        return repository.findByTypeIgnoreCase(cardType)
                            .map(CardType::getId)
                            .orElseThrow(() -> new RuntimeException("Could not find card type: " + cardType));
    }

    private CardTypeResponse mapToResponse(CardType entity){
        return CardTypeResponse.builder()
                .id(entity.getId())
                .type(entity.getType())
                .build();
    }
}