package com.econome.miapp.Controller;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.econome.miapp.DTO.ApiResponseDto;
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
     public ResponseEntity<ApiResponseDto<Entrada>> obtenerEntradaPorUsuario(@PathVariable Long usuarioId) {
        try {
            // Llama al servicio para obtener la entrada.
            // Ahora el servicio devuelve Optional<Entrada>
            Optional<Entrada> optionalEntrada = entradaService.findByUsuarioId(usuarioId);

            if (optionalEntrada.isPresent()) {
                Entrada entrada = optionalEntrada.get();
                // Si la entrada existe, la envolvemos en ApiResponseDto con status true
                return ResponseEntity.ok(new ApiResponseDto<>("Entrada inicial obtenida exitosamente", entrada, true));
            } else {
                // Si no se encuentra una entrada, devolvemos un ApiResponseDto con data null y status false/message
                return ResponseEntity.ok(new ApiResponseDto<>("No se encontró entrada inicial para el usuario", null, false));
            }
        } catch (Exception e) {
            // Manejo de errores genérico para cualquier otra excepción
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body(new ApiResponseDto<>("Error al obtener la entrada: " + e.getMessage(), null, false));
        }
    }
}
