package com.cardapi.springboot.dto;

public class AllCardResponse {
    private Integer id;
    private String cardName;
    private Integer cardSet;
    private boolean isOverNumbered;
    private boolean isAlternative;
    private Integer cardType;
    private Integer cardColour;
    private Integer isToken;
    private String collectorNumber;
    private float cardPrice;
    private Integer energy;
    private Integer might;
    private Integer power;
    private Integer subTypeId;
    private Boolean isSignature;
    
    public AllCardResponse(Integer id, String cardName, Integer cardSet, 
        boolean isOverNumbered, boolean isAlternative, Integer cardType, 
        Integer cardColour, Integer isToken, String collectorNumber, 
        float cardPrice, Integer energy, Integer might, Integer power, 
        Integer subTypeId, Boolean isSignature){
            this.id = id;
            this.cardName = cardName;
            this.cardSet = cardSet;
            this.isOverNumbered = isOverNumbered;
            this.isAlternative = isAlternative;
            this.cardType = cardType;
            this.cardColour = cardColour;
            this.isToken = isToken;
            this.collectorNumber = collectorNumber;
            this.cardPrice = cardPrice;
            this.energy = energy;
            this.might = might;
            this.power = power;
            this.subTypeId = subTypeId;
            this.isSignature = isSignature;
        }

    public Integer getId(){return id;}

    public String getCardName(){return cardName;}

    public Integer getCardSet(){return cardSet;}

    public boolean getIsOverNumbered(){return isOverNumbered;}

    public boolean getIsAlternative(){return isAlternative;}

    public Integer getCardType(){return cardType;}

    public Integer getCardColour(){return cardColour;}

    public Integer getIsToken(){return isToken;}

    public String getCollectorNumber(){return collectorNumber;}

    public float getCardPrice(){return cardPrice;}

    public Integer getEnergy(){return energy;}

    public Integer getMight(){return might;}

    public Integer getPower(){return power;}

    public Integer getSubTypeId(){return subTypeId;}

    public Boolean getIsSigniture(){return isSignature;}
}
