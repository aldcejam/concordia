package br.com.concordia.common.domain.entities;

import jakarta.persistence.*;
import java.util.UUID;
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
    private String cnpj;

    @Column(nullable = false)
    private String razaoSocial;

    public Empresa(String nome, String cnpj, String razaoSocial) {
        this.nome = nome;
        this.cnpj = cnpj;
        this.razaoSocial = razaoSocial;
    }
}
