package br.com.concordia.domain.obra;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import br.com.concordia.domain.common.enums.UnidadeFederativa;
import br.com.concordia.domain.empresa.EmpresaRepository;
import br.com.concordia.domain.obra.dependencia.DependenciaEtapaRepository;
import br.com.concordia.domain.obra.entities.EtapaObra;
import br.com.concordia.domain.obra.entities.ItemEap;
import br.com.concordia.domain.obra.entities.Obra;
import java.time.ZoneId;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

class ObraServiceReordenacaoTest {

    private ObraRepository obraRepository;
    private EmpresaRepository empresaRepository;
    private ObraMapper obraMapper;
    private ObraService obraService;

    @BeforeEach
    void setUp() {
        obraRepository = mock(ObraRepository.class);
        empresaRepository = mock(EmpresaRepository.class);
        obraMapper = mock(ObraMapper.class);
        obraService =
                new ObraService(obraRepository, empresaRepository, obraMapper, mock(DependenciaEtapaRepository.class));
    }

    @Test
    void deveReordenarEtapaParaFicarLogoAposEtapaAtrasada() {
        UUID obraId = UUID.randomUUID();
        Obra obra = new Obra("Construção Hospitalar", UnidadeFederativa.RN, ZoneId.of("America/Fortaleza"), null);
        ReflectionTestUtils.setField(obra, "id", obraId);

        UUID idEtapa1 = UUID.randomUUID();
        UUID idEtapa2 = UUID.randomUUID();
        UUID idEtapa3 = UUID.randomUUID();

        EtapaObra etapa1 = new EtapaObra("Demolição", null, 10);
        ReflectionTestUtils.setField(etapa1, "id", idEtapa1);
        ItemEap item1 = new ItemEap(obra, "Demolição", 1000.0, etapa1);
        ReflectionTestUtils.setField(item1, "id", UUID.randomUUID());
        item1.atualizarDadosOrcamento("Demolição", "1.1", null, null, null, "1.0", "UN", null, null, null, null, null);
        obra.adicionarItemEap(item1);

        EtapaObra etapa2 = new EtapaObra("Alvenaria", null, 20);
        ReflectionTestUtils.setField(etapa2, "id", idEtapa2);
        ItemEap item2 = new ItemEap(obra, "Alvenaria", 2000.0, etapa2);
        ReflectionTestUtils.setField(item2, "id", UUID.randomUUID());
        item2.atualizarDadosOrcamento("Alvenaria", "1.2", null, null, null, "1.0", "UN", null, null, null, null, null);
        obra.adicionarItemEap(item2);

        EtapaObra etapa3 = new EtapaObra("Pintura", null, 15);
        ReflectionTestUtils.setField(etapa3, "id", idEtapa3);
        ItemEap item3 = new ItemEap(obra, "Pintura", 3000.0, etapa3);
        ReflectionTestUtils.setField(item3, "id", UUID.randomUUID());
        item3.atualizarDadosOrcamento("Pintura", "1.3", null, null, null, "1.0", "UN", null, null, null, null, null);
        obra.adicionarItemEap(item3);

        when(obraRepository.findById(obraId)).thenReturn(Optional.of(obra));

        // Reordena etapa 3 (Pintura) para ficar logo após a etapa 1 (Demolição atrasada)
        var resultado = obraService.reordenarEtapaLogoApos(obraId, idEtapa1, idEtapa3);

        assertEquals(3, resultado.size());
        assertEquals("Demolição", resultado.get(0).nome());
        assertEquals("Pintura", resultado.get(1).nome());
        assertEquals("Alvenaria", resultado.get(2).nome());

        // Posição de Pintura deve estar entre 1000.0 e 2000.0 (1500.0)
        assertEquals(1500.0, item3.getPosicao());
        verify(obraRepository).save(obra);
    }
}
