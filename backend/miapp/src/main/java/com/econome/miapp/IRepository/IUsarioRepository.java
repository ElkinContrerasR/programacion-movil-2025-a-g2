package com.econome.miapp.IRepository;

import com.econome.miapp.Entity.Usuario;

public interface IUsarioRepository extends IBaseRepository<Usuario, Long>{

    Usuario findByEmail(String email);

    
}
