package br.com.concordia.common.domain.entities;

import jakarta.persistence.*;
import java.util.UUID;

import jakarta.validation.constraints.Pattern;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "empresa")
public class Empresa {
    @Id
    @GeneratedValue
    @UuidGenerator(style = UuidGenerator.Style.VERSION_7)
    private UUID id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false, unique = true)
    @Pattern(regexp = "^[A-Z0-9]{12}\\d{2}$", message = "O CNPJ deve ser válido.")
    private String cnpj;

    @Column(nullable = false)
    private String razaoSocial;

    public Empresa(String nome, String cnpj, String razaoSocial) {
        this.nome = nome;
        this.cnpj = cnpj;
        this.razaoSocial = razaoSocial;
    }
}
