package com.cardapi.springboot.dto;

import java.util.List;

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
public class AllCardResponse {
    private int id;
    private String cardName;
    private int cardSet;
    private boolean isOverNumbered;
    private boolean isAlternative;
    private int cardType;
    private int cardColour;
    private int isToken;
    private String collectorNumber;
    private float cardPrice;
    private int energy;
    private int might;
    private int power;
    private List<String> subType;
    private Boolean isSignature;
    private int superType;
}
