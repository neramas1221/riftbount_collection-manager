package com.cardapi.springboot.controller;

import com.cardapi.springboot.dto.CardTypeRequest;
import com.cardapi.springboot.dto.CardTypeResponse;
import com.cardapi.springboot.service.CardTypeService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/card-types")
public class CardTypeController {
    
    private final CardTypeService service;

    public CardTypeController(CardTypeService service) {
        this.service = service;
    }

    @GetMapping
    public List<CardTypeResponse> getAll() {
        return service.getAllCardType();
    }

    @PostMapping
    public CardTypeResponse create(@RequestBody CardTypeRequest request) {
        return service.createCardType(request);
    }
}