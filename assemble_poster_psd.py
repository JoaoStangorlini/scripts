# -*- coding: utf-8 -*-
"""
/*!
 * Hub de Comunicação Científica Lab-Div V3.0
 * Copyright (C) 2026 João Paulo Stangorlini de Carvalho
 *
 * Este programa é um software livre: você pode redistribuí-lo e/ou modificá-lo
 * sob os termos da Licença Pública Geral Affero GNU (AGPLv3) conforme
 * publicada pela Free Software Foundation.
 */
"""

import os
import sys
import numpy as np
from PIL import Image
import pytoshop
from pytoshop import enums
from pytoshop.user import nested_layers
from psd_tools import PSDImage

A4_WIDTH = 2480
A4_HEIGHT = 3508

def build_psd_for_poster(output_psd_path, layers_data):
    """
    layers_data: list of dicts:
      [
        {"name": "00. Fundo Base", "png_path": "..."},
        {"name": "01. Padrão Matemático", "png_path": "..."},
        ...
      ]
    Layers are ordered from bottom to top.
    """
    print(f"\n🎨 Montando PSD em {output_psd_path}...")
    psd_layers = []

    for item in layers_data:
        name = item['name']
        png_path = item['png_path']

        if not os.path.exists(png_path):
            print(f"   ⚠️ Imagem de camada não encontrada: {png_path}")
            continue

        im = Image.open(png_path).convert('RGBA')
        if im.size != (A4_WIDTH, A4_HEIGHT):
            im = im.resize((A4_WIDTH, A4_HEIGHT), Image.Resampling.LANCZOS)

        bbox = im.getbbox()
        if not bbox:
            continue

        cropped = im.crop(bbox)
        left, top, right, bottom = bbox
        c_arr = np.array(cropped)

        alpha = c_arr[:, :, 3]

        layer = nested_layers.Image(
            name=name,
            color_mode=enums.ColorMode.rgb,
            top=top,
            left=left,
            bottom=bottom,
            right=right,
            opacity=255
        )
        layer.set_channel(enums.ColorChannel.red, c_arr[:, :, 0].astype(np.uint8))
        layer.set_channel(enums.ColorChannel.green, c_arr[:, :, 1].astype(np.uint8))
        layer.set_channel(enums.ColorChannel.blue, c_arr[:, :, 2].astype(np.uint8))
        layer.set_channel(enums.ColorChannel.transparency, alpha.astype(np.uint8))
        psd_layers.append(layer)

    if not psd_layers:
        print("❌ Nenhuma camada válida para gerar o PSD.")
        return False

    # No Photoshop, a primeira camada da lista no nested_layers fica no topo.
    # Invertemos para que a camada base fique no fundo.
    psd_layers.reverse()

    psd_file = nested_layers.nested_layers_to_psd(
        psd_layers,
        color_mode=enums.ColorMode.rgb,
        size=(A4_WIDTH, A4_HEIGHT),
        compression=enums.Compression.raw
    )

    os.makedirs(os.path.dirname(output_psd_path), exist_ok=True)
    with open(output_psd_path, 'wb') as f:
        psd_file.write(f)

    # Validar integridade com psd_tools
    try:
        v = PSDImage.open(output_psd_path)
        print(f"   ✅ PSD verificado ({os.path.basename(output_psd_path)}): {v.width}x{v.height} px, {len(v)} camadas.")
        return True
    except Exception as e:
        print(f"   ⚠️ Erro ao verificar PSD: {e}")
        return False

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Uso: python3 assemble_poster_psd.py <out_psd> <layer1_name:layer1_path> <layer2_name:layer2_path> ...")
        sys.exit(1)

    out_path = sys.argv[1]
    layers = []
    for arg in sys.argv[2:]:
        parts = arg.split('::', 1)
        if len(parts) == 2:
            layers.append({"name": parts[0], "png_path": parts[1]})

    success = build_psd_for_poster(out_path, layers)
    sys.exit(0 if success else 1)
