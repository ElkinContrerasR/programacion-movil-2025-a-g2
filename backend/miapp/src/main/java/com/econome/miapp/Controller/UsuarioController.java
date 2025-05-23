package com.econome.miapp.Controller;


import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import org.springframework.web.bind.annotation.RestController;

import com.econome.miapp.Entity.Usuario;

import com.econome.miapp.IService.IUsuarioService;


//@CrossOrigin(origins = "http://localhost:8100")
@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController extends ABaseController<Usuario, IUsuarioService> {
    @Autowired
    IUsuarioService usuarioService;


    protected UsuarioController(IUsuarioService service) {
         super(service, "usuario");
        
    }


    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Usuario loginUsuario){

        Usuario autenticado = usuarioService.login(loginUsuario.getEmail(), loginUsuario.getPassword());

        if(autenticado != null){
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Inicio de sesión exitoso");
            response.put("user", Map.of(
                "id", autenticado.getId(),
                "email", autenticado.getEmail(),
                "nombreUsuario", autenticado.getNombreUsuario()
            ));
            return ResponseEntity.ok(response);
            
        }else {
            return ResponseEntity.status(401)
                .body(Collections.singletonMap("error", "Credenciales incorrectas"));
        }
        
    }
    
}
