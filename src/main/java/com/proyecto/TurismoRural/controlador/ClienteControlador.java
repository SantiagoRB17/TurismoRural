package com.proyecto.TurismoRural.controlador;

import com.proyecto.TurismoRural.modelo.Cliente;
import com.proyecto.TurismoRural.servicio.ClienteServicio;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.Map;

// ClienteControlador — recibe y responde peticiones HTTP del frontend

@RestController

@RequestMapping("/api/clientes")

@RequiredArgsConstructor
public class ClienteControlador {

    private final ClienteServicio clienteServicio;

    // GET /api/clientes          → devuelve todos los clientes
    // GET /api/clientes?query=xx → busca clientes por texto
    @GetMapping
    public ResponseEntity<List<Cliente>> listarOBuscar(
            @RequestParam(required = false) String query) {

        if (query != null && !query.isBlank()) {
            return ResponseEntity.ok(clienteServicio.buscar(query));
        }
        return ResponseEntity.ok(clienteServicio.listarTodos());
    }

    // GET /api/clientes/{documento} → devuelve un cliente específico
    @GetMapping("/{documento}")
    public ResponseEntity<Cliente> buscarPorDocumento(@PathVariable String documento) {
        return ResponseEntity.ok(clienteServicio.buscarPorDocumento(documento));
    }

    // POST /api/clientes → crea un nuevo cliente
    @PostMapping
    public ResponseEntity<Cliente> crear(@RequestBody Cliente cliente) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(clienteServicio.crear(cliente));
    }

    // PUT /api/clientes/{documento} → actualiza un cliente
    // Recibe tanto el documento en la URL como los nuevos datos en el cuerpo.
    @PutMapping("/{documento}")
    public ResponseEntity<Cliente> actualizar(
            @PathVariable String documento,
            @RequestBody Cliente datos) {
        return ResponseEntity.ok(clienteServicio.actualizar(documento, datos));
    }

    // DELETE /api/clientes/{documento} → desactiva un cliente
    @DeleteMapping("/{documento}")
    public ResponseEntity<Void> desactivar(@PathVariable String documento) {
        clienteServicio.desactivar(documento);
        return ResponseEntity.noContent().build();
    }

    // PATCH /api/clientes/{documento}/estado → activa o desactiva
    @PatchMapping("/{documento}/estado")
    public ResponseEntity<Void> cambiarEstado(
            @PathVariable String documento,
            @RequestBody Map<String, String> body) {
        String nuevoEstado = body.get("estado");
        if ("ACTIVO".equals(nuevoEstado)) {
            clienteServicio.activar(documento);
        } else if ("INACTIVO".equals(nuevoEstado)) {
            clienteServicio.desactivar(documento);
        } else {
            throw new RuntimeException("Estado no válido: " + nuevoEstado);
        }
        return ResponseEntity.noContent().build();
    }
}
