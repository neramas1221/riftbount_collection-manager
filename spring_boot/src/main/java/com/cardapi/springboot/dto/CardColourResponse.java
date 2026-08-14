package com.cardapi.springboot.dto;

public class CardColourResponse {
    private Integer id;
    private String colour;

    public CardColourResponse(Integer id, String colour){
        this.id = id;
        this.colour = colour;
    }

    public Integer getId(){return id;}

    public String getColour(){return colour;}
}
