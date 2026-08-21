package com.cardapi.springboot.entity;

import jakarta.persistence.*;

@Entity
@Table(name="card_types")
public class SubType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Integer id;

    @Column(nullable = false)
    public String subType;

    public SubType(){

    }

    public SubType(String subType){
        this.subType = subType;
    }

    public void setId(Integer id){
        this.id = id;
    }

    public Integer getId(){
        return id;
    }

    public void setSubType(String subType){
        this.subType = subType;
    }

    public String getSubType(){
        return subType;
    }
}
