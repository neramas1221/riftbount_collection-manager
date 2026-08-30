package com.cardapi.springboot.entity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name="rarites")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CardRarity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "rarite", nullable = false, unique = true, length = 20)
    private String rarity;
}
