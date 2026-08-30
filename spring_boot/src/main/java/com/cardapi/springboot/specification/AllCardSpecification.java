package com.cardapi.springboot.specification;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.jpa.domain.Specification;

import com.cardapi.springboot.dto.UserCardFilterRequest;
import com.cardapi.springboot.entity.AllCard;

import jakarta.persistence.criteria.Predicate;

public class AllCardSpecification {
    public static Specification<AllCard> buildFilterSpec(UserCardFilterRequest filter){
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter.getCardEnergyMin() != null){
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("energy"), filter.getCardEnergyMin()));
            }

            if (filter.getCardEnergyMax() != null){
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("energy"), filter.getCardEnergyMax()));
            }

            if (filter.getCardTypes() != null && !filter.getCardTypes().isEmpty()){
                predicates.add(root.join("cardType").get("type").in(filter.getCardTypes()));
            }

            if (filter.getCardSets() != null && !filter.getCardSets().isEmpty()){
                predicates.add(root.join("cardSet").get("setName").in(filter.getCardSets()));
            }
            
            if (filter.getCardColours() != null && !filter.getCardColours().isEmpty()){
                predicates.add(root.join("cardColour").get("colour").in(filter.getCardColours()));
            }

            if (filter.getCardMightMin() != null){
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("might"), filter.getCardMightMin()));
            }

            if (filter.getCardMightMax() != null){
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("might"), filter.getCardMightMax()));
            }

            if (filter.getCardPowerMin() != null){
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get( "power"), filter.getCardPowerMin()));
            }
            
            if (filter.getCardPowerMax() != null){
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get( "power"), filter.getCardPowerMax()));
            }

            if (filter.getIsOverNumbered() != null){
                predicates.add(criteriaBuilder.equal(root.get("isOverNumbered"), filter.getIsOverNumbered()));
            }
            
            if (filter.getIsAlternative() != null) {
                predicates.add(criteriaBuilder.equal(root.get("isAlternative"), filter.getIsAlternative()));
            }
            if (filter.getIsToken() != null){
                predicates.add(criteriaBuilder.equal(root.get("isToken"), filter.getIsToken()));
            }

            if (filter.getIsSignature() != null){
                predicates.add(criteriaBuilder.equal(root.get("isSignature"), filter.getIsSignature()));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}