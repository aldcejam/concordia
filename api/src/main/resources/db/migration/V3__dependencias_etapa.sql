-- UC06: vínculos de precedência entre etapas (FI, II, FF) com desfasamento.
-- Substitui a antiga tabela de junção etapa_obra_cpm, que não guardava tipo nem desfasamento.
CREATE TABLE IF NOT EXISTS dependencia_etapa (
    id                    UUID PRIMARY KEY,
    id_obra               UUID        NOT NULL REFERENCES obra (id) ON DELETE CASCADE,
    id_etapa_predecessora UUID        NOT NULL REFERENCES etapa_obra (id) ON DELETE CASCADE,
    id_etapa_sucessora    UUID        NOT NULL REFERENCES etapa_obra (id) ON DELETE CASCADE,
    tipo                  VARCHAR(2)  NOT NULL CHECK (tipo IN ('FI', 'II', 'FF')),
    desfasamento_dias     INTEGER     NOT NULL DEFAULT 0,
    obrigatoria           BOOLEAN     NOT NULL DEFAULT TRUE,
    criada_em             TIMESTAMP(6) WITH TIME ZONE NOT NULL,
    CONSTRAINT uk_dependencia_etapa_par UNIQUE (id_etapa_predecessora, id_etapa_sucessora),
    CONSTRAINT ck_dependencia_etapa_distintas CHECK (id_etapa_predecessora <> id_etapa_sucessora)
);

CREATE INDEX IF NOT EXISTS idx_dependencia_etapa_obra ON dependencia_etapa (id_obra);
