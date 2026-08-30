package com.cardapi.springboot.dto;

import lombok.Data;
import java.util.List;

@Data
public class UserCardFilterRequest {
    private List<String> cardSets;
    private List<String> cardTypes;
    private List<String> cardColours;
    private Integer cardEnergyMin;
    private Integer cardEnergyMax;
    private Integer cardMightMin;
    private Integer cardMightMax;
    private Integer cardPowerMin;
    private Integer cardPowerMax;
    private Boolean isOverNumbered;
    private Boolean isAlternative;
    private Integer isToken;
    private Boolean isSignature;
}
