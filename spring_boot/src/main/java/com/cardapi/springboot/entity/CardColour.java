package com.cardapi.springboot.entity;

import jakarta.persistence.*;

@Entity
@Table(name="colours")
public class CardColour {
    @Id
    @GeneratedValue(strategy =GenerationType.IDENTITY)
    public Integer id;
    @Column(nullable = false, length = 20, unique = true)
    public String colour;

    public CardColour(){
    }

    public CardColour(String colour){
        this.colour = colour;
    }

    public void setId(Integer id){
        this.id = id;
    }

    public Integer getId(){
        return id;
    }

    public void setColour(String colour){
        this.colour = colour;
    }

    public String getColour(){
        return colour;
    }
}
