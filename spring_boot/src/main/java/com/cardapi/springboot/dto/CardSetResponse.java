package com.cardapi.springboot.dto;

public class CardSetResponse {
    private Integer id;
    private String setName;

    public CardSetResponse(Integer id, String setName) {
        this.id = id;
        this.setName = setName;
    }

    public Integer getId() {return id;}
    public String getSet() {return setName;}
}