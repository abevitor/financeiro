package com.financeiro.financeiroWEB.repository;

import java.time.LocalDate;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.data.jpa.repository.JpaRepository;

import com.financeiro.financeiroWEB.domain.model.Transaction;
import com.financeiro.financeiroWEB.domain.model.User;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    Page<Transaction> findByUser(User user, Pageable pageable);

    Page<Transaction> findByUserAndDataBetween(User user, LocalDate inicio, LocalDate fim, Pageable pageable);

    List<Transaction> findByUser(User user);

    List<Transaction> findByUserAndDataBetween(User user, LocalDate inicio, LocalDate fim);
}
