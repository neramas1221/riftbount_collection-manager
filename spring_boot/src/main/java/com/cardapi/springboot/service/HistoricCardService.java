package com.cardapi.springboot.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.cardapi.springboot.dto.HistoricCardPriceRequest;
import com.cardapi.springboot.dto.HistoricCardPriceResponse;
import com.cardapi.springboot.entity.AllCard;
import com.cardapi.springboot.entity.HistoricPrices;
import com.cardapi.springboot.repository.AllCardRepository;
import com.cardapi.springboot.repository.HistoricCardPriceRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class HistoricCardService {
    private final HistoricCardPriceRepository repository;
    private final AllCardRepository allCardRepository;

    public List<HistoricCardPriceResponse> getAllHistoricCardPrices(){
        return repository.findAll().stream()
                         .map(this::mapToResponse)
                         .collect(Collectors.toList());
    }

    public HistoricCardPriceResponse createHistoricCardPrice(HistoricCardPriceRequest request){
        AllCard card = allCardRepository.findById(request.getCardId()).orElseThrow();

        HistoricPrices entity = HistoricPrices.builder()
                                              .cardId(card)
                                              .date(request.getRecordDate())
                                              .price(request.getCardPrice())
                                              .avg7D(request.getAvg7D())
                                              .avg30(request.getAvg30())
                                              .trend(request.getTrend())
                                              .build();
        HistoricPrices savedPrice = repository.save(entity);

        return mapToResponse(savedPrice);
    }

    private HistoricCardPriceResponse mapToResponse(HistoricPrices entity){
        return HistoricCardPriceResponse.builder()
                                        .id(entity.getId())
                                        .cardId(entity.getCardId().getId())
                                        .recordDate(entity.getDate())
                                        .cardPrice(entity.getPrice())
                                        .avg7D(entity.getAvg7D())
                                        .avg30(entity.getAvg30())
                                        .trend(entity.getTrend())
                                        .build();
    }
}
