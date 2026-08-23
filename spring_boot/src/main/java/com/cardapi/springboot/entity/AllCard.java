package com.cardapi.springboot.entity;

import java.util.List;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Entity
@Table(name="all_cards")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AllCard {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(nullable = false)
    private String cardName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "set_id", nullable = false)
    private CardSet cardSet;

    @Column(nullable = false)
    private boolean isOverNumbered;

    @Column(nullable = false)
    private boolean isAlternative;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "type_id", nullable = false)
    private CardType cardType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "colour_id", nullable = false)
    private CardColour cardColour;

    @Column(name = "is_token", nullable = false)
    private int isToken;

    @Column(name = "collector_number", nullable = false)
    private String collectorNumber;

    @Column(name = "recent_price", nullable = false)
    private float cardPrice;

    @Column(name = "energy", nullable = true)
    private int energy;

    @Column(name = "might", nullable = true)
    private int might;

    @Column(name = "power", nullable = true)
    private int power;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<String> subType;

    @Column(name = "is_signiture", nullable = false)
    private boolean isSignature;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "super_type_id", nullable = true)
    private SuperType superType;
}
