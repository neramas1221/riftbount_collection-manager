package com.cardapi.springboot.entity;

import jakarta.persistence.*;

@Entity
@Table(name="all_cards")
public class AllCard {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Integer id;

    @Column(nullable = false)
    public String cardName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "set_id", nullable = false)
    public CardSet cardSet;

    @Column(nullable = false)
    public boolean isOverNumbered;

    @Column(nullable = false)
    public boolean isAlternative;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "type_id", nullable = false)
    public CardType cardType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "colour_id", nullable = false)
    public CardColour cardColour;

    @Column(name = "is_token", nullable = false)
    public Integer isToken;

    @Column(name = "collector_number", nullable = false)
    public String collectorNumber;

    @Column(name = "recent_price", nullable = false)
    public float cardPrice;

    @Column(name = "energy", nullable = true)
    public Integer energy;

    @Column(name = "might", nullable = true)
    public Integer might;

    @Column(name = "power", nullable = true)
    public Integer power;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subtype_id", nullable = false)
    public SubType subTypeId;

    @Column(name = "is_signiture", nullable = false)
    public Boolean isSignature;

    public AllCard(){
    }

    public AllCard(String cardName, CardSet cardSet, boolean isOverNumbered,
        boolean isAlternative, CardType cardType, CardColour cardColour, Integer isToken,
        String collectorNumber, float cardPrice, Integer energy, Integer might,
        Integer power, SubType subTypeId, Boolean isSignature) {
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

    public void setId(Integer id){
        this.id = id;
    }

    public Integer getId(){
        return id;
    }

    public void setCardName(String cardName){
        this.cardName = cardName;
    }

    public String getCardName(){
        return cardName;
    }

    public void setCardSet(CardSet cardSet){
        this.cardSet = cardSet;
    }

    public CardSet getCardSet(){
        return cardSet;
    }

    public void setIsOverNumbered(boolean isOverNumbered){
        this.isOverNumbered = isOverNumbered;
    }

    public boolean getIsOverNumbered(){
        return isOverNumbered;
    }

    public void setIsAlternative(boolean isAlternative){
        this.isAlternative = isAlternative;
    }

    public boolean getIsAlternative(){
        return isAlternative;
    }

    public void setCardType(CardType cardType){
        this.cardType = cardType;
    }

    public CardType getCardType(){
        return cardType;
    }

    public void setCardColour(CardColour cardColour){
        this.cardColour = cardColour;
    }

    public CardColour getCardColour(){
        return cardColour;
    }

    public void setIsToken(Integer isToken){
        this.isToken = isToken;
    }

    public Integer getIsToken(){
        return isToken;
    }

    public void setCollectorNumber(String collectorNumber){
        this.collectorNumber = collectorNumber;
    }

    public String getCollectorNumber(){
        return collectorNumber;
    }

    public void setCardPrice(float cardPrice){
        this.cardPrice = cardPrice;
    }

    public float getCardPrice(){
        return cardPrice;
    }

    public void setEnergy(Integer energy){
        this.energy = energy;
    }

    public Integer getEnergy(){
        return energy;
    }

    public void setMight(Integer might){
        this.might = might;
    }

    public Integer getMight(){
        return might;
    }

    public void setPower(Integer power){
        this.power = power;
    }

    public Integer getPower(){
        return power;
    }

    public void setSubType(SubType subType){
        this.subTypeId = subType;
    }

    public SubType getSubType(){
        return subTypeId;
    }

    public void setIsSigniture(Boolean isSignature){
        this.isSignature = isSignature;
    }

    public Boolean getIsSignature(){
        return isSignature;
    }

}
