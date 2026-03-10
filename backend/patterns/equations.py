"""
Pure mathematical pattern generators.

These functions ONLY generate curves.

They do NOT:
- send to robot
- build XYZ coordinates
- create URScript

Those steps happen later in the pipeline.
"""

import numpy as np


# same constants as original project
NUM_WAYPOINTS = 800
SCALE = 300



def _norm(arr):
    """Normalize array to [-1, +1] range."""
    lo, hi = arr.min(), arr.max()
    return arr if (hi - lo) < 1e-9 else 2.0 * (arr - lo) / (hi - lo) - 1.0


def eq_heart():
    """Heart curve."""
    t = np.linspace(0, 2 * np.pi, NUM_WAYPOINTS)
    u = 16 * np.sin(t) ** 3
    v = (13 * np.cos(t)
         - 5 * np.cos(2 * t)
         - 2 * np.cos(3 * t)
         - np.cos(4 * t))
    return {"label": "heart", "u": u, "v": v}


def eq_infinity():
    """Infinity / Lemniscate."""
    t = np.linspace(0, 2 * np.pi, NUM_WAYPOINTS)
    u = np.cos(t) / (1 + np.sin(t)**2)
    v = np.sin(t) * np.cos(t) / (1 + np.sin(t)**2)
    return {"label": "infinity", "u": u, "v": v}


def eq_infinity_multi():
    """Multi-level Infinity (concentric lemniscate layers)."""
    a0 = 4.0              # Largest infinity size
    shrink = 0.7          # Scale reduction factor per level
    levels = 4            # Number of concentric curves
    STRETCH_X = 3.0       # Horizontal stretch (>1 = wider)
    STRETCH_Y = 3.0       # Vertical stretch (compensated for sin*cos range)

    t = np.linspace(0, 2 * np.pi, NUM_WAYPOINTS)
    u_all, v_all = [], []
    for k in range(levels):
        a = a0 * (shrink ** k)
        x_level = STRETCH_X * a * np.cos(t)
        y_level = STRETCH_Y * a * np.sin(t) * np.cos(t)
        u_all.extend(x_level)
        v_all.extend(y_level)
    return {"label": "infinity_multi", "u": np.array(u_all), "v": np.array(v_all)}


def eq_circle():
    """Circle."""
    t = np.linspace(0, 2 * np.pi, NUM_WAYPOINTS)
    return {"label": "circle", "u": np.cos(t), "v": np.sin(t)}


def eq_butterfly():
    """Butterfly curve."""
    t = np.linspace(0, 2 * np.pi, NUM_WAYPOINTS)
    e = np.exp(np.cos(t)) - 2 * np.cos(4 * t) - np.sin(t / 12) ** 5
    u = np.sin(t) * e
    v = np.cos(t) * e
    return {"label": "butterfly", "u": u, "v": v}


def eq_rose():
    """Rose curve (5 petals)."""
    t = np.linspace(0, 2 * np.pi, NUM_WAYPOINTS)
    n = 5
    r = np.cos(n * t)
    u = r * np.cos(t)
    v = r * np.sin(t)
    return {"label": "rose", "u": u, "v": v}


def eq_spiral():
    """Archimedean spiral (2 loops)."""
    t = np.linspace(0, 4 * np.pi, NUM_WAYPOINTS)
    u = t * np.cos(t)
    v = t * np.sin(t)
    return {"label": "spiral", "u": u, "v": v}


def eq_lorenz():
    """Lorenz Attractor (3D butterfly chaotic system)."""
    s, r, b = 10.0, 28.0, 2.667
    dt = 0.01
    xyzs = np.empty((NUM_WAYPOINTS + 1, 3))
    xyzs[0] = (0., 1., 1.05)

    for i in range(NUM_WAYPOINTS):
        x, y, z = xyzs[i]
        xyzs[i + 1] = xyzs[i] + np.array([
            s * (y - x),
            r * x - y - x * z,
            x * y - b * z
        ]) * dt

    att = xyzs[1:, :]
    u = _norm(att[:, 0]) * SCALE
    v = _norm(att[:, 1]) * SCALE
    w = _norm(att[:, 2]) * SCALE
    return {"label": "lorenz", "u": u, "v": v, "w": w}


def eq_aizawa():
    """Aizawa Attractor (3D spherical chaotic system)."""
    a, b, c, d, e, f = 0.95, 0.7, 0.6, 3.5, 0.25, 0.1
    dt = 0.01
    xyzs = np.empty((NUM_WAYPOINTS + 1, 3))
    xyzs[0] = (0.1, 0.0, 0.0)

    for i in range(NUM_WAYPOINTS):
        x, y, z = xyzs[i]
        xyzs[i + 1] = xyzs[i] + np.array([
            (z - b) * x - d * y,
            d * x + (z - b) * y,
            c + a * z - (z**3) / 3 - x**2 + f * z * (x**3)
        ]) * dt

    att = xyzs[1:, :]
    u = _norm(att[:, 0]) * SCALE
    v = _norm(att[:, 1]) * SCALE
    w = _norm(att[:, 2]) * SCALE
    return {"label": "aizawa", "u": u, "v": v, "w": w}


def eq_lorenz_custom():
    """Lorenz Attractor – custom params (σ=15, ρ=15, β=8/3)."""
    sigma = 15.0
    rho   = 15.0
    beta  = 8.0 / 3.0
    dt    = 0.005        # smaller step for stability at σ=15
    steps = NUM_WAYPOINTS * 4   # more integration steps, then downsample

    xyzs = np.empty((steps + 1, 3))
    xyzs[0] = (1.0, 1.0, 1.0)   # initial condition

    for i in range(steps):
        x, y, z = xyzs[i]
        xyzs[i + 1] = xyzs[i] + np.array([
            sigma * (y - x),
            x * (rho - z) - y,
            x * y - beta * z
        ]) * dt

    # Downsample to NUM_WAYPOINTS evenly-spaced indices
    idx = np.linspace(1, steps, NUM_WAYPOINTS, dtype=int)
    att = xyzs[idx]

    u = _norm(att[:, 0]) * SCALE
    v = _norm(att[:, 1]) * SCALE
    w = _norm(att[:, 2]) * SCALE
    return {"label": "lorenz_s15r15", "u": u, "v": v, "w": w}


def eq_batman():
    """Batman curve (piecewise analytic — wings, ears, head, cape)."""
    n_half = NUM_WAYPOINTS // 2
    sqrt10 = np.sqrt(10)
    c_bat  = (3 * np.sqrt(33) - 7) / 112  # lower-boundary constant

    # ── Top boundary: x from -7 to +7 ───────────────────────────────────────
    x_top = np.linspace(-7, 7, n_half)
    y_top = np.empty(n_half)

    for i, x in enumerate(x_top):
        ax = abs(x)
        if ax >= 3:
            # Wing arcs  (ellipse)
            y_top[i] = 3 * np.sqrt(max(0, 1 - (x / 7) ** 2))
        elif x < -1:
            # Left ear
            y_top[i] = ((6 / 7) * sqrt10
                        + (3 + x) / 2
                        - (3 / 7) * sqrt10 * np.sqrt(max(0, 4 - (x + 1) ** 2)))
        elif x <= 1:
            # Head (absolute-value piecewise linear)
            y_top[i] = (3 * (abs(x - 0.5) + abs(x + 0.5) + 6)
                        - 11 * (abs(x - 0.75) + abs(x + 0.75))) / 2
        else:
            # Right ear
            y_top[i] = ((6 / 7) * sqrt10
                        + (3 - x) / 2
                        - (3 / 7) * sqrt10 * np.sqrt(max(0, 4 - (x - 1) ** 2)))

    # ── Bottom boundary: x from +7 to -7 (reversed for closed path) ─────────
    x_bot = np.linspace(7, -7, n_half)
    y_bot = np.empty(n_half)

    for i, x in enumerate(x_bot):
        ax = abs(x)
        if ax > 4:
            # Outer wing underside (lower ellipse arc)
            y_bot[i] = -3 * np.sqrt(max(0, 1 - (x / 7) ** 2))
        else:
            # Cape / lower body
            w = 3 * np.sqrt(max(0, 1 - (x / 7) ** 2))
            p = np.sqrt(max(0, 1 - (abs(ax - 2) - 1) ** 2))
            y_bot[i] = 0.5 * (w + p + abs(x / 2) - c_bat * x ** 2 - 3) - w

    # ── Combine into one closed continuous path ──────────────────────────────
    u = np.concatenate([x_top, x_bot])
    v = np.concatenate([y_top, y_bot])

    return {"label": "batman", "u": u, "v": v}


# ── Menu registry (order = display order) ──────────────────────────────────
PATTERNS = {
    "heart": eq_heart,
    "infinity_multi": eq_infinity_multi,
    "lorenz_s15r15": eq_lorenz_custom,
    "butterfly": eq_butterfly,
    "rose": eq_rose,
    "spiral": eq_spiral,
    "batman": eq_batman,
    "aizawa": eq_aizawa,
}
