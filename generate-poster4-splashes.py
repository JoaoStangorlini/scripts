#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Hub de Comunicação Científica Lab-Div V3.0
Copyright (C) 2026 João Paulo Stangorlini de Carvalho

Este programa é um software livre: você pode redistribuí-lo e/ou modificá-lo
sob os termos da Licença Pública Geral Affero GNU (AGPLv3) conforme
publicada pela Free Software Foundation.
"""

import math
import random
import os

random.seed(777)

def generate_splashes():
    # Center of logo explosion: (620, 840)
    cx, cy = 620, 840
    elements = []
    
    # 1. Central burst puddle behind the logo
    elements.append(f'''
    <!-- Puddle blend center -->
    <g opacity="0.95">
      <!-- Blue burst lobe -->
      <path d="M {cx} {cy} C {cx-80} {cy-100} {cx-180} {cy-60} {cx-190} {cy-10} C {cx-200} {cy+60} {cx-100} {cy+90} {cx} {cy} Z" fill="#0F4780" opacity="0.3" />
      <!-- Red burst lobe -->
      <path d="M {cx} {cy} C {cx+80} {cy-100} {cx+180} {cy-60} {cx+190} {cy-10} C {cx+200} {cy+60} {cx+100} {cy+90} {cx} {cy} Z" fill="#F14343" opacity="0.3" />
      <!-- Yellow burst lobe -->
      <path d="M {cx} {cy} C {cx-70} {cy+90} {cx-120} {cy+180} {cx-40} {cy+220} C {cx+60} {cy+220} {cx+80} {cy+120} {cx} {cy} Z" fill="#FFCC00" opacity="0.35" />
    </g>
    ''')
    
    def create_tendril(start_pt, end_pt, w1, w2, color, seed_val, num_dots=32):
        r = random.Random(seed_val)
        sx, sy = start_pt
        ex, ey = end_pt
        dx = ex - sx
        dy = ey - sy
        dist = math.hypot(dx, dy)
        angle = math.atan2(dy, dx)
        perp = angle + math.pi / 2
        
        # Curved control points for organic fluid wave
        c1x = sx + dx * 0.30 + math.cos(perp) * r.uniform(-50, 50)
        c1y = sy + dy * 0.30 + math.sin(perp) * r.uniform(-50, 50)
        c2x = sx + dx * 0.70 + math.cos(perp) * r.uniform(-40, 40)
        c2y = sy + dy * 0.70 + math.sin(perp) * r.uniform(-40, 40)
        
        lx1 = sx - math.cos(perp) * w1
        ly1 = sy - math.sin(perp) * w1
        rx1 = sx + math.cos(perp) * w1
        ry1 = sy + math.sin(perp) * w1
        
        lx2 = ex - math.cos(perp) * w2
        ly2 = ey - math.sin(perp) * w2
        rx2 = ex + math.cos(perp) * w2
        ry2 = ey + math.sin(perp) * w2
        
        path_str = f"M {lx1:.1f} {ly1:.1f} " \
                   f"C {c1x-math.cos(perp)*w1:.1f} {c1y-math.sin(perp)*w1:.1f} {c2x-math.cos(perp)*w2:.1f} {c2y-math.sin(perp)*w2:.1f} {lx2:.1f} {ly2:.1f} " \
                   f"A {w2:.1f} {w2:.1f} 0 0 1 {rx2:.1f} {ry2:.1f} " \
                   f"C {c2x+math.cos(perp)*w2:.1f} {c2y+math.sin(perp)*w2:.1f} {c1x+math.cos(perp)*w1:.1f} {c1y+math.sin(perp)*w1:.1f} {rx1:.1f} {ry1:.1f} Z"
        
        items = [f'<path d="{path_str}" fill="{color}" />']
        
        # Fluid droplet spikes at the end of the splash
        for _ in range(5):
            sp_angle = angle + r.uniform(-0.7, 0.7)
            sp_len = r.uniform(40, 110)
            sp_w = r.uniform(8, 22)
            tip_x = ex + math.cos(sp_angle) * sp_len
            tip_y = ey + math.sin(sp_angle) * sp_len
            sp_path = f"M {ex-math.cos(sp_angle+math.pi/2)*sp_w:.1f} {ey-math.sin(sp_angle+math.pi/2)*sp_w:.1f} " \
                      f"Q {ex+math.cos(sp_angle)*sp_len*0.6:.1f} {ey+math.sin(sp_angle)*sp_len*0.6:.1f} {tip_x:.1f} {tip_y:.1f} " \
                      f"Q {ex+math.cos(sp_angle)*sp_len*0.6:.1f} {ey+math.sin(sp_angle)*sp_len*0.6:.1f} {ex+math.cos(sp_angle+math.pi/2)*sp_w:.1f} {ey+math.sin(sp_angle+math.pi/2)*sp_w:.1f} Z"
            items.append(f'<path d="{sp_path}" fill="{color}" />')
            
        # Surrounding splattered paint droplets
        for _ in range(num_dots):
            t = r.uniform(0.15, 1.40)
            base_x = sx + dx * t
            base_y = sy + dy * t
            scatter = r.gauss(0, 35 + t * 45)
            dx_pt = base_x + math.cos(perp) * scatter
            dy_pt = base_y + math.sin(perp) * scatter
            radius = r.uniform(3.0, 16.0 if t > 0.8 else 9.0)
            opacity = r.uniform(0.80, 1.0)
            items.append(f'<circle cx="{dx_pt:.1f}" cy="{dy_pt:.1f}" r="{radius:.1f}" fill="{color}" opacity="{opacity:.2f}" />')
            
        return '\n'.join(items)

    # 1. BLUE SPLASH (TOP-LEFT TO SOCIAL) -> Target: (240, 640)
    elements.append(create_tendril((550, 810), (240, 640), 40, 80, '#0F4780', 101, 35))
    elements.append(create_tendril((570, 780), (330, 550), 22, 50, '#0284C7', 102, 22))
    elements.append(create_tendril((530, 840), (160, 710), 18, 42, '#0F4780', 103, 18))
    
    # 2. RED SPLASH (TOP-RIGHT TO INFORMATIVO) -> Target: (1000, 640)
    elements.append(create_tendril((690, 810), (1000, 640), 40, 80, '#F14343', 201, 35))
    elements.append(create_tendril((670, 780), (910, 550), 22, 50, '#DC2626', 202, 22))
    elements.append(create_tendril((710, 840), (1080, 710), 18, 42, '#F14343', 203, 18))
    
    # 3. YELLOW/GOLD SPLASH (BOTTOM-LEFT TO FERRAMENTAS) -> Target: (280, 1220)
    elements.append(create_tendril((580, 890), (280, 1220), 42, 85, '#FFCC00', 301, 38))
    elements.append(create_tendril((620, 920), (380, 1310), 24, 55, '#D97706', 302, 24))
    elements.append(create_tendril((550, 870), (180, 1150), 20, 46, '#FFCC00', 303, 20))
    
    return '\n'.join(elements)

splashes_svg = generate_splashes()
print("Generated splashes SVG successfully, length:", len(splashes_svg))

# Save to a temporary file for inspection or inclusion
with open('public/divulgacao/poster4/.splashes_tmp.svg', 'w', encoding='utf-8') as f:
    f.write(splashes_svg)
