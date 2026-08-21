package com.cardapi.springboot.dto;

import lombok.Data;
import java.util.List;

@Data
public class UserCardFilterRequest {
    private List<String> cardSets;
    private List<String> cardTypes;
    private List<String> cardColours;
    private List<Integer> cardEnergy;
    private List<Integer> cardMight;
    private List<Integer> cardPower;
    private Boolean isOverNumbered;
    private Boolean isAlternative;
    private Integer isToken;
    private Boolean isSignature;

}
