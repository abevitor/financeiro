package com.financeiro.financeiroWEB.Controller;


import java.time.LocalDate;
import java.util.List;

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

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<TransactionResponse>> listarPorUsuario(@PathVariable Long userId) {
        return ResponseEntity.ok(transactionService.listarPorUsuario(userId));
    }

    @GetMapping("/user/{userId}/periodo")
    public ResponseEntity<List<TransactionResponse>> listarPorPeriodo(
            @PathVariable Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim
    ) {
        return ResponseEntity.ok(transactionService.listarPorPeriodo(userId, inicio, fim));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        transactionService.deletar(id);
        return ResponseEntity.noContent().build();
    }
    
}
