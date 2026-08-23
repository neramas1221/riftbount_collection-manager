package com.cardapi.springboot.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cardapi.springboot.dto.AllCardRequest;
import com.cardapi.springboot.dto.AllCardResponse;
import com.cardapi.springboot.service.AllCardService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/all-card")
@RequiredArgsConstructor
public class AllCardController {
    private final AllCardService service;

    @GetMapping
    public List<AllCardResponse> getAll(){
        return service.getAllCard();
    }

    @PostMapping
    public AllCardResponse create(@RequestBody AllCardRequest request){
        return service.createAllCard(request);
    }

    @GetMapping("colour/{colourName}")
    public ResponseEntity<List<AllCardResponse>> getCardByColour(@PathVariable String colourName){
        List<AllCardResponse> cards = service.getCardsByColour(colourName);
        if (cards.isEmpty()){
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(cards);
    }

    @GetMapping("cardname/{cardName}")
    public ResponseEntity<List<AllCardResponse>> getCardByCardName(@PathVariable String cardName){
        List<AllCardResponse> cards = service.getCardByName(cardName);
        if (cards.isEmpty()){
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(cards);
    }

    @GetMapping("cardname/{cardSet}")
    public ResponseEntity<List<AllCardResponse>> getCardBySet(@PathVariable String setName){
        List<AllCardResponse> cards = service.getCardByName(setName);
        if (cards.isEmpty()){
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(cards);
    }
}
