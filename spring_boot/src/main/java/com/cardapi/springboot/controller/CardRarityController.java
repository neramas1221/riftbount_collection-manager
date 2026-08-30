package com.cardapi.springboot.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cardapi.springboot.dto.CardRarityRequest;
import com.cardapi.springboot.dto.CardRarityResponse;
import com.cardapi.springboot.service.CardRarityService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/card-raritys")
@RequiredArgsConstructor
public class CardRarityController {
    private final CardRarityService service;

    @GetMapping
    public List<CardRarityResponse> getAll(){
        return service.getAllRarities();
    }

    @PostMapping
    public CardRarityResponse create(@RequestBody CardRarityRequest request){
        return service.createCardRarity(request);
    }

    @GetMapping("/{cardRarity}")
    public Integer getCardRarityByRarity(@PathVariable String cardRarity){
        return service.getCardRarityByRarity(cardRarity);
    }
}
