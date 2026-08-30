package com.cardapi.springboot.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.cardapi.springboot.dto.OwnedCardRequest;
import com.cardapi.springboot.dto.OwnedCardResponse;
import com.cardapi.springboot.service.OwnedCardService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/owned-cards")
@RequiredArgsConstructor
public class OwnedCardController {
    private final OwnedCardService service;

    @PostMapping
    @ResponseStatus(HttpStatus.OK)
    public OwnedCardResponse addOrUpdateCard(@RequestBody OwnedCardRequest request) {
        return service.upsertOwnedCard(request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCard(@PathVariable int id) {
        service.deleteOwnedCard(id);
    } 

    @GetMapping
    public List<OwnedCardResponse> getAll(){
        return service.getAllOwnedCards();
    }
}
