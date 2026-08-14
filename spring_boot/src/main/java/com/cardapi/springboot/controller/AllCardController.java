package com.cardapi.springboot.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
