package com.cardapi.springboot.entity;
import jakarta.persistence.*;

@Entity
@Table(name="card_sets")
public class CardSet {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    public Integer id;
    @Column(nullable=false, unique=true, length=255)
    public String setName;

    public CardSet(){
    }

    public CardSet(String setName){
        this.setName = setName;
    }

    public void setId(Integer id){
        this.id = id;
    }


    public Integer getId(){
        return id;
    }

    public void setSetName(String setName){
        this.setName = setName;
    }

    public String getSet(){
        return setName;
    }

}