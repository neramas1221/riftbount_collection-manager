package com.cardapi.springboot.controller;

import com.cardapi.springboot.dto.CardColourRequest;
import com.cardapi.springboot.dto.CardColourResponse;
import com.cardapi.springboot.service.CardColourService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/card-colour")
public class CardColourController {

    private final CardColourService service;

    public CardColourController (CardColourService service){
        this.service = service;
    }

    @GetMapping
    public List<CardColourResponse> getAll(){
        return service.getAllCardColours();
    }

    @PostMapping
    public CardColourResponse create(@RequestBody CardColourRequest request){
        return service.createCardColour(request);
    }
    
    @GetMapping("/{colourName}/id")
    public Integer getColourId(@PathVariable String colourName){
        return service.getColourIdByName(colourName);
    }
}
