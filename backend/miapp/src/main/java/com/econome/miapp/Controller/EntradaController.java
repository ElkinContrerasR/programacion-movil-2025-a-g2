package com.econome.miapp.Controller;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.econome.miapp.Entity.Entrada;
import com.econome.miapp.IService.IEntradaService;

//@CrossOrigin(origins = "http://localhost:8100")
@RestController
@RequestMapping("/api/entrada")
public class EntradaController extends ABaseController<Entrada, IEntradaService >{

    @Autowired
    IEntradaService entradaService;

    
    protected EntradaController(IEntradaService service) {
         super(service, "entrada");
        
    }


    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<Entrada> obtenerEntradaPorUsuario(@PathVariable Long usuarioId) {
        Optional<Entrada> entradaOptional = entradaService.findByUsuarioId(usuarioId);
        if (entradaOptional.isPresent()) {
            return new ResponseEntity<>(entradaOptional.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}
