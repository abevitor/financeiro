package com.financeiro.financeiroWEB.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;

import com.financeiro.financeiroWEB.domain.enums.TransactionType;
import com.financeiro.financeiroWEB.domain.model.Transaction;
import com.financeiro.financeiroWEB.dto.DashboardResponse;
import com.financeiro.financeiroWEB.repository.TransactionRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final TransactionRepository transactionRepository;

    public DashboardResponse resumo(Long userId) {
        List<Transaction> list = transactionRepository.findByUserId(userId);

        BigDecimal receitas = list.stream()
                .filter(t -> t.getTipo() == TransactionType.RECEITA)
                .map(Transaction::getValor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal despesas = list.stream()
                .filter(t -> t.getTipo() == TransactionType.DESPESA)
                .map(Transaction::getValor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal saldo = receitas.subtract(despesas);

        return new DashboardResponse(receitas, despesas, saldo);
    }
}
