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
import requests
from bs4 import BeautifulSoup

OUTPUT_FILE = "scripts/scrapers/cache/parsed_spaces.json"

SPACES_CURATED = [
    {
        "id": "biblioteca-bifusp",
        "nome": "Biblioteca do Instituto de Física",
        "sigla": "BIFUSP",
        "categoria": "estudo-biblioteca",
        "predio": "Edifício da Biblioteca",
        "andar": "Térreo e 1º Andar",
        "sala": "Recepção Central",
        "capacidade": "180 pessoas",
        "horario": "Segunda a Sexta, das 08h00 às 20h45",
        "descricao": "Acervo bibliográfico e científico de referência internacional em Física e Astronomia. Conta com amplo salão de estudos, cabines individuais silenciosas, salas fechadas para estudo em grupo, empréstimo de notebooks e terminais de pesquisa.",
        "recursos": ["Wi-Fi Eduroam", "Tomadas", "Salas de Grupo", "Cabines Silenciosas", "Empréstimo de Notebooks", "Acessibilidade"],
        "comoAcessar": "Acesso livre a toda a comunidade USP com apresentação do e-Card (carteirinha digital USP). Empréstimos requerem vínculo ativo na USP.",
        "contato": {
            "email": "bib@if.usp.br",
            "telefone": "(11) 3091-6923",
            "ramal": "16923"
        },
        "links": {
            "oficial": "https://portal.if.usp.br/bib",
            "agendamento": "https://portal.if.usp.br/bib/pt-br/node/421"
        },
        "destaque": True,
        "icone": "local_library"
    },
    {
        "id": "auditorio-abrahao-de-moraes",
        "nome": "Auditório Abrahão de Moraes",
        "sigla": "Auditório Principal",
        "categoria": "auditorio",
        "predio": "Edifício Principal (Basílio Jafet)",
        "andar": "Térreo",
        "sala": "Ala Central",
        "capacidade": "240 lugares",
        "horario": "Conforme agenda de colóquios e eventos",
        "descricao": "O principal e maior auditório do Instituto de Física da USP. Palco dos tradicionais Colóquios Gerais do IFUSP, defesas solenes, colações de grau e conferências internacionais. Equipado com cabine de transmissão ao vivo em alta definição, mesa de áudio profissional e climatização.",
        "recursos": ["Projetor Laser HD", "Transmissão ao Vivo", "Mesa de Áudio", "Microfones Sem Fio", "Climatização", "Acessibilidade para Cadeirantes"],
        "comoAcessar": "Acesso livre nos dias de colóquios e palestras abertas. Para reserva de eventos departamentais, solicitar com antecedência pelo sistema Agenda IF.",
        "contato": {
            "email": "eventos@if.usp.br",
            "telefone": "(11) 3091-6900",
            "ramal": "16900"
        },
        "links": {
            "oficial": "https://portal.if.usp.br/ifusp/pt-br/infraestrutura/auditorios",
            "agendamento": "https://agenda.if.usp.br/Web/view-schedule.php"
        },
        "destaque": True,
        "icone": "theater_comedy"
    },
    {
        "id": "auditorio-adma-jafet",
        "nome": "Auditório Adma Jafet",
        "sigla": "Adma Jafet",
        "categoria": "auditorio",
        "predio": "Edifício Principal (Basílio Jafet)",
        "andar": "Térreo",
        "sala": "Ala Sul",
        "capacidade": "80 lugares",
        "horario": "Segunda a Sexta, conforme agendamento",
        "descricao": "Auditório para seminários avançados de pesquisa, workshops departamentais e defesas de teses de mestrado e doutorado. Conta com tela ampla de projeção e sistema de videoconferência híbrida.",
        "recursos": ["Videoconferência", "Projetor", "Ar-condicionado", "Quadro Branco", "Acessibilidade"],
        "comoAcessar": "Reserva prévia realizada por docentes, secretarias departamentais ou comissões de pós-graduação via Agenda IF.",
        "contato": {
            "email": "eventos@if.usp.br",
            "ramal": "16900"
        },
        "links": {
            "oficial": "https://portal.if.usp.br/ifusp/pt-br/infraestrutura/auditorios",
            "agendamento": "https://agenda.if.usp.br/Web/view-schedule.php"
        },
        "destaque": False,
        "icone": "co_present"
    },
    {
        "id": "auditorio-gleb-wataghin",
        "nome": "Auditório Gleb Wataghin",
        "sigla": "Sala 2011",
        "categoria": "auditorio",
        "predio": "Edifício Principal",
        "andar": "1º Andar",
        "sala": "Sala 2011",
        "capacidade": "60 lugares",
        "horario": "Segunda a Sexta, conforme agendamento",
        "descricao": "Auditório histórico que homenageia o físico ítalo-ucraniano fundador do IFUSP. Utilizado para reuniões da Congregação, bancas de concursos acadêmicos e seminários de física nuclear e teórica.",
        "recursos": ["Projetor", "Sistema Híbrido", "Ar-condicionado", "Mesa de Reunião"],
        "comoAcessar": "Agendamento pelo sistema Agenda IF.",
        "contato": {
            "email": "eventos@if.usp.br"
        },
        "links": {
            "agendamento": "https://agenda.if.usp.br/Web/view-schedule.php"
        },
        "destaque": False,
        "icone": "meeting_room"
    },
    {
        "id": "auditorio-marcello-damy",
        "nome": "Auditório Marcello Damy",
        "sigla": "Sala 2032",
        "categoria": "auditorio",
        "predio": "Edifício dos Aceleradores (Pelletron)",
        "andar": "Térreo",
        "sala": "Sala 2032",
        "capacidade": "70 lugares",
        "horario": "Segunda a Sexta, das 08h às 18h",
        "descricao": "Espaço acadêmico localizado no complexo do acelerador Pelletron, dedicado a apresentações científicas de física experimental, colóquios departamentais e cursos de instrumentação nuclear.",
        "recursos": ["Projetor", "Ar-condicionado", "Quadro Branco", "Wi-Fi Eduroam"],
        "comoAcessar": "Reserva pelo sistema Agenda IF ou contato com a coordenação do LAFN.",
        "contato": {
            "email": "damy@if.usp.br"
        },
        "links": {
            "agendamento": "https://agenda.if.usp.br/Web/view-schedule.php"
        },
        "destaque": False,
        "icone": "science"
    },
    {
        "id": "auditorio-cesar-lattes",
        "nome": "Auditório César Lattes",
        "sigla": "Sala 2027",
        "categoria": "auditorio",
        "predio": "Edifício Principal",
        "andar": "1º Andar",
        "sala": "Sala 2027",
        "capacidade": "50 lugares",
        "horario": "Segunda a Sexta, das 08h às 18h",
        "descricao": "Auditório intimista para apresentações científicas, seminários do DFMA e reuniões de grupos de pesquisa.",
        "recursos": ["Projetor", "Quadro Negro Amplo", "Ar-condicionado"],
        "comoAcessar": "Agendamento pelo sistema Agenda IF.",
        "contato": {
            "email": "eventos@if.usp.br"
        },
        "links": {
            "agendamento": "https://agenda.if.usp.br/Web/view-schedule.php"
        },
        "destaque": False,
        "icone": "school"
    },
    {
        "id": "hackerspace-ifusp",
        "nome": "Hackerspace IFUSP",
        "sigla": "Hackerspace",
        "categoria": "maker-convivencia",
        "predio": "Edifício Principal (Subsolo das Oficinas)",
        "andar": "Subsolo",
        "sala": "Oficina Aberta",
        "capacidade": "30 pessoas",
        "horario": "Segunda a Sexta, das 10h às 20h",
        "descricao": "Espaço comunitário de fabricação digital, eletrônica aberta, prototipagem e computação criativa mantido por estudantes e apoiado pelo IFUSP. Conta com impressoras 3D FDM, estação de solda, componentes eletrônicos, corte a laser, computadores livres e ferramentas manuais.",
        "recursos": ["Impressoras 3D", "Estação de Solda", "Arduino & Raspberry Pi", "Ferramental Maker", "Wi-Fi Livre", "Bancadas de Prototipagem"],
        "comoAcessar": "Entrada livre e gratuita para toda a comunidade. Oficinas e cursos abertos periodicamente sem pré-requisitos.",
        "contato": {
            "email": "hackerspace@if.usp.br"
        },
        "links": {
            "oficial": "https://hackerspaceifusp.com.br",
            "agendamento": "https://hackerspaceifusp.com.br/agenda"
        },
        "destaque": True,
        "icone": "construction"
    },
    {
        "id": "cefisma-amelia-imperio",
        "nome": "Centro Acadêmico Amélia Império Hamburger",
        "sigla": "CEFISMA",
        "categoria": "maker-convivencia",
        "predio": "Vão Livre da Física",
        "andar": "Térreo",
        "sala": "Sede do CEFISMA",
        "capacidade": "50 pessoas",
        "horario": "Segunda a Sexta, das 08h às 22h",
        "descricao": "Ponto de encontro e representação dos estudantes da Física USP. Espaço de integração com sofás, mesas para refeição rápida e jogos, micro-ondas, cafeteria comunitária, mesa de sinuca e acervo de livros didáticos doados para consulta livre.",
        "recursos": ["Micro-ondas", "Cafeteira", "Mesa de Sinuca", "Espaço de Descanso", "Biblioteca Comunitária", "Mural de Recados"],
        "comoAcessar": "Livre acesso para todos os estudantes do IFUSP e visitantes do campus.",
        "contato": {
            "email": "cefisma@if.usp.br"
        },
        "links": {
            "oficial": "https://cefisma.com.br"
        },
        "destaque": True,
        "icone": "groups"
    },
    {
        "id": "aquario-estudantes",
        "nome": "Aquário dos Estudantes (Salão de Estudos)",
        "sigla": "Aquário",
        "categoria": "estudo-biblioteca",
        "predio": "Edifício Principal",
        "andar": "Térreo",
        "sala": "Salão de Vidro",
        "capacidade": "70 pessoas",
        "horario": "Segunda a Sexta, das 07h às 22h",
        "descricao": "Tradicional salão de estudos da graduação envidraçado no térreo do Edifício Principal. Equipado com mesas compridas para estudo em grupo, tomadas para carregamento de notebooks e quadros brancos para resolução de listas de exercícios e monitorias.",
        "recursos": ["Mesas Coletivas", "Tomadas em Todas as Mesas", "Quadros Brancos", "Wi-Fi Eduroam", "Ambiente Climatizado"],
        "comoAcessar": "Acesso livre aos estudantes da graduação e pós-graduação.",
        "links": {
            "oficial": "https://portal.if.usp.br"
        },
        "destaque": False,
        "icone": "menu_book"
    },
    {
        "id": "profis-licenciatura",
        "nome": "Espaço Pró-Física (PROFIS)",
        "sigla": "PROFIS",
        "categoria": "maker-convivencia",
        "predio": "Edifício da Física Experimental (FEP)",
        "andar": "Térreo",
        "sala": "PROFIS",
        "capacidade": "25 pessoas",
        "horario": "Segunda a Sexta, das 09h às 19h",
        "descricao": "Espaço acolhedor dedicado especialmente aos alunos da Licenciatura em Física. Oferece apoio pedagógico, ambiente para planejamento de aulas experimentais, acervo de kits didáticos de física para ensino fundamental e médio, além de computadores para preparação de materiais.",
        "recursos": ["Kits Didáticos de Ensino", "Computadores", "Material Pedagógico", "Plantão de Apoio", "Impressora"],
        "comoAcessar": "Aberto prioritariamente aos licenciandos em física e bolsistas de projetos escolares.",
        "contato": {
            "email": "profis@if.usp.br"
        },
        "links": {
            "oficial": "https://fep.if.usp.br/~profis/"
        },
        "destaque": False,
        "icone": "school"
    },
    {
        "id": "labdiv-estudio",
        "nome": "Laboratório de Comunicação e Divulgação Científica",
        "sigla": "LabDiv",
        "categoria": "maker-convivencia",
        "predio": "Edifício Novo Milênio",
        "andar": "Piso Superior",
        "sala": "Sala LabDiv",
        "capacidade": "20 pessoas",
        "horario": "Segunda a Sexta, das 10h às 18h",
        "descricao": "Núcleo de expressão e inovação do IFUSP inspirado no modelo MIT Communication Lab. Conta com bancadas para oficinas de escrita científica, tutoria entre pares, estúdio de gravação de podcasts e vídeos de divulgação científica, e suporte de design para projetos acadêmicos.",
        "recursos": ["Estúdio de Podcast & Áudio", "Iluminação de Gravação", "Mesas de Tutoria", "Monitores e Workstations", "Design & Redação"],
        "comoAcessar": "Aberto para mentorias e oficinas mediante agendamento direto pelo HUB LabDiv.",
        "contato": {
            "email": "labdiv@usp.br"
        },
        "links": {
            "oficial": "https://hub.labdiv.if.usp.br/iniciativas/labdiv",
            "agendamento": "/iniciativas/labdiv#mentorias"
        },
        "destaque": True,
        "icone": "mic"
    },
    {
        "id": "oficina-mecanica-precisao",
        "nome": "Oficina Mecânica de Precisão",
        "sigla": "OMP",
        "categoria": "oficina-tecnica",
        "predio": "Edifício das Oficinas Técnicas",
        "andar": "Térreo",
        "capacidade": "Equipe técnica especializada",
        "horario": "Segunda a Sexta, das 08h às 17h",
        "descricao": "Infraestrutura de suporte de alta tecnologia do IFUSP responsável pela usinagem de peças mecânicas de precisão em metais e polímeros para montagem de experimentos de ponta em física da matéria condensada, nuclear e óptica. Possui tornos mecânicos, fresadoras CNC e solda de alta pureza.",
        "recursos": ["Tornos Mecânicos", "Fresadoras CNC", "Solda TIG & Argônio", "Usinagem de Precisão", "Consultoria de Projetos Mecânicos"],
        "comoAcessar": "Solicitação via ordem de serviço (OS) submetida por docentes e pesquisadores via sistema de serviços do IFUSP.",
        "contato": {
            "email": "oficina@if.usp.br",
            "ramal": "16940"
        },
        "links": {
            "oficial": "https://portal.if.usp.br/ifusp/node/24"
        },
        "destaque": False,
        "icone": "handyman"
    },
    {
        "id": "oficina-vidraria-cientifica",
        "nome": "Oficina de Vidraria Científica",
        "sigla": "Vidraria",
        "categoria": "oficina-tecnica",
        "predio": "Edifício das Oficinas Técnicas",
        "andar": "Térreo",
        "horario": "Segunda a Sexta, das 08h às 17h",
        "descricao": "Oficina especializada em sopro e moldagem de vidro borossilicato e quartzo óptico para linhas de vácuo, ampolas de deposição, celas de espectroscopia e peças personalizadas para laboratórios de pesquisa.",
        "recursos": ["Sopro de Quartzo e Pirex", "Selagem a Vácuo", "Reparo de Vidraria Experimental"],
        "comoAcessar": "Atendimento sob demanda experimental com desenho técnico aprovado pelo laboratório solicitante.",
        "contato": {
            "email": "vidraria@if.usp.br"
        },
        "links": {
            "oficial": "https://portal.if.usp.br/ifusp/node/24"
        },
        "destaque": False,
        "icone": "science"
    },
    {
        "id": "acelerador-pelletron",
        "nome": "Laboratório Aberto de Física Nuclear (LAFN) & Pelletron",
        "sigla": "Pelletron / LAFN",
        "categoria": "laboratorio-pesquisa",
        "predio": "Edifício dos Aceleradores (Torre Pelletron)",
        "andar": "Subsolo e Torre",
        "horario": "Operação contínua sob escala experimental",
        "descricao": "Infraestrutura multiusuária pioneira que abriga o Acelerador Eletrostático Tandem Pelletron de 8MV e linhas de feixe voltadas à pesquisa em física nuclear fundamental, análise de materiais por feixes de íons (IBA), astrofísica nuclear e física biológica.",
        "recursos": ["Acelerador Tandem 8MV", "Linhas de Feixe Multiusuárias", "Espectrômetros Nucleares", "Análise IBA"],
        "comoAcessar": "Submissão de propostas de tempo de feixe ao comitê de usuários do LAFN.",
        "contato": {
            "email": "lafn@if.usp.br"
        },
        "links": {
            "oficial": "https://portal.if.usp.br/fnc/"
        },
        "destaque": True,
        "icone": "cyclone"
    },
    {
        "id": "restaurante-universitario-if",
        "nome": "Lanchonete da Física & Alimentação",
        "sigla": "Lanchonete",
        "categoria": "servico-alimentacao",
        "predio": "Vão Livre da Física",
        "andar": "Térreo",
        "horario": "Segunda a Sexta, das 07h30 às 20h30",
        "descricao": "Espaço de convivência tradicional e alimentação rápida da comunidade do IFUSP. Ponto de encontro para café da manhã, lanches, salgados e almoço rápido, com mesas ao ar livre no vão livre do instituto.",
        "recursos": ["Cafeteria", "Lanches Naturais e Quentes", "Mesas ao Ar Livre", "Pagamento por Cartão/PIX"],
        "comoAcessar": "Aberto ao público em geral, discentes, docentes e funcionários.",
        "links": {
            "oficial": "https://portal.if.usp.br"
        },
        "destaque": False,
        "icone": "coffee"
    }
]

def main():
    print("=" * 60)
    print("MÓDULO D: RASPAGEM E CONSOLIDAÇÃO DE ESPAÇOS FÍSICOS DO IFUSP")
    print("=" * 60)

    # Cria diretório de cache
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(SPACES_CURATED, f, ensure_ascii=False, indent=2)

    print(f"[SUCESSO] {len(SPACES_CURATED)} espaços físicos consolidados em: {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
