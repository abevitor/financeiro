package com.financeiro.financeiroWEB.service;
import java.util.List;

import org.springframework.stereotype.Service;

import com.financeiro.financeiroWEB.domain.model.User;
import com.financeiro.financeiroWEB.repository.UserRepository;

import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public User criar(User user) {
        if(userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email já cadastrado");
        }
        return userRepository.save(user);
    }

    public User buscarPorId(Long id) {
        return userRepository.findById(id)
               .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));          
    }

    public List<User> listarTodos(){
        return userRepository.findAll();
    }

        public void deletar(Long id) {
        User user = buscarPorId(id);
        userRepository.delete(user);
    }
 
}
