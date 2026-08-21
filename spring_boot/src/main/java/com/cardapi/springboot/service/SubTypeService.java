package com.cardapi.springboot.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.cardapi.springboot.dto.SubTypeRequest;
import com.cardapi.springboot.dto.SubTypeResponse;
import com.cardapi.springboot.entity.SubType;
import com.cardapi.springboot.repository.SubTypeRepository;

@Service
public class SubTypeService {
    private final SubTypeRepository repository;

    public SubTypeService(SubTypeRepository repository){
        this.repository = repository;
    }

    public List<SubTypeResponse> getAllSubTypes(){
        return repository.findAll().stream()
            .map(subType -> new SubTypeResponse(subType.getId(), subType.getSubType()))
            .collect(Collectors.toList());
    }

    public SubTypeResponse createSubType(SubTypeRequest request) {
        SubType newSubType = new SubType();
        newSubType.setSubType(request.getSubType());

        SubType savedSubType = repository.save(newSubType);

        return new SubTypeResponse(savedSubType.getId(), savedSubType.getSubType());
    }

    public Integer getSubTypeIdByName(String subTypeName){
        SubType foundSubType = repository.findBySubType(subTypeName)
            .orElseThrow(() -> new RuntimeException("Couldnt find subtype:" + subTypeName));
        
            return foundSubType.getId();
    }
        
}
