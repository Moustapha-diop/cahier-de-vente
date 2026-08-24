package com.magasin.sales_book_backend.dto;

import com.magasin.sales_book_backend.model.Depense;
import com.magasin.sales_book_backend.model.LigneVente;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JourneeSummary {
    private LocalDate date;
    private Boolean cloturee;
    private Integer nombreArticles;
    private BigDecimal totalVentes;
    private BigDecimal totalBenefice;
    private BigDecimal totalDepenses;
    private BigDecimal beneficeNetApresDepenses;
    private BigDecimal tauxMarge;
    private List<LigneVente> lignes;
    private List<Depense> depenses;
}