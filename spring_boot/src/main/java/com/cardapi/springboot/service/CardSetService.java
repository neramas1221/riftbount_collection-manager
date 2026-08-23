package com.cardapi.springboot.service;

import com.cardapi.springboot.dto.CardSetResponse;
import com.cardapi.springboot.dto.CardSetRequest;
import com.cardapi.springboot.entity.CardSet;
import com.cardapi.springboot.repository.CardSetRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CardSetService {
    private final CardSetRepository repository;

    public List<CardSetResponse> getAllCardSets() {
        return repository.findAll().stream()
            .map(set -> new CardSetResponse(set.getId(), set.getSetName()))
            .collect(Collectors.toList());
    }

    public CardSetResponse createCardSet(CardSetRequest request) {
        CardSet newCardSet = new CardSet();
        newCardSet.setSetName(request.getSetName());

        CardSet savedCardSet = repository.save(newCardSet);

        return new CardSetResponse(savedCardSet.getId(), savedCardSet.getSetName());
    }
}