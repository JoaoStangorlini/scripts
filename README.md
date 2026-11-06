# Hub LabDiv & Fire TV Stick — Automação e Scripts

Coleção centralizada de utilitários de infraestrutura, scrapers acadêmicos, geradores de assets gráficos e rotinas de manutenção para o ecossistema do **Hub de Comunicação Científica Lab-Div**.

---

## 📁 Estrutura de Diretórios e Componentes

| Módulo / Categoria | Descrição | Principais Arquivos |
| :--- | :--- | :--- |
| **Infraestrutura & Fire TV Stick** | Deploy híbrido (LAN/Tunnel), watchdog 24/7, gerenciador de HDs USB e scripts de diagnóstico. | `deploy-firestick.sh`, `watchdog.sh`, `manage-hd.sh`, `status.sh`, `backup-portfolio.sh`, `enable-24-7.sh` |
| **Geração de Artes & Cartazes** | Scripts Puppeteer e Python para renderização e composição de cartazes, panfletos e mídias. | `build-poster*.js`, `generate-*-suite.js`, `assemble-poster-*.py`, `process-*-psd.py` |
| **Scrapers Acadêmicos** | Pipeline de extração, auditoria e sincronização de dados de docentes, espaços e eventos do IFUSP. | `scrapers/scrape_departments.py`, `scrapers/audit_departments.ts`, `scrapers/run_pipeline.ts` |
| **QA & Testes** | Validação automatizada de componentes e testes ponta a ponta (headless). | `qa/test-full-stack.ts`, `qa/test-headless-components.tsx` |

---

## ⚙️ Configuração de Ambiente

Para executar os scripts de deploy e manutenção do Fire Stick localmente:

1. Copie o arquivo de exemplo para criar seu ambiente local:
   ```bash
   cp .env.example .env
   ```

2. Ajuste as variáveis de acordo com a sua rede e dispositivo:
   ```bash
   FIRESTICK_USER="u0_a000"
   FIRESTICK_HOST="192.168.0.x"
   FIRESTICK_PORT="8022"
   FIRESTICK_DIR="/data/data/com.termux/files/home/hub-storage-server"
   FIRESTICK_STORAGE_DIR="/storage/XXXX-XXXX/Android/data/com.termux/files/hub_data"
   REMOTE_ORIGIN="https://storage.exemplo.com"
   ```

3. Os scripts carregam automaticamente o `.env` (ou `.env.local`) presente no diretório.

---

## 🚀 Uso Rápido

### Diagnóstico e Status do Fire TV Stick
```bash
./status.sh
```

### Deploy do Servidor de Armazenamento
```bash
./deploy-firestick.sh          # Auto-detecta LAN ou túnel Cloudflare
./deploy-firestick.sh --local  # Força deploy via LAN SSH
./deploy-firestick.sh --remote # Força deploy via HTTPS/Cloudflare Tunnel
```

### Gerenciamento de HDs USB
```bash
./manage-hd.sh
```

### Executar Pipeline de Raspagem IFUSP
```bash
cd scrapers
npm install # ou bun/pnpm
python3 scrape_departments.py
npx tsx run_pipeline.ts
```

---

## 📄 Licença
Distribuído sob licença AGPLv3 / MIT conforme os cabeçalhos de cada arquivo.

