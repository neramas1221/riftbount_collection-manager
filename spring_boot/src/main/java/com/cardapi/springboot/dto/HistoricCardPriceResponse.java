package com.cardapi.springboot.dto;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HistoricCardPriceResponse {
    private Integer id;
    private Integer cardId;
    private LocalDate recordDate;
    private float cardPrice;
    private float avg7D;
    private float avg30;
    private float trend;
}
