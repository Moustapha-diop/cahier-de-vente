package com.magasin.sales_book_backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "depenses", indexes = {
    @Index(name = "idx_date_depense", columnList = "dateDepense")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Depense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate dateDepense;

    @Column(nullable = false)
    private String motif;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal montant;

    private String categorie;

    private String note;

    @Column(nullable = false)
    @Builder.Default
    private Boolean cloturee = false;

    private LocalDateTime dateCloture;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (dateDepense == null) {
            dateDepense = LocalDate.now();
        }
        if (cloturee == null) {
            cloturee = false;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}