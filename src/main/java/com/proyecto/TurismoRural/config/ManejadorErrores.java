package com.proyecto.TurismoRural.config;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.util.Map;

// ManejadorErrores — captura excepciones y las convierte en JSON amigable
//
// SIN este manejador: cuando ocurre un error en un servicio, Spring devuelve
// una respuesta con el stack trace completo.
//
// Con este manejador: cuando ocurre una RuntimeException (como las que lanzamos
// en ReservaServicio con throw new RuntimeException("mensaje...")), este clase
// la captura y devuelve un JSON limpio:
// { "mensaje": "El cliente está inactivo y no puede realizar reservas." }
// Con código HTTP 400 (Bad Request).

@RestControllerAdvice
public class ManejadorErrores {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> manejarRuntimeException(RuntimeException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of("mensaje", ex.getMessage()));
    }
}
