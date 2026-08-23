package com.magasin.sales_book_backend.config;

import com.magasin.sales_book_backend.model.LigneVente;
import com.magasin.sales_book_backend.repository.LigneVenteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final LigneVenteRepository repository;

    @Override
    public void run(String... args) {
        if (repository.count() == 0) {
            LocalDate day1 = LocalDate.of(2026, 8, 4);
            LocalDate day2 = LocalDate.of(2026, 8, 5);
            LocalDate today = LocalDate.now();

            List<LigneVente> day1Ventes = List.of(
                LigneVente.builder().dateVente(day1).quantite(1).nomProduit("BASA").montantVendu(new BigDecimal("52000")).benefice(new BigDecimal("1500")).cloturee(true).dateCloture(LocalDateTime.now()).build(),
                LigneVente.builder().dateVente(day1).quantite(1).nomProduit("206").montantVendu(new BigDecimal("62000")).benefice(new BigDecimal("2000")).cloturee(true).dateCloture(LocalDateTime.now()).build(),
                LigneVente.builder().dateVente(day1).quantite(1).nomProduit("ROB").montantVendu(new BigDecimal("45000")).benefice(new BigDecimal("2000")).cloturee(true).dateCloture(LocalDateTime.now()).build(),
                LigneVente.builder().dateVente(day1).quantite(1).nomProduit("217").montantVendu(new BigDecimal("25000")).benefice(new BigDecimal("1000")).cloturee(true).dateCloture(LocalDateTime.now()).build(),
                LigneVente.builder().dateVente(day1).quantite(1).nomProduit("1909").montantVendu(new BigDecimal("50000")).benefice(new BigDecimal("3000")).cloturee(true).dateCloture(LocalDateTime.now()).build(),
                LigneVente.builder().dateVente(day1).quantite(1).nomProduit("408 C").montantVendu(new BigDecimal("52000")).benefice(new BigDecimal("2500")).cloturee(true).dateCloture(LocalDateTime.now()).build(),
                LigneVente.builder().dateVente(day1).quantite(1).nomProduit("BALE").montantVendu(new BigDecimal("1500")).benefice(new BigDecimal("100")).cloturee(true).dateCloture(LocalDateTime.now()).build(),
                LigneVente.builder().dateVente(day1).quantite(1).nomProduit("SAC").montantVendu(new BigDecimal("1000")).benefice(new BigDecimal("250")).cloturee(true).dateCloture(LocalDateTime.now()).build(),
                LigneVente.builder().dateVente(day1).quantite(1).nomProduit("KOUBAT").montantVendu(new BigDecimal("4000")).benefice(new BigDecimal("1500")).cloturee(true).dateCloture(LocalDateTime.now()).build(),
                LigneVente.builder().dateVente(day1).quantite(1).nomProduit("PELE").montantVendu(new BigDecimal("2000")).benefice(new BigDecimal("500")).cloturee(true).dateCloture(LocalDateTime.now()).build(),
                LigneVente.builder().dateVente(day1).quantite(1).nomProduit("SAC K1").montantVendu(new BigDecimal("10000")).benefice(new BigDecimal("3500")).cloturee(true).dateCloture(LocalDateTime.now()).build(),
                LigneVente.builder().dateVente(day1).quantite(1).nomProduit("KOUPALA").montantVendu(new BigDecimal("17500")).benefice(new BigDecimal("6000")).cloturee(true).dateCloture(LocalDateTime.now()).build(),
                LigneVente.builder().dateVente(day1).quantite(2).nomProduit("GM").montantVendu(new BigDecimal("50000")).benefice(new BigDecimal("4000")).cloturee(true).dateCloture(LocalDateTime.now()).build(),
                LigneVente.builder().dateVente(day1).quantite(1).nomProduit("VANILLO-CM").montantVendu(new BigDecimal("40000")).benefice(new BigDecimal("5000")).cloturee(true).dateCloture(LocalDateTime.now()).build(),
                LigneVente.builder().dateVente(day1).quantite(1).nomProduit("MACLA").montantVendu(new BigDecimal("47500")).benefice(new BigDecimal("9000")).cloturee(true).dateCloture(LocalDateTime.now()).build(),
                LigneVente.builder().dateVente(day1).quantite(1).nomProduit("1202").montantVendu(new BigDecimal("11000")).benefice(new BigDecimal("4500")).cloturee(true).dateCloture(LocalDateTime.now()).build()
            );
            repository.saveAll(day1Ventes);

            List<LigneVente> day2Ventes = List.of(
                LigneVente.builder().dateVente(day2).quantite(1).nomProduit("MACLA").montantVendu(new BigDecimal("25000")).benefice(new BigDecimal("2250")).cloturee(true).dateCloture(LocalDateTime.now()).build(),
                LigneVente.builder().dateVente(day2).quantite(1).nomProduit("1202").montantVendu(new BigDecimal("10000")).benefice(new BigDecimal("3500")).cloturee(true).dateCloture(LocalDateTime.now()).build(),
                LigneVente.builder().dateVente(day2).quantite(1).nomProduit("KOUBAT").montantVendu(new BigDecimal("13000")).benefice(new BigDecimal("4000")).cloturee(true).dateCloture(LocalDateTime.now()).build(),
                LigneVente.builder().dateVente(day2).quantite(1).nomProduit("416").montantVendu(new BigDecimal("15000")).benefice(new BigDecimal("4500")).cloturee(true).dateCloture(LocalDateTime.now()).build(),
                LigneVente.builder().dateVente(day2).quantite(2).nomProduit("DARA").montantVendu(new BigDecimal("7000")).benefice(new BigDecimal("2700")).cloturee(true).dateCloture(LocalDateTime.now()).build(),
                LigneVente.builder().dateVente(day2).quantite(2).nomProduit("DRE").montantVendu(new BigDecimal("10000")).benefice(new BigDecimal("4000")).cloturee(true).dateCloture(LocalDateTime.now()).build()
            );
            repository.saveAll(day2Ventes);

            List<LigneVente> todayVentes = List.of(
                LigneVente.builder().dateVente(today).quantite(1).nomProduit("MACLA").montantVendu(new BigDecimal("35000")).benefice(new BigDecimal("4500")).cloturee(false).build(),
                LigneVente.builder().dateVente(today).quantite(2).nomProduit("DARA").montantVendu(new BigDecimal("14000")).benefice(new BigDecimal("5400")).cloturee(false).build(),
                LigneVente.builder().dateVente(today).quantite(1).nomProduit("1202").montantVendu(new BigDecimal("12000")).benefice(new BigDecimal("3800")).cloturee(false).build(),
                LigneVente.builder().dateVente(today).quantite(1).nomProduit("KOUBAT").montantVendu(new BigDecimal("18000")).benefice(new BigDecimal("4200")).cloturee(false).build()
            );
            repository.saveAll(todayVentes);
        }
    }
}