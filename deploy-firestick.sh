#!/usr/bin/env bash
# ==============================================================================
# Hub de Comunicação Científica Lab-Div V3.0 — Fire Stick Storage & Portfolio Portal
# Copyright (C) 2026 João Paulo Stangorlini de Carvalho
# Licença: Affero GNU (AGPLv3)
# ==============================================================================
#
# Deploy Híbrido Automático:
# - Se estiver na rede Wi-Fi de casa (LAN acessível): faz deploy instantâneo via SSH (porta 8022).
# - Se estiver fora de casa (4G, faculdade, viagem): faz deploy seguro via HTTPS direto
#   pelo túnel Cloudflare (https://storage.hublabdiv.com.br/api/admin/remote-deploy).
#
# Uso:
#   ./deploy-firestick.sh               # Modo automático (auto-detecta LAN em 1s)
#   ./deploy-firestick.sh --remote      # Força deploy remoto via HTTPS
#   ./deploy-firestick.sh --local       # Força deploy local via LAN SSH
#   NEW_ADMIN_PASSWORD="xxx" ./deploy-firestick.sh
# ==============================================================================

set -euo pipefail

# Carrega variáveis locais de ambiente se existir arquivo de configuração
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -f "${SCRIPT_DIR}/.env" ]; then
  # shellcheck disable=SC1091
  source "${SCRIPT_DIR}/.env"
elif [ -f "${SCRIPT_DIR}/.env.local" ]; then
  # shellcheck disable=SC1091
  source "${SCRIPT_DIR}/.env.local"
fi


SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -f "$SCRIPT_DIR/server.js" ]; then
  PROJECT_ROOT="$SCRIPT_DIR"
elif [ -f "$SCRIPT_DIR/../server.js" ]; then
  PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
else
  PROJECT_ROOT="$SCRIPT_DIR"
fi
cd "$PROJECT_ROOT"

FIRESTICK_USER="${FIRESTICK_USER:-u0_a000}"
FIRESTICK_HOST="${FIRESTICK_HOST:-}"
FIRESTICK_PORT="${FIRESTICK_PORT:-8022}"
FIRESTICK_DIR="${FIRESTICK_DIR:-/data/data/com.termux/files/home/hub-storage-server}"
DEFAULT_USB_STORAGE="${FIRESTICK_STORAGE_DIR:-/storage/XXXX-XXXX/Android/data/com.termux/files/hub_data}"
REMOTE_ORIGIN="${REMOTE_ORIGIN:-https://storage.hublabdiv.com.br}"
NEW_ADMIN_PASSWORD="${NEW_ADMIN_PASSWORD:-}"

FORCED_MODE=""
for arg in "$@"; do
  case "$arg" in
    --remote|-r)
      FORCED_MODE="remote"
      ;;
    --local|-l)
      FORCED_MODE="local"
      ;;
    --help|-h)
      echo "Uso: $0 [--local | --remote]"
      echo "  --local, -l   Força deploy local via LAN SSH (:)"
      echo "  --remote, -r  Força deploy remoto via HTTPS (https://storage.hublabdiv.com.br)"
      echo "  (sem flags)   Auto-detecta presença na rede local em 1 segundo"
      exit 0
      ;;
  esac
done

echo "======================================================================"
echo " Fire Stick Portal v2.0 — Deploy Híbrido Automático (Casa / Remoto)"
echo "======================================================================"

# 1. Validação sintática local antes do envio
for required_file in package.json server.js public/index.html public/styles.css public/app.js; do
  if [ ! -f "$required_file" ]; then
    echo "[ERRO] Arquivo obrigatório ausente: $required_file" >&2
    exit 1
  fi
done

if command -v node >/dev/null 2>&1; then
  node --check server.js
  node --check public/app.js
  echo "[OK] Validação sintática local (server.js & public/app.js) aprovada."
fi

# 2. Resolução do modo de conexão (LAN vs Remoto HTTPS)
DEPLOY_MODE="$FORCED_MODE"

if [ -z "$DEPLOY_MODE" ]; then
  echo "[Rede] Testando conectividade com o Fire Stick na rede local (${FIRESTICK_HOST}:${FIRESTICK_PORT})..."
  if nc -z -w 1 "$FIRESTICK_HOST" "$FIRESTICK_PORT" 2>/dev/null; then
    DEPLOY_MODE="local"
    echo "[Rede] Fire Stick detectado na LAN de casa! Usando deploy local via SSH."
  else
    DEPLOY_MODE="remote"
    echo "[Rede] Fire Stick não respondeu na LAN local. Chaveando automaticamente para Deploy Remoto HTTPS."
  fi
else
  echo "[Rede] Modo forçado pelo usuário: ${DEPLOY_MODE^^}"
fi

echo "======================================================================"

# ==============================================================================
# MODO A: DEPLOY LOCAL VIA SSH (REDE WI-FI DE CASA)
# ==============================================================================
if [ "$DEPLOY_MODE" = "local" ]; then
  echo " Destino SSH : ${FIRESTICK_USER}@${FIRESTICK_HOST}:${FIRESTICK_PORT}"
  echo " Diretório   : ${FIRESTICK_DIR}"
  echo "======================================================================"

  read -r -d '' REMOTE_SCRIPT << 'EOF_REMOTE' || true
set -euo pipefail

REMOTE_DIR="$1"
FALLBACK_STORAGE="$2"
CUSTOM_ADMIN_PASS="$3"

mkdir -p "$REMOTE_DIR" "$REMOTE_DIR/data"
cd "$REMOTE_DIR"

# Backup do server.js anterior antes de extrair a nova versão
if [ -f "server.js" ]; then
  cp -f "server.js" "server.js.bak"
  echo "[Termux] Backup criado em ${REMOTE_DIR}/server.js.bak"
fi

# Extrai arquivos atualizados preservando dados e túnel
tar xzf -
echo "[Termux] Arquivos v2.0 extraídos com sucesso (run_tunnel.sh e boot preservados)."

# Valida sintaxe no Node do próprio Termux; faz rollback se falhar
if ! node --check "$REMOTE_DIR/server.js"; then
  echo "[ERRO] Falha de sintaxe no Node do Termux! Restaurando server.js.bak..." >&2
  if [ -f "server.js.bak" ]; then
    cp -f "server.js.bak" "server.js"
  fi
  exit 1
fi

# Preserva .env existente
if [ ! -f ".env" ]; then
  echo "[AVISO] .env não encontrado em ${REMOTE_DIR}. Criando estrutura base..."
  cat > .env <<EOT
PORT=8080
BIND_HOST=127.0.0.1
STORAGE_DIR=${FALLBACK_STORAGE}
INTERNAL_DATA_DIR=${REMOTE_DIR}/data
PORTFOLIO_TITLE=JOÃO PAULO STANGORLINI — PORTFOLIO
EOT
  chmod 600 .env || true
fi

if ! grep -q '^INTERNAL_DATA_DIR=' .env 2>/dev/null; then
  printf '\nINTERNAL_DATA_DIR=%s/data\n' "$REMOTE_DIR" >> .env
fi

if ! grep -q '^SESSION_SECRET=' .env 2>/dev/null; then
  GEN_SESSION="$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")"
  printf 'SESSION_SECRET=%s\n' "$GEN_SESSION" >> .env
fi

GENERATED_PASS_NOTICE=""
if [ -n "$CUSTOM_ADMIN_PASS" ]; then
  grep -v '^ADMIN_PASSWORD=' .env > .env.tmp || true
  mv -f .env.tmp .env
  printf 'ADMIN_PASSWORD=%s\n' "$CUSTOM_ADMIN_PASS" >> .env
  echo "[Termux] ADMIN_PASSWORD atualizada conforme solicitado."
elif ! grep -q '^ADMIN_PASSWORD=' .env 2>/dev/null; then
  GEN_ADMIN_PASS="$(node -e "console.log(require('crypto').randomBytes(9).toString('base64url'))")"
  printf 'ADMIN_PASSWORD=%s\n' "$GEN_ADMIN_PASS" >> .env
  GENERATED_PASS_NOTICE="$GEN_ADMIN_PASS"
fi
chmod 600 .env 2>/dev/null || true

ACTUAL_PORT="$(grep -E '^PORT=' .env | tail -n 1 | cut -d '=' -f2- | tr -d '\r" ' || true)"
ACTUAL_PORT="${ACTUAL_PORT:-8080}"

# Reinicia EXCLUSIVAMENTE o processo node server.js
for pid in $(pgrep -x node 2>/dev/null || true); do
  cmdline="$(tr '\0' ' ' < "/proc/$pid/cmdline" 2>/dev/null || ps -p "$pid" -o args= 2>/dev/null || true)"
  case "$cmdline" in
    *server.js*)
      echo "[Termux] Reiniciando processo antigo node server.js (PID $pid)..."
      kill "$pid" 2>/dev/null || true
      for _ in 1 2 3 4 5; do
        kill -0 "$pid" 2>/dev/null || break
        sleep 0.4
      done
      kill -9 "$pid" 2>/dev/null || true
      ;;
  esac
done

nohup node --max-old-space-size=160 "$REMOTE_DIR/server.js" >> "$REMOTE_DIR/server.log" 2>&1 < /dev/null &
NEW_NODE_PID=$!
sleep 2

if ! kill -0 "$NEW_NODE_PID" 2>/dev/null; then
  echo "[ERRO] O processo node server.js encerrou inesperadamente. Últimas linhas do server.log:" >&2
  tail -n 25 "$REMOTE_DIR/server.log" >&2 || true
  exit 1
fi

if command -v curl >/dev/null 2>&1; then
  HEALTH_JSON="$(curl -sf "http://127.0.0.1:${ACTUAL_PORT}/health" || true)"
  echo "[Termux] Healthcheck local: ${HEALTH_JSON:-sem resposta}"
fi

if [ -n "$GENERATED_PASS_NOTICE" ]; then
  echo "======================================================================"
  echo " [IMPORTANTE] ADMIN_PASSWORD: ${GENERATED_PASS_NOTICE}"
  echo "======================================================================"
fi

echo "[SUCESSO] Portal Storage & Portfólio v2.0 ativo no Fire Stick (PID ${NEW_NODE_PID})!"
EOF_REMOTE

  echo "[Deploy] Conectando via SSH e enviando pacote compactado..."
  tar czf - package.json server.js .env.example public scripts node_modules/fflate | \
    ssh -p "$FIRESTICK_PORT" -i ~/.ssh/id_ed25519 -o StrictHostKeyChecking=no "${FIRESTICK_USER}@${FIRESTICK_HOST}" \
    "bash -c $(printf '%q' "$REMOTE_SCRIPT") -- $(printf '%q' "$FIRESTICK_DIR") $(printf '%q' "$DEFAULT_USB_STORAGE") $(printf '%q' "$NEW_ADMIN_PASSWORD")"

  echo "======================================================================"
  echo " Deploy local concluído! Acesse: ${REMOTE_ORIGIN}"
  echo "======================================================================"
  exit 0
fi

# ==============================================================================
# MODO B: DEPLOY REMOTO VIA HTTPS (FORA DE CASA — CLOUDFLARE TUNNEL)
# ==============================================================================
echo " Destino HTTPS : ${REMOTE_ORIGIN}/api/admin/remote-deploy"
echo "======================================================================"

# Obtém a chave de autenticação a partir de variável de ambiente ou do arquivo .env local
DEPLOY_TOKEN="${DEPLOY_KEY:-${API_SECRET_KEY:-${ADMIN_PASSWORD:-}}}"

if [ -z "$DEPLOY_TOKEN" ] && [ -f ".env" ]; then
  DEPLOY_TOKEN="$(grep -E '^(DEPLOY_KEY|API_SECRET_KEY|ADMIN_PASSWORD)=' .env | head -n 1 | cut -d '=' -f2- | tr -d '\r"'\'' ' || true)"
fi

if [ -z "$DEPLOY_TOKEN" ]; then
  echo "[ERRO] Nenhuma chave de deploy encontrada!" >&2
  echo "Defina DEPLOY_KEY no seu ambiente ou no arquivo .env local." >&2
  exit 1
fi

TMP_BUNDLE="/tmp/firestick-remote-deploy-$$.tar.gz"
trap 'rm -f "$TMP_BUNDLE"' EXIT

echo "[Pacote] Empacotando arquivos de código atualizados (server.js, public/, scripts/, package.json, fflate)..."
tar -czf "$TMP_BUNDLE" \
  --exclude='.git' \
  --exclude='data/thumbs' \
  --exclude='data/catalog.json' \
  package.json server.js .env.example public scripts data/disk_snapshot.json node_modules/fflate

BUNDLE_SIZE_KB="$(du -k "$TMP_BUNDLE" | cut -f1)"
echo "[Pacote] Pacote gerado com sucesso: ${BUNDLE_SIZE_KB} KB"

echo "[Envio] Transmitindo pacote via HTTPS com autenticação segura para o túnel Cloudflare..."
RESP_BODY="$(mktemp)"
trap 'rm -f "$TMP_BUNDLE" "$RESP_BODY"' EXIT

HTTP_STATUS="$(curl -s -w "%{http_code}" -o "$RESP_BODY" \
  -X POST \
  -H "x-deploy-key: ${DEPLOY_TOKEN}" \
  -H "Content-Type: application/octet-stream" \
  --data-binary @"$TMP_BUNDLE" \
  --max-time 60 \
  "${REMOTE_ORIGIN}/api/admin/remote-deploy" || true)"

if [ "$HTTP_STATUS" != "200" ]; then
  echo "[ERRO] O servidor respondeu com HTTP ${HTTP_STATUS}:" >&2
  cat "$RESP_BODY" >&2
  echo "" >&2
  exit 1
fi

echo "[OK] Resposta do Servidor:"
cat "$RESP_BODY"
echo ""

echo "----------------------------------------------------------------------"
echo "[Aguardando] Servidor remoto reiniciando de forma limpa..."
sleep 2

# Polling de validação com /api/status
STATUS_OK=0
for i in {1..12}; do
  printf "Verificando se o servidor voltou online (tentativa %d/12)... " "$i"
  STATUS_RESP="$(curl -s --max-time 4 "${REMOTE_ORIGIN}/api/status" 2>/dev/null || true)"
  if [[ "$STATUS_RESP" == *"\"status\":\"ok\""* ]]; then
    echo "ONLINE!"
    echo "[Telemetria] ${STATUS_RESP}"
    STATUS_OK=1
    break
  fi
  echo "aguardando..."
  sleep 1.5
done

if [ "$STATUS_OK" -eq 1 ]; then
  echo "======================================================================"
  echo " [SUCESSO] Deploy remoto finalizado e confirmado com HTTP 200 OK!"
  echo " Acesse seu portal de qualquer lugar: ${REMOTE_ORIGIN}"
  echo "======================================================================"
else
  echo "[AVISO] O deploy foi entregue, mas o healthcheck demorou a responder."
  echo "Verifique o status em: ${REMOTE_ORIGIN}/api/status"
fi
