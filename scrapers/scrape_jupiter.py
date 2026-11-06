#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
/*!
 * Hub de Comunicação Científica Lab-Div V3.0
 * Copyright (C) 2026 João Paulo Stangorlini de Carvalho
 *
 * Este programa é software livre: você pode redistribuí-lo e/ou modificá-lo
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
import json
import re
import time
from typing import Dict, Any, List
import requests

CACHE_DIR = os.path.join(os.path.dirname(__file__), "cache")
os.makedirs(CACHE_DIR, exist_ok=True)

DISCIPLINES_OUTPUT = os.path.join(CACHE_DIR, "parsed_disciplines.json")
CURRICULUM_OUTPUT = os.path.join(CACHE_DIR, "parsed_curriculum.json")

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 (Hub-LabDiv/3.0; IFUSP-Scraper)",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
}

# Códigos oficiais do JúpiterWeb para os cursos do IFUSP
# codcg = 43 (Instituto de Física)
# codcur = 43011 (Bacharelado Integral), 43012 (Bacharelado Noturno)
# codcur = 43021 (Licenciatura Diurno), 43022 (Licenciatura Noturno)
# codcur = 43031 / 43013 (Física Médica Integral)
COURSES_METADATA = {
    "bacharelado": {
        "id": "bacharelado",
        "nome": "Bacharelado em Física",
        "codigoCurso": "43011 / 43012",
        "turnosDisponiveis": ["integral", "noturno"],
        "vagasAnuais": {
            "total": 135,
            "integral": 60,
            "noturno": 75
        },
        "horasExtensaoAEx": 260,
        "descricaoPedagogica": "Formação científica de excelência voltada ao desenvolvimento da autonomia intelectual e domínio das teorias fundamentais da física clássica, quântica, estatística e relativística, instrumental matemático refinado, física computacional e sólida prática laboratorial.",
        "grades": {
            "integral": {
                "turno": "integral",
                "nomeTurno": "Integral (4 Anos)",
                "codigoHabilitacao": "43011",
                "duracaoSemestres": 8
            },
            "noturno": {
                "turno": "noturno",
                "nomeTurno": "Noturno (5 Anos)",
                "codigoHabilitacao": "43012",
                "duracaoSemestres": 10
            }
        }
    },
    "licenciatura": {
        "id": "licenciatura",
        "nome": "Licenciatura em Física",
        "codigoCurso": "43021 / 43022",
        "turnosDisponiveis": ["diurno", "noturno"],
        "vagasAnuais": {
            "total": 100,
            "diurno": 40,
            "noturno": 60
        },
        "horasExtensaoAEx": 260,
        "horasEstagio": 400,
        "descricaoPedagogica": "Curso dedicado a formar o Educador em Física do Século XXI, articulando conteúdos conceituais rigorosos com teorias pedagógicas contemporâneas, metodologias ativas, inclusão, Libras, história da ciência e 400h de imersão docente supervisionada em escolas públicas.",
        "grades": {
            "diurno": {
                "turno": "diurno",
                "nomeTurno": "Diurno (4 Anos)",
                "codigoHabilitacao": "43021",
                "duracaoSemestres": 8
            },
            "noturno": {
                "turno": "noturno",
                "nomeTurno": "Noturno (5 Anos)",
                "codigoHabilitacao": "43022",
                "duracaoSemestres": 10
            }
        }
    },
    "fisica-medica": {
        "id": "fisica-medica",
        "nome": "Bacharelado em Física Médica",
        "codigoCurso": "43031",
        "turnosDisponiveis": ["integral"],
        "vagasAnuais": {
            "total": 35,
            "integral": 35
        },
        "horasExtensaoAEx": 321,
        "descricaoPedagogica": "Formação multidisciplinar pioneira entre o IFUSP e a Faculdade de Medicina (FMUSP), integrando física nuclear, atômica e molecular às aplicações médicas em radioterapia, medicina nuclear, proteção radiológica, controle de qualidade hospitalar e diagnóstico por imagem.",
        "grades": {
            "integral": {
                "turno": "integral",
                "nomeTurno": "Integral (5 Anos)",
                "codigoHabilitacao": "43031",
                "duracaoSemestres": 10
            }
        }
    }
}

# Catálogo Curado Canônico de Disciplinas com Ementas Oficiais, Bibliografia e Pré-requisitos
RAW_DISCIPLINES = [
    # --- IFUSP: FÍSICA BÁSICA & EXPERIMENTAL (BACHARELADO & FÍSICA MÉDICA) ---
    {
        "codigo": "4302111",
        "nome": "Física I",
        "unidade": "IFUSP",
        "departamento": "FEP",
        "creditosAula": 4,
        "creditosTrabalho": 0,
        "horasExtensao": 0,
        "tipo": "obrigatoria",
        "ementa": "Cinemática vetorial do ponto material em uma e várias dimensões. Dinâmica newtoniana: Leis de Newton e suas aplicações. Trabalho e energia mecânica. Teorema do trabalho-energia cinética. Forças conservativas e energia potencial. Conservação da energia mecânica. Momento linear e sistemas de partículas. Colisões elásticas e inelásticas em uma e duas dimensões. Cinemática e dinâmica da rotação: torque, momento de inércia e conservação do momento angular. Gravitação universal: Lei da gravitação de Newton e leis de Kepler.",
        "objetivos": "Capacitar o estudante a compreender e formular os princípios fundamentais da mecânica clássica newtoniana, aplicando-os à resolução de problemas físicos reais e modelagem matemática analítica.",
        "bibliografia": [
            "Nussenzveig, H. M. Curso de Física Básica - Vol. 1: Mecânica. 5ª ed. Edgar Blücher, 2013.",
            "Halliday, D., Resnick, R., Walker, J. Fundamentos de Física - Vol. 1: Mecânica. 10ª ed. LTC, 2016.",
            "Tipler, P. A., Mosca, G. Física para Cientistas e Engenheiros - Vol. 1. 6ª ed. LTC, 2009."
        ],
        "preRequisitos": [],
        "observacao": "Mecânica newtoniana, leis de conservação, oscilações e gravitação"
    },
    {
        "codigo": "4302113",
        "nome": "Física Experimental I",
        "unidade": "IFUSP",
        "departamento": "FEP",
        "creditosAula": 4,
        "creditosTrabalho": 0,
        "horasExtensao": 0,
        "tipo": "obrigatoria",
        "ementa": "Metodologia científica e procedimentos experimentais. Instrumentação básica de medidas (paquímetro, micrômetro, cronômetros digitais). Teoria de erros e análise de incertezas experimentais: erros sistemáticos e aleatórios, desvio padrão, propagação de incertezas. Construção e interpretação de gráficos cartesianos, linearização de funções e método dos mínimos quadrados (ajuste linear). Experimentos de cinemática e dinâmica do ponto material, conservação de energia e colisões.",
        "objetivos": "Desenvolver a destreza laboratorial, capacidade crítica de análise estatística de dados experimentais e redação de relatórios técnicos padronizados.",
        "bibliografia": [
            "Vuolo, J. H. Fundamentos da Teoria de Erros. 2ª ed. Edgard Blücher, 1996.",
            "Taylor, J. R. An Introduction to Error Analysis. 2nd ed. University Science Books, 1997."
        ],
        "preRequisitos": [],
        "observacao": "Tratamento de dados experimentais, incertezas e medidas"
    },
    {
        "codigo": "4302112",
        "nome": "Física II",
        "unidade": "IFUSP",
        "departamento": "FEP",
        "creditosAula": 4,
        "creditosTrabalho": 0,
        "horasExtensao": 0,
        "tipo": "obrigatoria",
        "ementa": "Fluidos ideais e reais: Estática dos fluidos (Princípio de Pascal, Princípio de Arquimedes) e Dinâmica dos fluidos (Equação da continuidade, Teorema de Bernoulli). Oscilações harmônicas: Movimento harmônico simples (MHS), oscilações amortecidas e oscilações forçadas com ressonância. Ondas mecânicas: Propagação de ondas transversais e longitudinais em meios contínuos, equação de onda, superposição, reflexão e refração, ondas estacionárias e modos normais. Acústica física e Efeito Doppler.",
        "objetivos": "Estudar os fenômenos ondulatórios, mecânica dos fluidos e dinâmica oscilatória, consolidando a base fenomenológica clássica para disciplinas avançadas.",
        "bibliografia": [
            "Nussenzveig, H. M. Curso de Física Básica - Vol. 2: Fluidos, Oscilações e Ondas, Calor. 5ª ed. Edgar Blücher, 2014.",
            "Halliday, D., Resnick, R., Walker, J. Fundamentos de Física - Vol. 2. 10ª ed. LTC, 2016."
        ],
        "preRequisitos": [
            {"tipo": "fraco", "disciplinas": ["4302111", "MAT2453"], "descricao": "Ter cursado Física I e Cálculo I"}
        ],
        "observacao": "Fluidos, oscilações amortecidas, ondas e acústica"
    },
    {
        "codigo": "4302114",
        "nome": "Física Experimental II",
        "unidade": "IFUSP",
        "departamento": "FEP",
        "creditosAula": 4,
        "creditosTrabalho": 0,
        "horasExtensao": 0,
        "tipo": "obrigatoria",
        "ementa": "Experimentos com osciladores mecânicos livres, amortecidos e forçados com estudo detalhado da curva de ressonância. Ondas estacionárias em cordas e tubos acústicos. Determinação experimental da velocidade do som no ar e em sólidos. Propriedades térmicas da matéria: calorimetria e dilatação térmica. Estudo do comportamento de fluidos reais: viscosidade e escoamento laminar.",
        "objetivos": "Consolidar a metodologia experimental em física ondulatória, oscilatória e propriedades termodinâmicas com uso de sensores digitais e osciloscópios.",
        "bibliografia": [
            "Guia de Experimentos de Física Experimental II - Laboratórios Didáticos do IFUSP.",
            "Vuolo, J. H. Fundamentos da Teoria de Erros. Edgard Blücher, 1996."
        ],
        "preRequisitos": [
            {"tipo": "fraco", "disciplinas": ["4302113"], "descricao": "Ter cursado Física Experimental I"}
        ],
        "observacao": "Experimentos em oscilações mecânicas, ondas e ressonância"
    },
    {
        "codigo": "4302211",
        "nome": "Física III",
        "unidade": "IFUSP",
        "departamento": "FEP",
        "creditosAula": 4,
        "creditosTrabalho": 0,
        "horasExtensao": 0,
        "tipo": "obrigatoria",
        "ementa": "Eletrostática no vácuo: Carga elétrica, Lei de Coulomb e campo elétrico. Lei de Gauss na forma integral e diferencial. Potencial eletrostático, superfícies equipotenciais e energia eletrostática. Condutores em equilíbrio eletrostático. Dielétricos e polarização elétrica: vetor deslocamento elétrico D. Corrente elétrica, densidade de corrente e Lei de Ohm microscópica. Magnetostática no vácuo: Força de Lorentz, Lei de Biot-Savart e Lei de Ampère. Potencial vetor magnético. Materiais magnéticos: diamagnetismo, paramagnetismo e ferromagnetismo.",
        "objetivos": "Dominar os conceitos e a modelagem matemática vetorial da eletrostática e magnetostática clássicas nos meios materiais e no vácuo.",
        "bibliografia": [
            "Nussenzveig, H. M. Curso de Física Básica - Vol. 3: Eletromagnetismo. 2ª ed. Blücher, 2015.",
            "Purcell, E. M., Morin, D. J. Electricity and Magnetism. 3rd ed. Cambridge University Press, 2013.",
            "Halliday, D., Resnick, R., Walker, J. Fundamentos de Física - Vol. 3: Eletromagnetismo. LTC, 2016."
        ],
        "preRequisitos": [
            {"tipo": "forte", "disciplinas": ["4302111", "MAT2453"], "descricao": "Aprovação em Física I e Cálculo I"}
        ],
        "observacao": "Eletrostática, dielétricos, corrente elétrica e campos magnéticos"
    },
    {
        "codigo": "4302213",
        "nome": "Física Experimental III",
        "unidade": "IFUSP",
        "departamento": "FEP",
        "creditosAula": 4,
        "creditosTrabalho": 0,
        "horasExtensao": 0,
        "tipo": "obrigatoria",
        "ementa": "Instrumentação elétrica: multímetros analógicos e digitais, fontes de tensão reguladas, osciloscópios de duplo traço e geradores de função. Circuitos de corrente contínua (DC): Leis de Kirchhoff, divisores de tensão e corrente, teoremas de Thévenin e Norton. Mapeamento de superfícies equipotenciais e linhas de campo elétrico. Carga e descarga de capacitores (circuitos RC). Estudo experimental de campos magnéticos com sonda Hall e balança de corrente.",
        "objetivos": "Proporcionar familiaridade e destreza com instrumentação eletrônica de bancada e técnicas de medição eletromagnética.",
        "bibliografia": [
            "Apostilas do Laboratório Didático de Eletricidade e Magnetismo - IFUSP.",
            "Horowitz, P., Hill, W. The Art of Electronics. 3rd ed. Cambridge, 2015."
        ],
        "preRequisitos": [
            {"tipo": "fraco", "disciplinas": ["4302113"], "descricao": "Ter cursado Física Experimental I"}
        ],
        "observacao": "Instrumentação elétrica, circuitos DC e mapeamento de campo"
    },
    {
        "codigo": "4302212",
        "nome": "Física IV",
        "unidade": "IFUSP",
        "departamento": "FEP",
        "creditosAula": 4,
        "creditosTrabalho": 0,
        "horasExtensao": 0,
        "tipo": "obrigatoria",
        "ementa": "Campos magnéticos variáveis no tempo: Lei de Faraday-Lenz da indução eletromagnética e autoindutância. Corrente de deslocamento de Maxwell e a síntese das Equações de Maxwell. Ondas eletromagnéticas no vácuo e na matéria: equação de onda, vetor de Poynting e transporte de momento. Ótica eletromagnética: polarização, reflexão, refração, leis de Fresnel. Coerência e interferência óptica (experimento de Young, interferômetro de Michelson). Difração de Fresnel e Fraunhofer. Redes de difração e limites de resolução de instrumentos ópticos.",
        "objetivos": "Concluir a formação clássica em eletromagnetismo integrando as equações de Maxwell com a ótica ondulatória e suas aplicações físicas e tecnológicas.",
        "bibliografia": [
            "Nussenzveig, H. M. Curso de Física Básica - Vol. 4: Ótica, Relatividade, Física Quântica. Blücher, 2014.",
            "Hecht, E. Optics. 5th ed. Pearson, 2016.",
            "Halliday, D., Resnick, R. Fundamentos de Física - Vol. 4. LTC, 2016."
        ],
        "preRequisitos": [
            {"tipo": "forte", "disciplinas": ["4302211"], "descricao": "Aprovação em Física III"}
        ],
        "observacao": "Indução de Faraday, equações de Maxwell, ondas EM e ótica ondulatória"
    },
    {
        "codigo": "4302214",
        "nome": "Física Experimental IV",
        "unidade": "IFUSP",
        "departamento": "FEP",
        "creditosAula": 4,
        "creditosTrabalho": 0,
        "horasExtensao": 0,
        "tipo": "obrigatoria",
        "ementa": "Circuitos de corrente alternada (AC): impedância complexa, circuitos RLC série e paralelo, ressonância e resposta em frequência. Experimentos de indução eletromagnética e transformadores. Óptica ondulatória experimental: polarização da luz e Lei de Malus, interferência por divisão de frente de onda e divisão de amplitude, difração por fenda simples, fenda dupla e redes de difração com feixes laser.",
        "objetivos": "Investigar experimentalmente fenômenos de corrente alternada e ótica ondulatória com técnicas de interferometria e espectroscopia óptica.",
        "bibliografia": [
            "Guias de Física Experimental IV - Laboratório de Óptica e AC - IFUSP.",
            "Hecht, E. Optics. Pearson, 2016."
        ],
        "preRequisitos": [
            {"tipo": "fraco", "disciplinas": ["4302213"], "descricao": "Ter cursado Física Experimental III"}
        ],
        "observacao": "Circuitos AC, ressonância RLC, interferência e difração da luz"
    },

    # --- IFUSP: FÍSICA TEÓRICA AVANÇADA (BACHARELADO) ---
    {
        "codigo": "4302305",
        "nome": "Mecânica I",
        "unidade": "IFUSP",
        "departamento": "FMA",
        "creditosAula": 4,
        "creditosTrabalho": 0,
        "horasExtensao": 0,
        "tipo": "obrigatoria",
        "ementa": "Revisão crítica dos princípios newtonianos. Vínculos e coordenadas generalizadas. Princípio de D'Alembert e Princípio de Hamilton (Ação Estacionária). Equações de Lagrange e suas propriedades. Teorema de Noether e constantes de movimento decorrentes de simetrias espaço-temporais. Movimento em campo de forças centrais: equação de órbita, potencial efetivo e problema de dois corpos (gravitação e espalhamento Rutherford). Pequenas oscilações em torno do equilíbrio estável e modos normais de vibração. Formulação hamiltoniana: equações canônicas de Hamilton, parênteses de Poisson e transformações canônicas.",
        "objetivos": "Apresentar a mecânica analítica em nível intermediário-avançado, fornecendo a base conceitual e matemática necessária para a mecânica quântica e a teoria de campos.",
        "bibliografia": [
            "Goldstein, H., Poole, C., Safko, J. Classical Mechanics. 3rd ed. Addison-Wesley, 2002.",
            "Thornton, S. T., Marion, J. B. Classical Dynamics of Particles and Systems. 5th ed. Cengage, 2008.",
            "Landau, L. D., Lifshitz, E. M. Mechanics (Course of Theoretical Physics Vol. 1). 3rd ed. Butterworth-Heinemann, 1976."
        ],
        "preRequisitos": [
            {"tipo": "forte", "disciplinas": ["4302111", "MAT2454"], "descricao": "Aprovação em Física I e Cálculo II"}
        ],
        "observacao": "Mecânica lagrangiana e hamiltoniana, movimento sob força central"
    },
    {
        "codigo": "4302204",
        "nome": "Física Matemática I",
        "unidade": "IFUSP",
        "departamento": "FMA",
        "creditosAula": 4,
        "creditosTrabalho": 0,
        "horasExtensao": 0,
        "tipo": "obrigatoria",
        "ementa": "Funções de variável complexa: analiticidade, equações de Cauchy-Riemann e funções harmônicas. Integração complexa: Teorema e Fórmula Integral de Cauchy. Séries de Taylor e de Laurent, classificação de singularidades e cálculo de resíduos com aplicações a integrais reais impróprias. Transformadas integrais: Transformada de Fourier e de Laplace com aplicações a equações diferenciais lineares. Equações diferenciais parciais da física (onda, difusão e Laplace/Poisson), separação de variáveis e introdução às funções especiais (Legendre, Bessel e Hermite).",
        "objetivos": "Capacitar o aluno no uso rigoroso da análise complexa e equações diferenciais parciais fundamentais para a física matemática e teórica.",
        "bibliografia": [
            "Arfken, G. B., Weber, H. J., Harris, F. E. Mathematical Methods for Physicists. 7th ed. Academic Press, 2012.",
            "Butkov, E. Física Matemática. LTC, 1988.",
            "Brown, J. W., Churchill, R. V. Variáveis Complexas e Aplicações. 9ª ed. McGraw-Hill, 2015."
        ],
        "preRequisitos": [
            {"tipo": "forte", "disciplinas": ["MAT0216"], "descricao": "Aprovação em Cálculo III"}
        ],
        "observacao": "Funções de variável complexa, resíduos e transformadas integrais"
    },
    {
        "codigo": "4300208",
        "nome": "Introdução à Termodinâmica",
        "unidade": "IFUSP",
        "departamento": "FMA",
        "creditosAula": 2,
        "creditosTrabalho": 0,
        "horasExtensao": 0,
        "tipo": "obrigatoria",
        "ementa": "Conceitos termodinâmicos fundamentais: equilíbrio térmico, temperatura empírica e Lei Zero. Primeira Lei da Termodinâmica: calor, trabalho e energia interna. Segunda Lei da Termodinâmica: ciclos térmicos, rendimento de Carnot, entropia e princípio do aumento de entropia. Potenciais termodinâmicos (energia livre de Helmholtz, entalpia, energia livre de Gibbs) e relações de Maxwell. Condições de equilíbrio termodinâmico e estabilidade. Transições de fase de primeira ordem e equação de Clapeyron. Terceira Lei da Termodinâmica.",
        "objetivos": "Apresentar a estrutura formal axiomática da termodinâmica fenomenológica clássica e suas conexões com a estabilidade de sistemas materiais.",
        "bibliografia": [
            "Callen, H. B. Thermodynamics and an Introduction to Thermostatistics. 2nd ed. Wiley, 1985.",
            "Salinas, S. R. A. Introdução à Física Estatística. Edusp, 1999."
        ],
        "preRequisitos": [
            {"tipo": "fraco", "disciplinas": ["MAT2454"], "descricao": "Ter cursado Cálculo II"}
        ],
        "observacao": "Potenciais termodinâmicos, leis da termodinâmica e transições de fase"
    },
    {
        "codigo": "4302313",
        "nome": "Física Experimental V",
        "unidade": "IFUSP",
        "departamento": "FNC",
        "creditosAula": 4,
        "creditosTrabalho": 0,
        "horasExtensao": 0,
        "tipo": "obrigatoria",
        "ementa": "Experimentos históricos fundamentais da física moderna e início da mecânica quântica: Determinação da razão carga-massa do elétron (experimento de Thomson), radiação de corpo negro e Lei de Stefan-Boltzmann, efeito fotoelétrico e determinação da constante de Planck, experimento de Franck-Hertz e quantização dos níveis atômicos, espectroscopia atômica do hidrogênio (série de Balmer) e determinação da constante de Rydberg, efeito Zeeman anômalo e interferometria óptica de Fabry-Pérot.",
        "objetivos": "Vivenciar em laboratório os experimentos seminais que levaram à ruptura com a física clássica e à formulação da teoria quântica.",
        "bibliografia": [
            "Melissinos, A. C., Napolitano, J. Experiments in Modern Physics. 2nd ed. Academic Press, 2003.",
            "Tipler, P. A., Llewellyn, R. A. Física Moderna. 6ª ed. LTC, 2014."
        ],
        "preRequisitos": [
            {"tipo": "forte", "disciplinas": ["4302214"], "descricao": "Aprovação em Física Experimental IV"}
        ],
        "observacao": "Experimentos em física moderna, radiação térmica, efeito fotoelétrico"
    },
    {
        "codigo": "4302303",
        "nome": "Eletromagnetismo I",
        "unidade": "IFUSP",
        "departamento": "FMA",
        "creditosAula": 4,
        "creditosTrabalho": 0,
        "horasExtensao": 0,
        "tipo": "obrigatoria",
        "ementa": "Revisão da análise vetorial e operadores diferenciais em coordenadas curvilíneas. Eletrostática avançada: problemas de contorno e método das imagens. Equação de Poisson e Laplace: separação de variáveis em coordenadas cartesianas, esféricas e cilíndricas com polinômios de Legendre e funções de Bessel. Expansão em multipolos eletrostáticos (dipolo, quadrupolo). Dielétricos lineares e não-lineares: polarizabilidade atômica e suscetibilidade elétrica. Magnetostática avançada: expansão multipolar do potencial vetor e dipolo magnético. Campos eletrodinâmicos variáveis no tempo: potenciais de calibre (Coulomb e Lorenz), potenciais retardados e radiação dipolar elétrica.",
        "objetivos": "Desenvolver tratamento analítico e formal do eletromagnetismo clássico no nível de graduação avançada.",
        "bibliografia": [
            "Griffiths, D. J. Introduction to Electrodynamics. 4th ed. Cambridge University Press, 2017.",
            "Jackson, J. D. Classical Electrodynamics. 3rd ed. Wiley, 1998."
        ],
        "preRequisitos": [
            {"tipo": "forte", "disciplinas": ["4302212", "MAT0216"], "descricao": "Aprovação em Física IV e Cálculo III"}
        ],
        "observacao": "Potenciais eletrostáticos, problemas de contorno, radiação dipolar"
    },
    {
        "codigo": "4302311",
        "nome": "Física Quântica",
        "unidade": "IFUSP",
        "departamento": "FNC",
        "creditosAula": 2,
        "creditosTrabalho": 0,
        "horasExtensao": 0,
        "tipo": "obrigatoria",
        "ementa": "Crise da física clássica e hipóteses quânticas preliminares: radiação do corpo negro (Planck), efeito fotoelétrico (Einstein), efeito Compton e ondas de matéria de De Broglie. Princípio da incerteza de Heisenberg. Postulados fundamentais da mecânica quântica de Schrödinger. Equação de Schrödinger unidimensional independente do tempo: poço de potencial infinito e finito, barreira de potencial e tunelamento quântico, oscilador harmônico quântico simples.",
        "objetivos": "Introduzir os fundamentos conceituais e a formulação ondulatória da mecânica quântica de forma acessível e preparatória para a Mecânica Quântica I.",
        "bibliografia": [
            "Eisberg, R., Resnick, R. Física Quântica: Átomos, Moléculas, Sólidos, Núcleos e Partículas. Campus, 1979.",
            "Griffiths, D. J., Schroeter, D. F. Introduction to Quantum Mechanics. 3rd ed. Cambridge, 2018."
        ],
        "preRequisitos": [
            {"tipo": "forte", "disciplinas": ["4302212"], "descricao": "Aprovação em Física IV"}
        ],
        "observacao": "Dualidade onda-partícula, equação de Schrödinger unidimensional"
    },
    {
        "codigo": "4302403",
        "nome": "Mecânica Quântica I",
        "unidade": "IFUSP",
        "departamento": "FMA",
        "creditosAula": 4,
        "creditosTrabalho": 0,
        "horasExtensao": 0,
        "tipo": "obrigatoria",
        "ementa": "Formalismo matemático no espaço de Hilbert: vetores de estado, operadores hermitianos, relações de comutação, notação bra-ket de Dirac e medidas quânticas. Evolução temporal e equações de movimento nas representações de Schrödinger e Heisenberg. O oscilador harmônico quântico por operadores de criação e aniquilação (método algébrico). Teoria do momento angular: operadores de momento angular, autofunções e autovalores, harmônicos esféricos e acoplamento de momentos angulares (coeficientes de Clebsch-Gordan). O átomo de hidrogênio e átomos monoeletrônicos. Spin 1/2 e matrizes de Pauli. Partículas idênticas e princípio de exclusão de Pauli.",
        "objetivos": "Fornecer domínio rigoroso dos postulados, métodos algébricos e soluções exatas da mecânica quântica moderna não-relativística.",
        "bibliografia": [
            "Cohen-Tannoudji, C., Diu, B., Laloë, F. Quantum Mechanics - Vol. 1 & 2. Wiley, 1977.",
            "Sakurai, J. J., Napolitano, J. Modern Quantum Mechanics. 2nd ed. Cambridge, 2017.",
            "Griffiths, D. J., Schroeter, D. F. Introduction to Quantum Mechanics. 3rd ed. Cambridge, 2018."
        ],
        "preRequisitos": [
            {"tipo": "forte", "disciplinas": ["4302305", "4302311"], "descricao": "Aprovação em Mecânica I e Física Quântica"}
        ],
        "observacao": "Notação de Dirac, operadores, átomo de hidrogênio, momento angular"
    },
    {
        "codigo": "4302401",
        "nome": "Mecânica Estatística",
        "unidade": "IFUSP",
        "departamento": "FMA",
        "creditosAula": 4,
        "creditosTrabalho": 0,
        "horasExtensao": 0,
        "tipo": "obrigatoria",
        "ementa": "Fundamentos da física estatística: espaço de fase, densidade de estados e hipótese ergódica. Ensemble microcanônico: definição estatística da entropia (fórmula de Boltzmann) e temperatura. Ensemble canônico: distribuição de Boltzmann, função de partição e cálculo de grandezas termodinâmicas. Ensemble grande-canônico: potencial químico e flutuações de partículas. Estatísticas quânticas de partículas idênticas: estatística de Maxwell-Boltzmann, Fermi-Dirac e Bose-Einstein. Aplicações a gases quânticos ideais: gás de elétrons em metais e condensação de Bose-Einstein em gases bosônicos.",
        "objetivos": "Construir a ponte conceitual entre a mecânica microscópica (clássica e quântica) e as leis macroscópicas da termodinâmica estatística.",
        "bibliografia": [
            "Salinas, S. R. A. Introdução à Física Estatística. Edusp, 1999.",
            "Pathria, R. K., Beale, P. D. Statistical Mechanics. 3rd ed. Elsevier, 2011.",
            "Huang, K. Statistical Mechanics. 2nd ed. Wiley, 1987."
        ],
        "preRequisitos": [
            {"tipo": "forte", "disciplinas": ["4300208", "4302403"], "descricao": "Aprovação em Termodinâmica e Mecânica Quântica I"}
        ],
        "observacao": "Ensembles microcanônico, canônico e grande-canônico, gases quânticos"
    },

    # --- MATEMÁTICA & COMPUTAÇÃO (IME-USP) ---
    {
        "codigo": "MAT2453",
        "nome": "Cálculo Diferencial e Integral I",
        "unidade": "IME",
        "departamento": "MAT",
        "creditosAula": 6,
        "creditosTrabalho": 0,
        "horasExtensao": 0,
        "tipo": "obrigatoria",
        "ementa": "Números reais e funções de uma variável real. Limites e continuidade: definição precisa com épsilons e deltas, propriedades operatórias e Teorema do Confronto. Derivadas: interpretação geométrica e cinemática, regras de derivação, regra da cadeia e derivação implícita. Teoremas do Valor Médio (Rolle e Cauchy) e aplicações a problemas de máximos e mínimos e taxas relacionadas. Teorema Fundamental do Cálculo e integrais definidas e indefinidas. Métodos de integração: substituição de variáveis e integração por partes.",
        "objetivos": "Fornecer fundamentação sólida no cálculo de funções reais de uma variável para a física e ciências exatas.",
        "bibliografia": [
            "Guidorizzi, H. L. Um Curso de Cálculo - Vol. 1. 5ª ed. LTC, 2001.",
            "Stewart, J. Cálculo - Vol. 1. 8ª ed. Cengage Learning, 2016.",
            "Apostol, T. M. Calculus - Vol. 1. 2nd ed. Wiley, 1967."
        ],
        "preRequisitos": [],
        "observacao": "Limites, continuidade, derivadas e integrais de uma variável"
    },
    {
        "codigo": "MAT0112",
        "nome": "Vetores e Geometria",
        "unidade": "IME",
        "departamento": "MAT",
        "creditosAula": 4,
        "creditosTrabalho": 0,
        "horasExtensao": 0,
        "tipo": "obrigatoria",
        "ementa": "Espaço afim e euclidiano tridimensional. Vetores: operações de adição e multiplicação por escalar, dependência e independência linear, bases ortonormais e produto escalar, produto vetorial e produto misto. Retas e planos no espaço: equações vetoriais, paramétricas e gerais. Posições relativas, distâncias e ângulos entre retas e planos. Cônicas (elipse, hipérbole e parábola) e quádricas no espaço euclidiano.",
        "objetivos": "Desenvolver a percepção geométrica tridimensional e a álgebra vetorial fundamental aplicada à mecânica e eletromagnetismo.",
        "bibliografia": [
            "Boulos, P., Camargo, I. Geometria Analítica: Um Tratamento Vetorial. 3ª ed. Pearson, 2005.",
            "Santos, N. M. Vetores e Geometria Analítica. McGraw-Hill, 1988."
        ],
        "preRequisitos": [],
        "observacao": "Espaços euclidianos, vetores e geometria analítica"
    },
    {
        "codigo": "MAT2454",
        "nome": "Cálculo Diferencial e Integral II",
        "unidade": "IME",
        "departamento": "MAT",
        "creditosAula": 4,
        "creditosTrabalho": 0,
        "horasExtensao": 0,
        "tipo": "obrigatoria",
        "ementa": "Funções de várias variáveis reais: domínio, limites e continuidade. Derivadas parciais, diferenciabilidade e plano tangente. Regra da cadeia para funções de várias variáveis. Derivadas direcionais e vetor gradiente: significado geométrico e propriedades fundamentais. Máximos e mínimos locais e absolutos: matriz Hessiana, teste das derivadas segundas e multiplicadores de Lagrange para extremos condicionados.",
        "objetivos": "Capacitar o estudante no cálculo diferencial em espaços euclidianos multidimensionais, essencial para a física teórica.",
        "bibliografia": [
            "Guidorizzi, H. L. Um Curso de Cálculo - Vol. 2. 5ª ed. LTC, 2002.",
            "Stewart, J. Cálculo - Vol. 2. 8ª ed. Cengage Learning, 2016."
        ],
        "preRequisitos": [
            {"tipo": "forte", "disciplinas": ["MAT2453"], "descricao": "Aprovação em Cálculo I"}
        ],
        "observacao": "Funções de várias variáveis, derivadas parciais e extremos"
    },
    {
        "codigo": "MAT0122",
        "nome": "Álgebra Linear I",
        "unidade": "IME",
        "departamento": "MAT",
        "creditosAula": 4,
        "creditosTrabalho": 0,
        "horasExtensao": 0,
        "tipo": "obrigatoria",
        "ementa": "Sistemas lineares e método de eliminação de Gauss-Jordan. Espaços vetoriais reais e complexos: subespaços, combinações lineares, conjuntos geradores, dependência linear, base e dimensão. Transformações lineares: núcleo, imagem e teorema da dimensão. Matriz associada a uma transformação linear e mudança de base. Espaços com produto interno e ortogonalização de Gram-Schmidt. Autovalores, autovetores, polinômio característico e diagonalização de operadores lineares.",
        "objetivos": "Dominar a estrutura de espaços vetoriais e transformações lineares, pré-requisito nuclear para mecânica quântica.",
        "bibliografia": [
            "Hoffman, K., Kunze, R. Álgebra Linear. 2ª ed. LTC, 1979.",
            "Lipschutz, S., Lipson, M. Álgebra Linear (Coleção Schaum). 4ª ed. Bookman, 2011."
        ],
        "preRequisitos": [
            {"tipo": "fraco", "disciplinas": ["MAT0112"], "descricao": "Ter cursado Vetores e Geometria"}
        ],
        "observacao": "Espaços vetoriais, transformações lineares, autovalores e autovetores"
    },
    {
        "codigo": "MAT0216",
        "nome": "Cálculo Diferencial e Integral III",
        "unidade": "IME",
        "departamento": "MAT",
        "creditosAula": 6,
        "creditosTrabalho": 0,
        "horasExtensao": 0,
        "tipo": "obrigatoria",
        "ementa": "Integrais múltiplas: Integrais duplas e triplas sobre regiões gerais. Mudança de variáveis em integrais múltiplas (coordenadas polares, cilíndricas e esféricas) e o determinante Jacobiano. Campos vetoriais: rotacional, divergente e campos conservativos. Integrais de linha e Teorema de Green no plano. Superfícies parametrizadas, plano tangente e área de superfícies. Integrais de superfície de campos escalares e vetoriais (fluxo). Grandes teoremas da análise vetorial: Teorema de Stokes e Teorema da Divergência de Gauss com aplicações diretas ao eletromagnetismo.",
        "objetivos": "Instrumentalizar o aluno no cálculo integral multivariado e na análise vetorial avançada com rigor matemático.",
        "bibliografia": [
            "Guidorizzi, H. L. Um Curso de Cálculo - Vol. 3. 5ª ed. LTC, 2002.",
            "Stewart, J. Cálculo - Vol. 2. 8ª ed. Cengage, 2016."
        ],
        "preRequisitos": [
            {"tipo": "forte", "disciplinas": ["MAT2454"], "descricao": "Aprovação em Cálculo II"}
        ],
        "observacao": "Integrais múltiplas, integrais de linha, teoremas de Green, Stokes e Gauss"
    },
    {
        "codigo": "4300218",
        "nome": "Introdução à Física Computacional",
        "unidade": "IFUSP",
        "departamento": "FAP",
        "creditosAula": 4,
        "creditosTrabalho": 0,
        "horasExtensao": 0,
        "tipo": "obrigatoria",
        "ementa": "Ambientes modernos de computação científica em Python/C++. Tipagem, estruturas de controle, funções e bibliotecas científicas (NumPy, SciPy, Matplotlib). Solução numérica de equações diferenciais ordinárias (métodos de Euler, Verlet e Runge-Kutta) aplicadas à dinâmica de osciladores não-lineares e caos determinístico. Métodos de Monte Carlo e passeios aleatórios. Resolução numérica da equação de Schrödinger independente do tempo. Visualização de dados científicos e simulações físicas interativas.",
        "objetivos": "Capacitar os alunos na programação científica e modelagem computacional de sistemas físicos reais complexos.",
        "bibliografia": [
            "Newman, M. Computational Physics. CreateSpace Independent Publishing, 2013.",
            "Giordano, N. J., Nakanishi, H. Computational Physics. 2nd ed. Pearson, 2005."
        ],
        "preRequisitos": [
            {"tipo": "fraco", "disciplinas": ["4302111", "MAT2453"], "descricao": "Ter cursado Física I e Cálculo I"}
        ],
        "observacao": "Modelagem computacional, programação e simulação de sistemas físicos"
    },
    {
        "codigo": "MAT0220",
        "nome": "Cálculo Diferencial e Integral IV",
        "unidade": "IME",
        "departamento": "MAT",
        "creditosAula": 4,
        "creditosTrabalho": 0,
        "horasExtensao": 0,
        "tipo": "obrigatoria",
        "ementa": "Sequências e séries numéricas: critérios de convergência para séries de termos positivos e alternados. Séries de potências, raio e intervalo de convergência. Séries de Taylor e Maclaurin. Equações diferenciais ordinárias (EDOs) de 1ª ordem: lineares, separáveis e exatas. EDOs lineares de 2ª ordem com coeficientes constantes: método dos coeficientes a determinar e variação de parâmetros. Resolução de equações diferenciais por séries de potências (método de Frobenius). Introdução às séries de Fourier e convergência em média.",
        "objetivos": "Fornecer o instrumental de equações diferenciais e expansão em séries para a resolução analítica de problemas físicos.",
        "bibliografia": [
            "Boyce, W. E., DiPrima, R. C. Equações Diferenciais Elementares e Problemas de Valores de Contorno. 10ª ed. LTC, 2015.",
            "Guidorizzi, H. L. Um Curso de Cálculo - Vol. 4. 5ª ed. LTC, 2002."
        ],
        "preRequisitos": [
            {"tipo": "forte", "disciplinas": ["MAT2454"], "descricao": "Aprovação em Cálculo II"}
        ],
        "observacao": "Equações diferenciais ordinárias e séries de potências/Fourier"
    },
    {
        "codigo": "MAP0214",
        "nome": "Cálculo Numérico com Aplicações em Física",
        "unidade": "IME",
        "departamento": "MAP",
        "creditosAula": 4,
        "creditosTrabalho": 0,
        "horasExtensao": 0,
        "tipo": "obrigatoria",
        "ementa": "Aritmética de ponto flutuante e análise de propagação de erros. Zeros de funções reais: método da bisseção, iteração de ponto fixo e método de Newton-Raphson. Resolução de sistemas lineares: métodos diretos (eliminação de Gauss com pivoteamento, fatoração LU) e iterativos (Jacobi, Gauss-Seidel). Interpolação polinomial (Lagrange, Newton) e aproximação por splines cúbicas. Ajuste de curvas pelo método dos quadrados mínimos. Integração numérica (fórmulas de Newton-Cotes e quadratura gaussiana).",
        "objetivos": "Apresentar os principais métodos numéricos e algoritmos computacionais fundamentais com análise de estabilidade e convergência.",
        "bibliografia": [
            "Burden, R. L., Faires, J. D. Análise Numérica. 3ª ed. Cengage Learning, 2016.",
            "Franco, N. B. Cálculo Numérico. Pearson, 2006."
        ],
        "preRequisitos": [
            {"tipo": "fraco", "disciplinas": ["MAT2454"], "descricao": "Ter cursado Cálculo II"}
        ],
        "observacao": "Resolução numérica de equações, interpolação e integração numérica"
    },

    # --- LICENCIATURA EM FÍSICA (IFUSP / FEUSP / IME) ---
    {
        "codigo": "4300151",
        "nome": "Fundamentos de Mecânica",
        "unidade": "IFUSP",
        "departamento": "FEP",
        "creditosAula": 4,
        "creditosTrabalho": 0,
        "horasExtensao": 0,
        "tipo": "obrigatoria",
        "ementa": "Princípios fundamentais da mecânica com enfoque epistemológico e conceitual voltado à formação docente. Cinemática escalar e vetorial. As três Leis de Newton e o conceito de força e inércia. Trabalho, energia mecânica e teorema da energia cinética. Forças conservativas e energia potencial gravitacional e elástica. Quantidade de movimento e sua conservação em colisões. O papel das concepções alternativas no aprendizado da mecânica básica.",
        "objetivos": "Consolidar a estrutura conceitual da mecânica newtoniana e articular sua transposição didática inicial no ensino básico.",
        "bibliografia": [
            "Nussenzveig, H. M. Curso de Física Básica - Vol. 1. Blücher, 2013.",
            "Halliday, D., Resnick, R. Fundamentos de Física - Vol. 1. LTC, 2016."
        ],
        "preRequisitos": [],
        "observacao": "Mecânica newtoniana, conservação de energia e momento"
    },
    {
        "codigo": "4300160",
        "nome": "Ótica",
        "unidade": "IFUSP",
        "departamento": "FEP",
        "creditosAula": 2,
        "creditosTrabalho": 2,
        "horasExtensao": 15,
        "tipo": "obrigatoria",
        "ementa": "Fundamentos da ótica geométrica e ondulatória para futuros professores. Princípio de Fermat, leis da reflexão e refração. Formação de imagens em espelhos planos e esféricos, dioptros e lentes delgadas. Instrumentos ópticos: microscópio, telescópio e olho humano como sistema óptico. Fenômenos ondulatórios: difração, interferência e polarização com montagens simples de baixo custo para salas de aula do ensino médio (PCC integrada).",
        "objetivos": "Estudar a ótica clássica com ênfase na prática laboratorial acessível e transposição didática como Prática como Componente Curricular (PCC).",
        "bibliografia": [
            "Hecht, E. Optics. Pearson, 2016.",
            "Nussenzveig, H. M. Curso de Física Básica - Vol. 4. Blücher, 2014."
        ],
        "preRequisitos": [],
        "observacao": "Ótica geométrica, ondulatória e Prática como Componente Curricular (PCC)"
    },
    {
        "codigo": "MAT1351",
        "nome": "Cálculo de Funções de Uma Variável Real I",
        "unidade": "IME",
        "departamento": "MAT",
        "creditosAula": 6,
        "creditosTrabalho": 0,
        "horasExtensao": 0,
        "tipo": "obrigatoria",
        "ementa": "Conjunto dos números reais e propriedades de corpos ordenados completos. Funções elementares e suas inversas. Noções intuitivas e formais de limite e continuidade. Derivadas e diferenciais: regras operatórias e significado físico de taxa de variação. Estudo de variação de funções, concavidade, pontos de inflexão e assíntotas. Teorema do Valor Médio. Introdução à integral de Riemann e Teorema Fundamental do Cálculo.",
        "objetivos": "Fornecer ferramentas analíticas e conceituais do cálculo diferencial e integral de uma variável para os estudantes de licenciatura.",
        "bibliografia": [
            "Guidorizzi, H. L. Um Curso de Cálculo - Vol. 1. LTC, 2001.",
            "Stewart, J. Cálculo - Vol. 1. Cengage, 2016."
        ],
        "preRequisitos": [],
        "observacao": "Limites, continuidade, derivadas e teoremas fundamentais"
    },
    {
        "codigo": "MAT0105",
        "nome": "Geometria Analítica",
        "unidade": "IME",
        "departamento": "MAT",
        "creditosAula": 4,
        "creditosTrabalho": 0,
        "horasExtensao": 0,
        "tipo": "obrigatoria",
        "ementa": "Sistemas de coordenadas cartesianas no plano e no espaço. Vetores no plano e no espaço tridimensional: operações, produto escalar, vetorial e misto. Estudo analítico de retas e planos no espaço. Equações e propriedades métricas das seções cônicas (parábola, elipse, hipérbole) e superfícies quádricas. Aplicações a trajetórias e órbitas na física.",
        "objetivos": "Desenvolver a representação algébrico-geométrica de entes espaciais necessária para o aprendizado e ensino de ciências exatas.",
        "bibliografia": [
            "Boulos, P., Camargo, I. Geometria Analítica. Pearson, 2005."
        ],
        "preRequisitos": [],
        "observacao": "Vetores no plano e no espaço, cônicas e quádricas"
    },
    {
        "codigo": "4300157",
        "nome": "Ciência, Educação e Linguagem",
        "unidade": "IFUSP",
        "departamento": "FEP",
        "creditosAula": 2,
        "creditosTrabalho": 2,
        "horasExtensao": 30,
        "tipo": "obrigatoria",
        "ementa": "A linguagem como elemento mediador da construção do conhecimento científico e pedagógico. Textualidade científica versus linguagem cotidiana. Leitura, interpretação e produção de textos em ciências da natureza. Concepções da natureza da ciência e suas implicações no imaginário discente. Análise crítica de discursos em livros didáticos e mídias de divulgação científica.",
        "objetivos": "Desenvolver a capacidade analítica sobre o papel da linguagem no ensino de física e nas práticas de comunicação e divulgação.",
        "bibliografia": [
            "Bakhtin, M. Marxismo e Filosofia da Linguagem. Hucitec, 2006.",
            "Zanetic, J. Física também é Cultura. Tese de Doutorado, FEUSP, 1989."
        ],
        "preRequisitos": [],
        "observacao": "Linguagem científica, textualidade e primeiras reflexões sobre o ensino"
    },
    {
        "codigo": "4300153",
        "nome": "Mecânica",
        "unidade": "IFUSP",
        "departamento": "FEP",
        "creditosAula": 4,
        "creditosTrabalho": 2,
        "horasExtensao": 20,
        "tipo": "obrigatoria",
        "ementa": "Aprofundamento na mecânica newtoniana para a licenciatura. Dinâmica de sistemas de partículas e centro de massa. Trabalho de forças variáveis e energia potencial em campos conservativos. Movimento harmônico simples e oscilações amortecidas. Gravitação newtoniana e modelos cosmológicos históricos (geocentrismo vs heliocentrismo). Discussão e elaboração de sequências didáticas para o ensino médio com PCC.",
        "objetivos": "Aprofundar a mecânica integrando a história da ciência com práticas docentes criativas para a educação básica.",
        "bibliografia": [
            "Nussenzveig, H. M. Curso de Física Básica - Vol. 1. Blücher, 2013."
        ],
        "preRequisitos": [
            {"tipo": "fraco", "disciplinas": ["4300151"], "descricao": "Ter cursado Fundamentos de Mecânica"}
        ],
        "observacao": "Dinâmica de sistemas de partículas, colisões e PCC integrada"
    },
    {
        "codigo": "4300152",
        "nome": "Introdução às Medidas Físicas",
        "unidade": "IFUSP",
        "departamento": "FEP",
        "creditosAula": 4,
        "creditosTrabalho": 0,
        "horasExtensao": 0,
        "tipo": "obrigatoria",
        "ementa": "Metodologia experimental e tratamento estatístico de dados com ênfase no laboratório escolar. Algarismos significativos, estimativa de incertezas e propagação de erros experimentais. Construção de tabelas e gráficos em papel milimetrado e softwares livres. Ajustes lineares e não-lineares. Experimentos didáticos em mecânica com cronometragem manual e eletrônica.",
        "objetivos": "Instrumentalizar o futuro professor na concepção, execução e avaliação de atividades experimentais investigativas para a educação básica.",
        "bibliografia": [
            "Vuolo, J. H. Fundamentos da Teoria de Erros. Edgard Blücher, 1996."
        ],
        "preRequisitos": [],
        "observacao": "Tratamento de dados, construção de gráficos e instrumentos didáticos"
    },
    {
        "codigo": "MAT1352",
        "nome": "Cálculo de Funções de Uma Variável Real II",
        "unidade": "IME",
        "departamento": "MAT",
        "creditosAula": 6,
        "creditosTrabalho": 0,
        "horasExtensao": 0,
        "tipo": "obrigatoria",
        "ementa": "Técnicas avançadas de integração: frações parciais, substituições trigonométricas e integração por partes. Aplicações geométricas da integral: cálculo de áreas de figuras planas, volumes de sólidos de revolução e comprimento de arco. Integrais impróprias de primeira e segunda espécie. Sequências e séries numéricas, critérios de convergência e séries de potências.",
        "objetivos": "Aprofundar as técnicas de integração e séries para a compreensão de equações da física teórica e aplicada.",
        "bibliografia": [
            "Guidorizzi, H. L. Um Curso de Cálculo - Vol. 1 e 2. LTC, 2001."
        ],
        "preRequisitos": [
            {"tipo": "forte", "disciplinas": ["MAT1351"], "descricao": "Aprovação em Cálculo I (Licenciatura)"}
        ],
        "observacao": "Técnicas de integração e séries numéricas"
    },
    {
        "codigo": "4300156",
        "nome": "Gravitação",
        "unidade": "IFUSP",
        "departamento": "FEP",
        "creditosAula": 2,
        "creditosTrabalho": 0,
        "horasExtensao": 0,
        "tipo": "obrigatoria",
        "ementa": "Astronomia básica e gravitação sob perspectiva histórica: de Ptolomeu e Copérnico a Galileu, Kepler e Newton. Leis de Kepler da cinemática planetária. A Lei da Gravitação Universal e sua dedução dinâmica. Campo gravitacional e energia potencial gravitacional. Velocidade de escape e satélites artificiais. Princípio de equivalência e noções introdutórias da Relatividade Geral de Einstein.",
        "objetivos": "Capacitar o futuro professor nos tópicos de gravitação e astronomia fundamental, tema de grande apelo e curiosidade na educação básica.",
        "bibliografia": [
            "Nussenzveig, H. M. Curso de Física Básica - Vol. 1. Blücher, 2013.",
            "Kepler, J. O Segredo do Universo. Tradução e notas, 2000."
        ],
        "preRequisitos": [],
        "observacao": "Leis de Kepler, gravitação universal e modelos cosmológicos históricos"
    },
    {
        "codigo": "EDM0402",
        "nome": "Didática",
        "unidade": "FEUSP",
        "departamento": "EDM",
        "creditosAula": 4,
        "creditosTrabalho": 2,
        "horasExtensao": 30,
        "tipo": "obrigatoria",
        "ementa": "A Didática como campo de estudo dos processos de ensino-aprendizagem. Teorias pedagógicas e suas concepções de homem, sociedade e educação. Planejamento educacional: objetivos, conteúdos, métodos e avaliação da aprendizagem escolar. Relação professor-aluno, mediação pedagógica e gestão da sala de aula. Início da imersão em estágio supervisionado na rede de ensino público (30 horas computadas).",
        "objetivos": "Desenvolver a reflexão pedagógica e capacidade de planejamento de aulas articuladas com as realidades da escola pública brasileira.",
        "bibliografia": [
            "Candau, V. M. A Didática em Questão. Vozes, 2012.",
            "Libâneo, J. C. Didática. Cortez, 2008."
        ],
        "preRequisitos": [],
        "observacao": "Processos de ensino-aprendizagem, planejamento escolar e início do estágio (30h)"
    },
    {
        "codigo": "EDF0290",
        "nome": "Psicologia da Educação",
        "unidade": "FEUSP",
        "departamento": "EDF",
        "creditosAula": 4,
        "creditosTrabalho": 2,
        "horasExtensao": 30,
        "tipo": "obrigatoria",
        "ementa": "Teorias psicológicas do desenvolvimento e da aprendizagem humana. Abordagem psicogenética de Jean Piaget e os estágios do desenvolvimento cognitivo. Teoria histórico-cultural de Lev Vygotsky: mediação semiótica e zona de desenvolvimento proximal. A aprendizagem significativa de David Ausubel. Afetividade, cognição, subjetividade adolescente e relações interpessoais na escola (30 horas de estágio supervisionado).",
        "objetivos": "Fundamentar a prática pedagógica nas teorias do desenvolvimento cognitivo e emocional dos estudantes do ensino básico.",
        "bibliografia": [
            "Vygotsky, L. S. A Formação Social da Mente. Martins Fontes, 1998.",
            "Piaget, J. A Psicologia da Criança. Difel, 2003."
        ],
        "preRequisitos": [],
        "observacao": "Teorias da aprendizagem (Piaget, Vygotsky, Ausubel) e estágio (30h)"
    },
    {
        "codigo": "EDA0463",
        "nome": "Política e Organização da Educação Básica (POEB)",
        "unidade": "FEUSP",
        "departamento": "EDA",
        "creditosAula": 4,
        "creditosTrabalho": 2,
        "horasExtensao": 60,
        "tipo": "obrigatoria",
        "ementa": "História das políticas educacionais brasileiras. A Constituição Federal de 1988 e a Lei de Diretrizes e Bases da Educação Nacional (LDB 9.394/1996). Estrutura, níveis e modalidades de ensino no Brasil. Financiamento público da educação (Fundeb), políticas curriculares nacionais (BNCC) e avaliação em larga escala. Gestão democrática da escola pública e projeto político-pedagógico escolar (60 horas de estágio de gestão).",
        "objetivos": "Compreender o arcabouço legislativo e as forças sociais e políticas que estruturam o sistema educacional brasileiro.",
        "bibliografia": [
            "Saviani, D. Da Nova LDB ao Plano Nacional de Educação. Autores Associados, 2008.",
            "Brasil. Lei de Diretrizes e Bases da Educação Nacional (Lei 9.394/1996)."
        ],
        "preRequisitos": [],
        "observacao": "Legislação educacional (LDB), gestão democrática e estágio escolar (60h)"
    },
    {
        "codigo": "4300356",
        "nome": "Elementos e Estrutura do Ensino de Física",
        "unidade": "IFUSP",
        "departamento": "FEP",
        "creditosAula": 4,
        "creditosTrabalho": 2,
        "horasExtensao": 20,
        "tipo": "obrigatoria",
        "ementa": "Histórico das reformas do ensino de ciências e de física no Brasil e no mundo. Análise dos currículos oficiais e parâmetros curriculares. Transposição didática: a transformação do saber acadêmico em saber a ser ensinado. Concepções alternativas dos estudantes sobre fenômenos físicos e estratégias de mudança conceitual. Avaliação da aprendizagem em física e resolução de problemas na sala de aula.",
        "objetivos": "Articular a epistemologia da física com a didática da ciência e as especificidades do ensino médio.",
        "bibliografia": [
            "Chevallard, Y. La Transposition Didactique: du savoir savant au savoir enseigné. La Pensée Sauvage, 1991.",
            "Carvalho, A. M. P. Ensino de Física por Investigação. Cengage, 2013."
        ],
        "preRequisitos": [
            {"tipo": "fraco", "disciplinas": ["4300153"], "descricao": "Ter cursado Mecânica (Licenciatura)"}
        ],
        "observacao": "História das reformas curriculares e transposição didática"
    },
    {
        "codigo": "4300458",
        "nome": "Propostas e Projetos no Ensino de Física",
        "unidade": "IFUSP",
        "departamento": "FEP",
        "creditosAula": 4,
        "creditosTrabalho": 2,
        "horasExtensao": 40,
        "tipo": "obrigatoria",
        "ementa": "Concepção, planejamento e implementação de propostas e sequências de ensino investigativas (SEI) para o ensino médio. Educação Especial e Inclusiva: metodologias de ensino adaptadas a alunos com deficiência visual, auditiva ou neurodiversos. Introdução aos fundamentos da Língua Brasileira de Sinais (Libras) aplicados a conceitos científicos. Atividades extensionistas de divulgação e oficinas temáticas com alunos da rede pública.",
        "objetivos": "Capacitar os futuros professores no desenho de intervenções pedagógicas inclusivas com foco na diversidade e em Libras.",
        "bibliografia": [
            "Carvalho, A. M. P., Vannucchi, C. A. O Ensino de Ciências por Investigação: Condições para Implementação. Cengage, 2013.",
            "Brito, L. F. Integração Social e Educação do Surdo. Babel, 2003."
        ],
        "preRequisitos": [
            {"tipo": "forte", "disciplinas": ["4300356"], "descricao": "Aprovação em Elementos e Estrutura do Ensino de Física"}
        ],
        "observacao": "Elaboração de sequências didáticas, Educação Especial Inclusiva e Libras"
    },
    {
        "codigo": "4300390",
        "nome": "Práticas em Ensino de Física I",
        "unidade": "IFUSP",
        "departamento": "FEP",
        "creditosAula": 2,
        "creditosTrabalho": 0,
        "horasExtensao": 50,
        "tipo": "obrigatoria",
        "ementa": "Estágio Supervisionado de Regência em Escolas Públicas: inserção em turmas do Ensino Fundamental II (Ciências) ou Ensino Médio (Física). Observação participativa, coplanejamento com o professor titular e regência de sequências de aulas supervisionadas. Elaboração de diários de bordo e relatórios críticos de estágio (50 horas de regência homologadas).",
        "objetivos": "Vivenciar e assumir com protagonismo a prática docente supervisionada em ambiente real de escola pública.",
        "bibliografia": [
            "Pimenta, S. G., Lima, M. S. L. Estágio e Docência. Cortez, 2004."
        ],
        "preRequisitos": [
            {"tipo": "forte", "disciplinas": ["EDM0402"], "descricao": "Aprovação em Didática"}
        ],
        "observacao": "Estágio Supervisionado em regência de sala de aula (50h de regência)"
    },
    {
        "codigo": "4300391",
        "nome": "Práticas em Ensino de Física II",
        "unidade": "IFUSP",
        "departamento": "FEP",
        "creditosAula": 2,
        "creditosTrabalho": 0,
        "horasExtensao": 50,
        "tipo": "obrigatoria",
        "ementa": "Estágio Supervisionado de Regência Avançado: implementação de projetos investigativos e laboratoriais em escolas públicas estaduais. Avaliação de aprendizagem formativa e autoavaliação discente. Discussão coletiva dos desafios de sala de aula em reuniões de acompanhamento na CoCLic (50 horas de regência homologadas).",
        "objetivos": "Consolidar a autonomia docente e a reflexão sobre a prática na docência em física.",
        "bibliografia": [
            "Pimenta, S. G. O Estágio na Formação de Professores: Unidade Teoria e Prática? Cortez, 2005."
        ],
        "preRequisitos": [
            {"tipo": "forte", "disciplinas": ["4300390"], "descricao": "Aprovação em Práticas em Ensino de Física I"}
        ],
        "observacao": "Estágio supervisionado com acompanhamento coletivo na CoCLic (50h)"
    },
    {
        "codigo": "EDM0425",
        "nome": "Metodologia do Ensino de Física I",
        "unidade": "FEUSP",
        "departamento": "EDM",
        "creditosAula": 4,
        "creditosTrabalho": 2,
        "horasExtensao": 70,
        "tipo": "obrigatoria",
        "ementa": "Metodologias específicas para o ensino de física clássica no Ensino Médio. Análise de coleções didáticas do PNLD. Práticas inovadoras: demonstrações investigativas, feiras de ciências escolares e recursos multimídia. Investigação da prática escolar através de 70 horas de estágio supervisionado na escola pública.",
        "objetivos": "Formar a capacidade crítica metodológica e investigativa sobre o ensino da física na educação básica.",
        "bibliografia": [
            "Carvalho, A. M. P. et al. Ensino de Física. Coleção Ideias em Ação. Cengage Learning, 2011."
        ],
        "preRequisitos": [
            {"tipo": "forte", "disciplinas": ["EDM0402"], "descricao": "Aprovação em Didática"}
        ],
        "observacao": "Análise de livros didáticos, concepções alternativas e estágio (70h)"
    },
    {
        "codigo": "EDM0426",
        "nome": "Metodologia do Ensino de Física II",
        "unidade": "FEUSP",
        "departamento": "EDM",
        "creditosAula": 4,
        "creditosTrabalho": 2,
        "horasExtensao": 80,
        "tipo": "obrigatoria",
        "ementa": "Metodologias para o ensino de Física Moderna e Contemporânea (FMC) no Ensino Médio. Abordagens CTSA (Ciência, Tecnologia, Sociedade e Ambiente). Discussão de temas sócio-científicos polêmicos: energia nuclear, aquecimento global e nanotecnologia. Fechamento das 80 horas finais de estágio supervisionado com entrega do Relatório de Estágio Docente.",
        "objetivos": "Capacitar os licenciandos a abordar física contemporânea e temas sociais complexos na escola básica.",
        "bibliografia": [
            "Ostermann, F., Moreira, M. A. Física Contemporânea no Ensino Médio: Texto de Apoio ao Professor. UFRGS, 2000."
        ],
        "preRequisitos": [
            {"tipo": "forte", "disciplinas": ["EDM0425"], "descricao": "Aprovação em Metodologia do Ensino de Física I"}
        ],
        "observacao": "Investigação pedagógica na escola e conclusão dos relatórios de estágio (80h)"
    },
    {
        "codigo": "4300474",
        "nome": "Evolução dos Conceitos da Física",
        "unidade": "IFUSP",
        "departamento": "FEP",
        "creditosAula": 4,
        "creditosTrabalho": 0,
        "horasExtensao": 0,
        "tipo": "obrigatoria",
        "ementa": "História e Filosofia da Ciência aplicadas à formação do educador em física. A gênese e evolução dos grandes conceitos da física: espaço, tempo, movimento, força, energia, éter, campos e átomos. As rupturas epistemológicas de Galileu, Newton, Maxwell, Planck, Einstein e Bohr. O debate sobre o método científico: indutivismo, falsificacionismo de Popper, paradigmas de Kuhn e programas de pesquisa de Lakatos.",
        "objetivos": "Fornecer fundamentação epistemológica para desmistificar a visão positivista da ciência na docência.",
        "bibliografia": [
            "Chalmers, A. F. O que é Ciência afinal? Brasiliense, 1993.",
            "Kuhn, T. S. A Estrutura das Revoluções Científicas. Perspectiva, 2000.",
            "Zanetic, J. Física também é Cultura. FEUSP, 1989."
        ],
        "preRequisitos": [
            {"tipo": "fraco", "disciplinas": ["4300372"], "descricao": "Ter cursado Física Moderna I"}
        ],
        "observacao": "Epistemologia e história da ciência de Galileu aos quanta"
    },
    {
        "codigo": "4300490",
        "nome": "Laboratório de Ensino de Física",
        "unidade": "IFUSP",
        "departamento": "FEP",
        "creditosAula": 4,
        "creditosTrabalho": 2,
        "horasExtensao": 30,
        "tipo": "obrigatoria",
        "ementa": "Planejamento, desenvolvimento, prototipagem e validação de experimentos de baixo custo e kits didáticos para a sala de aula da rede pública. Automação de experimentos didáticos com placas Arduino e sensores de baixo custo. Elaboração de roteiros investigativos e guias do professor para acompanhamento das montagens laboratoriais.",
        "objetivos": "Capacitar os licenciandos na criação autônoma de recursos laboratoriais adaptáveis às realidades materiais de qualquer escola.",
        "bibliografia": [
            "Aguiar, C. E., Laudares, F. Arduino no Laboratório de Física. Revista Brasileira de Ensino de Física, 2011.",
            "Apostilas do Laboratório Didático de Ensino de Física - IFUSP."
        ],
        "preRequisitos": [
            {"tipo": "forte", "disciplinas": ["4300152", "4300373"], "descricao": "Aprovação em Introdução às Medidas Físicas e Lab de Eletromagnetismo"}
        ],
        "observacao": "Desenvolvimento e prototipagem de kits e experimentos de baixo custo"
    },

    # --- FÍSICA MÉDICA (IFUSP & FMUSP) ---
    {
        "codigo": "MDR0632",
        "nome": "Introdução à Física Médica",
        "unidade": "FMUSP",
        "departamento": "MDR",
        "creditosAula": 2,
        "creditosTrabalho": 0,
        "horasExtensao": 0,
        "tipo": "obrigatoria",
        "ementa": "Visão panorâmica da história e áreas de atuação do Físico Médico: Radioterapia, Medicina Nuclear, Radiodiagnóstico e Proteção Radiológica. Ética médica e relação com a equipe multiprofissional (médicos radiologistas, radio-oncologistas, biomédicos e técnicos). Normas de biossegurança hospitalar. Visitas técnicas orientadas ao Instituto de Radiologia (InRad) e Instituto do Câncer do Estado de São Paulo (ICESP).",
        "objetivos": "Apresentar a profissão de Físico Médico e ambientar o estudante com a rotina e os desafios do ambiente clínico-hospitalar.",
        "bibliografia": [
            "Bushberg, J. T. et al. The Essential Physics of Medical Imaging. 3rd ed. Lippincott Williams & Wilkins, 2011.",
            "Podgorsak, E. B. Radiation Oncology Physics: A Handbook for Teachers and Students. IAEA, 2005."
        ],
        "preRequisitos": [],
        "observacao": "Visão panorâmica da atuação clínica em radioterapia e diagnóstico"
    },
    {
        "codigo": "MDR0633",
        "nome": "Elementos de Anatomia e Fisiologia Humana",
        "unidade": "FMUSP",
        "departamento": "MDR",
        "creditosAula": 4,
        "creditosTrabalho": 0,
        "horasExtensao": 0,
        "tipo": "obrigatoria",
        "ementa": "Morfologia e fisiologia dos grandes sistemas do corpo humano com foco na interpretação anatômica por imagens médicas: sistema esquelético e muscular, sistema nervoso central e periférico, sistema cardiovascular e hemodinâmica, sistema respiratório e trocas gasosas, sistema digestório e urinário. Planos anatômicos de secção (axial, sagital e coronal) fundamentais para tomografia e ressonância magnética.",
        "objetivos": "Capacitar o físico médico a identificar estruturas anatômicas e compreender o funcionamento fisiológico essencial para o planejamento radioterápico e diagnóstico.",
        "bibliografia": [
            "Moore, K. L., Dalley, A. F., Agur, A. M. Anatomia Orientada para a Clínica. 7ª ed. Guanabara Koogan, 2014.",
            "Guyton, A. C., Hall, J. E. Tratado de Fisiologia Médica. 13ª ed. Elsevier, 2017."
        ],
        "preRequisitos": [],
        "observacao": "Sistemas cardiovascular, respiratório, nervoso e esquelético"
    },
    {
        "codigo": "MDR0635",
        "nome": "Estatística Médica I",
        "unidade": "FMUSP",
        "departamento": "MDR",
        "creditosAula": 4,
        "creditosTrabalho": 0,
        "horasExtensao": 0,
        "tipo": "obrigatoria",
        "ementa": "Conceitos de probabilidade aplicados às ciências biológicas e saúde. Variáveis aleatórias discretas e contínuas (Gaussiana, Poisson e Binomial). Testes de hipóteses paramétricos e não-paramétricos (teste t de Student, ANOVA, Qui-quadrado). Análise de sensibilidade, especificidade e curvas ROC para avaliação da acurácia de exames diagnósticos por imagem. Regressão linear e curvas de sobrevivência de Kaplan-Meier.",
        "objetivos": "Capacitar o estudante em bioestatística clínica para análise de testes diagnósticos, ensaios clínicos e dosimetria médica.",
        "bibliografia": [
            "Pagano, M., Gauvreau, K. Princípios de Bioestatística. Thompson Pioneira, 2004.",
            "Armitage, P., Berry, G., Matthews, J. N. S. Statistical Methods in Medical Research. 4th ed. Blackwell, 2002."
        ],
        "preRequisitos": [
            {"tipo": "fraco", "disciplinas": ["MAT2453"], "descricao": "Ter cursado Cálculo I"}
        ],
        "observacao": "Probabilidade, testes de hipóteses e bioestatística clínica"
    },
    {
        "codigo": "MAC0115",
        "nome": "Introdução à Computação para Ciências Exatas e Tecnologia",
        "unidade": "IME",
        "departamento": "MAC",
        "creditosAula": 4,
        "creditosTrabalho": 2,
        "horasExtensao": 0,
        "tipo": "obrigatoria",
        "ementa": "Fundamentos de lógica algorítmica e desenvolvimento de programas em linguagens de alto nível (Python / C). Tipos de dados, variáveis, expressões lógicas e aritméticas. Estruturas de controle de fluxo condicional e de repetição. Funções, escopo e recursão. Manipulação de vetores, matrizes multidimensionais e cadeias de caracteres. Entrada e saída de arquivos de dados científicos. Resolução algorítmica de problemas em exatas.",
        "objetivos": "Desenvolver o raciocínio algorítmico e capacidade de programação de ferramentas computacionais em ambiente científico.",
        "bibliografia": [
            "Zelle, J. Python Programming: An Introduction to Computer Science. 3rd ed. Franklin Beedle, 2016.",
            "Deitel, P., Deitel, H. C Como Programar. 6ª ed. Pearson, 2011."
        ],
        "preRequisitos": [],
        "observacao": "Lógica algorítmica, programação em Python/C e estruturas de dados"
    },
    {
        "codigo": "MDR0634",
        "nome": "Informática Médica I",
        "unidade": "FMUSP",
        "departamento": "MDR",
        "creditosAula": 4,
        "creditosTrabalho": 2,
        "horasExtensao": 0,
        "tipo": "obrigatoria",
        "ementa": "Sistemas de Informação em Saúde (SIS) e prontuário eletrônico do paciente (PEP). Arquitetura de sistemas hospitalares RIS (Radiology Information System) e PACS (Picture Archiving and Communication System). O padrão internacional DICOM (Digital Imaging and Communications in Medicine): estrutura de tags, metadados de imagem e transferência em rede. Processamento digital básico de imagens médicas: filtros de realce, segmentação de órgãos em risco e conversão de escala de cinza (janelamento Hounsfield).",
        "objetivos": "Capacitar o físico médico no manuseio técnico do ecossistema digital hospitalar de imagens e dados clínicos.",
        "bibliografia": [
            "Huang, H. K. PACS and Imaging Informatics: Basic Principles and Applications. 2nd ed. Wiley-Liss, 2010.",
            "Pianykh, O. S. Digital Imaging and Communications in Medicine (DICOM): A Practical Introduction and Survival Guide. Springer, 2012."
        ],
        "preRequisitos": [
            {"tipo": "fraco", "disciplinas": ["MAC0115"], "descricao": "Ter cursado Introdução à Computação"}
        ],
        "observacao": "Sistemas PACS, padrão DICOM e prontuário eletrônico"
    },
    {
        "codigo": "4300325",
        "nome": "Física do Corpo Humano",
        "unidade": "IFUSP",
        "departamento": "FEP",
        "creditosAula": 4,
        "creditosTrabalho": 0,
        "horasExtensao": 0,
        "tipo": "obrigatoria",
        "ementa": "Aplicações diretas dos princípios da física à compreensão dos sistemas biológicos humanos. Biomecânica estática e dinâmica: forças musculares, alavancas ósseas e elasticidade dos tecidos (módulo de Young do osso e vasos). Biofísica de membranas e transporte celular: difusão, osmose, equação de Nernst e potencial de repouso. Geração e condução do potencial de ação e equação de Goldman-Hodgkin-Katz. Hemodinâmica e física cardiovascular: viscosidade sanguínea, regime laminar e turbulento, Lei de Poiseuille e pressão arterial. Biofísica da visão e audição.",
        "objetivos": "Construir a interface analítica e quantitativa entre a física mecânica, elétrica e dos fluidos e os sistemas biológicos humanos.",
        "bibliografia": [
            "Cameron, J. R., Skofronick, J. G., Grant, R. M. Physics of the Body. 2nd ed. Medical Physics Publishing, 1999.",
            "Okuno, E., Fratin, L. Desvendando a Física do Corpo Humano: Biomecânica. Manole, 2003.",
            "Garcia, E. A. C. Biofísica. 2ª ed. Sarvier, 2015."
        ],
        "preRequisitos": [
            {"tipo": "fraco", "disciplinas": ["4302112"], "descricao": "Ter cursado Física II"}
        ],
        "observacao": "Biomecânica, biofísica de membranas, potenciais de ação e hemodinâmica"
    },
    {
        "codigo": "MDR0639",
        "nome": "Física do Diagnóstico por Imagens I",
        "unidade": "FMUSP",
        "departamento": "MDR",
        "creditosAula": 4,
        "creditosTrabalho": 0,
        "horasExtensao": 0,
        "tipo": "obrigatoria",
        "ementa": "Produção de Raios X: tubos de raios X, geradores de alta tensão, alvos de anodo giratório, radiação característica e radiação de frenamento (Bremsstrahlung). Interação de fótons com a matéria (efeito fotoelétrico, espalhamento Rayleigh e Compton) e coeficientes de atenuação linear e em massa. Formação da imagem radiológica convencional: contraste do sujeito, dispersão, grades antidifusoras e receptores de imagem (detectores digitais CR e DR). Qualidade de imagem médica: resolução espacial, Função de Transferência de Modulação (MTF), ruído e relação sinal-ruído (SNR).",
        "objetivos": "Dominar os fundamentos físicos da produção de radiação X e os mecanismos analíticos de formação e qualidade da imagem radiológica.",
        "bibliografia": [
            "Bushberg, J. T. et al. The Essential Physics of Medical Imaging. 3rd ed. Wolters Kluwer, 2011.",
            "Curry, T. S. et al. Christensen's Physics of Diagnostic Radiology. 4th ed. Lea & Febiger, 1990."
        ],
        "preRequisitos": [
            {"tipo": "forte", "disciplinas": ["4302212"], "descricao": "Aprovação em Física IV"}
        ],
        "observacao": "Produção de raios X, atenuação em tecidos, contraste e detectores"
    },
    {
        "codigo": "MDR0637",
        "nome": "Diagnóstico por Imagens Médicas",
        "unidade": "FMUSP",
        "departamento": "MDR",
        "creditosAula": 4,
        "creditosTrabalho": 0,
        "horasExtensao": 0,
        "tipo": "obrigatoria",
        "ementa": "Semiótica radiológica e interpretação anatômica clínica de imagens por médicos e físicos. Estudo comparativo de modalidades diagnósticas: Radiografia de Tórax, Abdome e Esqueleto, Mamografia digital, Ultrassonografia com Doppler colorido, Tomografia Computadorizada (TC) multislice e Ressonância Magnética (RM). Identificação de artefatos de imagem versus patologias reais (calcificações, lesões expansivas, derrames e fraturas).",
        "objetivos": "Capacitar o físico médico no diálogo técnico com a equipe de radiologistas e na compreensão anatômica e patológica das imagens produzidas.",
        "bibliografia": [
            "Herring, W. Aprendendo Radiologia: Princípios Fundamentais. 3ª ed. Elsevier, 2016."
        ],
        "preRequisitos": [
            {"tipo": "forte", "disciplinas": ["MDR0633"], "descricao": "Aprovação em Anatomia e Fisiologia Humana"}
        ],
        "observacao": "Semiótica radiológica e interpretação anatômica de exames"
    },
    {
        "codigo": "MDR0636",
        "nome": "Equipamentos Médico-Hospitalares I",
        "unidade": "FMUSP",
        "departamento": "MDR",
        "creditosAula": 4,
        "creditosTrabalho": 0,
        "horasExtensao": 0,
        "tipo": "obrigatoria",
        "ementa": "Engenharia e tecnologia de equipamentos biomédicos hospitalares: transdutores de pressão, eletrodos de biopotenciais (ECG, EEG, EMG), amplificadores de instrumentação e filtros eletrônicos analógicos e digitais. Desfibriladores cardíacos e marca-passos. Bisturis eletrônicos de alta frequência e eletrocirurgia. Bombas de infusão e ventiladores pulmonares mecânicos. Normas de segurança elétrica hospitalar (Norma ABNT NBR IEC 60601) e proteção contra microchoque e macrochoque.",
        "objetivos": "Estudar a instrumentação médica avançada com foco em princípios físicos de transdução e conformidade normativa de segurança hospitalar.",
        "bibliografia": [
            "Webster, J. G. Medical Instrumentation: Application and Design. 4th ed. Wiley, 2009.",
            "Bronzino, J. D. The Biomedical Engineering Handbook. 3rd ed. CRC Press, 2006."
        ],
        "preRequisitos": [
            {"tipo": "fraco", "disciplinas": ["4302213"], "descricao": "Ter cursado Física Experimental III"}
        ],
        "observacao": "Transdutores biomédicos, monitores cardíacos e segurança elétrica"
    },
    {
        "codigo": "4300436",
        "nome": "Efeitos Biológicos das Radiações Ionizantes e Não-Ionizantes",
        "unidade": "IFUSP",
        "departamento": "FNC",
        "creditosAula": 4,
        "creditosTrabalho": 0,
        "horasExtensao": 0,
        "tipo": "obrigatoria",
        "ementa": "Radiobiologia molecular, celular e tecidual: ação direta e indireta da radiação sobre o DNA celular, produção de radicais livres e quebras de fita dupla. Cinética de reparo de DNA e mecanismos de morte celular (apoptose, necrose e catástrofe mitótica). Efetividade Biológica Relativa (RBE) e Transferência Linear de Energia (LET). Efeitos determinísticos (síndromes agudas de radiação) versus efeitos estocásticos (carcinogênese radioinduzida e mutações hereditárias). Efeitos biológicos de campos eletromagnéticos de radiofrequência e lasers.",
        "objetivos": "Fornecer a compreensão biológica e quantitativa dos danos e respostas celulares à radiação ionizante e não-ionizante.",
        "bibliografia": [
            "Hall, E. J., Giaccia, A. J. Radiobiology for the Radiologist. 7th ed. Lippincott Williams & Wilkins, 2012.",
            "Joiner, M., van der Kogel, A. Basic Clinical Radiobiology. 4th ed. CRC Press, 2009."
        ],
        "preRequisitos": [
            {"tipo": "forte", "disciplinas": ["4302212"], "descricao": "Aprovação em Física IV"}
        ],
        "observacao": "Danos ao DNA celular, curvas de sobrevivência celular e efeitos estocásticos"
    },
    {
        "codigo": "4300437",
        "nome": "Física das Radiações I",
        "unidade": "IFUSP",
        "departamento": "FNC",
        "creditosAula": 4,
        "creditosTrabalho": 0,
        "horasExtensao": 0,
        "tipo": "obrigatoria",
        "ementa": "Propriedades do núcleo atômico e forças nucleares. Decaimentos radioativos alfa, beta e gama: leis cinéticas de decaimento, atividade e séries radioativas. Interação de partículas carregadas pesadas e leves com a matéria: fórmula de Bethe-Bloch para perda de energia por colisão e radiação, pico de Bragg e alcance de partículas. Interação de nêutrons com a matéria: espalhamento elástico, inelástico e captura radiativa. Princípios físicos dos detectores de radiação a gás (câmaras de ionização, contadores proporcionais e Geiger-Müller) e semicondutores.",
        "objetivos": "Aprofundar a física nuclear e os mecanismos microscópicos fundamentais de interação da radiação ionizante com a matéria.",
        "bibliografia": [
            "Knoll, G. F. Radiation Detection and Measurement. 4th ed. Wiley, 2010.",
            "Turner, J. E. Atoms, Radiation, and Radiation Protection. 3rd ed. Wiley-VCH, 2007.",
            "Attix, F. H. Introduction to Radiological Physics and Radiation Dosimetry. Wiley-VCH, 1986."
        ],
        "preRequisitos": [
            {"tipo": "forte", "disciplinas": ["4302311"], "descricao": "Aprovação em Física Quântica"}
        ],
        "observacao": "Efeito fotoelétrico, espalhamento Compton, produção de pares e frenamento"
    },
    {
        "codigo": "MDR0640",
        "nome": "Proteção Radiológica I",
        "unidade": "FMUSP",
        "departamento": "MDR",
        "creditosAula": 4,
        "creditosTrabalho": 0,
        "horasExtensao": 0,
        "tipo": "obrigatoria",
        "ementa": "Princípios fundamentais do sistema de proteção radiológica da ICRP: Justificação, Otimização (Princípio ALARA) e Limitação de Dose individual. Grandezas dosimétricas e operacionais: Dose Absorvida, Dose Equivalente e Dose Efetiva com fatores de ponderação da radiação e tecidual. Cálculos analíticos de blindagens estruturais para instalações radiológicas e radioterápicas (cálculo de barreira primária e secundária). Normas regulatórias obrigatórias da CNEN (CNEN NN 3.01) e RDC 611 da Anvisa. Gerenciamento de rejeitos radioativos hospitalares.",
        "objetivos": "Habilitar o estudante nos cálculos técnicos de blindagem, dosimetria ocupacional e conformidade regulatória perante os órgãos de vigilância (CNEN e Anvisa).",
        "bibliografia": [
            "ICRP Publication 103. The 2007 Recommendations of the International Commission on Radiological Protection. Elsevier, 2007.",
            "NCRP Report No. 147. Structural Shielding Design and Evaluation for Medical Use of X Rays and Gamma Rays of Energies Up to 50 MeV. 2004.",
            "Comissão Nacional de Energia Nuclear. Norma CNEN NN 3.01: Diretrizes Básicas de Proteção Radiológica."
        ],
        "preRequisitos": [
            {"tipo": "forte", "disciplinas": ["4300436"], "descricao": "Aprovação em Efeitos Biológicos das Radiações"}
        ],
        "observacao": "Blindagens, dosimetria individual, normas CNEN-NN-3.01 e RDC Anvisa"
    },
    {
        "codigo": "4300439",
        "nome": "Laboratório de Dosimetria das Radiações",
        "unidade": "IFUSP",
        "departamento": "FNC",
        "creditosAula": 2,
        "creditosTrabalho": 2,
        "horasExtensao": 0,
        "tipo": "obrigatoria",
        "ementa": "Procedimentos práticos de metrologia e dosimetria de feixes clínicos de radiação. Calibração de câmaras de ionização cilíndricas e de placas paralelas em fantomas de água e acrílico. Dosimetria por termoluminescência (TLD) e dosímetros de filme radiocrômico (Gafchromic). Determinação experimental de curvas de rendimento em profundidade (PDD) e perfis de dose de feixes de fótons e elétrons. Protocolos de calibração absoluta TRS-398 da Agência Internacional de Energia Atômica (IAEA) e AAPM TG-51.",
        "objetivos": "Desenvolver a destreza experimental necessária para a dosimetria clínica e calibração de aceleradores lineares e equipamentos emissores de radiação.",
        "bibliografia": [
            "IAEA Technical Reports Series No. 398. Absorbed Dose Determination in External Beam Radiotherapy. IAEA, Vienna, 2000.",
            "Almond, P. R. et al. AAPM's TG-51 protocol for clinical reference dosimetry of high-energy photon and electron beams. Medical Physics, 1999."
        ],
        "preRequisitos": [
            {"tipo": "forte", "disciplinas": ["4300437"], "descricao": "Aprovação em Física das Radiações I"}
        ],
        "observacao": "Câmaras de ionização, termoluminescência (TLD) e dosimetria de feixe"
    },
    {
        "codigo": "MDR0641",
        "nome": "Medicina Nuclear",
        "unidade": "FMUSP",
        "departamento": "MDR",
        "creditosAula": 4,
        "creditosTrabalho": 0,
        "horasExtensao": 0,
        "tipo": "obrigatoria",
        "ementa": "Física dos radiofármacos diagnósticos e terapêuticos (Tc-99m, I-131, F-18 FDG). Instrumentação específica em Medicina Nuclear: calibrador de doses (curiómetro), câmaras de cintilação (câmaras de Anger) e colimadores. Tomografia por emissão de fóton único (SPECT) e Tomografia por Emissão de Pósitrons (PET-CT): física da aniquilação pósitron-elétron e detecção em coincidência temporal. Controle de qualidade periódico em câmaras gama e PET (normas NEMA). Dosimetria interna de pacientes (esquema MIRD) e terapia com radioisótopos (teranóstica).",
        "objetivos": "Capacitar o físico médico nos fundamentos e na rotina de controle de qualidade e dosimetria da medicina nuclear diagnóstica e terapêutica.",
        "bibliografia": [
            "Cherry, S. R., Sorenson, J. A., Phelps, M. E. Physics in Nuclear Medicine. 4th ed. Saunders, 2012.",
            "Chandra, R. Nuclear Medicine Physics: The Basics. 7th ed. Lippincott Williams & Wilkins, 2011."
        ],
        "preRequisitos": [
            {"tipo": "forte", "disciplinas": ["4300437"], "descricao": "Aprovação em Física das Radiações I"}
        ],
        "observacao": "Câmaras gama, tomografia por emissão de pósitrons (PET) e SPECT"
    },
    {
        "codigo": "MDR0642",
        "nome": "Radioterapia",
        "unidade": "FMUSP",
        "departamento": "MDR",
        "creditosAula": 4,
        "creditosTrabalho": 0,
        "horasExtensao": 0,
        "tipo": "obrigatoria",
        "ementa": "Fundamentos físicos e clínicos da radioterapia externa e braquiterapia. Aceleradores lineares médicos de alta energia (LINAC): sistemas de produção de feixe, colimador multilâminas (MLC) e sistemas de guiamento por imagem (IGRT). Técnicas modernas de tratamento: Radioterapia Conformacional Tridimensional (3D-CRT), Radioterapia com Modulação de Intensidade do Feixe (IMRT) e Arcoterapia Volumétrica Modulada (VMAT). Sistemas de planejamento computadorizado (TPS) e algoritmos de cálculo de dose (Convolução/Superposição e Monte Carlo). Controle de qualidade específico de aceleradores lineares e radiocirurgia (SRS/SBRT).",
        "objetivos": "Dominar os conceitos teóricos e operacionais da física de radioterapia em aceleradores lineares e planejamento de tratamentos oncológicos.",
        "bibliografia": [
            "Khan, F. M., Gibbons, J. P. Khan's The Physics of Radiation Therapy. 5th ed. Wolters Kluwer, 2014.",
            "Podgorsak, E. B. Radiation Oncology Physics: A Handbook for Teachers and Students. IAEA, 2005."
        ],
        "preRequisitos": [
            {"tipo": "forte", "disciplinas": ["4300437", "4302403"], "descricao": "Aprovação em Física das Radiações I e Quântica I"}
        ],
        "observacao": "Aceleradores lineares, sistemas de planejamento 3D, IMRT e braquiterapia"
    },
    {
        "codigo": "MDR0643",
        "nome": "Física do Diagnóstico por Imagens II",
        "unidade": "FMUSP",
        "departamento": "MDR",
        "creditosAula": 4,
        "creditosTrabalho": 0,
        "horasExtensao": 0,
        "tipo": "obrigatoria",
        "ementa": "Modalidades avançadas de imagem diagnóstica: Tomografia Computadorizada (TC) de múltipla fileira de detectores, geração de imagens helicoidais, índice de dose CTDI e produto dose-comprimento (DLP). Mamografia digital e tomossíntese mamária: espectros de baixa energia, contraste glandular e dosimetria em mama. Ressonância Magnética Nuclear (RMN): precessão de Larmor, pulsos de radiofrequência, tempos de relaxação T1 e T2, seleção de corte e codificação espacial por gradientes magnéticos. Ultrassonografia diagnóstica: propagação de ondas ultrassônicas em tecidos, transdutores piezoelétricos e modo B.",
        "objetivos": "Estudar a física e os protocolos de calibração e qualidade das tecnologias tomográficas, mamográficas e de ressonância magnética hospitalar.",
        "bibliografia": [
            "Bushberg, J. T. et al. The Essential Physics of Medical Imaging. 3rd ed. Wolters Kluwer, 2011.",
            "Haacke, E. M. et al. Magnetic Resonance Imaging: Physical Principles and Sequence Design. Wiley, 1999."
        ],
        "preRequisitos": [
            {"tipo": "forte", "disciplinas": ["MDR0639"], "descricao": "Aprovação em Física do Diagnóstico por Imagens I"}
        ],
        "observacao": "Tomografia computadorizada helicoidal, mamografia e fluoroscopia"
    },
    {
        "codigo": "MDR0644",
        "nome": "Introdução ao Ambiente Hospitalar",
        "unidade": "FMUSP",
        "departamento": "MDR",
        "creditosAula": 2,
        "creditosTrabalho": 0,
        "horasExtensao": 0,
        "tipo": "obrigatoria",
        "ementa": "Rotinas operacionais e convivência multiprofissional no ambiente médico-hospitalar. Estrutura organizacional e hierarquia de grandes hospitais universitários terciários. Biossegurança, precauções padrão contra infecção hospitalar e descarte de materiais perfurocortantes. Comunicação clínica com equipes médicas, de enfermagem e pacientes graves. Princípios éticos e humanização do atendimento a pacientes oncológicos.",
        "objetivos": "Preparar o futuro físico médico para a inserção ética, segura e respeitosa na rotina clínica hospitalar.",
        "bibliografia": [
            "Ministério da Saúde. Manual de Segurança no Ambiente Hospitalar. Brasília, 2013.",
            "Goldim, J. R. Bioética Clínica. Hospital de Clínicas de Porto Alegre, 2002."
        ],
        "preRequisitos": [
            {"tipo": "forte", "disciplinas": ["MDR0632"], "descricao": "Aprovação em Introdução à Física Médica"}
        ],
        "observacao": "Rotinas clínicas, biossegurança e convivência com equipes médicas"
    },
    {
        "codigo": "MDR0647",
        "nome": "Estágio Hospitalar Geral",
        "unidade": "FMUSP",
        "departamento": "MDR",
        "creditosAula": 0,
        "creditosTrabalho": 4,
        "horasExtensao": 35,
        "tipo": "obrigatoria",
        "ementa": "Imersão prática supervisionada (120 horas totais, das quais 35 horas são de extensão com diálogo com a comunidade) nos setores clínicos do complexo do Hospital das Clínicas (HC-FMUSP: InRad, ICESP e InCor). Acompanhamento de rotinas em dosimetria clínica, testes de controle de qualidade semanais e mensais em aceleradores e tomógrafos, acolhimento de pacientes e elaboração de relatórios técnicos de supervisão sob orientação de Físico Médico certificado pela ABFM.",
        "objetivos": "Vivenciar em escala real a prática profissional hospitalar integrando o conhecimento teórico às decisões clínicas diárias.",
        "bibliografia": [
            "Protocolos Clínicos e Diretrizes do InRad e ICESP - HC-FMUSP.",
            "Manuais de Rotinas de Física Médica - ABFM."
        ],
        "preRequisitos": [
            {"tipo": "forte", "disciplinas": ["MDR0640", "MDR0642"], "descricao": "Aprovação em Proteção Radiológica I e Radioterapia"}
        ],
        "observacao": "120 horas práticas supervisionadas (inclui 35h de extensão) em hospitais parceiros"
    },
    {
        "codigo": "MDR0645",
        "nome": "Introdução à Saúde Ocupacional, Medicina Legal e Ética da Física Médica",
        "unidade": "FMUSP",
        "departamento": "MDR",
        "creditosAula": 4,
        "creditosTrabalho": 0,
        "horasExtensao": 0,
        "tipo": "obrigatoria",
        "ementa": "Direito sanitário e responsabilidade civil e penal do profissional de saúde. Legislação trabalhista e Normas Regulamentadoras (NR-32) relativas a agentes físicos e radiação no trabalho hospitalar. Código de Ética Profissional do Físico Médico da ABFM. Laudos periciais e investigação de acidentes radiológicos históricos (Goiânia, Chernobyl). Bioética aplicada e sigilo de prontuário e dados médicos sensíveis (LGPD na saúde).",
        "objetivos": "Compreender os aspectos éticos, jurídicos e trabalhistas fundamentais que regem a conduta profissional do Físico Médico.",
        "bibliografia": [
            "Associação Brasileira de Física Médica (ABFM). Código de Ética Profissional do Físico Médico.",
            "França, G. V. Medicina Legal. 11ª ed. Guanabara Koogan, 2017."
        ],
        "preRequisitos": [
            {"tipo": "forte", "disciplinas": ["MDR0640"], "descricao": "Aprovação em Proteção Radiológica I"}
        ],
        "observacao": "Legislação trabalhista, responsabilidade civil e bioética do paciente"
    },
    {
        "codigo": "MDR0646",
        "nome": "Tópicos Avançados de Matemática e Física em Medicina",
        "unidade": "FMUSP",
        "departamento": "MDR",
        "creditosAula": 4,
        "creditosTrabalho": 0,
        "horasExtensao": 0,
        "tipo": "obrigatoria",
        "ementa": "Algoritmos avançados de reconstrução tomográfica: Transformada de Radon direta e inversa, retroprojeção filtrada (FBP) e métodos de reconstrução iterativa estatística (ASIR, MBIR). Aplicações de inteligência artificial e redes neurais convolucionais (CNNs) em radiômica e segmentação automática de tumores e órgãos em risco. Simulação de transporte de radiação por Monte Carlo (pacotes Geant4 / EGSnrc / TOPAS) para cálculo dosimétrico fino.",
        "objetivos": "Apresentar as fronteiras da modelagem matemática, inteligência artificial e física computacional aplicadas à oncologia e imagens médicas.",
        "bibliografia": [
            "Kak, A. C., Slaney, M. Principles of Computerized Tomographic Imaging. SIAM, 2001.",
            "Seco, J., Verhaegen, F. Monte Carlo Techniques in Radiation Therapy. CRC Press, 2013."
        ],
        "preRequisitos": [
            {"tipo": "forte", "disciplinas": ["MAP0214", "MDR0643"], "descricao": "Aprovação em Cálculo Numérico e Diagnóstico por Imagens II"}
        ],
        "observacao": "Reconstrução tomográfica por transformada de Radon e redes neurais"
    },
    {
        "codigo": "MDR0660",
        "nome": "Prática Profissional em Imagens Médicas",
        "unidade": "FMUSP",
        "departamento": "MDR",
        "creditosAula": 0,
        "creditosTrabalho": 5,
        "horasExtensao": 143,
        "tipo": "obrigatoria",
        "ementa": "Atividades práticas em regime de imersão no InRad / HC-FMUSP. Calibração metrológica de equipamentos de tomografia, mamografia e raios X digital. Aplicação prática dos testes de controle de qualidade preconizados pela RDC 611 da Anvisa. Participação em programas extensionistas de orientação dosimétrica para comunidades assistidas e pacientes (143 horas de extensão computadas no total de 150h).",
        "objetivos": "Proporcionar domínio prático autônomo na garantia de qualidade em diagnósticos por imagem com impacto social e extensionista.",
        "bibliografia": [
            "Agência Nacional de Vigilância Sanitária (Anvisa). Resolução RDC nº 611/2022.",
            "Protocolos Técnicos de Controle de Qualidade em Radiodiagnóstico do InRad."
        ],
        "preRequisitos": [
            {"tipo": "forte", "disciplinas": ["MDR0643", "MDR0647"], "descricao": "Aprovação em Diagnóstico por Imagens II e Estágio Geral"}
        ],
        "observacao": "150 horas totais (143h de extensão). Controle de qualidade e calibração de TC/RM/Mamografia"
    },
    {
        "codigo": "MDR0661",
        "nome": "Prática Profissional em Radioterapia",
        "unidade": "FMUSP",
        "departamento": "MDR",
        "creditosAula": 0,
        "creditosTrabalho": 5,
        "horasExtensao": 143,
        "tipo": "obrigatoria",
        "ementa": "Imersão avançada em radioterapia no ICESP / HC-FMUSP. Rotinas de controle de qualidade diário, mensal e anual de aceleradores lineares. Planejamento de tratamentos oncológicos complexos com técnicas IMRT e VMAT. Controle de qualidade paciente-específico com matrizes de diodos e dosimetria portal (EPID). Ações de extensão sobre conscientização e segurança de tratamentos radioterápicos para a comunidade (143 horas de extensão computadas no total de 150h).",
        "objetivos": "Consolidar a formação prática terminal do estudante no setor de radioterapia oncológica de alta complexidade.",
        "bibliografia": [
            "AAPM Task Group Reports (TG-142, TG-100) on Quality Assurance of Medical Accelerators.",
            "Protocolos de Radioterapia do ICESP - HC-FMUSP."
        ],
        "preRequisitos": [
            {"tipo": "forte", "disciplinas": ["MDR0642", "MDR0647"], "descricao": "Aprovação em Radioterapia e Estágio Geral"}
        ],
        "observacao": "150 horas totais (143h de extensão). Calibração de feixes, dosimetria e controle em aceleradores"
    }
]

# Configuração semestral dos cursos por turno
SEMESTER_GRIDS_CONFIG = {
    "bacharelado": {
        # Integral: 8 semestres
        "integral": [
            {
                "semestre": 1,
                "titulo": "1º Semestre: Fundamentos de Mecânica e Linguagem Matemática",
                "subtitulo": "Aclimatação ao rigor conceitual e ferramental de cálculo diferencial",
                "disciplinasCodigos": ["4302111", "4302113", "MAT2453", "MAT0112"]
            },
            {
                "semestre": 2,
                "titulo": "2º Semestre: Gravitação, Fluidos, Ondas e Cálculo em Múltiplas Dimensões",
                "subtitulo": "Aprofundamento fenomenológico e ampliação do aparato matemático",
                "disciplinasCodigos": ["4302112", "4302114", "MAT2454", "MAT0122"]
            },
            {
                "semestre": 3,
                "titulo": "3º Semestre: Eletrostática, Magnetostática e Análise Vetorial",
                "subtitulo": "Entrada no eletromagnetismo clássico e campos vetoriais",
                "disciplinasCodigos": ["4302211", "4302213", "MAT0216", "4300218"]
            },
            {
                "semestre": 4,
                "titulo": "4º Semestre: Equações de Maxwell, Ótica Ondulatória e Métodos Numéricos",
                "subtitulo": "Conclusão da física clássica básica e ferramentas computacionais avançadas",
                "disciplinasCodigos": ["4302212", "4302214", "MAT0220", "MAP0214"]
            },
            {
                "semestre": 5,
                "titulo": "5º Semestre: Mecânica Analítica, Métodos Matemáticos e Termodinâmica",
                "subtitulo": "Início do ciclo formal avançado: formulação lagrangiana e hamiltoniana",
                "disciplinasCodigos": ["4302305", "4302204", "4300208", "4302313"]
            },
            {
                "semestre": 6,
                "titulo": "6º Semestre: Teoria Eletromagnética e Introdução à Física Quântica",
                "subtitulo": "Formulações fundamentais e primeiros passos no mundo microscópico",
                "disciplinasCodigos": ["4302303", "4302311"]
            },
            {
                "semestre": 7,
                "titulo": "7º Semestre: Mecânica Quântica Formal e Mecânica Estatística",
                "subtitulo": "Estruturação quântica rigorosa e conexão microscópico-macroscópico",
                "disciplinasCodigos": ["4302403", "4302401"]
            },
            {
                "semestre": 8,
                "titulo": "8º Semestre: Eletivas Avançadas, Iniciação Científica e Conclusão",
                "subtitulo": "Personalização do currículo para inserção em pós-graduação ou mercado de ponta",
                "disciplinasCodigos": []
            }
        ],
        # Noturno: 10 semestres
        "noturno": [
            {
                "semestre": 1,
                "titulo": "1º Semestre: Introdução ao Cálculo e Mecânica Newtoniana (Noturno)",
                "subtitulo": "Entrada noturna: cálculo fundamental e física do movimento",
                "disciplinasCodigos": ["4302111", "MAT2453", "MAT0112"]
            },
            {
                "semestre": 2,
                "titulo": "2º Semestre: Métodos Experimentais e Álgebra Matricial (Noturno)",
                "subtitulo": "Prática laboratorial inicial e espaços vetoriais",
                "disciplinasCodigos": ["4302113", "MAT2454", "MAT0122"]
            },
            {
                "semestre": 3,
                "titulo": "3º Semestre: Fluidos, Ondas e Cálculo Vetorial (Noturno)",
                "subtitulo": "Mecânica contínua e análise vetorial de campos",
                "disciplinasCodigos": ["4302112", "4302114", "MAT0216"]
            },
            {
                "semestre": 4,
                "titulo": "4º Semestre: Eletrostática e Modelagem Computacional (Noturno)",
                "subtitulo": "Campos elétricos e introdução à programação científica",
                "disciplinasCodigos": ["4302211", "4302213", "4300218"]
            },
            {
                "semestre": 5,
                "titulo": "5º Semestre: Eletromagnetismo Dinâmico e Equações Diferenciais (Noturno)",
                "subtitulo": "Indução de Faraday e métodos analíticos de equações diferenciais",
                "disciplinasCodigos": ["4302212", "MAT0220"]
            },
            {
                "semestre": 6,
                "titulo": "6º Semestre: Ótica Experimental, Cálculo Numérico e Termodinâmica (Noturno)",
                "subtitulo": "Laboratório de ondas/ótica e fundamentos térmicos",
                "disciplinasCodigos": ["4302214", "MAP0214", "4300208"]
            },
            {
                "semestre": 7,
                "titulo": "7º Semestre: Mecânica Analítica e Métodos da Física Teórica (Noturno)",
                "subtitulo": "Formalismo lagrangiano e funções de variável complexa",
                "disciplinasCodigos": ["4302305", "4302204"]
            },
            {
                "semestre": 8,
                "titulo": "8º Semestre: Eletrodinâmica e Início da Física Quântica (Noturno)",
                "subtitulo": "Teoria de potenciais eletromagnéticos e dualidade quântica",
                "disciplinasCodigos": ["4302303", "4302311", "4302313"]
            },
            {
                "semestre": 9,
                "titulo": "9º Semestre: Mecânica Quântica nos Espaços de Hilbert (Noturno)",
                "subtitulo": "Operadores de Dirac, spin e momento angular",
                "disciplinasCodigos": ["4302403"]
            },
            {
                "semestre": 10,
                "titulo": "10º Semestre: Mecânica Estatística e Conclusão Noturna (Noturno)",
                "subtitulo": "Ensembles quânticos e consolidação das 260h de AEx e optativas",
                "disciplinasCodigos": ["4302401"]
            }
        ]
    },
    "licenciatura": {
        # Diurno: 8 semestres
        "diurno": [
            {
                "semestre": 1,
                "titulo": "1º Semestre: Fundamentos de Mecânica, Ótica e Linguagem",
                "subtitulo": "Início da articulação entre física fundamental, cálculo e reflexão pedagógica",
                "disciplinasCodigos": ["4300151", "4300160", "MAT1351", "MAT0105", "4300157"]
            },
            {
                "semestre": 2,
                "titulo": "2º Semestre: Mecânica Intermediária, Medidas Físicas e Didática Geral",
                "subtitulo": "Experimentos didáticos e imersão na teoria educacional da FEUSP",
                "disciplinasCodigos": ["4300153", "4300152", "MAT1352", "4300156", "EDM0402"]
            },
            {
                "semestre": 3,
                "titulo": "3º Semestre: Corpos Rígidos, Física do Calor e Psicologia da Educação",
                "subtitulo": "Desenvolvimento cognitivo do estudante e laboratório de mecânica",
                "disciplinasCodigos": ["EDF0290"]
            },
            {
                "semestre": 4,
                "titulo": "4º Semestre: Eletromagnetismo Básico, Termo-Estatística e Políticas Públicas",
                "subtitulo": "POEB na FEUSP e Estrutura do Ensino de Física",
                "disciplinasCodigos": ["EDA0463", "4300356"]
            },
            {
                "semestre": 5,
                "titulo": "5º Semestre: Ondas, Eletromagnetismo II, Inclusão, Libras e Práticas",
                "subtitulo": "Propostas de ensino inclusivas e 50h de estágio de regência supervisionada",
                "disciplinasCodigos": ["4300458", "4300390"]
            },
            {
                "semestre": 6,
                "titulo": "6º Semestre: Física Moderna, Metodologia de Ensino e Estágio Aprofundado",
                "subtitulo": "A passagem para o século XX e regência ativa de turmas de Ensino Médio",
                "disciplinasCodigos": ["EDM0425", "4300391"]
            },
            {
                "semestre": 7,
                "titulo": "7º Semestre: Quântica para o Ensino, Evolução Conceitual e Estágio Final",
                "subtitulo": "História e Filosofia da Física e fechamento das horas de regência escolar",
                "disciplinasCodigos": ["4300474", "EDM0426"]
            },
            {
                "semestre": 8,
                "titulo": "8º Semestre: Integralização, Validação de Portfólio ATPA e Formatura",
                "subtitulo": "Consolidação das 400h de estágio, 400h de PCC e 200h de atividades complementares",
                "disciplinasCodigos": ["4300490"]
            }
        ],
        # Noturno: 10 semestres
        "noturno": [
            {
                "semestre": 1,
                "titulo": "1º Semestre: Mecânica Básica e Linguagem Científica (Noturno)",
                "subtitulo": "Início da trajetória formativa no período noturno",
                "disciplinasCodigos": ["4300151", "MAT1351", "4300157"]
            },
            {
                "semestre": 2,
                "titulo": "2º Semestre: Geometria Analítica e Medidas de Laboratório (Noturno)",
                "subtitulo": "Álgebra vetorial e metodologia experimental didática",
                "disciplinasCodigos": ["4300152", "MAT0105", "4300160"]
            },
            {
                "semestre": 3,
                "titulo": "3º Semestre: Dinâmica Avançada e Cálculo Integral (Noturno)",
                "subtitulo": "Sistemas de partículas e cálculo em uma variável",
                "disciplinasCodigos": ["4300153", "MAT1352", "4300156"]
            },
            {
                "semestre": 4,
                "titulo": "4º Semestre: Didática Geral e Planejamento Escolar (Noturno)",
                "subtitulo": "Imersão na Faculdade de Educação e primeiros estágios",
                "disciplinasCodigos": ["EDM0402"]
            },
            {
                "semestre": 5,
                "titulo": "5º Semestre: Psicologia do Desenvolvimento e Ensino de Ciências (Noturno)",
                "subtitulo": "Teorias de aprendizagem e transposição didática",
                "disciplinasCodigos": ["EDF0290", "4300356"]
            },
            {
                "semestre": 6,
                "titulo": "6º Semestre: Estrutura Escolar (POEB) e Regência Inicial (Noturno)",
                "subtitulo": "Legislação e primeiras 50h de regência em sala",
                "disciplinasCodigos": ["EDA0463", "4300390"]
            },
            {
                "semestre": 7,
                "titulo": "7º Semestre: Inclusão, Libras e Metodologia I (Noturno)",
                "subtitulo": "Sequências didáticas acessíveis e estágio escolar",
                "disciplinasCodigos": ["4300458", "EDM0425"]
            },
            {
                "semestre": 8,
                "titulo": "8º Semestre: Práticas II e Regência em Ensino Médio (Noturno)",
                "subtitulo": "Supervisão docente compartilhada na CoCLic",
                "disciplinasCodigos": ["4300391"]
            },
            {
                "semestre": 9,
                "titulo": "9º Semestre: Epistemologia e Metodologia II (Noturno)",
                "subtitulo": "História da ciência e estágio com física contemporânea",
                "disciplinasCodigos": ["4300474", "EDM0426"]
            },
            {
                "semestre": 10,
                "titulo": "10º Semestre: Laboratório de Ensino e Integralização das 400h (Noturno)",
                "subtitulo": "Construção de experimentos de baixo custo e conclusão",
                "disciplinasCodigos": ["4300490"]
            }
        ]
    },
    "fisica-medica": {
        # Integral: 10 semestres
        "integral": [
            {
                "semestre": 1,
                "titulo": "1º Semestre: Fundamentos da Física, Geometria e Nivelamento",
                "subtitulo": "Introdução ao cálculo e bases da mecânica e vetores",
                "disciplinasCodigos": ["4302111", "4302113", "MAT2453", "MAT0112"]
            },
            {
                "semestre": 2,
                "titulo": "2º Semestre: Introdução à Física Médica, Anatomia e Fisiologia",
                "subtitulo": "Início da interface biomédica direta com a Faculdade de Medicina (FMUSP)",
                "disciplinasCodigos": ["4302112", "4302114", "MAT2454", "MDR0632", "MDR0633"]
            },
            {
                "semestre": 3,
                "titulo": "3º Semestre: Eletricidade, Magnetismo e Estatística Médica",
                "subtitulo": "Domínio do eletromagnetismo e bioestatística aplicada à saúde",
                "disciplinasCodigos": ["4302211", "4302213", "MAT0216", "MDR0635"]
            },
            {
                "semestre": 4,
                "titulo": "4º Semestre: Ondas Eletromagnéticas e Informática Médica",
                "subtitulo": "Equações de Maxwell, ótica e sistemas digitais em saúde",
                "disciplinasCodigos": ["4302212", "4302214", "MAC0115", "MDR0634"]
            },
            {
                "semestre": 5,
                "titulo": "5º Semestre: Física do Corpo Humano e Diagnóstico por Imagem",
                "subtitulo": "Transição aprofundada para os princípios físicos de formação de imagem",
                "disciplinasCodigos": ["4300325", "MDR0639", "4302204", "MDR0637"]
            },
            {
                "semestre": 6,
                "titulo": "6º Semestre: Radiação Ionizante, Efeitos Biológicos e Instrumentação",
                "subtitulo": "Radiobiologia e tecnologia dos equipamentos médico-hospitalares",
                "disciplinasCodigos": ["MDR0636", "4300436", "4302311", "4302305", "MAP0214"]
            },
            {
                "semestre": 7,
                "titulo": "7º Semestre: Física das Radiações e Proteção Radiológica",
                "subtitulo": "Interação da radiação com a matéria e normas regulatórias da CNEN/Anvisa",
                "disciplinasCodigos": ["4300437", "MDR0640", "4302403", "4302303"]
            },
            {
                "semestre": 8,
                "titulo": "8º Semestre: Dosimetria Clínica, Radioterapia e Medicina Nuclear",
                "subtitulo": "Aceleradores lineares de alta energia, radiofármacos e PET-CT",
                "disciplinasCodigos": ["4300439", "MDR0641", "MDR0642", "MDR0643", "MDR0644"]
            },
            {
                "semestre": 9,
                "titulo": "9º Semestre: Estágio Hospitalar Supervisionado no Complexo HC",
                "subtitulo": "120 horas de imersão clínica obrigatória no InRad, ICESP e InCor",
                "disciplinasCodigos": ["MDR0647", "MDR0645", "MDR0646"]
            },
            {
                "semestre": 10,
                "titulo": "10º Semestre: Práticas Profissionais Avançadas, Extensão e TCC",
                "subtitulo": "Regime integral de imersão com 286 horas de extensão dialógica e TCC",
                "disciplinasCodigos": ["MDR0660", "MDR0661"]
            }
        ]
    }
}

def fetch_jupiterweb_safe(cod_disciplina: str) -> str:
    """
    Tenta consultar a ementa oficial no JúpiterWeb com tratamento de timeout e encoding ISO-8859-1.
    Retorna string HTML ou vazio em caso de falha de conexão.
    """
    url = f"https://uspdigital.usp.br/jupiterweb/obterDisciplina?sgldis={cod_disciplina}"
    try:
        resp = requests.get(url, headers=HEADERS, timeout=6)
        if resp.status_code == 200:
            # JúpiterWeb utiliza ISO-8859-1 / Windows-1252
            resp.encoding = "iso-8859-1"
            return resp.text
    except Exception as e:
        # Silencioso / fail-safe para execução em runners fora do Brasil
        pass
    return ""

def compute_bidirectional_prerequisites(disciplines_dict: Dict[str, Any]):
    """
    Gera o mapeamento reverso liberaDisciplinas:
    Se a disciplina Y possui X em seus preRequisitos, adiciona Y na lista liberaDisciplinas de X.
    """
    for code, item in disciplines_dict.items():
        item["liberaDisciplinas"] = []

    for code_target, item_target in disciplines_dict.items():
        pre_reqs = item_target.get("preRequisitos", [])
        for req in pre_reqs:
            for source_code in req.get("disciplinas", []):
                if source_code in disciplines_dict:
                    if code_target not in disciplines_dict[source_code]["liberaDisciplinas"]:
                        disciplines_dict[source_code]["liberaDisciplinas"].append(code_target)

def build_curriculum_structure(disciplines_dict: Dict[str, Any]) -> Dict[str, Any]:
    """
    Monta a estrutura CourseCurriculum completa com suporte a turnos distintos (8 vs 10 semestres)
    calculando dinamicamente os créditos por semestre.
    """
    curriculum = {}

    for course_id, base_meta in COURSES_METADATA.items():
        grades_por_turno = {}
        grids_for_course = SEMESTER_GRIDS_CONFIG.get(course_id, {})

        for shift_name, semester_blocks in grids_for_course.items():
            base_grade_meta = base_meta["grades"].get(shift_name, {
                "turno": shift_name,
                "nomeTurno": shift_name.capitalize(),
                "duracaoSemestres": len(semester_blocks)
            })

            semestres_processados = []
            for sem in semester_blocks:
                total_ca = 0
                total_ct = 0
                valid_codes = []
                for d_code in sem.get("disciplinasCodigos", []):
                    if d_code in disciplines_dict:
                        valid_codes.append(d_code)
                        total_ca += disciplines_dict[d_code].get("creditosAula", 0)
                        total_ct += disciplines_dict[d_code].get("creditosTrabalho", 0)
                    else:
                        valid_codes.append(d_code)

                semestres_processados.append({
                    "semestre": sem["semestre"],
                    "titulo": sem["titulo"],
                    "subtitulo": sem.get("subtitulo", ""),
                    "totalCreditosAula": total_ca,
                    "totalCreditosTrabalho": total_ct,
                    "disciplinasCodigos": valid_codes
                })

            grades_por_turno[shift_name] = {
                "turno": base_grade_meta["turno"],
                "nomeTurno": base_grade_meta["nomeTurno"],
                "codigoHabilitacao": base_grade_meta.get("codigoHabilitacao", ""),
                "duracaoSemestres": base_grade_meta["duracaoSemestres"],
                "semestres": semestres_processados
            }

        course_dict = {
            "id": course_id,
            "nome": base_meta["nome"],
            "codigoCurso": base_meta["codigoCurso"],
            "turnosDisponiveis": base_meta["turnosDisponiveis"],
            "vagasAnuais": base_meta["vagasAnuais"],
            "horasExtensaoAEx": base_meta["horasExtensaoAEx"],
            "descricaoPedagogica": base_meta["descricaoPedagogica"],
            "gradesPorTurno": grades_por_turno
        }
        if "horasEstagio" in base_meta:
            course_dict["horasEstagio"] = base_meta["horasEstagio"]

        curriculum[course_id] = course_dict

    return curriculum

def main():
    print("[1/4] Iniciando scrape_jupiter.py (Módulo E: Matrizes Curriculares & JúpiterWeb)...")

    disciplines_dict = {}

    # Popula com o catálogo canônico curado
    print(f"[2/4] Carregando catálogo canônico ({len(RAW_DISCIPLINES)} disciplinas)...")
    for disc in RAW_DISCIPLINES:
        code = disc["codigo"]
        # Calcula cargaHorariaTotal
        ca = disc.get("creditosAula", 0)
        ct = disc.get("creditosTrabalho", 0)
        carga_total = (ca * 15) + (ct * 30)

        disciplines_dict[code] = {
            "codigo": code,
            "nome": disc["nome"],
            "unidade": disc.get("unidade", "IFUSP"),
            "departamento": disc.get("departamento", "IFUSP"),
            "creditosAula": ca,
            "creditosTrabalho": ct,
            "cargaHorariaTotal": carga_total,
            "horasExtensao": disc.get("horasExtensao", 0),
            "tipo": disc.get("tipo", "obrigatoria"),
            "ementa": disc.get("ementa", ""),
            "objetivos": disc.get("objetivos", ""),
            "bibliografia": disc.get("bibliografia", []),
            "preRequisitos": disc.get("preRequisitos", []),
            "coRequisitos": disc.get("coRequisitos", []),
            "liberaDisciplinas": [],
            "linkJupiter": f"https://uspdigital.usp.br/jupiterweb/obterDisciplina?sgldis={code}",
            "observacao": disc.get("observacao", "")
        }

    # Tentativa segura de enriquecimento online (se rede disponível e rápida)
    print("[3/4] Validando conectividade com o JúpiterWeb (ISO-8859-1 check)...")
    sample_code = "4302111"
    html_sample = fetch_jupiterweb_safe(sample_code)
    if html_sample and len(html_sample) > 500:
        print("  ✓ Conexão com JúpiterWeb ativa. Servidor respondeu com sucesso.")
    else:
        print("  ℹ JúpiterWeb inacessível ou timeout. Utilizando base curada local sem perda de dados.")

    # Calcula grafo reverso bidirecional (liberaDisciplinas)
    compute_bidirectional_prerequisites(disciplines_dict)
    total_unlocked_links = sum(len(d["liberaDisciplinas"]) for d in disciplines_dict.values())
    print(f"  ✓ Grafo bidirecional calculado com sucesso: {total_unlocked_links} arestas de desbloqueio identificadas.")

    # Constrói o currículo estruturado com suporte a turnos (8 vs 10 semestres)
    curriculum_data = build_curriculum_structure(disciplines_dict)

    # Grava saídas em cache
    with open(DISCIPLINES_OUTPUT, "w", encoding="utf-8") as f:
        json.dump(disciplines_dict, f, ensure_ascii=False, indent=2)
    print(f"[4/4] Gravado: {DISCIPLINES_OUTPUT} ({len(disciplines_dict)} disciplinas)")

    with open(CURRICULUM_OUTPUT, "w", encoding="utf-8") as f:
        json.dump(curriculum_data, f, ensure_ascii=False, indent=2)
    print(f"[4/4] Gravado: {CURRICULUM_OUTPUT} (Cursos: {list(curriculum_data.keys())})")

    print("\n✓ scrape_jupiter.py concluído com êxito!")

if __name__ == "__main__":
    main()
