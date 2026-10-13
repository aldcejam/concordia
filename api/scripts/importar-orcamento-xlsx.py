#!/usr/bin/env python3
"""Importa itens de uma planilha de orçamento analítico para a API Concordia."""

import argparse
import json
import re
import sys
import urllib.error
import urllib.request
import zipfile
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path
from xml.etree import ElementTree

NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
CENT = Decimal("0.01")
FOUR_PLACES = Decimal("0.0001")


def value(cell, shared_strings):
    if cell.get("t") == "inlineStr":
        inline = cell.find("m:is/m:t", NS)
        if inline is not None:
            return inline.text or ""
    raw = cell.find("m:v", NS)
    if raw is None:
        return ""
    if cell.get("t") == "s":
        return shared_strings[int(raw.text)]
    return raw.text or ""


def read_rows(path):
    with zipfile.ZipFile(path) as workbook:
        try:
            strings_xml = ElementTree.fromstring(workbook.read("xl/sharedStrings.xml"))
            shared_strings = [
                "".join(part.text or "" for part in item.findall(".//m:t", NS))
                for item in strings_xml.findall("m:si", NS)
            ]
        except KeyError:
            shared_strings = []
        sheet = ElementTree.fromstring(workbook.read("xl/worksheets/sheet1.xml"))
        rows = []
        for row in sheet.findall(".//m:sheetData/m:row", NS):
            cells = {
                re.sub(r"\d+$", "", cell.get("r")): value(cell, shared_strings)
                for cell in row.findall("m:c", NS)
            }
            rows.append((int(row.get("r")), cells))
        return rows


def decimal_value(raw):
    if not raw:
        return Decimal(0)
    return Decimal(raw.replace(".", "").replace(",", ".")) if "," in raw else Decimal(raw)


def import_items(path):
    rows = read_rows(path)
    bdi = decimal_value(rows[1][1].get("G", "20,74%").replace("%", ""))
    items = []
    current_sections = []
    for index, (row_number, row) in enumerate(rows):
        eap_code = row.get("A", "").strip()
        if re.fullmatch(r"\d+(?:\.\d+)*", eap_code) and row.get("D") not in ("Descrição", ""):
            if row.get("D") != "Descrição Total":
                current_sections.append((eap_code, row.get("D", "").strip()))
            else:
                current_sections = [section for section in current_sections if eap_code.startswith(section[0] + ".")]
            continue
        if row.get("A") != "Composição":
            continue

        eap_row = next(
            (candidate for _, candidate in reversed(rows[:index])
             if re.fullmatch(r"\d+(?:\.\d+)*", candidate.get("A", "").strip())
             and candidate.get("D") == "Descrição"),
            None,
        )
        if eap_row is None:
            raise ValueError(f"Código EAP não encontrado antes da linha {row_number}")
        eap_code = eap_row["A"].strip()
        parents = []
        for candidate_code, candidate_name in current_sections:
            if eap_code.startswith(candidate_code + "."):
                parents.append(candidate_name)
        summary = next(
            (candidate for _, candidate in rows[index + 1:] if candidate.get("G") == "Quant. =>"),
            None,
        )
        if summary is None:
            raise ValueError(f"Total da composição {eap_code} não encontrado")
        quantity = decimal_value(summary.get("H", ""))
        total = Decimal(summary.get("J", "0")).quantize(CENT, rounding=ROUND_HALF_UP)
        unit_price = (total / quantity).quantize(CENT, rounding=ROUND_HALF_UP) if quantity else Decimal(0)
        items.append({
            "nome": row.get("D", "").strip(),
            "descricao": row.get("D", "").strip(),
            "inicio": None,
            "prazoEsperadoDias": None,
            "posicao": float(len(items)),
            "codigoEap": eap_code,
            "bancoOrcamento": row.get("C", "").strip(),
            "codigoComposicao": row.get("B", "").strip(),
            "tipoComposicao": row.get("E", "").strip(),
            "macroetapa": " › ".join(parents),
            "unidadeOrcamento": row.get("G", "").strip(),
            "quantidadeOrcada": str(quantity.quantize(FOUR_PLACES, rounding=ROUND_HALF_UP)),
            "valorUnitarioOrcado": str(unit_price),
            "valorUnitarioBase": str(Decimal(row.get("I", "0")).quantize(CENT, rounding=ROUND_HALF_UP)),
            "percentualBdi": str(bdi),
            "valorTotalOrcado": str(total),
        })
    return items


def request_json(url, method="GET", data=None):
    payload = json.dumps(data).encode() if data is not None else None
    request = urllib.request.Request(
        url, data=payload, method=method,
        headers={"Content-Type": "application/json"} if payload is not None else {},
    )
    try:
        with urllib.request.urlopen(request) as response:
            content = response.read()
            return json.loads(content) if content else None
    except urllib.error.HTTPError as error:
        raise RuntimeError(f"API respondeu HTTP {error.code}: {error.read().decode()}") from error


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("planilha", type=Path)
    parser.add_argument("--api", default="http://localhost:8080")
    args = parser.parse_args()
    if not args.planilha.is_file():
        parser.error(f"arquivo não encontrado: {args.planilha}")

    items = import_items(args.planilha)
    description = (
        "COMPLEMENTAÇÃO DA OBRA DA ESCOLA MULTICAMPI DE CIÊNCIAS MÉDICAS (EMCM) "
        "- INFRAESTRUTURA E URBANIZAÇÃO - COM DESCONTO LINEAR"
    )
    obras = request_json(f"{args.api}/api/obras")
    obra = next((item for item in obras if item["descricao"] == description), None)
    if obra is None:
        obra = request_json(f"{args.api}/api/obras", "POST", {
            "descricao": description,
            "uf": "RN",
            "fusoHorario": "America/Fortaleza",
            "idEmpresa": None,
        })

    existing = request_json(f"{args.api}/api/obras/{obra['id']}/etapas")
    existing_by_code = {stage.get("codigoEap"): stage for stage in existing}

    imported = 0
    for number, item in enumerate(items, start=1):
        current = existing_by_code.get(item["codigoEap"])
        if current:
            request_json(
                f"{args.api}/api/obras/{obra['id']}/etapas/{current['id']}/orcamento",
                "PATCH",
                item,
            )
        else:
            request_json(f"{args.api}/api/obras/{obra['id']}/etapas", "POST", item)
        imported += 1
        print(f"Importadas {number}/{len(items)} composições", flush=True)
    print(f"Importação concluída. Obra {obra['id']}: {imported} composições sincronizadas; {len(items)} no total.")


if __name__ == "__main__":
    try:
        main()
    except Exception as error:  # noqa: BLE001 - mensagem amigável para ferramenta CLI
        print(f"Erro: {error}", file=sys.stderr)
        sys.exit(1)
