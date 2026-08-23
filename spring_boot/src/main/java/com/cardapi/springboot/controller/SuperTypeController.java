package com.cardapi.springboot.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.cardapi.springboot.dto.SuperTypeRequest;
import com.cardapi.springboot.dto.SuperTypeResponse;
import com.cardapi.springboot.service.SuperTypeService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/super-types")
@RequiredArgsConstructor
public class SuperTypeController {
    private final SuperTypeService service;

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<List<SuperTypeResponse>> getAll(){
        return ResponseEntity.ok(service.getAllSuperTypes());
    }

    @GetMapping("/name/{name}")
    public ResponseEntity<SuperTypeResponse> getByName(@PathVariable String name){
        return ResponseEntity.ok(service.getSuperTypeByName(name));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<SuperTypeResponse> create(@PathVariable SuperTypeRequest request){
        SuperTypeResponse created = service.createSuperType(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }
}
