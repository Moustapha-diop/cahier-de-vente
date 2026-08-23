package com.magasin.sales_book_backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "lignes_vente", indexes = {
    @Index(name = "idx_date_vente", columnList = "dateVente")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LigneVente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate dateVente;

    @Column(nullable = false)
    @Builder.Default
    private Integer quantite = 1;

    @Column(nullable = false)
    private String nomProduit;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal montantVendu;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal benefice;

    @Column(nullable = false)
    @Builder.Default
    private Boolean cloturee = false;

    private LocalDateTime dateCloture;

    private String note;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (dateVente == null) {
            dateVente = LocalDate.now();
        }
        if (quantite == null || quantite < 1) {
            quantite = 1;
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