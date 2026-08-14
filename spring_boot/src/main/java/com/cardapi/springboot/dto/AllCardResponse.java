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
    
    public AllCardResponse(Integer id, String cardName, Integer cardSet, 
        boolean isOverNumbered, boolean isAlternative, Integer cardType, 
        Integer cardColour, Integer isToken, String collectorNumber, float cardPrice){
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
}
