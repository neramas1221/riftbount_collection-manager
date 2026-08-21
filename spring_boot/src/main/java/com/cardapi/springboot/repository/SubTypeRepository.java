package com.cardapi.springboot.repository;

import com.cardapi.springboot.entity.SubType;
import org.springframework.stereotype.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;


@Repository
public interface SubTypeRepository extends JpaRepository<SubType, Integer> {

    Optional<SubType> findBySubType(String subType);
}
