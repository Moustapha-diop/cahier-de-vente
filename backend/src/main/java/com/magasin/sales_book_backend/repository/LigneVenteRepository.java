package com.magasin.sales_book_backend.repository;

import com.magasin.sales_book_backend.model.LigneVente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LigneVenteRepository extends JpaRepository<LigneVente, Long> {

    List<LigneVente> findByDateVenteOrderByIdAsc(LocalDate dateVente);

    List<LigneVente> findByDateVenteBetweenOrderByDateVenteAscIdAsc(LocalDate startDate, LocalDate endDate);

    @Query("SELECT DISTINCT l.dateVente FROM LigneVente l ORDER BY l.dateVente DESC")
    List<LocalDate> findDistinctDates();

    @Query("SELECT COUNT(l) > 0 FROM LigneVente l WHERE l.dateVente = :dateVente AND l.cloturee = true")
    boolean isDateCloturee(@Param("dateVente") LocalDate dateVente);
}