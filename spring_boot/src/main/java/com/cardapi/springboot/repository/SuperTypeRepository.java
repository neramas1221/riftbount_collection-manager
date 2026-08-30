package com.cardapi.springboot.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.cardapi.springboot.entity.SuperType;

@Repository
public interface SuperTypeRepository extends JpaRepository<SuperType, Integer>{
    Optional<SuperType> findByName(String name);
    Optional<SuperType> findByNameIgnoreCase(String name);
}