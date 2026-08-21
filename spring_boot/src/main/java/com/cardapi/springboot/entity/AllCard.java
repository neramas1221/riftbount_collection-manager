package com.cardapi.springboot.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name="all_cards")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AllCard {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

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
    private Integer isToken;

    @Column(name = "collector_number", nullable = false)
    private String collectorNumber;

    @Column(name = "recent_price", nullable = false)
    private float cardPrice;

    @Column(name = "energy", nullable = true)
    private Integer energy;

    @Column(name = "might", nullable = true)
    private Integer might;

    @Column(name = "power", nullable = true)
    private Integer power;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subtype_id", nullable = false)
    private SubType subType;

    @Column(name = "is_signiture", nullable = false)
    private boolean isSignature;

}
