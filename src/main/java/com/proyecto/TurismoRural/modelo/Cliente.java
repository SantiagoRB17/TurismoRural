package com.proyecto.TurismoRural.modelo;

import com.proyecto.TurismoRural.modelo.enums.EstadoCliente;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cliente {

    private String documento;

    private String nombre;

    private String apellido;

    private String email;

    private String telefono;

    private EstadoCliente estado = EstadoCliente.ACTIVO;
}
