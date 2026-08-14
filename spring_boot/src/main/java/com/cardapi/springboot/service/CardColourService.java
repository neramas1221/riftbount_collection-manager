package com.cardapi.springboot.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.cardapi.springboot.dto.CardColourRequest;
import com.cardapi.springboot.dto.CardColourResponse;
import com.cardapi.springboot.entity.CardColour;
import com.cardapi.springboot.repository.CardColourRepository;

@Service
public class CardColourService {
    private final CardColourRepository repository;

    public CardColourService(CardColourRepository repository){
        this.repository = repository;
    }

    public List<CardColourResponse> getAllCardColours() {
        return repository.findAll().stream()
            .map(colour -> new CardColourResponse(colour.getId(), colour.getColour()))
            .collect(Collectors.toList());
    }

    public CardColourResponse createCardColour(CardColourRequest request) {
        CardColour newCardColour = new CardColour();
        newCardColour.setColour(request.getColour());

        CardColour savedCardColour = repository.save(newCardColour);

        return new CardColourResponse(savedCardColour.getId(), savedCardColour.getColour());
    }

    public Integer getColourIdByName(String colourName){
        CardColour foundColour = repository.findByColour(colourName)
            .orElseThrow(() -> new RuntimeException("Couldnt find colour:" + colourName));
        
            return foundColour.getId();
    }
}
