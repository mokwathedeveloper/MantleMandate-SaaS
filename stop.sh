#!/usr/bin/env bash
cd "$(dirname "$0")"

echo "Stopping MantleMandate services..."

for pidfile in logs/backend.pid logs/celery.pid logs/frontend.pid; do
    if [ -f "$pidfile" ]; then
        pid=$(cat "$pidfile")
        kill "$pid" 2>/dev/null && echo "  Stopped PID $pid ($pidfile)" || true
        rm -f "$pidfile"
    fi
done

pkill -f "python run.py"    2>/dev/null || true
pkill -f "celery.*worker"   2>/dev/null || true
pkill -f "next dev"         2>/dev/null || true

docker compose down 2>/dev/null || true
echo "All services stopped."
