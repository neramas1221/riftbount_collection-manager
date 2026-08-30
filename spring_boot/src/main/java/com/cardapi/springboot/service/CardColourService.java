package com.cardapi.springboot.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.cardapi.springboot.dto.CardColourRequest;
import com.cardapi.springboot.dto.CardColourResponse;
import com.cardapi.springboot.entity.CardColour;
import com.cardapi.springboot.repository.CardColourRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CardColourService {
    private final CardColourRepository repository;

    public List<CardColourResponse> getAllCardColours() {
        return repository.findAll().stream()
            .map(colour -> new CardColourResponse(colour.getId(), colour.getColour()))
            .collect(Collectors.toList());
    }

    public CardColourResponse createCardColour(CardColourRequest request) {
        CardColour existingColour = repository.findByColourIgnoreCase(request.getColour()).orElse(null);

        if (existingColour != null){
            return mapToResponse(existingColour);
        }

        CardColour newCardColour = CardColour.builder()
                                    .colour(request.getColour())
                                    .build();

        CardColour savedCardColour = repository.save(newCardColour);

        return mapToResponse(savedCardColour);
    }

    public Integer getColourIdByName(String colourName){
        CardColour foundColour = repository.findByColourIgnoreCase(colourName)
            .orElseThrow(() -> new RuntimeException("Couldnt find colour:" + colourName));
        
            return foundColour.getId();
    }

    public Integer getColourByName(String colourName){
        return repository.findByColourIgnoreCase(colourName)
               .map(CardColour::getId)
               .orElseThrow(() -> new RuntimeException("Couldnt find colour: " + colourName));
    }

    private CardColourResponse mapToResponse(CardColour entity){
        return CardColourResponse.builder()
                .id(entity.getId())
                .colour(entity.getColour())
                .build();
    }
}
