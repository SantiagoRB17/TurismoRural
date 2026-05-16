package com.proyecto.TurismoRural.servicio;

import com.proyecto.TurismoRural.dto.ReservaRequest;
import com.proyecto.TurismoRural.modelo.Cliente;
import com.proyecto.TurismoRural.modelo.Experiencia;
import com.proyecto.TurismoRural.modelo.Reserva;
import com.proyecto.TurismoRural.modelo.enums.EstadoCliente;
import com.proyecto.TurismoRural.modelo.enums.EstadoExperiencia;
import com.proyecto.TurismoRural.modelo.enums.EstadoReserva;
import com.proyecto.TurismoRural.repositorio.ClienteRepositorio;
import com.proyecto.TurismoRural.repositorio.ExperienciaRepositorio;
import com.proyecto.TurismoRural.repositorio.ReservaRepositorio;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

// ReservaServicio — lógica de negocio para reservas

@Service
@RequiredArgsConstructor
public class ReservaServicio {

    private final ReservaRepositorio reservaRepositorio;
    private final ClienteRepositorio clienteRepositorio;
    private final ExperienciaRepositorio experienciaRepositorio;

    // CREAR UNA NUEVA RESERVA con todas las validaciones
    public Reserva crearReserva(ReservaRequest dto) {

        Cliente cliente = clienteRepositorio.findById(dto.getClienteDocumento())
                .orElseThrow(() -> new RuntimeException(
                        "No se encontró un cliente con el documento: " + dto.getClienteDocumento()));

        Experiencia experiencia = experienciaRepositorio.findById(dto.getExperienciaId())
                .orElseThrow(() -> new RuntimeException(
                        "No se encontró una experiencia con el ID: " + dto.getExperienciaId()));

        // ============================================================
        // REGLA RN-06: El cliente debe estar ACTIVO para poder reservar
        // ============================================================
        if (cliente.getEstado() == EstadoCliente.INACTIVO) {
            throw new RuntimeException("El cliente está inactivo y no puede realizar reservas.");
        }

        // ============================================================
        // REGLA RN-01: Máximo 2 reservas activas por cliente
        // ============================================================
        // Contamos las reservas PENDIENTE y CONFIRMADA del cliente.
        // Las CANCELADAS no se cuentan porque ya no están activas.
        long reservasActivas = reservaRepositorio.contarReservasActivas(
                dto.getClienteDocumento(),
                List.of(EstadoReserva.PENDIENTE, EstadoReserva.CONFIRMADA));

        if (reservasActivas >= 2) {
            throw new RuntimeException(
                    "El cliente ya tiene el máximo de reservas activas permitidas (2). " +
                            "Debe cancelar una reserva antes de crear una nueva.");
        }

        // ============================================================
        // REGLA RN-02: Solo se puede reservar experiencias DISPONIBLES
        // ============================================================
        if (experiencia.getEstado() != EstadoExperiencia.DISPONIBLE) {
            throw new RuntimeException(
                    "La experiencia '" + experiencia.getNombre() +
                            "' no está disponible para reservas. Estado actual: " + experiencia.getEstado());
        }

        // ============================================================
        // REGLA RN-03: La cantidad de personas no puede superar la capacidad
        // ============================================================
        if (dto.getCantidadPersonas() > experiencia.getCapacidadMaxima()) {
            throw new RuntimeException(
                    "La cantidad de personas solicitada (" + dto.getCantidadPersonas() +
                            ") supera la capacidad máxima de la experiencia (" +
                            experiencia.getCapacidadMaxima() + " personas).");
        }

        // ============================================================
        // REGLA RN-04: La fecha debe ser mínimo mañana
        // ============================================================
        if (!dto.getFechaExperiencia().isAfter(LocalDate.now())) {
            throw new RuntimeException(
                    "La fecha de la experiencia debe ser mínimo mañana (" +
                            LocalDate.now().plusDays(1) + "). " +
                            "No se pueden hacer reservas para hoy ni fechas pasadas.");
        }

        // ============================================================
        // REGLA RN-07: No pueden existir reservas duplicadas
        // ============================================================
        boolean yaExiste = reservaRepositorio.existeDuplicado(
                dto.getClienteDocumento(),
                dto.getExperienciaId(),
                dto.getFechaExperiencia(),
                List.of(EstadoReserva.PENDIENTE, EstadoReserva.CONFIRMADA));

        if (yaExiste) {
            throw new RuntimeException(
                    "El cliente ya tiene una reserva activa para '" +
                            experiencia.getNombre() + "' en la fecha " + dto.getFechaExperiencia() + ".");
        }

        // ============================================================
        // REGLA RN-05: El total lo calcula el servidor
        // ============================================================
        BigDecimal total = experiencia.getPrecio()
                .multiply(BigDecimal.valueOf(dto.getCantidadPersonas()));

        Reserva reserva = new Reserva();
        reserva.setCliente(cliente);
        reserva.setExperiencia(experiencia);
        reserva.setFechaReserva(LocalDate.now());
        reserva.setFechaExperiencia(dto.getFechaExperiencia());
        reserva.setCantidadPersonas(dto.getCantidadPersonas());
        reserva.setTotal(total);
        reserva.setEstado(EstadoReserva.PENDIENTE);
        reserva.setCreadoEn(LocalDateTime.now());

        return reservaRepositorio.save(reserva);
    }

    // Busca una reserva por su ID
    public Reserva buscarPorId(Long id) {
        return reservaRepositorio.findById(id)
                .orElseThrow(() -> new RuntimeException("No se encontró una reserva con el ID: " + id));
    }

    // Devuelve todas las reservas
    public List<Reserva> listarTodos() {
        return reservaRepositorio.findAll();
    }

    // Devuelve las reservas de un cliente específico
    public List<Reserva> listarPorCliente(String documento) {
        return reservaRepositorio.findByClienteDocumento(documento);
    }
}
