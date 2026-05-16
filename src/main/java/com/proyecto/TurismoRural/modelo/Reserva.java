package com.proyecto.TurismoRural.modelo;

import com.proyecto.TurismoRural.modelo.enums.EstadoReserva;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

// Clase Reserva — representa una reserva hecha por un cliente

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Reserva {

    private Long id;

    private Cliente cliente;

    private Experiencia experiencia;

    private LocalDate fechaReserva;

    private LocalDate fechaExperiencia;

    private Integer cantidadPersonas;

    private BigDecimal total;

    private EstadoReserva estado = EstadoReserva.PENDIENTE;

    private LocalDateTime creadoEn;
}
