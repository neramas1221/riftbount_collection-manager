package com.cardapi.springboot.controller;

import com.cardapi.springboot.dto.CardSetRequest;
import com.cardapi.springboot.dto.CardSetResponse;
import com.cardapi.springboot.service.CardSetService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/card-sets")
public class CardSetController {

    private final CardSetService service;

    public CardSetController(CardSetService service){
        this.service = service;
    }

    @GetMapping
    public List<CardSetResponse> getAll(){
        return service.getAllCardSets();
    }

    @PostMapping
    public CardSetResponse create(@RequestBody CardSetRequest request) {
        return service.createCardSet(request);
    }
}