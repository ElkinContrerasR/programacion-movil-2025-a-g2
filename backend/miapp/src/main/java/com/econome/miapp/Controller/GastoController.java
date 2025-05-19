package com.econome.miapp.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.econome.miapp.DTO.ApiResponseDto;
import com.econome.miapp.Entity.Gasto;
import com.econome.miapp.Entity.Usuario;
import com.econome.miapp.IService.IGastoService;
import com.econome.miapp.IService.IUsuarioService;

@RestController
@RequestMapping("/api/gastos")
public class GastoController extends ABaseController<Gasto, IGastoService>{
    @Autowired
    private IGastoService gastoService;

    @Autowired
    private IUsuarioService usuarioService;

    public GastoController(IGastoService service) {
        super(service, "Gasto");
        this.gastoService = service;
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<ApiResponseDto<List<Gasto>>> getGastosByUsuario(@PathVariable Long usuarioId) {
        try {
            Usuario usuario = usuarioService.findById(usuarioId);
            if (usuario == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponseDto<>("Usuario no encontrado", null, false));
            }
            List<Gasto> gastos = gastoService.findByUsuario(usuario);
            return ResponseEntity.ok(new ApiResponseDto<>("Gastos del usuario obtenidos", gastos, true));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new ApiResponseDto<>(e.getMessage(), null, false));
        }
    }

    @PostMapping("/usuario/{usuarioId}")
    public ResponseEntity<ApiResponseDto<Gasto>> saveGasto(@PathVariable Long usuarioId, @RequestBody Gasto gasto) {
        try {
            Usuario usuario = usuarioService.findById(usuarioId);
            if (usuario == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponseDto<>("Usuario no encontrado", null, false));
            }
            Gasto nuevoGasto = gastoService.save(gasto, usuario);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponseDto<>("Gasto guardado", nuevoGasto, true));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new ApiResponseDto<>(e.getMessage(), null, false));
        }
    }

    @PutMapping("/{id}/usuario/{usuarioId}")
    public ResponseEntity<ApiResponseDto<Gasto>> updateGasto(@PathVariable Long id, @PathVariable Long usuarioId, @RequestBody Gasto gasto) {
        try {
            Usuario usuario = usuarioService.findById(usuarioId);
            if (usuario == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponseDto<>("Usuario no encontrado", null, false));
            }
            Gasto updatedGasto = gastoService.update(id, gasto, usuario);
            return ResponseEntity.ok(new ApiResponseDto<>("Gasto actualizado", updatedGasto, true));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponseDto<>(e.getMessage(), null, false));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new ApiResponseDto<>(e.getMessage(), null, false));
        }
    }
}
