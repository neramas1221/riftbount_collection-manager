package com.cardapi.springboot.entity;
import jakarta.persistence.*;

@Entity
@Table(name="card_types")
public class CardType {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Integer id;
    @Column(nullable = false, unique = true, length = 50)
    private String type;


    public CardType() {
    }

    public CardType(String type){
        this.type = type;
    }

    public Integer getId(){
        return id;
    }

    public void setId(Integer id){
        this.id = id;
    }

    public String getType(){
        return type;
    }

    public void setType(String type){
        this.type = type;
    }
}