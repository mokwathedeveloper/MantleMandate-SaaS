"""
Creates a demo GIF from the captured screenshots.
Each frame is held for 3 seconds so judges can read the content.
"""
from PIL import Image
import os, glob

FRAMES_DIR = os.path.dirname(__file__)
OUT_GIF    = os.path.join(FRAMES_DIR, "../demo-video.gif")

LABELS = {
    "01-login.png":         "Step 1 — Login: Secure authentication with email/password or OAuth",
    "02-dashboard.png":     "Step 2 — Dashboard: Real-time portfolio KPIs, P&L chart, active agents",
    "03-mandates.png":      "Step 3 — Mandates: Plain-English trading strategies, AI-parsed & on-chain",
    "04-new-mandate.png":   "Step 4 — Create Mandate: Write a rule in plain English → Claude AI parses it",
    "05-mandate-detail.png":"Step 5 — Anchor On-Chain: Policy hash submitted to MandatePolicy contract",
    "06-agents.png":        "Step 6 — AI Agents: Autonomous execution agents on Mantle Network",
    "07-deploy-agent.png":  "Step 7 — Deploy Agent: Bind agent to mandate → register in AgentExecutor",
    "08-audit.png":         "Step 8 — Audit Trail: Every OrderExecuted event from Mantle Sepolia live",
    "09-portfolio.png":     "Step 9 — Portfolio: Real-time P&L, win rate, position tracking",
    "10-risk.png":          "Step 10 — Risk Engine: On-chain policy enforcement, exposure limits",
}

TARGET_W = 1280

frames = []
for fname, label in LABELS.items():
    path = os.path.join(FRAMES_DIR, fname)
    if not os.path.exists(path):
        print(f"  SKIP (not found): {fname}")
        continue

    img = Image.open(path).convert("RGB")

    # Scale to uniform width, maintain aspect ratio
    w, h   = img.size
    new_h  = int(h * TARGET_W / w)
    img    = img.resize((TARGET_W, new_h), Image.LANCZOS)

    # Crop to max 900px height so the GIF stays compact
    img = img.crop((0, 0, TARGET_W, min(new_h, 900)))

    frames.append(img.convert("P", palette=Image.ADAPTIVE, colors=256))
    print(f"  ✓ {fname} ({TARGET_W}×{img.height})")

if not frames:
    raise SystemExit("No frames found — check demo-frames/ directory")

frames[0].save(
    OUT_GIF,
    save_all=True,
    append_images=frames[1:],
    duration=3000,   # 3 seconds per slide
    loop=0,
    optimize=True,
)

size_kb = os.path.getsize(OUT_GIF) // 1024
print(f"\n✅  demo-video.gif saved ({len(frames)} slides, {size_kb} KB)")
print(f"   → {os.path.abspath(OUT_GIF)}")
