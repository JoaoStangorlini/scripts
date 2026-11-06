#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Hub de Comunicação Científica Lab-Div V3.0
Copyright (C) 2026 João Paulo Stangorlini de Carvalho

Este programa é software livre: você pode redistribuí-lo e/ou modificá-lo
sob os termos da Licença Pública Geral Affero GNU (AGPLv3) conforme
publicada pela Free Software Foundation.
"""

import os
import re
import json
import time
import hashlib
import unicodedata
from urllib.parse import urljoin, urlparse
import requests
from bs4 import BeautifulSoup

CACHE_DIR = "scripts/scrapers/cache/raw_html"
OUTPUT_FILE = "scripts/scrapers/cache/parsed_initiatives.json"
INDEX_URL = "https://portal.if.usp.br/extensao/pt-br/node/607"
EXTENSAO_HOME = "https://portal.if.usp.br/extensao/"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) HUB-LabDiv-InitiativesAuditor/1.0"
}

def decode_cloudflare_email(cf_hex: str) -> str:
    """Decodifica e-mails protegidos pelo Cloudflare Email Protection."""
    try:
        r = int(cf_hex[:2], 16)
        email = ''.join([chr(int(cf_hex[i:i+2], 16) ^ r) for i in range(2, len(cf_hex), 2)])
        return email.strip()
    except Exception:
        return ""

def clean_email(email_str: str) -> str:
    if not email_str:
        return ""
    email_str = email_str.replace("[arroba]", "@").replace("[dot]", ".").replace(" at ", "@")
    email_str = email_str.replace("mailto:", "").strip().lower()
    m = re.search(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', email_str)
    return m.group(0) if m else ""

def slugify(text: str) -> str:
    n = unicodedata.normalize('NFKD', text).encode('ASCII', 'ignore').decode('utf-8').lower()
    return re.sub(r'[^a-z0-9]+', '-', n).strip('-')

def fetch_with_cache(url: str, ttl_hours: int = 24) -> str:
    os.makedirs(CACHE_DIR, exist_ok=True)
    url_hash = hashlib.md5(url.encode('utf-8')).hexdigest()
    cache_path = os.path.join(CACHE_DIR, f"{url_hash}.html")

    if os.path.exists(cache_path):
        mtime = os.path.getmtime(cache_path)
        if (time.time() - mtime) < (ttl_hours * 3600):
            with open(cache_path, "r", encoding="utf-8", errors="ignore") as f:
                return f.read()

    try:
        print(f"  [GET] {url}")
        resp = requests.get(url, headers=HEADERS, timeout=8, verify=False)
        if resp.status_code == 200:
            with open(cache_path, "w", encoding="utf-8") as f:
                f.write(resp.text)
            time.sleep(0.3)
            return resp.text
        else:
            print(f"  [AVISO] Status {resp.status_code} para {url}")
    except Exception as e:
        print(f"  [ERRO] Falha ao baixar {url}: {e}")

    return ""

def infer_category(name: str, desc: str) -> str:
    text = (name + " " + desc).lower()
    if any(k in text for k in ['mulher', 'noether', 'equidade', 'inclusão', 'afirmativ', 'usp 60', 'usp60']):
        return 'inclusao'
    if any(k in text for k in ['maker', 'hackerspace', 'impressão 3d', 'eletrônica', 'virtual']):
        return 'maker'
    if any(k in text for k in ['escola', 'ensino médio', 'obfep', 'olimpíad', 'visitas monitoradas', 'profissões', 'cuica', 'vestibular']):
        return 'escolar'
    if any(k in text for k in ['masterclasses', 'tiomno', 'escola de física', 'curso de difusão', 'pesquisa']):
        return 'academica'
    return 'divulgacao'

def extract_child_page(url: str, base_name: str) -> dict:
    html = fetch_with_cache(url)
    if not html:
        return {}

    soup = BeautifulSoup(html, "html.parser")
    
    # 1. Cloudflare decoded emails
    emails = []
    for cf in soup.find_all("a", class_=re.compile(r"cf_email|__cf_email__")):
        cf_hex = cf.get("data-cfemail", "")
        if cf_hex:
            dec = decode_cloudflare_email(cf_hex)
            if dec:
                emails.append(dec)

    # Standard mailto
    for a in soup.find_all("a", href=re.compile(r"^mailto:")):
        em = clean_email(a["href"])
        if em and em not in emails:
            emails.append(em)

    # 2. Main content area
    content_div = soup.find("div", class_="field-item") or soup.find("div", id="content") or soup.find("article")
    text_content = ""
    paragraphs = []
    if content_div:
        for p in content_div.find_all(["p", "div"]):
            t = p.get_text().strip()
            # Filter menus and scripts
            if len(t) > 30 and not t.startswith("function") and not t.startswith("var "):
                paragraphs.append(t)
        text_content = " ".join(paragraphs)

    # 3. Extrair Coordenação
    coordenacao = ""
    coord_patterns = [
        r'(?:Coordenação|Coordenador(?:a)?|Responsável|Organização)[:\s]+([^\n\.,;]+)',
        r'(?:Prof(?:a)?\.?\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)',
        r'(?:Capitaneada pela\s+([^\n\.,;]+))'
    ]
    for cp in coord_patterns:
        m = re.search(cp, text_content, re.IGNORECASE)
        if m:
            found = m.group(1).strip() if m.lastindex else m.group(0).strip()
            if 3 < len(found) < 60:
                coordenacao = found
                break

    # 4. Extrair Localização
    localizacao = ""
    loc_match = re.search(r'(?:Auditório\s+[^\n\.,;]+|Edifício\s+[^\n\.,;]+|Ala\s+[^\n\.,;]+|Sala\s+\d+)', text_content, re.IGNORECASE)
    if loc_match:
        localizacao = loc_match.group(0).strip()

    # 5. Extrair Links externos / Formulários / Redes
    website = ""
    instagram = ""
    youtube = ""
    formulario = ""
    for a in soup.find_all("a", href=True):
        href = a["href"].strip()
        if "instagram.com" in href and not instagram:
            instagram = href
        elif "youtube.com" in href or "youtu.be" in href:
            if not youtube:
                youtube = href
        elif any(f in href.lower() for f in ["form", "inscricao", "inscrição", "webform"]):
            if not formulario:
                formulario = urljoin(url, href)
        elif href.startswith("http") and not any(ign in href for ign in ["portal.if.usp.br", "facebook.com/sharer", "twitter.com"]):
            if not website and len(href) > 10:
                website = href

    # E-mail no texto
    if not emails:
        raw_emails = re.findall(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', text_content)
        for re_em in raw_emails:
            c = clean_email(re_em)
            if c and c not in emails:
                emails.append(c)

    # Resumo (primeiros 200 caracteres limpos)
    resumo = ""
    if paragraphs:
        resumo = re.sub(r'\s+', ' ', paragraphs[0]).strip()
        if len(resumo) > 220:
            resumo = resumo[:217] + "..."

    # Descricao completa
    descricao = re.sub(r'\s+', ' ', text_content[:800]).strip() if text_content else ""

    return {
        "resumo": resumo,
        "descricao": descricao,
        "coordenacao": coordenacao,
        "localizacao": localizacao,
        "email": emails[0] if emails else "",
        "website": website,
        "instagram": instagram,
        "youtube": youtube,
        "formulario": formulario
    }

def main():
    print("\x1b[34m[CCEx INITIATIVES SCRAPER]\x1b[0m Iniciando coleta de iniciativas de extensão do IFUSP...")

    index_html = fetch_with_cache(INDEX_URL)
    if not index_html:
        print("\x1b[31m✕ Falha ao carregar índice de iniciativas da CCEx.\x1b[0m")
        return

    soup = BeautifulSoup(index_html, "html.parser")
    content = soup.find("div", class_="field-item") or soup.find("div", id="content")

    initiatives_crawled = []

    if content:
        # Extrair links e títulos da lista
        seen_urls = set()
        for a in content.find_all("a", href=True):
            raw_title = a.get_text().strip()
            href = a["href"].strip()
            if not raw_title or len(raw_title) < 3:
                continue

            # Converte URLs relativas
            full_url = urljoin(INDEX_URL, href)
            if full_url in seen_urls:
                continue
            seen_urls.add(full_url)

            # Evita links externos genéricos como bit.ly ou compartilhamento
            if "bit.ly" in full_url:
                continue

            print(f"\n-> Processando: {raw_title}")
            details = {}
            if "if.usp.br" in full_url or "usp.br" in full_url:
                details = extract_child_page(full_url, raw_title)

            slug = slugify(raw_title)
            categoria = infer_category(raw_title, details.get("descricao", ""))

            resumo = details.get("resumo") or f"Iniciativa de extensão e difusão científica vinculada à CCEx-IFUSP: {raw_title}."
            descricao = details.get("descricao") or f"{raw_title} é uma iniciativa de cultura e extensão universitária do Instituto de Física da USP voltada à interação com a sociedade."

            initiatives_crawled.append({
                "id": slug,
                "nome": raw_title,
                "categoria": categoria,
                "resumo": resumo,
                "descricao": descricao,
                "publicoAlvo": "Comunidade externa, escolas e universitários",
                "coordenacao": details.get("coordenacao") or "",
                "comoParticipar": "Acesso aberto ou participação via projetos de extensão cadastrados na CCEx-IFUSP.",
                "modalidadeBolsa": ["PUB", "Voluntariado"],
                "temaVisual": "default",
                "contatos": {
                    "email": details.get("email") or "",
                    "website": details.get("website") or "",
                    "instagram": details.get("instagram") or "",
                    "youtube": details.get("youtube") or "",
                    "localizacao": details.get("localizacao") or ""
                },
                "links": {
                    "oficial": full_url,
                    "formulario": details.get("formulario") or ""
                },
                "destaque": False,
                "tags": [raw_title.lower(), categoria, "extensão", "ifusp"]
            })

    output_payload = {
        "metadata": {
            "source": INDEX_URL,
            "scraped_at": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "total_initiatives": len(initiatives_crawled)
        },
        "initiatives": initiatives_crawled
    }

    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(output_payload, f, indent=2, ensure_ascii=False)

    print(f"\n\x1b[32m✓\x1b[0m Sucesso! {len(initiatives_crawled)} iniciativas da CCEx salvas em: {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
