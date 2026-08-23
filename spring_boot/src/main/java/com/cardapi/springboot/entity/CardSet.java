package com.cardapi.springboot.entity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name="card_sets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CardSet {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable=false, unique=true, length=255)
    private String setName;

    @Column(nullable = false)
    private Integer totalCollectorNum;
}