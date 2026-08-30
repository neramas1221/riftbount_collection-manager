package com.cardapi.springboot.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.cardapi.springboot.dto.AllCardRequest;
import com.cardapi.springboot.dto.AllCardResponse;
import com.cardapi.springboot.dto.UserCardFilterRequest;
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

    @GetMapping("cardset/{setName}")
    public ResponseEntity<List<AllCardResponse>> getCardBySet(@PathVariable String setName){
        List<AllCardResponse> cards = service.getCardsBySet(setName);
        if (cards.isEmpty()){
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(cards);
    }

    @PostMapping("/search")
    public ResponseEntity<List<AllCardResponse>> cardSearch(@RequestBody UserCardFilterRequest filter){
        List<AllCardResponse> foundCards = service.searchCards(filter);
        return ResponseEntity.ok(foundCards);
    }

    @GetMapping("/{id}/price-history")
    public Float getCardPrice(@PathVariable Integer id){
        return service.getCardPriceById(id);
    }

    @PatchMapping("/{id}/card-price")
    public ResponseEntity<Void> updateCardPrice(@PathVariable Integer id, @RequestParam Float cardPrice){
        if (cardPrice != null && cardPrice == 0.0) {
             return ResponseEntity.ok().build();
        }

        service.updateCardPrice(id, cardPrice);

        return ResponseEntity.ok().build();
    }
}
