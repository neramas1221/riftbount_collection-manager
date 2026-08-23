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
        CardType newCardType = new CardType();
        newCardType.setType(request.getType());

        CardType savedCard = repository.save(newCardType);

        return new CardTypeResponse(savedCard.getId(), savedCard.getType());
    }
}