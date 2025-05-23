package com.econome.miapp.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

import com.econome.miapp.Entity.Usuario;
import com.econome.miapp.IRepository.IUsarioRepository;
import com.econome.miapp.IService.IUsuarioService;

@Service
public class UsuarioService extends ABaseService<Usuario> implements IUsuarioService{

    @Autowired
    private IUsarioRepository repository;

    

    @Override
    protected JpaRepository<Usuario, Long> getRepository() {
        return repository;
    }

    
    @Override
    public Usuario login(String email, String password){
        Usuario usuario = repository.findByEmail(email);
        if(usuario != null && usuario.getPassword().equals(password)){
            return usuario;
        }
        return null;
    }

   
}
