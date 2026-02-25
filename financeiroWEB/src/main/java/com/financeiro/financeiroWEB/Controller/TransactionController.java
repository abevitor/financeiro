package com.financeiro.financeiroWEB.Controller;

import java.time.LocalDate;

import com.financeiro.financeiroWEB.dto.TransactionUpdateRequest;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.financeiro.financeiroWEB.dto.TransactionCreateRequest;
import com.financeiro.financeiroWEB.dto.TransactionResponse;
import com.financeiro.financeiroWEB.service.TransactionService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping
    public ResponseEntity<TransactionResponse> criar(@Valid @RequestBody TransactionCreateRequest dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(transactionService.criar(dto));
    }

    @GetMapping
    public ResponseEntity<Page<TransactionResponse>> listarMinhas(
            @PageableDefault(size = 20, sort = "data") Pageable pageable
    ) {
        return ResponseEntity.ok(transactionService.listarMinhas(pageable));
    }

    @GetMapping("/periodo")
    public ResponseEntity<Page<TransactionResponse>> listarPorPeriodo(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim,
            @PageableDefault(size = 20, sort = "data") Pageable pageable
    ) {
        return ResponseEntity.ok(transactionService.listarPorPeriodo(inicio, fim, pageable));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        transactionService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<TransactionResponse> atualizar(
        @PathVariable Long id,
        @Valid @RequestBody TransactionUpdateRequest dto
    ){
        return ResponseEntity.ok(transactionService.atualizar(id, dto));
    }


}
