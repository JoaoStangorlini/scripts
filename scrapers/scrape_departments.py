#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Este arquivo é parte do programa HUB Lab-Div - Software Livre sob licença GNU AGPLv3.
Copyright (C) 2026 João Paulo Stangorlini de Carvalho

Módulo A (v3.1): Extrator Resiliente de Dados Departamentais, Docentes e Laboratórios do IFUSP.
Salva payload estruturado em cache JSON para validação e auditoria TypeScript/Zod.
"""

import os
import sys
import json
import time
import hashlib
import ssl
import re
import unicodedata
import urllib.request
import urllib.error
from datetime import datetime, timedelta
from bs4 import BeautifulSoup

SENTINEL_VALUES = {"-", "--", "---", "?", "s/n", "sn", "none", "null", "n/a", ""}
STOPWORDS = {"de", "da", "do", "dos", "das", "del", "e", "van", "von", "der"}
GENERIC_MENU_TITLES = {
    "laboratorios", "laboratórios", "laboratorio", "laboratório",
    "laboratorios de pesquisa", "laboratórios de pesquisa",
    "laboratórios didáticos", "laboratorios didaticos",
    "laboratórios de ensino", "laboratorios de ensino",
    "grupos de pesquisa", "grupo de pesquisa",
    "laboratórios e grupos", "laboratorios e grupos",
    "pesquisa", "linhas de pesquisa", "início", "sobre", "pessoas"
}

def decode_cloudflare_email(cf_hex: str) -> str:
    """Decodifica e-mails protegidos pelo algoritmo XOR do Cloudflare."""
    try:
        key = int(cf_hex[:2], 16)
        return "".join([chr(int(cf_hex[i:i+2], 16) ^ key) for i in range(2, len(cf_hex), 2)])
    except Exception:
        return ""

def clean_email(raw: str) -> str:
    """Normaliza e-mails com ofuscações textuais ou links /cdn-cgi/l/email-protection#."""
    if not raw:
        return ""
    s = raw.strip()
    
    # Se recebeu URL do Cloudflare, extrai o hash
    if "/cdn-cgi/l/email-protection#" in s:
        hex_str = s.split("#")[-1]
        s = decode_cloudflare_email(hex_str)
    
    s = re.sub(r'\[at\]|\(arroba\)|\[arroba\]|&#64;', '@', s, flags=re.IGNORECASE)
    s = re.sub(r'\[dot\]|\(ponto\)|\[ponto\]', '.', s, flags=re.IGNORECASE)
    s = re.sub(r'\s*@\s*', '@', s)
    s = re.sub(r'\s*\.\s*', '.', s)
    
    match = re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', s)
    if match:
        return match.group(0).lower()
    return ""

def compute_initials(name: str) -> str:
    """Gera iniciais maiúsculas preservando sobrenomes curtos reais de 2 letras (ex: Sá, Li, Wu)."""
    parts = [p for p in re.split(r'\s+', name.strip()) if len(p) >= 2 and p.lower() not in STOPWORDS]
    if not parts:
        clean = re.sub(r'[^a-zA-Z]', '', name)
        return clean[:2].upper() if len(clean) >= 2 else "DC"
    if len(parts) == 1:
        return parts[0][:2].upper()
    return f"{parts[0][0]}{parts[-1][0]}".upper()

def slugify(text: str) -> str:
    """Gera um slug ASCII limpo a partir de qualquer string unicode."""
    norm = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('ascii')
    clean = re.sub(r'[^a-zA-Z0-9]+', '-', norm.lower()).strip('-')
    return clean or "item"

def normalize_role(funcao_oficial: str, funcao_detalhada: str = "") -> str:
    """
    Converte termos brutos de Drupal para títulos acadêmicos padronizados.
    Dá precedência estrita a Emérito e Sênior sobre cargos anteriores.
    Se não houver termo explícito de hierarquia (ex: apenas 'DCT - Docente'), retorna 'Docente'.
    """
    combined = f"{funcao_oficial} {funcao_detalhada}".lower()
    if "emérito" in combined or "emerito" in combined:
        return "Professor Emérito"
    if "sênior" in combined or "senior" in combined or "aposentado" in combined:
        return "Professor Sênior"
    if "titular" in combined or "ms-6" in combined:
        return "Professor Titular"
    if "associado" in combined or "livre-docente" in combined or "ms-5" in combined:
        return "Professor Associado"
    if "doutor" in combined or "ms-3" in combined:
        return "Professor Doutor"
    return "Docente"

class IFUSPDepartmentScraper:
    def __init__(self, config_path: str, force_refresh: bool = False):
        with open(config_path, "r", encoding="utf-8") as f:
            self.config = json.load(f)
        
        self.force_refresh = force_refresh
        self.cache_dir = os.path.abspath(self.config["settings"]["cache_dir"])
        os.makedirs(self.cache_dir, exist_ok=True)
        
        self.output_json = os.path.abspath(self.config["settings"]["output_json"])
        os.makedirs(os.path.dirname(self.output_json), exist_ok=True)
        
        self.ctx = ssl._create_unverified_context()
        self.headers = {"User-Agent": self.config["settings"]["user_agent"]}
        self.ttl = timedelta(hours=self.config["settings"]["cache_ttl_hours"])
        self.timeout = self.config["settings"]["request_timeout_seconds"]
        self.delay = self.config["settings"]["rate_limit_delay_seconds"]

    def _fetch_url(self, url: str) -> str:
        """Busca uma URL com cache em disco e tolerância a falhas."""
        url_hash = hashlib.md5(url.encode("utf-8")).hexdigest()
        cache_file = os.path.join(self.cache_dir, f"{url_hash}.html")
        
        if not self.force_refresh and os.path.exists(cache_file):
            file_mtime = datetime.fromtimestamp(os.path.getmtime(cache_file))
            if datetime.now() - file_mtime < self.ttl:
                with open(cache_file, "r", encoding="utf-8", errors="ignore") as f:
                    return f.read()

        # Download HTTP resiliente
        try:
            req = urllib.request.Request(url, headers=self.headers)
            with urllib.request.urlopen(req, context=self.ctx, timeout=self.timeout) as resp:
                content = resp.read().decode("utf-8", errors="ignore")
                with open(cache_file, "w", encoding="utf-8") as f:
                    f.write(content)
                time.sleep(self.delay)
                return content
        except Exception:
            return ""

    def scrape_user_profile(self, user_url: str) -> dict:
        """
        Extrai dados detalhados do perfil Drupal do docente.
        Separa estritamente campos textuais (item.get_text) de hiperlinks (a_tag['href']).
        """
        html = self._fetch_url(user_url)
        if not html:
            return {}
        
        soup = BeautifulSoup(html, "html.parser")
        data = {}
        
        for field in soup.find_all("div", class_="field"):
            label = field.find("div", class_="field-label")
            item = field.find("div", class_="field-item")
            if not label or not item:
                continue
            lbl_text = label.get_text().strip().lower()

            # 1. Tratamento específico para e-mail (data-cfemail, /cdn-cgi/ ou texto puro)
            if "e-mail" in lbl_text or "email" in lbl_text:
                cf_span = item.find(attrs={"data-cfemail": True})
                cf_link = item.find("a", href=lambda h: h and "/cdn-cgi/l/email-protection#" in h)
                if cf_span:
                    raw_email = decode_cloudflare_email(cf_span["data-cfemail"])
                elif cf_link:
                    hex_str = cf_link["href"].split("#")[-1]
                    raw_email = decode_cloudflare_email(hex_str)
                else:
                    raw_email = item.get_text().strip()
                
                valid_email = clean_email(raw_email)
                if valid_email:
                    data["email"] = valid_email

            # 2. Tratamento para Hiperlinks Externos (extrai 'href')
            elif "lattes" in lbl_text:
                a_tag = item.find("a")
                if a_tag and "href" in a_tag.attrs:
                    data["lattes"] = a_tag["href"].strip()
                else:
                    txt = item.get_text().strip()
                    if "lattes.cnpq.br" in txt or "buscatextual.cnpq.br" in txt:
                        data["lattes"] = txt
            elif "web page" in lbl_text or "homepage" in lbl_text:
                a_tag = item.find("a")
                data["website"] = a_tag["href"].strip() if (a_tag and "href" in a_tag.attrs) else item.get_text().strip()
            elif "scholar" in lbl_text:
                a_tag = item.find("a")
                data["google_scholar"] = a_tag["href"].strip() if (a_tag and "href" in a_tag.attrs) else item.get_text().strip()
            elif "orcid" in lbl_text:
                a_tag = item.find("a")
                data["orcid"] = a_tag["href"].strip() if (a_tag and "href" in a_tag.attrs) else item.get_text().strip()

            # 3. Tratamento para Campos Textuais (item.get_text() - NUNCA url de taxonomia)
            elif "função" in lbl_text or "cargo" in lbl_text:
                data["funcao_detalhada"] = item.get_text().strip()
            elif "sala" in lbl_text and "sala" not in data:
                val = item.get_text().strip()
                if val.lower() not in SENTINEL_VALUES:
                    data["sala"] = val
            elif "prédio" in lbl_text and "predio" not in data:
                val = item.get_text().strip()
                if val.lower() not in SENTINEL_VALUES:
                    data["predio"] = val
            elif "telefone" in lbl_text and "telefone" not in data:
                val = item.get_text().strip()
                if val.lower() not in SENTINEL_VALUES:
                    data["telefone"] = val

        # Avatar se existir imagem no perfil
        user_img = soup.find("div", class_="user-picture")
        if user_img and user_img.find("img"):
            img_src = user_img.find("img")["src"]
            if img_src.startswith("/"):
                img_src = self.config["base_portal_url"] + img_src
            data["avatar"] = img_src

        return data

    def scrape_department_labs(self, slug: str, portal_url: str) -> list:
        """
        Extrai referências oficiais de laboratórios presentes nas subpáginas dos departamentos,
        filtrando termos genéricos de menu do Drupal e normalizando IDs.
        """
        labs = []
        if not portal_url:
            return labs
        
        html = self._fetch_url(portal_url)
        if not html:
            return labs
        
        soup = BeautifulSoup(html, "html.parser")
        seen_names = set()
        
        for a in soup.find_all("a", href=True):
            raw_text = a.get_text()
            text_clean = re.sub(r'\s+', ' ', raw_text).strip()
            href = a["href"].strip()
            
            # Filtro contra links genéricos de menu/navegação
            if text_clean.lower() in GENERIC_MENU_TITLES:
                continue
                
            if any(k in text_clean.lower() for k in ["laboratório", "laboratorio", "lab.", "grupo de pesquisa", "grupo de"]):
                if len(text_clean) > 4 and text_clean.lower() not in seen_names:
                    seen_names.add(text_clean.lower())
                    if href.startswith("/"):
                        href = self.config["base_portal_url"] + href
                    
                    lab_slug_part = slugify(text_clean)[:30].rstrip('-')
                    labs.append({
                        "id": f"lab-{lab_slug_part}",
                        "nome": text_clean,
                        "description": f"Laboratório vinculado ao departamento {slug.upper()}.",
                        "website": href
                    })
        return labs

    def run(self):
        print(f"[*] Iniciando extração de dados oficiais do IFUSP (Pipeline v3.1)...")
        master_url = self.config["master_roster_url"]
        print(f"[*] Baixando lista mestra oficial de docentes: {master_url}")
        master_html = self._fetch_url(master_url)
        if not master_html:
            print("[ERRO CRÍTICO] Falha ao acessar a tabela mestra de docentes do IFUSP.", file=sys.stderr)
            sys.exit(1)

        soup = BeautifulSoup(master_html, "html.parser")
        table = soup.find("table")
        if not table:
            print("[ERRO CRÍTICO] Elemento <table> não encontrado na página de docentes.", file=sys.stderr)
            sys.exit(1)

        rows = table.find_all("tr")[1:]
        print(f"[*] Localizadas {len(rows)} linhas na tabela mestra oficial.")

        # Dicionário de normalização tolerante a variações oficiais e históricas
        dept_code_to_slug = {
            "FAP": "fap", "DFAP": "fap",
            "FMT": "fmt", "DFMT": "fmt",
            "FGE": "fge", "DFGE": "fge",
            "FMA": "dfma", "DFMA": "dfma",
            "FNC": "fnc", "DFN": "fnc",
            "FEP": "fep", "DFE": "fep", "DFEP": "fep"
        }

        collected_departments = {slug: [] for slug in set(dept_code_to_slug.values())}
        collected_departments["outros"] = []

        total_processed = 0
        for r in rows:
            tds = r.find_all("td")
            if len(tds) < 6:
                continue

            nome = tds[0].get_text().strip()
            dept_code_raw = tds[1].get_text().strip()
            dept_code = dept_code_raw.upper()
            predio = tds[2].get_text().strip()
            sala = tds[3].get_text().strip()
            telefone = tds[4].get_text().strip()
            funcao_oficial = tds[5].get_text().strip()

            user_link = ""
            a_tag = tds[0].find("a")
            if a_tag and "href" in a_tag.attrs:
                user_link = a_tag["href"]
                if user_link.startswith("/"):
                    user_link = self.config["base_portal_url"] + user_link

            docente = {
                "id": slugify(nome),
                "nome": nome,
                "iniciais": compute_initials(nome),
                "role": "Docente",
                "funcao_oficial": funcao_oficial,
                "funcao_detalhada": "",
                "dept_code": dept_code,
                "predio": predio if predio.lower() not in SENTINEL_VALUES else "",
                "sala": sala if sala.lower() not in SENTINEL_VALUES else "",
                "telefone": telefone if telefone.lower() not in SENTINEL_VALUES else "",
                "portal_profile_url": user_link,
                "email": "",
                "lattes": "",
                "avatar": "",
                "website": "",
                "google_scholar": "",
                "orcid": ""
            }

            # Enriquecimento via perfil individual Drupal
            if user_link:
                profile_data = self.scrape_user_profile(user_link)
                for k, v in profile_data.items():
                    if not v:
                        continue
                    # Não sobrescreve localização da tabela mestra com valores vazios/sentinela
                    if k in ("sala", "predio", "telefone"):
                        if str(v).strip().lower() not in SENTINEL_VALUES:
                            docente[k] = v
                    else:
                        docente[k] = v

            # Normalização semântica do título/cargo
            docente["role"] = normalize_role(docente["funcao_oficial"], docente["funcao_detalhada"])

            slug = dept_code_to_slug.get(dept_code, "outros")
            collected_departments[slug].append(docente)
            total_processed += 1
            if total_processed % 30 == 0:
                print(f"  [Progresso] {total_processed}/{len(rows)} docentes catalogados...")

        print(f"[*] Total de docentes processados: {total_processed}")

        # TRAVA DE SEGURANÇA (SANITY CHECK)
        if total_processed < 100:
            print(f"\n[ERRO CRÍTICO] Sanity Check Falhou: Apenas {total_processed} docentes foram coletados.", file=sys.stderr)
            print("[ERRO CRÍTICO] Mínimo esperado é 100. O cache parsed_departments.json NÃO será sobrescrito.", file=sys.stderr)
            sys.exit(1)

        # Alerta se houver docentes em 'outros'
        if collected_departments["outros"]:
            print(f"\n[AVISO] {len(collected_departments['outros'])} docentes sem lotação nos 6 departamentos principais:", file=sys.stderr)
            for d in collected_departments["outros"]:
                print(f"  - {d['nome']} (Dept Code: '{d['dept_code']}')", file=sys.stderr)

        # Montagem do Payload Estruturado
        payload = {
            "metadata": {
                "extracted_at": datetime.now().isoformat(),
                "total_docentes": total_processed,
                "source": master_url,
                "generator": "HUB-LabDiv scrape_departments.py v3.1"
            },
            "departments": {}
        }

        for slug, info in self.config["departments"].items():
            docentes = collected_departments.get(slug, [])
            scraped_labs = self.scrape_department_labs(slug, info.get("portal_url", ""))
            payload["departments"][slug] = {
                "slug": slug,
                "sigla": info["sigla"],
                "dept_code": info["dept_code"],
                "nome": info["name"],
                "docentes_count": len(docentes),
                "docentes": docentes,
                "laboratorios": scraped_labs
            }

        # Inclui 'outros' no payload para não descartar silenciosamente
        if collected_departments["outros"]:
            payload["departments"]["outros"] = {
                "slug": "outros",
                "sigla": "OUTROS",
                "dept_code": "OUTROS",
                "nome": "Outros / Sem Lotação Direta",
                "docentes_count": len(collected_departments["outros"]),
                "docentes": collected_departments["outros"],
                "laboratorios": []
            }

        # Salva em JSON
        with open(self.output_json, "w", encoding="utf-8") as f:
            json.dump(payload, f, ensure_ascii=False, indent=2)

        print(f"[OK] Payload estruturado v3.1 salvo com sucesso em:\n     {self.output_json}")

if __name__ == "__main__":
    force = "--force" in sys.argv
    config_file = os.path.join(os.path.dirname(__file__), "config.json")
    scraper = IFUSPDepartmentScraper(config_file, force_refresh=force)
    scraper.run()
