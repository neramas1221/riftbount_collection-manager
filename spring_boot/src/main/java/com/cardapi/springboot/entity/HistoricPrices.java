package com.cardapi.springboot.entity;

import java.time.LocalDate;

import org.hibernate.annotations.Collate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDate;

@Entity
@Getter
@Setter
@Table(name="historic_prices")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HistoricPrices {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="card_id", nullable = false)
    private AllCard cardId;

    @Column(name="date_time", nullable = false)
    private LocalDate date; 

    @Column(name="price", nullable = false)
    private float price;

    @Column(name="avg_7d", nullable = false)
    private float avg7D;

    @Column(name="avg30", nullable = false)
    private float avg30;

    @Column(name="trend", nullable = false)
    private float trend;
}
