package com.cardapi.springboot.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.cardapi.springboot.dto.HistoricCardPriceRequest;
import com.cardapi.springboot.dto.HistoricCardPriceResponse;
import com.cardapi.springboot.service.HistoricCardService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/historic-price")
@RequiredArgsConstructor
public class HistoricPriceController {
    private final HistoricCardService service;

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<List<HistoricCardPriceResponse>> getAll(){
        return ResponseEntity.ok(service.getAllHistoricCardPrices());
    }

    @PostMapping
    public HistoricCardPriceResponse create(@RequestBody HistoricCardPriceRequest request){
        return service.createHistoricCardPrice(request);
    }
}
