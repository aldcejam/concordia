-- Executar uma vez em bancos PostgreSQL existentes antes de iniciar com o perfil prod.
-- O perfil dev usa ddl-auto=update. Este script não altera a hierarquia da EAP.
BEGIN;
ALTER TABLE obra ADD COLUMN IF NOT EXISTS versao_cronograma BIGINT NOT NULL DEFAULT 0;
ALTER TABLE etapa_obra ADD COLUMN IF NOT EXISTS ordem INTEGER;
ALTER TABLE etapa_obra ALTER COLUMN descricao TYPE TEXT;
ALTER TABLE item_eap ALTER COLUMN nome TYPE TEXT;
ALTER TABLE etapa_obra ADD COLUMN IF NOT EXISTS status VARCHAR(255) NOT NULL DEFAULT 'NAO_INICIADA';
ALTER TABLE etapa_obra ADD COLUMN IF NOT EXISTS inicio_original TIMESTAMP WITH TIME ZONE;
ALTER TABLE etapa_obra ADD COLUMN IF NOT EXISTS fim_original TIMESTAMP WITH TIME ZONE;
ALTER TABLE etapa_obra ADD COLUMN IF NOT EXISTS inicio_real TIMESTAMP WITH TIME ZONE;
ALTER TABLE etapa_obra ADD COLUMN IF NOT EXISTS fim_real TIMESTAMP WITH TIME ZONE;
UPDATE etapa_obra SET inicio_original = inicio WHERE inicio_original IS NULL;
UPDATE etapa_obra SET fim_original = COALESCE(fim, inicio + prazo_esperado_dias * INTERVAL '1 day')
WHERE fim_original IS NULL;
CREATE TABLE IF NOT EXISTS atraso_etapa (
    id UUID PRIMARY KEY,
    obra_id UUID NOT NULL,
    etapa_id UUID NOT NULL,
    motivo VARCHAR(2000) NOT NULL,
    dias_atraso INTEGER NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL,
    referencia TIMESTAMP WITH TIME ZONE,
    aplicado_em TIMESTAMP WITH TIME ZONE,
    autor_aplicacao VARCHAR(255),
    versao_cronograma BIGINT NOT NULL,
    status VARCHAR(255) NOT NULL,
    erro VARCHAR(255),
    sugestoes_json TEXT,
    contexto_json TEXT,
    selecionadas_json TEXT,
    resultado_json TEXT
);
CREATE INDEX IF NOT EXISTS idx_atraso_obra_data ON atraso_etapa (obra_id, criado_em DESC);
COMMIT;
