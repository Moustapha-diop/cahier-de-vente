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
public class LigneVenteRequest {

    private LocalDate dateVente;

    @Builder.Default
    private Integer quantite = 1;

    @NotBlank(message = "Le nom du produit est obligatoire")
    private String nomProduit;

    @NotNull(message = "Le montant vendu est obligatoire")
    @DecimalMin(value = "0.0", inclusive = true, message = "Le montant doit Ãªtre positif")
    private BigDecimal montantVendu;

    @NotNull(message = "Le bÃ©nÃ©fice est obligatoire")
    private BigDecimal benefice;

    private String note;
}