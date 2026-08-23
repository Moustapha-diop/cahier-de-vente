package com.magasin.sales_book_backend.dto;

import com.magasin.sales_book_backend.model.LigneVente;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RapportResponse {
    private String type;
    private String titrePeriode;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private int nombreArticlesTotal;
    private BigDecimal totalVentes;
    private BigDecimal totalBenefice;
    private BigDecimal margeMoyennePourcentage;
    private List<PeriodeStat> breakdown;
    private List<LigneVente> lignes;
}