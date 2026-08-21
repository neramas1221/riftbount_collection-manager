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

            if (filter.getCardEnergy() != null && !filter.getCardEnergy().isEmpty()){
                predicates.add(root.get("energy").in(filter.getCardEnergy()));
            }

            if (filter.getCardSets() != null && !filter.getCardSets().isEmpty()){
                predicates.add(root.join("cardType").get("name").in(filter.getCardTypes()));
            }

            if (filter.getCardSets() != null && !filter.getCardSets().isEmpty()){
                predicates.add(root.join("cardSet").get("name").in(filter.getCardSets()));
            }
            
            if (filter.getCardColours() != null && !filter.getCardColours().isEmpty()){
                predicates.add(root.join("cardColour").get("name").in(filter.getCardSets()));
            }

            if (filter.getCardMight() != null && !filter.getCardMight().isEmpty()){
                predicates.add(root.get("might").in(filter.getCardMight()));
            }

            if (filter.getCardPower() != null && !filter.getCardPower().isEmpty()){
                predicates.add(root.get("power").in(filter.getCardPower()));
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
