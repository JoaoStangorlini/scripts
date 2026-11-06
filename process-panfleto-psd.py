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
import subprocess
import numpy as np
from PIL import Image
import pytoshop
from pytoshop import enums
from pytoshop.user import nested_layers
from psd_tools import PSDImage

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, '..'))
PUBLIC_DIR = os.path.join(PROJECT_ROOT, 'public')
PANFLETOS_DIR = os.path.join(PUBLIC_DIR, 'divulgacao', 'panfletos')
OUTPUT_DIR = os.path.join(PANFLETOS_DIR, 'editavel_photoshop_illustrator')
PNG_DIR = os.path.join(OUTPUT_DIR, 'elementos_png_300dpi')
PNG_EXTERNA_DIR = os.path.join(PNG_DIR, 'face_externa')
PNG_INTERNA_DIR = os.path.join(PNG_DIR, 'face_interna')
SVG_DIR = os.path.join(OUTPUT_DIR, 'elementos_vetoriais_svg')
TMP_RAW_DIR = os.path.join(OUTPUT_DIR, '.tmp_raw_layers')
TMP_EXTERNA_DIR = os.path.join(TMP_RAW_DIR, 'externa')
TMP_INTERNA_DIR = os.path.join(TMP_RAW_DIR, 'interna')

ARTIFACT_DIR = os.environ.get('ARTIFACT_DIR', './artifacts')

A4_LANDSCAPE_W = 3508
A4_LANDSCAPE_H = 2480

LAYERS_EXTERNA_DEFS = [
    # (id, name, group_name, default_opacity)
    ('00_fundo_base', 'Fundo Base (#F8FAFC)', '01_Fundo_e_Guias', 255),
    ('01_fundo_padrao_matematico', 'Padrão Fórmulas Matemáticas', '01_Fundo_e_Guias', 140), # ~55%
    ('02_guias_de_dobra', 'Guias Tracejadas de Dobra', '01_Fundo_e_Guias', 200),
    
    ('03_p1_topo_titulos', 'P1: Título Sobre o LabDiv & Slogan', '02_Painel_1_Sobre_LabDiv', 255),
    ('04_p1_card_mentorias', 'P1: Card Mentorias (MIT Model)', '02_Painel_1_Sobre_LabDiv', 255),
    ('05_p1_card_projetos', 'P1: Card Projetos & Frentes', '02_Painel_1_Sobre_LabDiv', 255),
    ('06_p1_card_digitalab', 'P1: Card DigitaLab (Estúdio)', '02_Painel_1_Sobre_LabDiv', 255),
    ('07_p1_card_contato_qr', 'P1: Card Localização, Contato & QR', '02_Painel_1_Sobre_LabDiv', 255),
    
    ('08_p2_topo_titulo', 'P2: Título Acesso Imediato', '03_Painel_2_Acesso_e_QRCodes', 255),
    ('09_p2_card_qr_web', 'P2: Card QR Code Web PWA', '03_Painel_2_Acesso_e_QRCodes', 255),
    ('10_p2_card_qr_playstore', 'P2: Card QR Google Play & Instalar', '03_Painel_2_Acesso_e_QRCodes', 255),
    ('11_p2_card_em_desenvolvimento', 'P2: Card iOS & Desktop a caminho', '03_Painel_2_Acesso_e_QRCodes', 255),
    
    ('12_p3_topo_institucional', 'Capa: Topo IFUSP & LabDiv', '04_Painel_3_Capa_Oficial', 255),
    ('13_p3_logo_capelo', 'Capa: Símbolo Capelo LabDiv', '04_Painel_3_Capa_Oficial', 255),
    ('14_p3_titulo_hub_labdiv', 'Capa: Título HUB LabDiv', '04_Painel_3_Capa_Oficial', 255),
    ('15_p3_slogan_1app', 'Capa: Slogan 1 APP • INÚMERAS FUNÇÕES', '04_Painel_3_Capa_Oficial', 255),
    ('16_p3_texto_descritivo', 'Capa: Texto Descritivo da Plataforma', '04_Painel_3_Capa_Oficial', 255),
    ('17_p3_mini_card_social', 'Capa: Mini-card Eixo 1 Social', '04_Painel_3_Capa_Oficial', 255),
    ('18_p3_mini_card_informativo', 'Capa: Mini-card Eixo 2 Informativo', '04_Painel_3_Capa_Oficial', 255),
    ('19_p3_mini_card_ferramentas', 'Capa: Mini-card Eixo 3 Ferramentas', '04_Painel_3_Capa_Oficial', 255),
    ('20_p3_rodape_capa', 'Capa: Linha de Licença AGPLv3 IFUSP', '04_Painel_3_Capa_Oficial', 255)
]

LAYERS_INTERNA_DEFS = [
    # (id, name, group_name, default_opacity)
    ('00_fundo_base', 'Fundo Base (#F8FAFC)', '01_Fundo_e_Guias', 255),
    ('01_fundo_padrao_matematico', 'Padrão Fórmulas Matemáticas', '01_Fundo_e_Guias', 140),
    ('02_guias_de_dobra', 'Guias Tracejadas de Dobra', '01_Fundo_e_Guias', 200),
    
    ('03_header_unificado', 'Topo Geral: HUB LabDiv & Slogan', '02_Topo_Geral', 255),
    
    ('04_p1_social_header', 'Eixo 1: Cabeçalho & Descrição', '03_Eixo_1_Social', 255),
    ('05_p1_card_comunidade', 'Eixo 1: Card Comunidade (Fluxo/Galeria)', '03_Eixo_1_Social', 255),
    ('06_p1_card_interacoes', 'Eixo 1: Card Central de Interações', '03_Eixo_1_Social', 255),
    ('07_p1_card_lab_pessoal', 'Eixo 1: Card Lab Pessoal', '03_Eixo_1_Social', 255),
    
    ('08_p2_info_header', 'Eixo 2: Cabeçalho & Descrição', '04_Eixo_2_Informativo', 255),
    ('09_p2_card_wiki', 'Eixo 2: Card Wiki Central da USP', '04_Eixo_2_Informativo', 255),
    ('10_p2_card_instituto', 'Eixo 2: Card O Instituto', '04_Eixo_2_Informativo', 255),
    ('11_p2_card_interativo', 'Eixo 2: Card Interativo & FAQ', '04_Eixo_2_Informativo', 255),
    
    ('12_p3_tools_header', 'Eixo 3: Cabeçalho & Descrição', '05_Eixo_3_Ferramentas', 255),
    ('13_p3_card_planejamento', 'Eixo 3: Card Planejamento Acadêmico', '05_Eixo_3_Ferramentas', 255),
    ('14_p3_card_match', 'Eixo 3: Card Match & Parcerias', '05_Eixo_3_Ferramentas', 255),
    ('15_p3_card_produtividade', 'Eixo 3: Card Produtividade Científica', '05_Eixo_3_Ferramentas', 255),
    
    ('16_footer_linha_gradiente', 'Rodapé: Linha Degradê Contínua', '06_Rodape_Unificado', 255),
    ('17_footer_card_discentes', 'Rodapé: Card Para Discentes (Azul)', '06_Rodape_Unificado', 255),
    ('18_footer_card_docentes', 'Rodapé: Card Para Docentes (Vermelho)', '06_Rodape_Unificado', 255),
    ('19_footer_card_sociedade', 'Rodapé: Card Para Sociedade (Amarelo)', '06_Rodape_Unificado', 255)
]

def make_psd_layer(img_pil, name, left, top, opacity=255):
    w, h = img_pil.size
    arr = np.array(img_pil)
    
    if arr.ndim == 2:
        r = arr
        g = arr
        b = arr
        a = np.full((h, w), opacity, dtype=np.uint8)
    elif arr.shape[2] == 3:
        r = arr[:, :, 0]
        g = arr[:, :, 1]
        b = arr[:, :, 2]
        a = np.full((h, w), opacity, dtype=np.uint8)
    else:
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

def process_face_psd(face_name, tmp_dir, png_dest_dir, layer_defs, groups_order, out_psd_name):
    print(f"\n🎨 Processando PSD para: {face_name}...")
    
    # 1. Base background
    base_bg_file = os.path.join(tmp_dir, '00_fundo_base.png')
    if os.path.exists(base_bg_file):
        shutil.copyfile(base_bg_file, os.path.join(png_dest_dir, '00_fundo_base_limpo.png'))
        base_im = Image.open(base_bg_file).convert('RGB')
    else:
        base_im = Image.new('RGB', (A4_LANDSCAPE_W, A4_LANDSCAPE_H), color='#F8FAFC')
        base_im.save(os.path.join(png_dest_dir, '00_fundo_base_limpo.png'))
        
    # 2. Combined background
    math_bg_file = os.path.join(tmp_dir, '01_fundo_padrao_matematico.png')
    if os.path.exists(math_bg_file):
        math_im = Image.open(math_bg_file).convert('RGBA')
        combined_bg = base_im.copy().convert('RGBA')
        math_arr = np.array(math_im)
        math_arr[:, :, 3] = (math_arr[:, :, 3].astype(np.float32) * 0.55).astype(np.uint8)
        math_with_opacity = Image.fromarray(math_arr, 'RGBA')
        combined_bg.paste(math_with_opacity, (0, 0), math_with_opacity)
        combined_bg.convert('RGB').save(os.path.join(png_dest_dir, '00_fundo_completo_com_padrao.png'))

    groups_dict = {grp: [] for grp in groups_order}

    for layer_id, layer_name, group_name, default_opacity in layer_defs:
        raw_file = os.path.join(tmp_dir, f"{layer_id}.png")
        if not os.path.exists(raw_file):
            print(f"  ⚠️ Aviso: Arquivo bruto não encontrado: {raw_file}")
            continue

        im = Image.open(raw_file)
        if layer_id in ['00_fundo_base', '01_fundo_padrao_matematico', '02_guias_de_dobra']:
            cropped_im = im
            left, top = 0, 0
        else:
            bbox = im.getbbox()
            if not bbox:
                print(f"  ⚠️ Camada vazia detectada: {layer_id}")
                continue
            left, top, right, bottom = bbox
            cropped_im = im.crop(bbox)

        out_png = os.path.join(png_dest_dir, f"{layer_id}.png")
        cropped_im.save(out_png, 'PNG')
        print(f"  📸 PNG salvo: {layer_id}.png (tam: {cropped_im.size}, pos: x={left}, y={top})")

        psd_layer = make_psd_layer(cropped_im, layer_name, left, top, default_opacity)
        if group_name in groups_dict:
            groups_dict[group_name].append(psd_layer)

    # Invert groups so top elements in Photoshop layers panel are on top
    psd_groups = []
    for grp in reversed(groups_order):
        if groups_dict[grp]:
            # Human readable group name
            display_name = grp.replace('_', ' ')
            psd_groups.append(nested_layers.Group(name=display_name, layers=groups_dict[grp]))

    out_psd_path = os.path.join(OUTPUT_DIR, out_psd_name)
    print(f"💾 Gravando arquivo PSD em {out_psd_path}...")
    psd_file = nested_layers.nested_layers_to_psd(
        psd_groups,
        color_mode=enums.ColorMode.rgb,
        size=(A4_LANDSCAPE_W, A4_LANDSCAPE_H),
        compression=enums.Compression.raw
    )
    with open(out_psd_path, 'wb') as f:
        psd_file.write(f)
    print(f"✅ PSD gravado: {out_psd_name}")

    # Verify with psd-tools
    verified = PSDImage.open(out_psd_path)
    print(f"🔍 {out_psd_name} verificado: {verified.width}x{verified.height}, {len(verified)} grupos:")
    for g in verified:
        print(f"   📁 {g.name}")
        if g.is_group():
            for sub in g:
                print(f"      📄 {sub.name} (bbox: {sub.bbox})")

    return out_psd_path

def main():
    # 1. Process Face Externa
    groups_externa = ['01_Fundo_e_Guias', '02_Painel_1_Sobre_LabDiv', '03_Painel_2_Acesso_e_QRCodes', '04_Painel_3_Capa_Oficial']
    psd_externo = process_face_psd(
        'Face Externa (Capa + Verso + LabDiv)',
        TMP_EXTERNA_DIR,
        PNG_EXTERNA_DIR,
        LAYERS_EXTERNA_DEFS,
        groups_externa,
        'panfleto_face_externa_editavel.psd'
    )

    # 2. Process Face Interna
    groups_interna = ['01_Fundo_e_Guias', '02_Topo_Geral', '03_Eixo_1_Social', '04_Eixo_2_Informativo', '05_Eixo_3_Ferramentas', '06_Rodape_Unificado']
    psd_interno = process_face_psd(
        'Face Interna (Os 3 Eixos Temáticos + Rodapé)',
        TMP_INTERNA_DIR,
        PNG_INTERNA_DIR,
        LAYERS_INTERNA_DEFS,
        groups_interna,
        'panfleto_face_interna_editavel.psd'
    )

    # 3. Combine Vector PDFs into 2-page complete vector PDF
    pdf_externo = os.path.join(OUTPUT_DIR, 'panfleto_face_externa_illustrator.pdf')
    pdf_interno = os.path.join(OUTPUT_DIR, 'panfleto_face_interna_illustrator.pdf')
    pdf_completo = os.path.join(OUTPUT_DIR, 'panfleto_completo_illustrator.pdf')
    if os.path.exists(pdf_externo) and os.path.exists(pdf_interno):
        print(f"\n📑 Unindo PDFs vetoriais com pdfunite em {pdf_completo}...")
        subprocess.run(['pdfunite', pdf_externo, pdf_interno, pdf_completo], check=True)
        print("✅ PDF vetorial completo (2 páginas) gerado com sucesso!")

    # 4. Generate README
    readme_content = f"""# GUIA DO DESIGNER - KIT DO PANFLETO HUB LABDIV (PHOTOSHOP & ILLUSTRATOR)
Laboratório de Expressão e Divulgação (LabDiv) - IFUSP
Software Livre sob Licença AGPLv3

Este pacote contém todos os arquivos e elementos abertos para edição, reposicionamento e customização do Panfleto Oficial Dobrável (Tri-Fold A4) do HUB LabDiv.

Formato: A4 Paisagem (297 x 210 mm) dobrado em 3 partes (2 dobras verticais).
Resolução Digital: 3508 x 2480 px @ 300 DPI oficial para gráfica.

---

## 📁 ARQUIVOS PRINCIPAIS

1. `panfleto_face_externa_editavel.psd` (Photoshop)
   - Contém a Face Externa oficial em camadas separadas:
     * Painel 3 (Direita): CAPA OFICIAL (Logo grande, HUB LabDiv, 1 APP • INÚMERAS FUNÇÕES, 3 mini-cards, rodapé)
     * Painel 2 (Centro): VERSO & QR CODES (Acesse no Navegador, Google Play com botão Instalar, Em Desenvolvimento)
     * Painel 1 (Esquerda): SOBRE O LABDIV (Mentorias MIT, Projetos/Frentes, DigitaLab, Contato & QR)
     * Fundo & Guias: Fundo base #F8FAFC, Padrão de Fórmulas Matemáticas transparente e Linhas Guias de Dobra tracejadas.

2. `panfleto_face_interna_editavel.psd` (Photoshop)
   - Contém a Face Interna aberta com os 3 Eixos Temáticos:
     * Topo Geral: Barra institucional unificada
     * Painel 1 (Esquerda): Eixo 1 - Social (Cards Comunidade, Central de Interações, Lab Pessoal)
     * Painel 2 (Centro): Eixo 2 - Informativo (Cards Wiki Central, O Instituto, Interativo)
     * Painel 3 (Direita): Eixo 3 - Ferramentas (Cards Planejamento, Match, Produtividade)
     * Rodapé Unificado: Linha em degradê contínua + Cards Discentes, Docentes e Sociedade
     * Fundo & Guias: Padrão matemático + Guias de dobra

3. `panfleto_face_externa_illustrator.pdf` e `panfleto_face_interna_illustrator.pdf` (Illustrator)
   - Arquivos 100% vetoriais. Abra no Adobe Illustrator através de "Arquivo > Abrir".
   - Cada texto, curva bézier, logo e ícone é um objeto vetorial nativo independente.

4. `panfleto_completo_illustrator.pdf`
   - Documento vetorial de 2 páginas (Página 1 = Externa, Página 2 = Interna) para envio direto à gráfica ou revisão.

5. Pasta `elementos_png_300dpi/`
   - Subpasta `face_externa/`: 21 elementos recortados em PNG transparente 300 DPI.
   - Subpasta `face_interna/`: 20 elementos recortados em PNG transparente 300 DPI.

6. Pasta `elementos_vetoriais_svg/`
   - Todos os logotipos e ícones em SVG puro: Capelo LabDiv, Padrão de Fórmulas, QR Codes, ícones dos 3 eixos e utilitários.

---

## 🎨 IDENTIDADE VISUAL E DIRETRIZES DA MARCA

- **Cores Oficiais:**
  * Azul LabDiv: #0F4780
  * Vermelho LabDiv: #F14343
  * Amarelo / Dourado LabDiv: #FFCC00 (para texto em fundo claro: #D97706 ou #854D0E)
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
    readme_path = os.path.join(OUTPUT_DIR, 'LEIA-ME_GUIA_DO_DESIGNER_PANFLETO.txt')
    with open(readme_path, 'w', encoding='utf-8') as f:
        f.write(readme_content)
    print("✅ LEIA-ME do Panfleto gerado!")

    # 5. Create ZIP package
    zip_path = os.path.join(PANFLETOS_DIR, 'kit_panfleto_labdiv_editavel.zip')
    print(f"\n📦 Criando pacote ZIP em {zip_path}...")
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
        zf.write(psd_externo, arcname=os.path.join('kit_panfleto_labdiv', 'panfleto_face_externa_editavel.psd'))
        zf.write(psd_interno, arcname=os.path.join('kit_panfleto_labdiv', 'panfleto_face_interna_editavel.psd'))
        zf.write(pdf_externo, arcname=os.path.join('kit_panfleto_labdiv', 'panfleto_face_externa_illustrator.pdf'))
        zf.write(pdf_interno, arcname=os.path.join('kit_panfleto_labdiv', 'panfleto_face_interna_illustrator.pdf'))
        if os.path.exists(pdf_completo):
            zf.write(pdf_completo, arcname=os.path.join('kit_panfleto_labdiv', 'panfleto_completo_illustrator.pdf'))
        zf.write(readme_path, arcname=os.path.join('kit_panfleto_labdiv', 'LEIA-ME_GUIA_DO_DESIGNER_PANFLETO.txt'))

        for root, dirs, files in os.walk(PNG_DIR):
            for file in files:
                full_p = os.path.join(root, file)
                rel_p = os.path.relpath(full_p, OUTPUT_DIR)
                zf.write(full_p, arcname=os.path.join('kit_panfleto_labdiv', rel_p))

        for file in os.listdir(SVG_DIR):
            full_p = os.path.join(SVG_DIR, file)
            zf.write(full_p, arcname=os.path.join('kit_panfleto_labdiv', 'elementos_vetoriais_svg', file))

    print(f"✅ ZIP gerado com sucesso! Tamanho: {os.path.getsize(zip_path) / (1024*1024):.2f} MB")

    # 6. Copy to active artifacts directory
    if os.path.exists(ARTIFACT_DIR):
        print(f"\n📋 Copiando arquivos principais para o diretório de artifacts...")
        shutil.copyfile(zip_path, os.path.join(ARTIFACT_DIR, 'kit_panfleto_labdiv_editavel.zip'))
        shutil.copyfile(psd_externo, os.path.join(ARTIFACT_DIR, 'panfleto_face_externa_editavel.psd'))
        shutil.copyfile(psd_interno, os.path.join(ARTIFACT_DIR, 'panfleto_face_interna_editavel.psd'))
        shutil.copyfile(pdf_completo, os.path.join(ARTIFACT_DIR, 'panfleto_completo_illustrator.pdf'))
        shutil.copyfile(readme_path, os.path.join(ARTIFACT_DIR, 'LEIA-ME_GUIA_DO_DESIGNER_PANFLETO.txt'))
        print("✅ Cópias para artifacts concluídas com sucesso!")

    # Clean up temp raw layers
    if os.path.exists(TMP_RAW_DIR):
        shutil.rmtree(TMP_RAW_DIR)

if __name__ == '__main__':
    main()
