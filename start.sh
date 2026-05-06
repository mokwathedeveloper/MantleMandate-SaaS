#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
info()  { echo -e "${BLUE}[INFO]${NC}  $*"; }
ok()    { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
die()   { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

# ── 1. Docker ─────────────────────────────────────────────────────────────────
info "Starting Docker services (postgres + redis)..."
if ! docker info &>/dev/null; then
    die "Cannot reach Docker daemon. Run:\n  sudo usermod -aG docker \$USER\n  newgrp docker\nthen re-run this script."
fi

docker compose up -d
info "Waiting for postgres to be healthy..."
until docker compose exec -T postgres pg_isready -U mantlemandate &>/dev/null; do
    printf '.'
    sleep 2
done
echo ""
ok "Postgres is ready"

info "Waiting for redis..."
until docker compose exec -T redis redis-cli ping 2>/dev/null | grep -q PONG; do
    printf '.'
    sleep 1
done
echo ""
ok "Redis is ready"

# ── 2. Backend migrations ─────────────────────────────────────────────────────
info "Running database migrations..."
cd backend
FLASK=venv/bin/flask
PYTHON=venv/bin/python
CELERY=venv/bin/celery

# First-time init — only if env.py is missing
if [ ! -f migrations/env.py ]; then
    rm -rf migrations
    $FLASK db init
fi
$FLASK db migrate -m "schema $(date +%Y%m%d%H%M%S)" 2>/dev/null || true
$FLASK db upgrade
ok "Migrations complete"

# ── 3. Start backend (background) ─────────────────────────────────────────────
info "Starting Flask backend on :5000..."
pkill -f "python run.py" 2>/dev/null || true
mkdir -p ../logs
nohup $PYTHON run.py > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > ../logs/backend.pid
sleep 5
if curl -sf http://localhost:5000/api/health &>/dev/null; then
    ok "Backend running (PID $BACKEND_PID)"
else
    warn "Backend may still be starting — check logs/backend.log"
fi

# ── 4. Start Celery worker (background) ───────────────────────────────────────
info "Starting Celery worker..."
pkill -f "celery.*worker" 2>/dev/null || true
nohup $CELERY -A celery_worker.celery worker --loglevel=warning > ../logs/celery.log 2>&1 &
echo $! > ../logs/celery.pid
ok "Celery worker started"

cd ..

# ── 5. Start frontend ─────────────────────────────────────────────────────────
info "Starting Next.js frontend on :3000..."
cd frontend
pkill -f "next dev" 2>/dev/null || true
mkdir -p ../logs
nohup npm run dev > ../logs/frontend.log 2>&1 &
echo $! > ../logs/frontend.pid
sleep 5
ok "Frontend starting — open http://localhost:3000"

cd ..

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  MantleMandate is running!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "  Frontend  → ${BLUE}http://localhost:3000${NC}"
echo -e "  API       → ${BLUE}http://localhost:5000/api/health${NC}"
echo -e "  Logs dir  → ${BLUE}$(pwd)/logs/${NC}"
echo ""
echo -e "  Stop all: ${YELLOW}./stop.sh${NC}"
