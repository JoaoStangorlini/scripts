# Hub de Comunicação Científica Lab-Div V3.0
# Copyright (C) 2026 João Paulo Stangorlini de Carvalho
# Licença Affero GNU AGPLv3.

import os

def generate_svg():
    items = [
        # --- ZONA 1: TOPO & CABEÇALHO (y: 35 a 520) ---
        ('E = mc²', 80, 50, '#0F4780', 32, -12),
        ('∂ψ/∂t', 640, 45, '#F14343', 28, 8),
        ('Δx · Δp ≥ ℏ/2', 1020, 60, '#D97706', 26, -6),
        ('∇×B = μ₀J', 320, 95, '#0F4780', 25, 14),
        ('∮ B·dl = μ₀I', 880, 100, '#F14343', 25, -9),
        ('λ = h/p', 120, 180, '#F14343', 26, -10),
        ('∑ 1/n² = π²/6', 1100, 190, '#0F4780', 25, 8),
        ('F = dp/dt', 60, 270, '#D97706', 27, 10),
        ('dE = TdS - PdV', 1080, 290, '#D97706', 25, -7),
        ('ψ(x,t)', 80, 360, '#0F4780', 26, -6),
        ('γ = 1/√(1 - v²/c²)', 1060, 370, '#F14343', 25, 7),
        ('α · β · γ', 70, 450, '#D97706', 27, -5),
        ('e^{iπ} + 1 = 0', 1080, 460, '#0F4780', 28, 6),
        ('μ₀ε₀ = 1/c²', 250, 490, '#F14343', 24, -4),
        ('T = 2π√(l/g)', 920, 500, '#D97706', 25, 8),

        # --- ZONA 2: CANAL CENTRAL ENTRE SOCIAL E INFORMATIVO (x: 440 a 800, y: 520 a 710) ---
        ('∇·E = ρ/ε₀', 510, 560, '#0F4780', 26, 6),
        ('L = T - V', 720, 560, '#D97706', 27, -5),
        ('iℏ ∂ψ/∂t = Ĥψ', 620, 620, '#F14343', 27, -4),
        ('∫ e^{-x²} dx = √π', 620, 680, '#0F4780', 25, 0),

        # --- ZONA 3: ENTRE CARD SOCIAL E CARD FERRAMENTAS (x: 50 a 440, y: 780 a 1110) ---
        ('S = k ln W', 200, 810, '#F14343', 30, 8),
        ('G_μν = κ T_μν', 110, 870, '#D97706', 26, -6),
        ('ψ(r,θ,φ) = R(r)Y_lm', 260, 920, '#0F4780', 26, 7),
        ('[x̂, p̂] = iℏ', 120, 980, '#0F4780', 28, -7),
        ('N(t) = N₀ e^{-λt}', 280, 1030, '#F14343', 26, 8),
        ('c = 299 792 458 m/s', 150, 1090, '#D97706', 24, -5),

        # --- ZONA 4: TODO O LADO DIREITO ABAIXO DE INFORMATIVO (x: 770 a 1200, y: 780 a 1430) ---
        ('H|ψ⟩ = E|ψ⟩', 940, 810, '#F14343', 30, 8),
        ('∂²u/∂t² = v²∇²u', 1110, 870, '#0F4780', 27, -7),
        ('Z = ∑ e^{-β E_i}', 860, 930, '#D97706', 27, 6),
        ('F = -k_B T ln Z', 1060, 990, '#F14343', 26, -9),
        ('S = -k_B ∑ p_i ln p_i', 880, 1050, '#0F4780', 26, 8),
        ('ℏ = 1.054×10⁻³⁴ J·s', 1080, 1110, '#D97706', 23, -5),
        ('a_c = v²/r', 860, 1170, '#F14343', 28, 7),
        ('R_μν - ½R g_μν = κ T_μν', 1080, 1230, '#0F4780', 24, -8),
        ('σ = 5.67×10⁻⁸ W/(m²K⁴)', 860, 1290, '#F14343', 23, -6),
        ('L = Iω', 1080, 1350, '#D97706', 29, -5),
        ('F_B = q(v × B)', 890, 1410, '#F14343', 27, 8),

        # --- ZONA 5: CENTRO ABAIXO DO ÍCONE E À DIREITA DE FERRAMENTAS (x: 440 a 750, y: 1040 a 1430) ---
        ('pV = nRT', 580, 1060, '#0F4780', 29, -6),
        ('v = f · λ', 490, 1130, '#F14343', 28, 8),
        ('∮ E·dl = -dΦ_B/dt', 680, 1190, '#D97706', 25, -7),
        ('E_n = -13.6 eV / n²', 510, 1260, '#0F4780', 27, 8),
        ('τ = r × F', 670, 1320, '#0F4780', 28, -6),
        ('B = μ₀nI', 490, 1380, '#D97706', 27, 6),
        ('ω = 2πf', 670, 1430, '#0F4780', 28, -7),

        # --- ZONA 6: ENTRE RODAPÉ E QR CODE (x: 670 a 920, y: 1480 a 1700) ---
        ('k_B = 1.38×10⁻²³ J/K', 780, 1510, '#0F4780', 22, -8),
        ('Ω_m + Ω_Λ = 1', 800, 1590, '#F14343', 24, 7),
        ('μ₀ = 4π×10⁻⁷ H/m', 780, 1670, '#D97706', 22, -5),
    ]

    # Atoms & orbital ellipses
    atoms = [
        (220, 230, 24, 8, 30, '#0F4780', '#D97706'),
        (1040, 230, 22, 7, -25, '#F14343', '#0F4780'),
        (140, 490, 25, 8, 45, '#D97706', '#0F4780'),
        (220, 870, 26, 9, 35, '#0F4780', '#F14343'),
        (1000, 870, 25, 8, -35, '#F14343', '#D97706'),
        (1040, 1170, 24, 8, 40, '#0F4780', '#D97706'),
        (580, 1200, 26, 9, -20, '#D97706', '#F14343'),
        (780, 1550, 22, 7, 50, '#D97706', '#F14343'),
    ]

    # Floating particles / dots
    dots = [
        (90, 130, 3.5, '#0F4780'),
        (540, 110, 2.5, '#F14343'),
        (780, 140, 3.0, '#D97706'),
        (1150, 120, 3.5, '#0F4780'),
        (100, 300, 2.5, '#D97706'),
        (1140, 300, 3.0, '#F14343'),
        (470, 520, 3.0, '#0F4780'),
        (770, 520, 2.5, '#D97706'),
        (80, 840, 3.5, '#F14343'),
        (380, 840, 2.5, '#0F4780'),
        (800, 840, 3.0, '#D97706'),
        (1180, 840, 3.5, '#0F4780'),
        (80, 1020, 3.0, '#D97706'),
        (400, 1020, 2.5, '#F14343'),
        (800, 1020, 3.0, '#0F4780'),
        (1180, 1020, 3.5, '#F14343'),
        (600, 1100, 3.0, '#0F4780'),
        (740, 1160, 3.5, '#D97706'),
        (600, 1280, 2.5, '#F14343'),
        (740, 1340, 3.0, '#0F4780'),
        (800, 1240, 3.5, '#D97706'),
        (1180, 1240, 3.0, '#F14343'),
        (800, 1380, 3.5, '#0F4780'),
        (1180, 1380, 3.0, '#0F4780'),
        (720, 1490, 2.5, '#0F4780'),
        (840, 1630, 3.0, '#F14343'),
    ]

    svg_parts = [
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1240 1754" width="1240" height="1754" fill="none">',
        '  <g id="equations" font-family="Georgia, serif" font-weight="bold" opacity="0.65">',
    ]

    for eq, x, y, col, sz, rot in items:
        svg_parts.append(f'    <text x="{x}" y="{y}" fill="{col}" font-size="{sz}" transform="rotate({rot} {x} {y})">{eq}</text>')

    svg_parts.append('  </g>')

    # Dots
    svg_parts.append('  <g id="dots" opacity="0.65">')
    for x, y, r, col in dots:
        svg_parts.append(f'    <circle cx="{x}" cy="{y}" r="{r}" fill="{col}" />')
    svg_parts.append('  </g>')

    # Atoms
    svg_parts.append('  <g id="atoms" opacity="0.65">')
    for cx, cy, rx, ry, rot, col1, col2 in atoms:
        svg_parts.append(f'    <ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" stroke="{col1}" stroke-width="1.8" transform="rotate({rot} {cx} {cy})" />')
        svg_parts.append(f'    <ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" stroke="{col2}" stroke-width="1.8" transform="rotate({rot + 60} {cx} {cy})" />')
        svg_parts.append(f'    <circle cx="{cx}" cy="{cy}" r="3.5" fill="{col1}" />')
    svg_parts.append('  </g>')

    svg_parts.append('</svg>')
    return '\n'.join(svg_parts)

if __name__ == '__main__':
    svg_content = generate_svg()
    out_path = os.environ.get('OUTPUT_SVG', './math-bg.svg')
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(svg_content)
    print(f'✅ Arquivo math-bg.svg gerado com sucesso ({len(svg_content)} bytes)!')
