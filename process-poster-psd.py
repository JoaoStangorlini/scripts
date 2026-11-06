# -*- coding: utf-8 -*-
"""
/*!
 * Hub de Comunicação Científica Lab-Div V3.0
 * Copyright (C) 2026 João Paulo Stangorlini de Carvalho
 *
 * Este programa é um software livre: você pode redistribuí-lo e/ou modificá-lo
 * sob os termos da Licença Pública Geral Affero GNU (AGPLv3) conforme
 * publicada pela Free Software Foundation.
 *
 * Este programa é distribuído na esperança de que seja útil, mas SEM
 * QUALQUER GARANTIA; sem mesmo a garantia implícita de COMERCIALIZAÇÃO
 * ou ADEQUAÇÃO A UM DETERMINADO FIM.
 */
"""

import os
import sys
import shutil
import zipfile
import numpy as np
from PIL import Image
import pytoshop
from pytoshop import enums
from pytoshop.user import nested_layers
from psd_tools import PSDImage

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, '..'))
PUBLIC_DIR = os.path.join(PROJECT_ROOT, 'public')
POSTERS_DIR = os.path.join(PUBLIC_DIR, 'divulgacao', 'posters')
OUTPUT_DIR = os.path.join(POSTERS_DIR, 'editavel_photoshop_illustrator')
PNG_DIR = os.path.join(OUTPUT_DIR, 'elementos_png_300dpi')
SVG_DIR = os.path.join(OUTPUT_DIR, 'elementos_vetoriais_svg')
TMP_RAW_LAYERS_DIR = os.path.join(OUTPUT_DIR, '.tmp_raw_layers')

ARTIFACT_DIR = os.environ.get('ARTIFACT_DIR', './artifacts')

A4_WIDTH = 2480
A4_HEIGHT = 3508

LAYER_DEFS = [
    # (id, name, group_name, default_opacity)
    ('00_fundo_base', 'Fundo Base (#F8FAFC)', '01_Fundo', 255),
    ('01_fundo_padrao_matematico', 'Padrão Fórmulas Matemáticas', '01_Fundo', 140), # ~55%
    
    ('04_hero_texto_inumeras_funcoes', 'Título: INÚMERAS FUNÇÕES', '02_Hero_Topo', 255),
    ('03_hero_texto_1app', 'Título: 1 APP', '02_Hero_Topo', 255),
    ('02_hero_card_google_play', 'Card Google Play HUB LabDiv', '02_Hero_Topo', 255),
    ('06_hero_card_botao_instalar', 'Sub: Botão Instalar', '02_Hero_Topo', 255),
    ('05_hero_card_icone_labdiv', 'Sub: Ícone HUB LabDiv', '02_Hero_Topo', 255),
    
    ('09_eixo_3_ferramentas', 'Eixo 3 - Ferramentas', '03_Eixos_Tematicos', 255),
    ('08_eixo_2_informativo', 'Eixo 2 - Informativo', '03_Eixos_Tematicos', 255),
    ('07_eixo_1_social', 'Eixo 1 - Social', '03_Eixos_Tematicos', 255),
    
    ('13_experimente_perks', 'Benefícios (Nuvem, Offline, Grátis)', '04_Secao_Experimente', 255),
    ('12_qr_card_google_play', 'Card QR Code Google Play', '04_Secao_Experimente', 255),
    ('11_qr_card_site_web', 'Card QR Code Site Web', '04_Secao_Experimente', 255),
    ('10_experimente_titulo_foguete', 'Título Experimente Agora', '04_Secao_Experimente', 255),
    
    ('18_rodape_linha_copyright', 'Direitos IFUSP & Licença AGPLv3', '05_Rodape', 255),
    ('17_rodape_botao_email', 'Botão E-mail Suporte', '05_Rodape', 255),
    ('16_rodape_botao_github', 'Botão GitHub Código Aberto', '05_Rodape', 255),
    ('15_rodape_bloco_seguranca', 'Bloco Segurança e Conformidade', '05_Rodape', 255),
    ('14_rodape_barra_fundo', 'Barra de Rodapé (Fundo & Gradiente)', '05_Rodape', 255),
]

def make_psd_layer(img_pil, name, left, top, opacity=255):
    w, h = img_pil.size
    arr = np.array(img_pil)
    
    if arr.ndim == 2: # grayscale
        r = arr
        g = arr
        b = arr
        a = np.full((h, w), opacity, dtype=np.uint8)
    elif arr.shape[2] == 3: # RGB
        r = arr[:, :, 0]
        g = arr[:, :, 1]
        b = arr[:, :, 2]
        a = np.full((h, w), opacity, dtype=np.uint8)
    else: # RGBA
        r = arr[:, :, 0]
        g = arr[:, :, 1]
        b = arr[:, :, 2]
        a = arr[:, :, 3]
        if opacity < 255:
            a = (a.astype(np.float32) * (opacity / 255.0)).astype(np.uint8)
            
    img_layer = nested_layers.Image(
        name=name,
        color_mode=enums.ColorMode.rgb,
        top=top,
        left=left,
        bottom=top + h,
        right=left + w,
        opacity=opacity
    )
    img_layer.set_channel(enums.ColorChannel.red, r)
    img_layer.set_channel(enums.ColorChannel.green, g)
    img_layer.set_channel(enums.ColorChannel.blue, b)
    img_layer.set_channel(enums.ColorChannel.transparency, a)
    return img_layer

def process_assets_and_psd():
    print("🎨 Processando camadas recortadas e montando PSD...")
    
    # 1. Process base background
    base_bg_file = os.path.join(TMP_RAW_LAYERS_DIR, '00_fundo_base.png')
    if os.path.exists(base_bg_file):
        shutil.copyfile(base_bg_file, os.path.join(PNG_DIR, '00_fundo_base_limpo.png'))
        base_im = Image.open(base_bg_file).convert('RGB')
    else:
        base_im = Image.new('RGB', (A4_WIDTH, A4_HEIGHT), color='#F8FAFC')
        base_im.save(os.path.join(PNG_DIR, '00_fundo_base_limpo.png'))
    
    # 2. Combine base + pattern for an instant background file
    math_bg_file = os.path.join(TMP_RAW_LAYERS_DIR, '01_fundo_padrao_matematico.png')
    if os.path.exists(math_bg_file):
        math_im = Image.open(math_bg_file).convert('RGBA')
        combined_bg = base_im.copy().convert('RGBA')
        # paste math pattern with 55% opacity
        math_with_opacity = math_im.copy()
        math_arr = np.array(math_with_opacity)
        math_arr[:, :, 3] = (math_arr[:, :, 3].astype(np.float32) * 0.55).astype(np.uint8)
        math_with_opacity = Image.fromarray(math_arr, 'RGBA')
        combined_bg.paste(math_with_opacity, (0, 0), math_with_opacity)
        combined_bg.convert('RGB').save(os.path.join(PNG_DIR, '00_fundo_completo_com_padrao.png'))
        print("✅ Fundo completo gerado: 00_fundo_completo_com_padrao.png")

    groups_dict = {
        '01_Fundo': [],
        '02_Hero_Topo': [],
        '03_Eixos_Tematicos': [],
        '04_Secao_Experimente': [],
        '05_Rodape': []
    }
    
    for layer_id, layer_name, group_name, default_opacity in LAYER_DEFS:
        raw_file = os.path.join(TMP_RAW_LAYERS_DIR, f"{layer_id}.png")
        if not os.path.exists(raw_file):
            print(f"⚠️ Aviso: Arquivo bruto não encontrado: {raw_file}")
            continue
            
        im = Image.open(raw_file)
        
        # If it's a full-canvas layer (like background or pattern)
        if layer_id in ['00_fundo_base', '01_fundo_padrao_matematico', '14_rodape_barra_fundo']:
            cropped_im = im
            left, top = 0, 0
            if layer_id == '14_rodape_barra_fundo':
                bbox = im.getbbox()
                if bbox:
                    left, top, right, bottom = bbox
                    cropped_im = im.crop(bbox)
        else:
            bbox = im.getbbox()
            if not bbox:
                print(f"⚠️ Camada vazia detectada: {layer_id}")
                continue
            left, top, right, bottom = bbox
            cropped_im = im.crop(bbox)
            
        # Save transparent cropped PNG
        out_png = os.path.join(PNG_DIR, f"{layer_id}.png")
        cropped_im.save(out_png, 'PNG')
        print(f"  📸 PNG salvo: {layer_id}.png (tam: {cropped_im.size}, pos: x={left}, y={top})")
        
        # Create PSD layer
        psd_layer = make_psd_layer(cropped_im, layer_name, left, top, default_opacity)
        groups_dict[group_name].append(psd_layer)

    # Build PSD Group Hierarchy (Top to bottom in Photoshop layer panel)
    psd_groups = []
    
    # 05. Rodapé
    if groups_dict['05_Rodape']:
        psd_groups.append(nested_layers.Group(name='05. Rodapé & Jurídico', layers=groups_dict['05_Rodape']))
        
    # 04. Experimente
    if groups_dict['04_Secao_Experimente']:
        psd_groups.append(nested_layers.Group(name='04. Seção Experimente & QR Codes', layers=groups_dict['04_Secao_Experimente']))
        
    # 03. Eixos
    if groups_dict['03_Eixos_Tematicos']:
        psd_groups.append(nested_layers.Group(name='03. Os 3 Eixos Temáticos', layers=groups_dict['03_Eixos_Tematicos']))
        
    # 02. Hero
    if groups_dict['02_Hero_Topo']:
        psd_groups.append(nested_layers.Group(name='02. Destaques & Hero', layers=groups_dict['02_Hero_Topo']))
        
    # 01. Fundo
    if groups_dict['01_Fundo']:
        psd_groups.append(nested_layers.Group(name='01. Fundo & Textura', layers=groups_dict['01_Fundo']))

    out_psd_path = os.path.join(OUTPUT_DIR, 'poster_labdiv_editavel.psd')
    print(f"💾 Gravando arquivo PSD em {out_psd_path}...")
    psd_file = nested_layers.nested_layers_to_psd(
        psd_groups,
        color_mode=enums.ColorMode.rgb,
        size=(A4_WIDTH, A4_HEIGHT),
        compression=enums.Compression.raw
    )
    with open(out_psd_path, 'wb') as f:
        psd_file.write(f)
    print("✅ Arquivo PSD gravado com sucesso!")
    
    # Verify with psd-tools
    verified_psd = PSDImage.open(out_psd_path)
    print(f"🔍 PSD Verificado: Dimensões {verified_psd.width}x{verified_psd.height}, Grupos: {len(verified_psd)}")
    for g in verified_psd:
        print(f"   📁 {g.name}")
        if g.is_group():
            for sub in g:
                print(f"      📄 {sub.name} (bbox: {sub.bbox})")

    # 3. Create LEIA-ME
    readme_content = f"""# GUIA DO DESIGNER - KIT DO PÔSTER HUB LABDIV (PHOTOSHOP & ILLUSTRATOR)
Laboratório de Expressão e Divulgação (LabDiv) - IFUSP
Software Livre sob Licença AGPLv3

Este pacote contém todos os arquivos e elementos necessários para você editar, reorganizar e customizar livremente o cartaz/pôster do HUB LabDiv.

---

## 📁 CONTEÚDO DO PACOTE

1. `poster_labdiv_editavel.psd`
   - Arquivo nativo do Adobe Photoshop em formato A4 Oficial (2480 x 3508 px @ 300 DPI).
   - Camadas organizadas em 5 Pastas (Grupos):
     * 05. Rodapé & Jurídico (Segurança, links Git, Email, Licença AGPLv3)
     * 04. Seção Experimente & QR Codes (QR Web, QR Play Store, Benefícios)
     * 03. Os 3 Eixos Temáticos (Social, Informativo, Ferramentas)
     * 02. Destaques & Hero (Card Play Store, 1 APP, INÚMERAS FUNÇÕES)
     * 01. Fundo & Textura (Padrão matemático com opacidade regulável + Fundo Base #F8FAFC)
   - Cada texto, caixa e selo está em uma camada separada que você pode clicar com a ferramenta Mover (tecla V) e arrastar, redimensionar (Ctrl+T) ou ocultar.

2. `poster_illustrator_vetorial.pdf`
   - Arquivo vetorial de alta definição para Adobe Illustrator.
   - Preserva todas as curvas, formas vetoriais, caixas e textos nativos da identidade visual do LabDiv.
   - Abra no Illustrator através de "Arquivo > Abrir" e desative/edite qualquer elemento.

3. Pasta `elementos_png_300dpi/`
   - Todos os elementos isolados e recortados com fundo transparente (300 DPI):
     * Fundo limpo (#F8FAFC)
     * Fundo completo com o padrão de fórmulas
     * Padrão matemático isolado transparente
     * Card Google Play HUB LabDiv
     * Texto 1 APP
     * Texto INÚMERAS FUNÇÕES
     * Cards Eixo 1 (Social), Eixo 2 (Informativo) e Eixo 3 (Ferramentas)
     * Header "EXPERIMENTE O HUB AGORA" com ícone de foguete
     * QR Codes de alta tolerância com o ícone LabDiv centralizado
     * Barra de benefícios
     * Barra e blocos do rodapé

4. Pasta `elementos_vetoriais_svg/`
   - SVGs puros prontos para arrastar no Illustrator, CorelDraw ou Figma:
     * `icone-HUBLabDiv.svg` (Símbolo oficial com gradiente LabDiv)
     * `bg-if-padrao-matematico.svg` (Textura matemática do IFUSP)
     * `qr-hub-web.svg` (QR Code para a Web)
     * `qr-google-play.svg` (QR Code para a Google Play Store)
     * `icone-eixo-social.svg`, `icone-eixo-cgif.svg`, `icone-eixo-ferramentas.svg`
     * `icone-foguete.svg`, `icone-escudo-seguranca.svg`

---

## 🎨 IDENTIDADE VISUAL E DIRETRIZES DA MARCA

- **Cores Oficiais:**
  * Azul LabDiv: #0F4780
  * Vermelho LabDiv: #F14343
  * Amarelo / Dourado LabDiv: #FFCC00 (para texto em fundo claro: #D97706)
  * Dark Escuro: #0F172A
  * Fundo Claro: #F8FAFC

- **Tipografia:**
  * Títulos e Destaques: 29LT Bukra Semi Wide Bold (ou Outfit ExtraBold / Black como alternativa)
  * Textos Longos, Subtítulos e Botões: Open Sans (Regular, SemiBold, Bold)

---

## ⚖️ LICENÇA
Hub de Comunicação Científica Lab-Div - Copyright (C) 2026 João Paulo Stangorlini de Carvalho.
Distribuído sob a Licença Pública Geral Affero GNU (AGPLv3).
"""
    readme_path = os.path.join(OUTPUT_DIR, 'LEIA-ME_GUIA_DO_DESIGNER.txt')
    with open(readme_path, 'w', encoding='utf-8') as f:
        f.write(readme_content)
    print("✅ LEIA-ME gerado com sucesso!")

    # 4. Create ZIP package
    zip_path = os.path.join(POSTERS_DIR, 'kit_poster_labdiv_editavel.zip')
    print(f"📦 Criando pacote ZIP em {zip_path}...")
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
        zf.write(out_psd_path, arcname=os.path.join('kit_poster_labdiv', 'poster_labdiv_editavel.psd'))
        
        pdf_source = os.path.join(OUTPUT_DIR, 'poster_illustrator_vetorial.pdf')
        if os.path.exists(pdf_source):
            zf.write(pdf_source, arcname=os.path.join('kit_poster_labdiv', 'poster_illustrator_vetorial.pdf'))
            
        zf.write(readme_path, arcname=os.path.join('kit_poster_labdiv', 'LEIA-ME_GUIA_DO_DESIGNER.txt'))
        
        # Add all PNGs
        for f_name in os.listdir(PNG_DIR):
            f_path = os.path.join(PNG_DIR, f_name)
            zf.write(f_path, arcname=os.path.join('kit_poster_labdiv', 'elementos_png_300dpi', f_name))
            
        # Add all SVGs
        for f_name in os.listdir(SVG_DIR):
            f_path = os.path.join(SVG_DIR, f_name)
            zf.write(f_path, arcname=os.path.join('kit_poster_labdiv', 'elementos_vetoriais_svg', f_name))
            
    print(f"✅ ZIP gerado com sucesso! Tamanho: {os.path.getsize(zip_path) / (1024*1024):.2f} MB")
    
    # 5. Copy to active artifacts directory
    if os.path.exists(ARTIFACT_DIR):
        print(f"📋 Copiando arquivos principais para o diretório de artifacts...")
        shutil.copyfile(zip_path, os.path.join(ARTIFACT_DIR, 'kit_poster_labdiv_editavel.zip'))
        shutil.copyfile(out_psd_path, os.path.join(ARTIFACT_DIR, 'poster_labdiv_editavel.psd'))
        if os.path.exists(pdf_source):
            shutil.copyfile(pdf_source, os.path.join(ARTIFACT_DIR, 'poster_illustrator_vetorial.pdf'))
        shutil.copyfile(readme_path, os.path.join(ARTIFACT_DIR, 'LEIA-ME_GUIA_DO_DESIGNER.txt'))
        print("✅ Cópias para artifacts concluídas com sucesso!")

    # Clean up temp raw layers
    if os.path.exists(TMP_RAW_LAYERS_DIR):
        shutil.rmtree(TMP_RAW_LAYERS_DIR)

if __name__ == '__main__':
    process_assets_and_psd()
