package com.econome.miapp.Service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

import com.econome.miapp.Entity.Entrada;

import com.econome.miapp.IRepository.IEntradaRepository;

import com.econome.miapp.IService.IEntradaService;

@Service
public class EntradaService extends ABaseService<Entrada> implements IEntradaService{

    @Autowired
    private IEntradaRepository repository;

    @Override
    protected JpaRepository<Entrada, Long> getRepository() {
        return repository;
    }

    @Override
    public Optional<Entrada> findByUsuarioId(Long usuarioId) {
        return repository.findByUsuarioId(usuarioId);
    }
    
    
}
