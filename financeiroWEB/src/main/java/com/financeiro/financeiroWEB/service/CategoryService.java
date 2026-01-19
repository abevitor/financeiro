package com.financeiro.financeiroWEB.service;

import java.util.List;

import com.financeiro.financeiroWEB.domain.enums.CategoryType;
import com.financeiro.financeiroWEB.domain.model.Category;
import com.financeiro.financeiroWEB.repository.CategoryRepository;

public class CategoryService {

     private final CategoryRepository categoryRepository = null;

    public Category criar(Category category){
        return categoryRepository.save(category);
    }

    public List<Category> listarTodas(){
        return categoryRepository.findAll();
    }

    public List<Category> listarPorTipo(CategoryType tipo) {
        return categoryRepository.findByTipo(tipo);
    }

    public Category buscarPorId(Long id){
        return categoryRepository.findById(id)
               .orElseThrow(() -> new RuntimeException("Categoria não encontrada")); 
    }
    

         public void deletar(Long id) {
        Category category = buscarPorId(id);
        categoryRepository.delete(category);
               }
}
