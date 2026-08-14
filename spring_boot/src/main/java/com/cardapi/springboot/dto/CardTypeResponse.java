package com.cardapi.springboot.dto;

public class CardTypeResponse {
    private Integer id;
    private String type;

    public CardTypeResponse(Integer id, String type) {
        this.id = id;
        this.type = type;
    }

    public Integer getId() {return id;}
    public String getType() {return type;}
}