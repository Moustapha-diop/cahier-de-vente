package com.magasin.sales_book_backend.service;

import com.magasin.sales_book_backend.dto.*;
import com.magasin.sales_book_backend.model.Depense;
import com.magasin.sales_book_backend.model.LigneVente;
import com.magasin.sales_book_backend.repository.DepenseRepository;
import com.magasin.sales_book_backend.repository.LigneVenteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VenteService {

    private final LigneVenteRepository ligneVenteRepository;
    private final DepenseRepository depenseRepository;

    public LigneVente ajouterLigne(LigneVenteRequest req) {
        LocalDate date = req.getDateVente() != null ? req.getDateVente() : LocalDate.now();
        int qte = (req.getQuantite() != null && req.getQuantite() > 0) ? req.getQuantite() : 1;

        LigneVente ligne = LigneVente.builder()
                .dateVente(date)
                .quantite(qte)
                .nomProduit(req.getNomProduit().trim())
                .montantVendu(req.getMontantVendu())
                .benefice(req.getBenefice())
                .note(req.getNote())
                .cloturee(false)
                .build();
        return ligneVenteRepository.save(ligne);
    }

    public LigneVente modifierLigne(Long id, LigneVenteRequest req) {
        LigneVente ligne = ligneVenteRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Ligne de vente non trouvÃ©e : " + id));

        if (Boolean.TRUE.equals(ligne.getCloturee())) {
            throw new IllegalStateException("Impossible de modifier une ligne dÃ©jÃ  clÃ´turÃ©e.");
        }

        if (req.getQuantite() != null && req.getQuantite() > 0) {
            ligne.setQuantite(req.getQuantite());
        }
        if (req.getDateVente() != null) {
            ligne.setDateVente(req.getDateVente());
        }
        if (req.getNomProduit() != null) {
            ligne.setNomProduit(req.getNomProduit().trim());
        }
        if (req.getMontantVendu() != null) {
            ligne.setMontantVendu(req.getMontantVendu());
        }
        if (req.getBenefice() != null) {
            ligne.setBenefice(req.getBenefice());
        }
        if (req.getNote() != null) {
            ligne.setNote(req.getNote());
        }

        return ligneVenteRepository.save(ligne);
    }

    public void supprimerLigne(Long id) {
        LigneVente ligne = ligneVenteRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Ligne de vente non trouvÃ©e : " + id));

        if (Boolean.TRUE.equals(ligne.getCloturee())) {
            throw new IllegalStateException("Impossible de supprimer une ligne dÃ©jÃ  clÃ´turÃ©e.");
        }
        ligneVenteRepository.delete(ligne);
    }

    public void reinitialiserToutesLesVentes() {
        ligneVenteRepository.deleteAll();
        depenseRepository.deleteAll();
    }

    public JourneeSummary getJourneeSummary(LocalDate date) {
        LocalDate targetDate = (date != null) ? date : LocalDate.now();
        List<LigneVente> lignes = ligneVenteRepository.findByDateVenteOrderByIdAsc(targetDate);
        List<Depense> depenses = depenseRepository.findByDateDepenseOrderByIdAsc(targetDate);

        BigDecimal totalVentes = lignes.stream()
                .map(LigneVente::getMontantVendu)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalBenefice = lignes.stream()
                .map(LigneVente::getBenefice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalDepenses = depenses.stream()
                .map(Depense::getMontant)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal beneficeNetApresDepenses = totalBenefice.subtract(totalDepenses);

        int totalQuantite = lignes.stream()
                .mapToInt(l -> l.getQuantite() != null ? l.getQuantite() : 1)
                .sum();

        boolean isCloturee = !lignes.isEmpty() && lignes.stream().allMatch(l -> Boolean.TRUE.equals(l.getCloturee()));

        return JourneeSummary.builder()
                .date(targetDate)
                .cloturee(isCloturee)
                .nombreArticles(totalQuantite)
                .totalVentes(totalVentes)
                .totalBenefice(totalBenefice)
                .totalDepenses(totalDepenses)
                .beneficeNetApresDepenses(beneficeNetApresDepenses)
                .tauxMarge(BigDecimal.ZERO)
                .lignes(lignes)
                .depenses(depenses)
                .build();
    }

    @Transactional
    public JourneeSummary cloturerJournee(LocalDate date, boolean forcerReouverture) {
        LocalDate targetDate = (date != null) ? date : LocalDate.now();
        List<LigneVente> lignes = ligneVenteRepository.findByDateVenteOrderByIdAsc(targetDate);
        List<Depense> depenses = depenseRepository.findByDateDepenseOrderByIdAsc(targetDate);

        if (lignes.isEmpty() && depenses.isEmpty()) {
            throw new IllegalStateException("Aucune opÃ©ration enregistrÃ©e pour la journÃ©e du " + targetDate);
        }

        boolean nouveauStatut = !forcerReouverture;
        LocalDateTime now = nouveauStatut ? LocalDateTime.now() : null;

        for (LigneVente l : lignes) {
            l.setCloturee(nouveauStatut);
            l.setDateCloture(now);
        }
        ligneVenteRepository.saveAll(lignes);

        for (Depense d : depenses) {
            d.setCloturee(nouveauStatut);
            d.setDateCloture(now);
        }
        depenseRepository.saveAll(depenses);

        return getJourneeSummary(targetDate);
    }

    public RapportResponse genererRapport(String type, LocalDate dateRef, LocalDate dateDebutCustom, LocalDate dateFinCustom) {
        LocalDate ref = (dateRef != null) ? dateRef : LocalDate.now();
        String typeUpper = (type != null) ? type.toUpperCase() : "JOUR";

        LocalDate start;
        LocalDate end;
        String titre;

        switch (typeUpper) {
            case "SEMAINE":
                start = ref.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
                end = ref.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));
                titre = "Semaine du " + start.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) + " au " + end.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
                break;
            case "MOIS":
                start = ref.with(TemporalAdjusters.firstDayOfMonth());
                end = ref.with(TemporalAdjusters.lastDayOfMonth());
                titre = "Mois de " + ref.format(DateTimeFormatter.ofPattern("MMMM yyyy", Locale.FRENCH));
                break;
            case "ANNEE":
                start = ref.with(TemporalAdjusters.firstDayOfYear());
                end = ref.with(TemporalAdjusters.lastDayOfYear());
                titre = "AnnÃ©e " + ref.getYear();
                break;
            case "PERSONNALISE":
                start = (dateDebutCustom != null) ? dateDebutCustom : ref;
                end = (dateFinCustom != null) ? dateFinCustom : ref;
                titre = "PÃ©riode du " + start.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) + " au " + end.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
                break;
            case "JOUR":
            default:
                start = ref;
                end = ref;
                titre = "JournÃ©e du " + ref.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
                break;
        }

        List<LigneVente> lignes = ligneVenteRepository.findByDateVenteBetweenOrderByDateVenteAscIdAsc(start, end);
        List<Depense> depenses = depenseRepository.findByDateDepenseBetweenOrderByDateDepenseAscIdAsc(start, end);

        BigDecimal totalVentes = lignes.stream()
                .map(LigneVente::getMontantVendu)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalBenefice = lignes.stream()
                .map(LigneVente::getBenefice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalDepenses = depenses.stream()
                .map(Depense::getMontant)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal beneficeNetApresDepenses = totalBenefice.subtract(totalDepenses);

        int totalQuantite = lignes.stream()
                .mapToInt(l -> l.getQuantite() != null ? l.getQuantite() : 1)
                .sum();

        // Breakdown par date
        Set<LocalDate> allDates = new TreeSet<>();
        lignes.forEach(l -> allDates.add(l.getDateVente()));
        depenses.forEach(d -> allDates.add(d.getDateDepense()));

        Map<LocalDate, List<LigneVente>> ventesParDate = lignes.stream()
                .collect(Collectors.groupingBy(LigneVente::getDateVente));
        Map<LocalDate, List<Depense>> depensesParDate = depenses.stream()
                .collect(Collectors.groupingBy(Depense::getDateDepense));

        List<PeriodeStat> breakdown = new ArrayList<>();
        allDates.forEach(dateKey -> {
            List<LigneVente> vList = ventesParDate.getOrDefault(dateKey, Collections.emptyList());
            List<Depense> dList = depensesParDate.getOrDefault(dateKey, Collections.emptyList());

            BigDecimal v = vList.stream().map(LigneVente::getMontantVendu).reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal b = vList.stream().map(LigneVente::getBenefice).reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal d = dList.stream().map(Depense::getMontant).reduce(BigDecimal.ZERO, BigDecimal::add);
            int qteTotale = vList.stream().mapToInt(l -> l.getQuantite() != null ? l.getQuantite() : 1).sum();

            breakdown.add(PeriodeStat.builder()
                    .label(dateKey.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")))
                    .dateRef(dateKey)
                    .nombreVentes(qteTotale)
                    .totalVentes(v)
                    .totalBenefice(b)
                    .totalDepenses(d)
                    .beneficeNetApresDepenses(b.subtract(d))
                    .build());
        });

        return RapportResponse.builder()
                .type(typeUpper)
                .titrePeriode(titre)
                .dateDebut(start)
                .dateFin(end)
                .nombreArticlesTotal(totalQuantite)
                .totalVentes(totalVentes)
                .totalBenefice(totalBenefice)
                .totalDepenses(totalDepenses)
                .beneficeNetApresDepenses(beneficeNetApresDepenses)
                .margeMoyennePourcentage(BigDecimal.ZERO)
                .breakdown(breakdown)
                .lignes(lignes)
                .depenses(depenses)
                .build();
    }

    public List<LocalDate> getHistoriqueDates() {
        Set<LocalDate> dates = new TreeSet<>(Comparator.reverseOrder());
        dates.addAll(ligneVenteRepository.findDistinctDates());
        dates.addAll(depenseRepository.findDistinctDates());
        return new ArrayList<>(dates);
    }
}