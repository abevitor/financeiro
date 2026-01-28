package com.financeiro.financeiroWEB.auth.security;



import com.financeiro.financeiroWEB.repository.UserRepository;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService{

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        var user = userRepository.findByEmail(email)
                 .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado"));

                 return org.springframework.security.core.userdetails.User
                           .withUsername(user.getEmail())
                           .password(user.getSenha())
                           .roles("USER")
                           .build();
    }
    
}
