package com.proyecto.TurismoRural.dto;

import lombok.Data;
import java.time.LocalDate;

// ReservaRequest — DTO (Data Transfer Object) para crear una reserva

@Data
public class ReservaRequest {

    // Documento de identidad del cliente que hace la reserva
    private String clienteDocumento;

    // ID de la experiencia que el cliente quiere reservar
    private Long experienciaId;

    // Fecha en que el cliente quiere realizar la experiencia
    // Spring convierte automáticamente el string "2025-08-20" a LocalDate
    private LocalDate fechaExperiencia;

    // Cuántas personas van a participar en la experiencia
    private Integer cantidadPersonas;
}
