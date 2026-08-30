package com.cardapi.springboot.service;

import com.cardapi.springboot.dto.CardSetResponse;
import com.cardapi.springboot.dto.CardSetRequest;
import com.cardapi.springboot.entity.CardSet;
import com.cardapi.springboot.repository.CardSetRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CardSetService {
    private final CardSetRepository repository;

    public List<CardSetResponse> getAllCardSets() {
        return repository.findAll().stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    public CardSetResponse createCardSet(CardSetRequest request) {
        CardSet existingCardSet = repository.findBySetNameIgnoreCase(request.getSetName()).orElse(null);
        
        if (existingCardSet != null){
            return mapToResponse(existingCardSet);
        }

        CardSet newCardSet = CardSet.builder()
                            .setName(request.getSetName())
                            .totalCollectorNum(request.getTotalCollectorNum())
                            .cardMarketId(request.getCardMarketId())
                            .build();

        CardSet savedCardSet = repository.save(newCardSet);

        return mapToResponse(savedCardSet);
    }

    public Integer getCardSetByName(String cardSet){
        return repository.findBySetNameIgnoreCase(cardSet)
                         .map(CardSet::getId)
                         .orElseThrow(() -> new RuntimeException("Couldnt find cardset: " + cardSet));
    }

    public void updateCardMarketId(@PathVariable String setName, @RequestParam List<Integer> id){
        CardSet set = repository.findBySetNameIgnoreCase(setName).orElseThrow(() -> new RuntimeException("Set not found"));
        set.setCardMarketId(id);
        repository.save(set);
    }

    private CardSetResponse mapToResponse(CardSet entity){
        return CardSetResponse.builder()
                .id(entity.getId())
                .setName(entity.getSetName())
                .totalCollectorNum(entity.getTotalCollectorNum())
                .cardMarketId(entity.getCardMarketId())
                .build();
    }
}