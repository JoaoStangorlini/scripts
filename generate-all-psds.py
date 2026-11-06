# -*- coding: utf-8 -*-
"""
Hub de Comunicação Científica Lab-Div V3.0
Copyright (C) 2026 João Paulo Stangorlini de Carvalho

Este programa é um software livre: você pode redistribuí-lo e/ou modificá-lo
sob os termos da Licença Pública Geral Affero GNU (AGPLv3) conforme
publicada pela Free Software Foundation.
"""

import os
import sys
import json
import shutil
import numpy as np
from PIL import Image
import pytoshop
from pytoshop import enums
from pytoshop.user import nested_layers
from psd_tools import PSDImage

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, '..'))
POSTERS_ROOT = os.path.join(PROJECT_ROOT, 'public', 'divulgacao', 'posters')

A4_WIDTH = 2480
A4_HEIGHT = 3508

def build_psd_for_poster(poster_idx, config_data):
    poster_dir = os.path.join(POSTERS_ROOT, f"poster{poster_idx}")
    tmp_dir = os.path.join(poster_dir, ".tmp_layers")
    out_psd_path = os.path.join(poster_dir, f"poster{poster_idx}.psd")
    consolidated_dir = os.path.join(POSTERS_ROOT, "posters_de_1_a_12")
    os.makedirs(consolidated_dir, exist_ok=True)
    
    if not os.path.exists(tmp_dir):
        print(f"⚠️ Diretório de camadas não encontrado para poster {poster_idx}: {tmp_dir}")
        return False

    bg_color = config_data.get("bg_color", "#FFFFFF")
    layers_meta = config_data.get("layers", [])

    print(f"\n🎨 [Poster {poster_idx:02d}] Montando PSD multi-camadas em {out_psd_path}...")
    psd_layers = []

    # 1. Base solid background layer
    bg_im = Image.new('RGB', (A4_WIDTH, A4_HEIGHT), color=bg_color)
    arr_bg = np.array(bg_im)
    bg_layer = nested_layers.Image(
        name='00. Fundo Base',
        color_mode=enums.ColorMode.rgb,
        top=0, left=0, bottom=A4_HEIGHT, right=A4_WIDTH
    )
    bg_layer.set_channel(enums.ColorChannel.red, arr_bg[:,:,0].astype(np.uint8))
    bg_layer.set_channel(enums.ColorChannel.green, arr_bg[:,:,1].astype(np.uint8))
    bg_layer.set_channel(enums.ColorChannel.blue, arr_bg[:,:,2].astype(np.uint8))
    bg_layer.set_channel(enums.ColorChannel.transparency, np.full((A4_HEIGHT, A4_WIDTH), 255, dtype=np.uint8))
    psd_layers.append(bg_layer)

    # 2. Add each extracted layer
    for item in layers_meta:
        lid = item['id']
        name = item['name']
        opacity = item.get('opacity', 255)
        layer_png = os.path.join(tmp_dir, f"{lid}.png")
        
        if not os.path.exists(layer_png):
            continue

        im = Image.open(layer_png)
        bbox = im.getbbox()
        if not bbox:
            continue
            
        cropped = im.crop(bbox)
        left, top, right, bottom = bbox
        c_arr = np.array(cropped)
        
        # Determine alpha
        if c_arr.shape[2] == 4:
            alpha = c_arr[:, :, 3]
        else:
            alpha = np.full((bottom - top, right - left), 255, dtype=np.uint8)
            
        if opacity < 255:
            alpha = (alpha.astype(np.float32) * (opacity / 255.0)).astype(np.uint8)

        layer = nested_layers.Image(
            name=name,
            color_mode=enums.ColorMode.rgb,
            top=top,
            left=left,
            bottom=bottom,
            right=right,
            opacity=opacity
        )
        layer.set_channel(enums.ColorChannel.red, c_arr[:,:,0].astype(np.uint8))
        layer.set_channel(enums.ColorChannel.green, c_arr[:,:,1].astype(np.uint8))
        layer.set_channel(enums.ColorChannel.blue, c_arr[:,:,2].astype(np.uint8))
        layer.set_channel(enums.ColorChannel.transparency, alpha)
        psd_layers.append(layer)

    # In Photoshop, the first layer in the list is at the top of the layer stack.
    # Therefore, we reverse so that the background stays at the very bottom.
    psd_layers.reverse()

    psd_file = nested_layers.nested_layers_to_psd(
        psd_layers,
        color_mode=enums.ColorMode.rgb,
        size=(A4_WIDTH, A4_HEIGHT),
        compression=enums.Compression.raw
    )

    with open(out_psd_path, 'wb') as f:
        psd_file.write(f)

    # Verify integrity with psd_tools
    try:
        v = PSDImage.open(out_psd_path)
        print(f"   ✅ PSD verificado ({os.path.basename(out_psd_path)}): {v.width}x{v.height} px, {len(v)} camadas ativas.")
        for l in v:
            print(f"      📄 {l.name} {l.bbox}")
    except Exception as e:
        print(f"   ⚠️ Aviso na verificação do PSD: {e}")

    # Cleanup temporary layer images
    shutil.rmtree(tmp_dir, ignore_errors=True)
    return True

def main():
    config_file = sys.argv[1] if len(sys.argv) > 1 else os.path.join(PROJECT_ROOT, "scripts", "posters_psd_config.json")
    if not os.path.exists(config_file):
        print(f"❌ Arquivo de configuração não encontrado: {config_file}")
        sys.exit(1)

    with open(config_file, 'r', encoding='utf-8') as f:
        all_configs = json.load(f)

    success_count = 0
    for p_idx_str, cfg in all_configs.items():
        p_idx = int(p_idx_str)
        if build_psd_for_poster(p_idx, cfg):
            success_count += 1

    print(f"\n🎉 Concluído: {success_count} arquivos PSD gerados e validados com sucesso!")

if __name__ == "__main__":
    main()
