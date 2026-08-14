package com.cardapi.springboot.dto;

public class AllCardRequest {
    private String cardName;

    private Integer cardSet;

    private boolean isOverNumbered;

    private boolean isAlternative;

    private Integer cardType;

    private Integer cardColour;

    private Integer isToken;

    private String collectorNumber;

    private float cardPrice;

    public void setCardName(String cardName){this.cardName = cardName;}

    public String getCardName(){return cardName;}

    public void setCardSet(Integer cardSet){this.cardSet = cardSet;}

    public Integer getCardSet(){return cardSet;}

    public void setIsOverNumbered(boolean isOverNumbered){this.isOverNumbered = isOverNumbered;}

    public boolean getIsOverNumbered(){return isOverNumbered;}

    public void setIsAlternative(boolean isAlternative){this.isAlternative = isAlternative;}

    public boolean getIsAlternative(){return isAlternative;}

    public void setCardType(Integer cardType){this.cardType = cardType;}

    public Integer getCardType(){return cardType;}

    public void setCardColour(Integer cardColour){this.cardColour = cardColour;}

    public Integer getCardColour(){return cardColour;}

    public void setIsToken(Integer isToken){this.isToken = isToken;}

    public Integer getIsToken(){return isToken;}

    public void setCollectorNumber(String collectorNumber){this.collectorNumber = collectorNumber;}

    public String getCollectorNumber(){return collectorNumber;}

    public void setCardPrice(float cardPrice){this.cardPrice = cardPrice;}

    public float getCardPrice(){return cardPrice;}
}
