package com.proyecto.TurismoRural.controlador;

import com.proyecto.TurismoRural.modelo.Experiencia;
import com.proyecto.TurismoRural.repositorio.ExperienciaRepositorio;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

// ExperienciaControlador — endpoints para consultar experiencias

@RestController
@RequestMapping("/api/experiencias")
@RequiredArgsConstructor
public class ExperienciaControlador {

    private final ExperienciaRepositorio experienciaRepositorio;

    // GET /api/experiencias          → devuelve todas las experiencias
    // GET /api/experiencias?query=xx → busca por nombre o ubicación
    @GetMapping
    public ResponseEntity<List<Experiencia>> listarOBuscar(
            @RequestParam(required = false) String query) {

        if (query != null && !query.isBlank()) {
            return ResponseEntity.ok(
                    experienciaRepositorio.buscarPorTexto(query));
        }
        return ResponseEntity.ok(experienciaRepositorio.findAll());
    }
    
    // GET /api/experiencias/{id} → devuelve una experiencia por ID
    @GetMapping("/{id}")
    public ResponseEntity<Experiencia> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(
                experienciaRepositorio.findById(id)
                        .orElseThrow(() -> new RuntimeException(
                                "No se encontró la experiencia con el ID: " + id)));
    }
}
