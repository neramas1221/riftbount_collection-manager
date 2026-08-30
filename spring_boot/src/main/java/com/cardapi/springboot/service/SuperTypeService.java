package com.cardapi.springboot.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.cardapi.springboot.dto.SuperTypeRequest;
import com.cardapi.springboot.dto.SuperTypeResponse;
import com.cardapi.springboot.entity.SuperType;
import com.cardapi.springboot.repository.SuperTypeRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SuperTypeService {
    private final SuperTypeRepository repository;

    public List<SuperTypeResponse> getAllSuperTypes(){
        return repository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public SuperTypeResponse getSuperTypeByName(String name){
        SuperType  entity = repository.findByName(name).orElseThrow(() -> new EntityNotFoundException("SuperType not found with name: " + name));

        return mapToResponse(entity);
    }

    public SuperTypeResponse createSuperType(SuperTypeRequest request){
        SuperType existingSuperType = repository.findByNameIgnoreCase(request.getSuperTypeName()).orElse(null);
        
        if (existingSuperType != null){
            return mapToResponse(existingSuperType);
        }
        
        SuperType entity = SuperType.builder()
                            .name(request.getSuperTypeName())
                            .build();
        SuperType savedEntity = repository.save(entity);
        return mapToResponse(savedEntity);
    }
    
    private SuperTypeResponse mapToResponse(SuperType entity) {
        return SuperTypeResponse.builder()
                .id(entity.getId())
                .superType(entity.getName())
                .build();
    }

}
