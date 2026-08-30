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
public class AllCardRequest {
    private String cardName;
    private int cardSet;
    private boolean isOverNumbered;
    private boolean isAlternative;
    private int cardType;
    private int cardColour;
    private int isToken;
    private String collectorNumber;
    private float cardPrice;
    private Integer energy;
    private Integer might;
    private Integer power;
    private List<String> subType;
    private boolean isSignature;
    private Integer superType;
    private Integer cardRarity; 
    private String cardImageUrl;
    private String riftBoundId;
}
