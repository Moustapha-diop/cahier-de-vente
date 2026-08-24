package com.magasin.sales_book_backend.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PeriodeStat {
    private String label;
    private LocalDate dateRef;
    private Integer nombreVentes;
    private BigDecimal totalVentes;
    private BigDecimal totalBenefice;
    private BigDecimal totalDepenses;
    private BigDecimal beneficeNetApresDepenses;
}