package com.cardapi.springboot.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cardapi.springboot.dto.SubTypeRequest;
import com.cardapi.springboot.dto.SubTypeResponse;
import com.cardapi.springboot.service.SubTypeService;

@RestController
@RequestMapping("/api/sub-type")
public class SubTypeController {
    private final SubTypeService service;

    public SubTypeController(SubTypeService service){
        this.service = service;
    }

    @GetMapping
    public List<SubTypeResponse> getAll(){
        return service.getAllSubTypes();
    }

    @PostMapping
    public SubTypeResponse create(@RequestBody SubTypeRequest request){
        return service.createSubType(request);
    }

}
