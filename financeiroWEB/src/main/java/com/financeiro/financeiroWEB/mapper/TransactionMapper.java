package com.financeiro.financeiroWEB.mapper;

import com.financeiro.financeiroWEB.domain.model.Category;
import com.financeiro.financeiroWEB.domain.model.Transaction;
import com.financeiro.financeiroWEB.domain.model.User;
import com.financeiro.financeiroWEB.dto.TransactionCreateRequest;
import com.financeiro.financeiroWEB.dto.TransactionResponse;

public class TransactionMapper {

    private TransactionMapper() {}

    public static Transaction toEntity(
            TransactionCreateRequest dto,
            User user,
            Category category
    ) {
        Transaction t = new Transaction();
        t.setDescricao(dto.descricao());
        t.setValor(dto.valor());
        t.setData(dto.data());
        t.setTipo(dto.tipo());
        t.setUser(user);           
        t.setCategory(category);   
        return t;
    }

    public static TransactionResponse toResponse(Transaction t) {
        return new TransactionResponse(
                t.getId(),
                t.getDescricao(),
                t.getValor(),
                t.getData(),
                t.getTipo(),
                t.getUser().getId(),
                t.getCategory().getId()
        );
    }
}
