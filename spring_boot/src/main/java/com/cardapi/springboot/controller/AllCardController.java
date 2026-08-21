package com.cardapi.springboot.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.cardapi.springboot.entity.AllCard;

import com.cardapi.springboot.dto.AllCardRequest;
import com.cardapi.springboot.dto.AllCardResponse;
import com.cardapi.springboot.service.AllCardService;

@RestController
@RequestMapping("/api/all-card")
public class AllCardController {
    private final AllCardService service;

    public AllCardController(AllCardService service){
        this.service = service;
    }

    @GetMapping
    public List<AllCardResponse> getAll(){
        return service.getAllCard();
    }

    @PostMapping
    public AllCardResponse create(@RequestBody AllCardRequest request){
        return service.createAllCard(request);
    }

    @GetMapping("colour/{colourName}")
    public ResponseEntity<List<AllCard>> getCardByColour(@PathVariable String colourName){
        List<AllCard> cards = service.getCardsByColour(colourName);
        if (cards.isEmpty()){
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(cards);
    }

    @GetMapping("cardname/{cardName}")
    public ResponseEntity<List<AllCard>> getCardByCardName(@PathVariable String cardName){
        List<AllCard> cards = service.getCardByName(cardName);
        if (cards.isEmpty()){
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(cards);
    }
}
