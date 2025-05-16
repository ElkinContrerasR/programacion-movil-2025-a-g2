package com.econome.miapp.IService;

import com.econome.miapp.Entity.Usuario;

public interface IUsuarioService extends IBaseService<Usuario>  {
    Usuario login(String email, String password);
    
}
