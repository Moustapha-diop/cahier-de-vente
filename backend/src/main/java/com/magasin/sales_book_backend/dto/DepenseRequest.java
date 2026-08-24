package com.magasin.sales_book_backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepenseRequest {

    private LocalDate dateDepense;

    @NotBlank(message = "Le motif de la dÃ©pense est obligatoire.")
    private String motif;

    @NotNull(message = "Le montant est obligatoire.")
    @DecimalMin(value = "0.0", message = "Le montant doit Ãªtre positif.")
    private BigDecimal montant;

    private String categorie;
    private String note;
}