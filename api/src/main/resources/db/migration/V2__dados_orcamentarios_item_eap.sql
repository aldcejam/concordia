ALTER TABLE item_eap ADD COLUMN IF NOT EXISTS codigo_eap VARCHAR(80);
ALTER TABLE item_eap ADD COLUMN IF NOT EXISTS banco_orcamento VARCHAR(80);
ALTER TABLE item_eap ADD COLUMN IF NOT EXISTS codigo_composicao VARCHAR(80);
ALTER TABLE item_eap ADD COLUMN IF NOT EXISTS tipo_composicao VARCHAR(160);
ALTER TABLE item_eap ADD COLUMN IF NOT EXISTS macroetapa VARCHAR(255);
ALTER TABLE item_eap ADD COLUMN IF NOT EXISTS unidade_orcamento VARCHAR(40);
ALTER TABLE item_eap ADD COLUMN IF NOT EXISTS quantidade_orcada NUMERIC(19, 4);
ALTER TABLE item_eap ADD COLUMN IF NOT EXISTS valor_unitario_orcado NUMERIC(19, 4);
ALTER TABLE item_eap ADD COLUMN IF NOT EXISTS valor_unitario_base NUMERIC(19, 4);
ALTER TABLE item_eap ADD COLUMN IF NOT EXISTS percentual_bdi NUMERIC(7, 4);
ALTER TABLE item_eap ADD COLUMN IF NOT EXISTS valor_total_orcado NUMERIC(19, 2);
ALTER TABLE etapa_obra ALTER COLUMN inicio DROP NOT NULL;
ALTER TABLE etapa_obra ALTER COLUMN descricao TYPE VARCHAR(2000);
ALTER TABLE item_eap ALTER COLUMN nome TYPE VARCHAR(2000);

CREATE UNIQUE INDEX IF NOT EXISTS uk_item_eap_id_obra_codigo_eap
    ON item_eap (id_obra, codigo_eap)
    WHERE codigo_eap IS NOT NULL;
