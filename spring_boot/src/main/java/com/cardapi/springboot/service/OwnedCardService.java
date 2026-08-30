package com.cardapi.springboot.service;

import java.util.List;
import java.util.stream.Collectors  ;

import org.springframework.stereotype.Service;

import com.cardapi.springboot.dto.OwnedCardRequest;
import com.cardapi.springboot.dto.OwnedCardResponse;
import com.cardapi.springboot.entity.AllCard;
import com.cardapi.springboot.entity.OwnedCard;
import com.cardapi.springboot.repository.AllCardRepository;
import com.cardapi.springboot.repository.OwnedCardRepository;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OwnedCardService {

    private final OwnedCardRepository ownedCardRepository;
    private final AllCardRepository allCardRepository;

        @Transactional
        public OwnedCardResponse upsertOwnedCard(OwnedCardRequest request){
        if (request.getQuantity() <= 0){
            ownedCardRepository.findByAllCardId(request.getAllCardId()).ifPresent(ownedCardRepository::delete);
            return null;
        }

        OwnedCard ownedCard = ownedCardRepository.findByAllCardId(request.getAllCardId()).orElseGet(() -> {
            AllCard cardToLink = allCardRepository.findById(request.getAllCardId())
            .orElseThrow(() -> new EntityNotFoundException("Card not found with ID: " + request.getAllCardId()));
            return OwnedCard.builder()
                            .allCard(cardToLink)
                            .build();
        });
        
        ownedCard.setQuantity(request.getQuantity());
        OwnedCard savedEntity = ownedCardRepository.save(ownedCard);

        return mapToResponse(savedEntity);
    }

    public void deleteOwnedCard(int id){
        ownedCardRepository.deleteById(id);
    }

    public List<OwnedCardResponse> getAllOwnedCards(){
        return ownedCardRepository.findAll().stream().map(this::mapToResponse)
                                    .collect(Collectors.toList());
    }

    private OwnedCardResponse mapToResponse(OwnedCard entity) {
        return OwnedCardResponse.builder()
                .id(entity.getId())
                .allCardId(entity.getAllCard().getId())
                .quantity(entity.getQuantity())
                .build();
    }

}

