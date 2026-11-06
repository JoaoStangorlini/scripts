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
EVENTS_OUTPUT = "scripts/scrapers/cache/parsed_events.json"
NEWS_OUTPUT = "scripts/scrapers/cache/parsed_news.json"

EVENTS_URL = "https://portal.if.usp.br/ifusp/pt-br/eventos"
NEWS_URL = "https://portal.if.usp.br/ifusp/pt-br/noticias"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) HUB-LabDiv-EventsAuditor/1.0"
}

def slugify(text: str) -> str:
    n = unicodedata.normalize('NFKD', text).encode('ASCII', 'ignore').decode('utf-8').lower()
    clean = re.sub(r'[^a-z0-9]+', '-', n).strip('-')
    return clean[:60].rstrip('-')

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
        time.sleep(0.3)
        resp = requests.get(url, headers=HEADERS, timeout=12)
        if resp.status_code == 200:
            with open(cache_path, "w", encoding="utf-8") as f:
                f.write(resp.text)
            return resp.text
        else:
            print(f"[WARN] Status {resp.status_code} para {url}")
            return ""
    except Exception as e:
        print(f"[ERROR] Falha ao baixar {url}: {e}")
        return ""

def classify_event_type(title: str, text: str = "") -> str:
    comb = f"{title} {text}".lower()
    if "colóquio" in comb or "coloquio" in comb:
        return "coloquio"
    if "convite à física" in comb or "convite a fisica" in comb:
        return "convite-fisica"
    if "seminário" in comb or "seminario" in comb:
        return "seminario"
    if any(k in comb for k in ["workshop", "escola", "encontro", "simpósio", "simposio", "curso", "semana da física"]):
        return "workshop"
    return "institucional"

def parse_speaker(text: str) -> dict:
    speaker = {"nome": "", "afiliacao": "", "titulacao": ""}
    # Padrão: com Prof(a). Nome (Instituição) ou Palestrante: Nome
    m_speaker = re.search(r'(?:com\s+|palestrante:\s*)(Prof(?:ª|\.|a\.)?|Dr(?:ª|\.|a\.)?)?\s*([A-ZÁÉÍÓÚÂÊÔÃÕÇ][a-zA-Záéíóúâêôãõç\s\.\-]+?)(?:\s*\((.*?)\)|,|\s*[\-\–]|\s*às|\s*\.|$)', text, re.IGNORECASE)
    if m_speaker:
        title = m_speaker.group(1) or ""
        name = m_speaker.group(2).strip()
        affil = m_speaker.group(3) or ""
        if len(name) > 3 and not any(w in name.lower() for w in ["transmissão", "auditório", "evento", "outubro", "novembro"]):
            speaker["titulacao"] = title.strip()
            speaker["nome"] = f"{title + ' ' if title else ''}{name}".strip()
            speaker["afiliacao"] = affil.strip()
    return speaker

def scrape_event_detail(url: str, base_title: str, base_date: str) -> dict:
    html = fetch_with_cache(url)
    if not html:
        return {}

    soup = BeautifulSoup(html, "html.parser")
    
    # H1
    h1 = soup.find("h1")
    title = h1.get_text(strip=True) if h1 else base_title

    # Article or region content
    article = soup.find("article") or soup.find("div", class_="region-content") or soup
    full_text = article.get_text(separator=" ", strip=True)

    # Date and Time
    date_val = base_date
    time_val = "16:00" if "coloquio" in title.lower() else "14:00"
    
    # Try to find exact time pattern
    m_time = re.search(r'às\s*(\d{1,2}(?:h|\:\d{2}))', full_text, re.IGNORECASE)
    if m_time:
        raw_t = m_time.group(1).replace('h', ':00')
        if not ':' in raw_t:
            raw_t += ':00'
        if len(raw_t.split(':')[0]) == 1:
            raw_t = '0' + raw_t
        time_val = raw_t[:5]
    else:
        m_time2 = re.search(r'(\d{2}\/\d{2}\/\d{4})\s*-\s*(\d{2}:\d{2})', full_text)
        if m_time2:
            date_val = m_time2.group(1)
            time_val = m_time2.group(2)

    # Location
    location_name = "Auditório Abrahão de Moraes"
    formato = "hibrido"
    if "abrahao de moraes" in full_text.lower() or "abrahão de moraes" in full_text.lower():
        location_name = "Auditório Abrahão de Moraes"
    elif "adma jafet" in full_text.lower():
        location_name = "Auditório Adma Jafet"
    elif "sala" in full_text.lower():
        m_sala = re.search(r'(sala\s+[0-9a-zA-Z\.\-]+)', full_text, re.IGNORECASE)
        if m_sala:
            location_name = m_sala.group(1).title()
    elif "online" in full_text.lower() or "transmissão exclusiva" in full_text.lower():
        location_name = "Transmissão Online"
        formato = "online"

    # Speaker
    speaker = parse_speaker(full_text)
    if not speaker.get("nome"):
        speaker = parse_speaker(title)

    # Resumo / Abstract
    resumo = ""
    # Check for "Resumo:" field
    m_res = re.search(r'Resumo:\s*(.+?)(?:Anexos:|Data do Evento:|Data de Término:|Link:|$)', full_text, re.DOTALL | re.IGNORECASE)
    if m_res:
        resumo = m_res.group(1).strip()
    else:
        # Pega o primeiro parágrafo significativo
        for p in article.find_all("p"):
            p_text = p.get_text(strip=True)
            if len(p_text) > 60 and not "leia mais" in p_text.lower() and not "institucional" in p_text.lower():
                resumo = p_text
                break

    if not resumo:
        resumo = f"Palestra e apresentação científica oficial do Instituto de Física da USP: {title}."

    # Links
    links = {
        "oficial": url,
        "transmissao": "https://www.youtube.com/@ifusp_oficial/streams",
        "anexoPdf": ""
    }
    
    # Check for youtube
    for a in article.find_all("a", href=True):
        href = a["href"]
        if "youtube.com" in href or "youtu.be" in href:
            links["transmissao"] = href
        elif href.lower().endswith(".pdf"):
            links["anexoPdf"] = urljoin(url, href)

    tipo = classify_event_type(title, full_text)
    slug = slugify(title)

    tags = ["Física", tipo.replace('-', ' ').title()]
    if "wataghin" in title.lower():
        tags.append("Gleb Wataghin")
    if "quântic" in full_text.lower():
        tags.append("Física Quântica")
    if "relativid" in full_text.lower():
        tags.append("Relatividade")
    if "médica" in full_text.lower():
        tags.append("Física Médica")

    return {
        "id": slug,
        "titulo": title,
        "tipo": tipo,
        "data": date_val,
        "horario": time_val,
        "local": {
            "nome": location_name,
            "formato": formato
        },
        "palestrante": speaker if speaker.get("nome") else None,
        "resumo": resumo[:600],
        "links": links,
        "destaque": "coloquio" in tipo or "wataghin" in title.lower(),
        "tags": list(set(tags))
    }

def scrape_events() -> list:
    print(f"[EVENTS] Iniciando raspagem de eventos em {EVENTS_URL}...")
    events = []
    seen_ids = set()

    for page in range(3): # Páginas 0, 1 e 2 (30 eventos)
        page_url = f"{EVENTS_URL}?page={page}"
        print(f"  -> Baixando página {page}: {page_url}")
        html = fetch_with_cache(page_url)
        if not html:
            continue

        soup = BeautifulSoup(html, "html.parser")
        rows = soup.find_all("div", class_=lambda c: c and "views-row" in c)
        print(f"     Encontrados {len(rows)} itens de evento.")

        for row in rows:
            h = row.find(["h2", "h3", "a"])
            date_el = row.find("span", class_=lambda c: c and "date" in c)
            link_el = row.find("a", href=True)

            if not h or not link_el:
                continue

            raw_title = h.get_text(strip=True)
            raw_date = date_el.get_text(strip=True) if date_el else "2026-11-01"
            href = link_el["href"]
            child_url = urljoin(EVENTS_URL, href)

            try:
                evt = scrape_event_detail(child_url, raw_title, raw_date)
                if evt and evt["id"] not in seen_ids:
                    seen_ids.add(evt["id"])
                    events.append(evt)
                    print(f"     [OK] {evt['tipo'].upper()}: {evt['titulo'][:60]}... ({evt['data']})")
            except Exception as e:
                print(f"     [ERRO] Evento {raw_title}: {e}")

    return events

def classify_news_category(title: str, text: str = "") -> str:
    comb = f"{title} {text}".lower()
    if any(k in comb for k in ["prêmio", "premio", "premiad", "honra"]):
        return "Premiação"
    if any(k in comb for k in ["estudo", "pesquisa", "descoberta", "artigo", "publica", "paper", "experimento"]):
        return "Pesquisa"
    if any(k in comb for k in ["extensao", "extensão", "oficina", "escola", "visita", "mostra", "comunidade"]):
        return "Extensão"
    if any(k in comb for k in ["graduação", "graduacao", "disciplina", "aula", "mestrado", "doutorado", "bolsa"]):
        return "Ensino"
    return "Institucional"

def scrape_news() -> list:
    print(f"[NEWS] Iniciando raspagem de notícias em {NEWS_URL}...")
    html = fetch_with_cache(f"{NEWS_URL}?page=0")
    if not html:
        return []

    soup = BeautifulSoup(html, "html.parser")
    rows = soup.find_all("div", class_=lambda c: c and "views-row" in c)
    print(f"  -> Encontradas {len(rows)} notícias no índice principal.")

    news_list = []
    seen_ids = set()

    for row in rows[:20]: # Top 20 notícias recentes
        h = row.find(["h2", "h3", "a"])
        date_el = row.find("span", class_=lambda c: c and "date" in c)
        link_el = row.find("a", href=True)
        img_el = row.find("img")

        if not h or not link_el:
            continue

        title = h.get_text(strip=True)
        date_val = date_el.get_text(strip=True) if date_el else "2026-10-30"
        url = urljoin(NEWS_URL, link_el["href"])
        img_url = urljoin(NEWS_URL, img_el["src"]) if img_el and img_el.get("src") else ""

        # Resumo ou Teaser
        body_el = row.find("div", class_=lambda c: c and ("body" in c or "summary" in c or "content" in c))
        resumo = body_el.get_text(strip=True) if body_el else ""
        if not resumo:
            # Baixa o detalhe para extrair resumo
            c_html = fetch_with_cache(url)
            if c_html:
                c_soup = BeautifulSoup(c_html, "html.parser")
                p = c_soup.find("div", class_="region-content")
                if p:
                    for tag in p.find_all("p"):
                        t = tag.get_text(strip=True)
                        if len(t) > 60:
                            resumo = t
                            break

        if not resumo:
            resumo = f"Notícia oficial e atualização institucional publicada pelo Instituto de Física da USP: {title}."

        slug = slugify(title)
        if slug in seen_ids:
            continue
        seen_ids.add(slug)

        category = classify_news_category(title, resumo)
        tags = ["IFUSP", category]
        if "física médica" in title.lower():
            tags.append("Física Médica")
        if "biblioteca" in title.lower():
            tags.append("BIFUSP")

        item = {
            "id": slug,
            "titulo": title,
            "data": date_val,
            "resumo": resumo[:350],
            "categoria": category,
            "imagem": img_url,
            "linkOficial": url,
            "autor": "Assessoria de Comunicação IFUSP",
            "tags": tags
        }
        news_list.append(item)
        print(f"     [NEWS OK] [{category}] {title[:60]}... ({date_val})")

    return news_list

def main():
    print("=" * 60)
    print("MÓDULO C: SCRAPING DE EVENTOS, COLÓQUIOS E NOTÍCIAS DO IFUSP")
    print("=" * 60)

    events = scrape_events()
    news = scrape_news()

    os.makedirs(os.path.dirname(EVENTS_OUTPUT), exist_ok=True)

    with open(EVENTS_OUTPUT, "w", encoding="utf-8") as f:
        json.dump(events, f, ensure_ascii=False, indent=2)
    print(f"\n[SUCESSO] {len(events)} eventos salvos em: {EVENTS_OUTPUT}")

    with open(NEWS_OUTPUT, "w", encoding="utf-8") as f:
        json.dump(news, f, ensure_ascii=False, indent=2)
    print(f"[SUCESSO] {len(news)} notícias salvas em: {NEWS_OUTPUT}\n")

if __name__ == "__main__":
    main()
