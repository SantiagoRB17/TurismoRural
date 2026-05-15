package com.proyecto.TurismoRural.modelo;

import com.proyecto.TurismoRural.modelo.enums.EstadoExperiencia;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Experiencia {

    private Long id;

    private String nombre;

    private String descripcion;

    private String ubicacion;

    private BigDecimal precio;

    private Integer capacidadMaxima;

    private Integer duracionHoras;

    private EstadoExperiencia estado = EstadoExperiencia.DISPONIBLE;
}
