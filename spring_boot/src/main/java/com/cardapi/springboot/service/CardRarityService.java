package com.cardapi.springboot.service;

import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;

import com.cardapi.springboot.dto.CardRarityRequest;
import com.cardapi.springboot.dto.CardRarityResponse;
import com.cardapi.springboot.entity.CardRarity;
import com.cardapi.springboot.repository.CardRarityRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
@RequiredArgsConstructor
public class CardRarityService {
    private final CardRarityRepository repository;

    public List<CardRarityResponse> getAllRarities(){
        return repository.findAll().stream()
                        .map(this::mapToResponse)
                        .collect(Collectors.toList());
    }

    public CardRarityResponse getRarityByName(String name){
        CardRarity entity = repository.findByRarity(name).orElseThrow(() -> new EntityNotFoundException("CardRarity not found with name: " + name));

        
        return mapToResponse(entity);
    }

    public CardRarityResponse createCardRarity(CardRarityRequest request){
        CardRarity existingRarity = repository.findByRarityIgnoreCase(request.getRarity()).orElse(null);

        if (existingRarity != null){
            return mapToResponse(existingRarity);
        }

        CardRarity entity = CardRarity.builder()
                            .rarity(request.getRarity())
                            .build();
        CardRarity savedRarity = repository.save(entity);
        return mapToResponse(savedRarity);
    }

    public Integer getCardRarityByRarity(@PathVariable String cardRarity){
        return repository.findByRarityIgnoreCase(cardRarity)
                         .map(CardRarity::getId)
                         .orElseThrow(() -> new EntityNotFoundException("Couldnt find rarity: "+ cardRarity));
    }

    private CardRarityResponse mapToResponse(CardRarity entity){
        return CardRarityResponse.builder()
                .id(entity.getId())
                .rarity(entity.getRarity())
                .build();
    }

}
