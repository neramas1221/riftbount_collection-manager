package com.cardapi.springboot.dto;

public class SubTypeResponse {
    private Integer id;
    private String subType;

    public SubTypeResponse(Integer id, String subType){
        this.id = id;
        this.subType = subType;
    }

    public Integer getId(){return id;}
    public String getType(){return subType;}
}
