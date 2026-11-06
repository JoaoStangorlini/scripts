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
import shutil
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
TMP_LAYERS_DIR = os.path.join(POSTERS_DIR, '.tmp_mk3_layers')

A4_WIDTH = 2480
A4_HEIGHT = 3508

LAYER_DEFS = [
    # (id, name, group_name, default_opacity)
    ('00_fundo_base', 'Fundo Base (#F8FAFC)', '00_Fundo_e_Textura', 255),
    ('01_padrao_matematico', 'Padrão Fórmulas Matemáticas', '00_Fundo_e_Textura', 140),

    ('02_top_banner_bg', 'Fundo & Sombra do Card Topo', '01_Card_Topo_Google_Play', 255),
    ('03_top_banner_arrow', 'Ícone Seta (←)', '01_Card_Topo_Google_Play', 255),
    ('04_top_banner_brand_text', 'Texto: Google Play', '01_Card_Topo_Google_Play', 255),
    ('05_top_banner_app_icon', 'Logo Capelo HUB LabDiv', '01_Card_Topo_Google_Play', 255),
    ('06_top_banner_app_title', 'Título: HUB LabDiv', '01_Card_Topo_Google_Play', 255),
    ('07_top_banner_app_desc', 'Texto Descritivo do HUB', '01_Card_Topo_Google_Play', 255),
    ('08_top_banner_install_btn', 'Botão Completo: Instalar', '01_Card_Topo_Google_Play', 255),

    ('09_top_gradient_line', 'Linha Gradiente Superior', '02_Secao_Voce_Conhece_Hub', 255),
    ('10_experimente_icon', 'Ícone Foguete', '02_Secao_Voce_Conhece_Hub', 255),
    ('11_experimente_title', 'Título: VOCÊ CONHECE O HUB?', '02_Secao_Voce_Conhece_Hub', 255),
    ('11b_experimente_subtitle', 'Subtítulo: Escaneie e descubra o HUB...', '02_Secao_Voce_Conhece_Hub', 255),

    ('12_qr_web_card_bg', 'Fundo & Borda do Card QR Web', '03_Card_QR_Web', 255),
    ('13_qr_web_code_matrix', 'Código QR Web (Matriz)', '03_Card_QR_Web', 255),
    ('14_qr_web_center_badge', 'Badge Central QR Web (Logo)', '03_Card_QR_Web', 255),
    ('15_qr_web_label', 'Título: 🌐 ACESSE NO SITE', '03_Card_QR_Web', 255),
    ('16_qr_web_link_blue', 'Link Azul: hub-lab-div.vercel.app', '03_Card_QR_Web', 255),

    ('17_qr_play_card_bg', 'Fundo & Borda do Card QR PlayStore', '04_Card_QR_PlayStore', 255),
    ('18_qr_play_code_matrix', 'Código QR PlayStore (Matriz)', '04_Card_QR_PlayStore', 255),
    ('19_qr_play_center_badge', 'Badge Central QR PlayStore (Logo)', '04_Card_QR_PlayStore', 255),
    ('20_qr_play_label', 'Título: ▶ GOOGLE PLAY', '04_Card_QR_PlayStore', 255),
    ('21_qr_play_sub_text', 'Subtítulo: App Oficial Android', '04_Card_QR_PlayStore', 255),

    ('22_axis_social_card_bg', 'Card Social: Fundo & Barra Azul', '05_Eixo_1_Social', 255),
    ('23_axis_social_badge', 'Card Social: Ícone Comunidade', '05_Eixo_1_Social', 255),
    ('24_axis_social_title', 'Card Social: Título Social', '05_Eixo_1_Social', 255),
    ('25_axis_social_desc', 'Card Social: Descrição', '05_Eixo_1_Social', 255),

    ('26_axis_info_card_bg', 'Card Info: Fundo & Barra Vermelha', '06_Eixo_2_Informativo', 255),
    ('27_axis_info_badge', 'Card Info: Ícone CGIF', '06_Eixo_2_Informativo', 255),
    ('28_axis_info_title', 'Card Info: Título Informativo', '06_Eixo_2_Informativo', 255),
    ('29_axis_info_desc', 'Card Info: Descrição', '06_Eixo_2_Informativo', 255),

    ('30_axis_tools_card_bg', 'Card Ferramentas: Fundo & Barra Amarela', '07_Eixo_3_Ferramentas', 255),
    ('31_axis_tools_badge', 'Card Ferramentas: Ícone Ferramentas', '07_Eixo_3_Ferramentas', 255),
    ('32_axis_tools_title', 'Card Ferramentas: Título Ferramentas', '07_Eixo_3_Ferramentas', 255),
    ('33_axis_tools_desc', 'Card Ferramentas: Descrição', '07_Eixo_3_Ferramentas', 255),

    ('34_footer_bar_bg', 'Barra do Rodapé: Fundo Cinza', '08_Rodape_Oficial', 255),
    ('35_footer_gradient_divider', 'Linha Degradê do Rodapé', '08_Rodape_Oficial', 255),
    ('36_footer_legal_badge', 'Bloco Legal: Ícone & Título', '08_Rodape_Oficial', 255),
    ('37_footer_legal_text', 'Bloco Legal: Texto de Conformidade', '08_Rodape_Oficial', 255),
    ('38_footer_card_git', 'Botão: GitHub Código Aberto', '08_Rodape_Oficial', 255),
    ('39_footer_card_email', 'Botão: E-mail de Suporte', '08_Rodape_Oficial', 255),
    ('40_footer_bottom_line', 'Linha Copyright IFUSP & AGPLv3', '08_Rodape_Oficial', 255)
]

GROUPS_ORDER = [
    '00_Fundo_e_Textura',
    '01_Card_Topo_Google_Play',
    '02_Secao_Voce_Conhece_Hub',
    '03_Card_QR_Web',
    '04_Card_QR_PlayStore',
    '05_Eixo_1_Social',
    '06_Eixo_2_Informativo',
    '07_Eixo_3_Ferramentas',
    '08_Rodape_Oficial'
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

def main():
    print("🎨 Montando poster.psd com cada sub-elemento isolado em sua própria camada...")

    groups_dict = {grp: [] for grp in GROUPS_ORDER}

    for layer_id, layer_name, group_name, default_opacity in LAYER_DEFS:
        raw_file = os.path.join(TMP_LAYERS_DIR, f"{layer_id}.png")
        if not os.path.exists(raw_file):
            print(f"⚠️ Aviso: Arquivo bruto não encontrado: {raw_file}")
            continue

        im = Image.open(raw_file)

        if layer_id in ['00_fundo_base', '01_padrao_matematico']:
            cropped_im = im
            left, top = 0, 0
        else:
            bbox = im.getbbox()
            if not bbox:
                print(f"⚠️ Camada vazia detectada: {layer_id}")
                continue
            left, top, right, bottom = bbox
            cropped_im = im.crop(bbox)

        print(f"  📄 Camada: {layer_name} (tam: {cropped_im.size}, pos: x={left}, y={top})")
        psd_layer = make_psd_layer(cropped_im, layer_name, left, top, default_opacity)
        groups_dict[group_name].append(psd_layer)

    # Invert groups so top elements in Photoshop layers panel are on top
    psd_groups = []
    for grp in reversed(GROUPS_ORDER):
        if groups_dict[grp]:
            display_name = grp.replace('_', ' ')
            psd_groups.append(nested_layers.Group(name=display_name, layers=groups_dict[grp]))

    out_psd_path = os.path.join(POSTERS_DIR, 'poster.psd')
    print(f"\n💾 Gravando arquivo PSD em {out_psd_path}...")
    psd_file = nested_layers.nested_layers_to_psd(
        psd_groups,
        color_mode=enums.ColorMode.rgb,
        size=(A4_WIDTH, A4_HEIGHT),
        compression=enums.Compression.raw
    )
    with open(out_psd_path, 'wb') as f:
        psd_file.write(f)
    print("✅ poster.psd gravado com sucesso!")

    # Verify with psd-tools
    verified = PSDImage.open(out_psd_path)
    print(f"\n🔍 poster.psd verificado: {verified.width}x{verified.height}, {len(verified)} grupos:")
    for g in verified:
        print(f"   📁 {g.name}")
        if g.is_group():
            for sub in g:
                print(f"      📄 {sub.name} (bbox: {sub.bbox})")

    # Clean up temp raw layers
    if os.path.exists(TMP_LAYERS_DIR):
        shutil.rmtree(TMP_LAYERS_DIR)

if __name__ == '__main__':
    main()
