package com.proyecto.TurismoRural.controlador;

import com.proyecto.TurismoRural.dto.ReservaRequest;
import com.proyecto.TurismoRural.modelo.Reserva;
import com.proyecto.TurismoRural.servicio.ReservaServicio;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

// ReservaControlador — endpoints para crear y consultar reservas

@RestController
@RequestMapping("/api/reservas")
@RequiredArgsConstructor
public class ReservaControlador {

    private final ReservaServicio reservaServicio;

    // GET /api/reservas              → todas las reservas
    // GET /api/reservas?clienteDoc=x → reservas de un cliente
    @GetMapping
    public ResponseEntity<List<Reserva>> listar(
            @RequestParam(required = false) String clienteDoc) {
        if (clienteDoc != null && !clienteDoc.isBlank()) {
            return ResponseEntity.ok(reservaServicio.listarPorCliente(clienteDoc));
        }
        return ResponseEntity.ok(reservaServicio.listarTodos());
    }

    // POST /api/reservas → crea una nueva reserva
    @PostMapping
    public ResponseEntity<Reserva> crear(@RequestBody ReservaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reservaServicio.crearReserva(request));
    }

    // GET /api/reservas/{id} → devuelve el detalle de una reserva
    @GetMapping("/{id}")
    public ResponseEntity<Reserva> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(reservaServicio.buscarPorId(id));
    }
}
