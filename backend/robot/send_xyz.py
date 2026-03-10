"""
send_xyz.py
===========
TWO MODES OF OPERATION:

  MODE 1 -- STANDALONE (paste your own XYZ points)
    Edit the POINTS list below, then:
      python send_xyz.py
    Or pass a CSV / NPY file:
      python send_xyz.py my_points.csv

  MODE 2 -- CALLED FROM equation_sender.py
    equation_sender.py generates points from a math equation
    and calls send_xyz.run_interactive(points, label).
    You don't need to touch this file.

  BOTH MODES give you:
    1. Single 4-panel preview  (3D + XY + YZ + XZ)
    2. Prompt: "Name for .urscript file?"
    3. Prompt: "Send to cobot? [y/N]"
    4. Auto-launches cobot_run.py if yes

  AXIS CONVENTION:
    Column 0 = X = depth      (robot forward/back,  J3 elbow)
    Column 1 = Y = lateral    (robot left/right,    J1 pan)
    Column 2 = Z = height     (robot up/down,       J2 lift)

  UNITS: anything works -- mm, metres, pure math.
         Values are auto-normalised to [-1, +1] before sending.

  FLAGS:
    --preview   preview only, do not save .urscript
    --label     custom name, e.g.  --label mysquare
"""

import sys
import os
import math
import numpy as np
import matplotlib
matplotlib.use('TkAgg')
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D   # noqa: F401

# ─────────────────────────────────────────────────────────────────────────────
#  ▼▼▼  MODE 1: PASTE YOUR XYZ POINTS HERE  ▼▼▼
#  Each row: [X_depth,  Y_lateral,  Z_height]
#  Any unit — will be auto-scaled to [-1,+1]
#
#  Replace the example below with your own coordinates.
#  You can have 10 points or 500 points — any count works.
# ─────────────────────────────────────────────────────────────────────────────

POINTS = [
    #   X(depth)    Y(left/right)    Z(up/down)
    [   0.0,          0.0,           200.0  ],   # top
    [  50.0,        150.0,           100.0  ],   # right-upper
    [   0.0,        200.0,             0.0  ],   # right-mid
    [ -50.0,        150.0,          -100.0  ],   # right-lower
    [   0.0,          0.0,          -200.0  ],   # bottom
    [  50.0,       -150.0,          -100.0  ],   # left-lower
    [   0.0,       -200.0,             0.0  ],   # left-mid
    [ -50.0,       -150.0,           100.0  ],   # left-upper
    [   0.0,          0.0,           200.0  ],   # back to top (closed)
    # ← paste your own points here (delete the example above)
]

# ─────────────────────────────────────────────────────────────────────────────
#  ROBOT JOINT CONFIG  (keep in sync with cobot_run.py)
# ─────────────────────────────────────────────────────────────────────────────
J1_HOME =  1.570   # pan   — left/right
J2_HOME = -1.200   # lift  — up/down
J3_HOME =  1.600   # elbow — depth
J4_HOME = -0.400   # wrist 1 — LOCKED
J5_HOME =  1.570   # wrist 2 — LOCKED
J6_HOME =  0.000   # wrist 3 — LOCKED

SCALE_LATERAL = 0.90   # Y → J1
SCALE_HEIGHT  = 0.70   # Z → J2
SCALE_DEPTH   = 0.40   # X → J3
Z_BIAS        = 0.20   # vertical centre bias
SCALE         = 0.9    # global motion scale  (reduce to shrink pattern)

VELOCITY      = 2.0    # rad/s  per movej
ACCELERATION  = 1.7    # rad/s²
# BLEND: corner-rounding radius (radians) for each movej waypoint.
# r=0   -> robot STOPS completely at every waypoint (choppy, jerky)
# r>0   -> robot starts blending to NEXT point before reaching this one
# r=0.08 -> robot flows continuously, never stopping (smooth path)
# Rule:  r < half the joint-space distance between adjacent points
BLEND         = 0.08   # continuous motion -- robot never fully stops

LIMITS = {
    'j1': (0.00,  3.14),
    'j2': (-2.40, -0.30),
    'j3': (0.80,   2.60),
    'j4': (-3.10,  3.10),
    'j5': (0.20,   3.10),
    'j6': (-3.10,  3.10),
}


# ─────────────────────────────────────────────────────────────────────────────
#  INTERNAL FUNCTIONS
# ─────────────────────────────────────────────────────────────────────────────

def _norm(v):
    """Scale any array to [-1, +1]."""
    v = np.asarray(v, dtype=float)
    lo, hi = v.min(), v.max()
    if hi - lo < 1e-9:
        return np.zeros_like(v)
    return 2.0 * (v - lo) / (hi - lo) - 1.0


def _clamp(name, val):
    lo, hi = LIMITS[name]
    return max(lo, min(hi, val))


def xyz_to_joints(x, y, z):
    """
    Convert one normalised XYZ point → 6 joint angles (radians).
    X [-1,+1] → J3 elbow  (depth)
    Y [-1,+1] → J1 pan    (left/right)
    Z [-1,+1] → J2 lift   (up/down)
    J4/J5/J6  → locked at home (no wrist wobble)
    """
    j1 = _clamp('j1', J1_HOME + y * SCALE_LATERAL * SCALE)
    j2 = _clamp('j2', J2_HOME - (z + Z_BIAS) * SCALE_HEIGHT * SCALE)
    j3 = _clamp('j3', J3_HOME + x * SCALE_DEPTH * SCALE)
    j4 = _clamp('j4', J4_HOME)
    j5 = _clamp('j5', J5_HOME)
    j6 = _clamp('j6', J6_HOME)
    return [j1, j2, j3, j4, j5, j6]


def load_points(source):
    """
    Load from: list-of-lists  OR  .csv path  OR  .npy path.
    Returns X, Y, Z as normalised numpy arrays in [-1, +1].
    Also returns raw_pts for display.
    """
    if isinstance(source, str):
        if source.endswith('.npy'):
            raw = np.load(source)
        else:
            try:
                raw = np.loadtxt(source, delimiter=',')
            except ValueError:
                raw = np.loadtxt(source, delimiter=',', skiprows=1)
    else:
        raw = np.array(source, dtype=float)

    if raw.ndim == 1 and len(raw) == 3:
        raw = raw.reshape(1, 3)

    if raw.ndim != 2 or raw.shape[1] != 3:
        raise ValueError(
            f"Expected Nx3 array (columns: X, Y, Z), got shape {raw.shape}.\n"
            "  Each row must be  [X_depth, Y_lateral, Z_height]"
        )

    X = _norm(raw[:, 0])
    Y = _norm(raw[:, 1])
    Z = _norm(raw[:, 2])

    print(f"\n  Loaded {len(X)} points")
    print(f"    X (depth)      raw [{raw[:,0].min():+.3f}, {raw[:,0].max():+.3f}]  -> norm [-1, +1]")
    print(f"    Y (left/right) raw [{raw[:,1].min():+.3f}, {raw[:,1].max():+.3f}]  -> norm [-1, +1]")
    print(f"    Z (up/down)    raw [{raw[:,2].min():+.3f}, {raw[:,2].max():+.3f}]  -> norm [-1, +1]")
    return X, Y, Z


def points_to_urscript(X, Y, Z, label):
    """Convert normalised XYZ arrays → complete URScript string."""
    traj = [xyz_to_joints(float(X[i]), float(Y[i]), float(Z[i]))
            for i in range(len(X))]
    home = [round(j, 4) for j in [J1_HOME, J2_HOME, J3_HOME, J4_HOME, J5_HOME, J6_HOME]]
    fn   = label.lower().replace(' ', '_').replace('-', '_')

    first_pts = [round(a, 4) for a in traj[0]]
    home_dist = sum((h - f)**2 for h, f in zip(home, first_pts)) ** 0.5

    lines = [
        f"# UR10 -- {label}",
        f"# Points: {len(traj)}   v={VELOCITY} rad/s   a={ACCELERATION} rad/s2",
        f"# Generated by send_xyz.py",
        f"def run_{fn}():",
        f"  set_tool_voltage(12)           # power tool connector (12V for LED)",
        f"  set_tool_digital_out(0, False) # LED off initially",
        f"  movej({home}, a=0.4, v=0.2)   # go to home first",
    ]

    if home_dist > 0.02:
        # Home ≠ pattern start — move precisely to start, then pause
        lines.append(f"  movej({first_pts}, a=0.4, v=0.2)   # move to pattern start")
        lines.append(f"  sleep(1.5)   # pause — home ≠ start (dist={home_dist:.3f} rad)")
        pattern_traj = traj[1:]   # first point already reached
    else:
        # Home ≈ pattern start — begin drawing immediately
        pattern_traj = traj

    lines.append(f"  set_tool_digital_out(0, True)  # LED on — drawing starts")
    for angles in pattern_traj:
        pts = [round(a, 4) for a in angles]
        lines.append(f"  movej({pts}, a={ACCELERATION}, v={VELOCITY}, r={BLEND})")
    lines += [
        f"  set_tool_digital_out(0, False) # LED off — drawing done",
        f"  movej({home}, a=0.4, v=0.2)   # return to home",
        f"end",
        f"",
        f"run_{fn}()",
        f"",
    ]
    return "\n".join(lines), traj


def show_preview(X, Y, Z, label):
    """Single 4-panel window: 3D + XY plane + YZ plane + XZ plane."""
    t     = np.linspace(0, 1, len(X))
    color = '#61afef'

    fig = plt.figure(figsize=(14, 10), facecolor='#0d1117')
    fig.suptitle(
        f'{label}  --  Preview   |   3D  +  XY  +  YZ  +  XZ  planes\n'
        f'Green = start     Red = end     Gradient = time order',
        color='#e6edf3', fontsize=13, fontweight='bold'
    )

    def _style(ax, xl, yl, title, equal=False):
        ax.set_facecolor('#0d1117')
        ax.set_xlabel(xl, color='#8b949e', fontsize=9)
        ax.set_ylabel(yl, color='#8b949e', fontsize=9)
        ax.set_title(title, color='#e6edf3', fontsize=10)
        ax.grid(color='#21262d', lw=0.5)
        ax.tick_params(colors='#8b949e', labelsize=7)
        for sp in ax.spines.values():
            sp.set_edgecolor('#30363d')
        if equal:
            ax.set_aspect('equal')

    # ── top-left : 3D ────────────────────────────────────────────────────────
    ax3 = fig.add_subplot(2, 2, 1, projection='3d')
    ax3.set_facecolor('#0d1117')
    for i in range(len(X) - 1):
        ax3.plot(X[i:i+2], Y[i:i+2], Z[i:i+2],
                 color=color, lw=1.4, alpha=0.30 + 0.70 * t[i])
    ax3.scatter([X[0]],  [Y[0]],  [Z[0]],  color='#3fb950', s=80, label='start')
    ax3.scatter([X[-1]], [Y[-1]], [Z[-1]], color='#f85149', s=80, label='end')
    ax3.set_xlabel('X  depth',      color='#8b949e', fontsize=8)
    ax3.set_ylabel('Y  left/right', color='#8b949e', fontsize=8)
    ax3.set_zlabel('Z  up/down',    color='#8b949e', fontsize=8)
    ax3.set_title('3D  view', color=color, fontsize=10)
    for p in [ax3.xaxis.pane, ax3.yaxis.pane, ax3.zaxis.pane]:
        p.fill = False
        p.set_edgecolor('#30363d')
    ax3.tick_params(colors='#8b949e', labelsize=7)
    ax3.legend(fontsize=8, labelcolor='#8b949e',
               facecolor='#161b22', edgecolor='#30363d')

    # ── top-right : YZ plane ─────────────────────────────────────────────────
    ax_yz = fig.add_subplot(2, 2, 2)
    ax_yz.scatter(Y, Z, c=t, cmap='plasma', s=6, alpha=0.95)
    ax_yz.plot(Y, Z, color='#4a9eff', lw=0.6, alpha=0.30)
    ax_yz.scatter(Y[0],  Z[0],  color='#3fb950', s=100, zorder=6, label='start')
    ax_yz.scatter(Y[-1], Z[-1], color='#f85149', s=100, zorder=6, label='end')
    ax_yz.legend(fontsize=8, labelcolor='#8b949e',
                 facecolor='#161b22', edgecolor='#30363d')
    _style(ax_yz, 'Y  (left/right)', 'Z  (up/down)',
           'YZ  Plane  (front view  --  cobot draws this)', equal=True)

    # ── bottom-left : XZ plane ───────────────────────────────────────────────
    ax_xz = fig.add_subplot(2, 2, 3)
    ax_xz.scatter(X, Z, c=t, cmap='plasma', s=6, alpha=0.9)
    ax_xz.plot(X, Z, color='#4a9eff', lw=0.6, alpha=0.30)
    ax_xz.scatter(X[0],  Z[0],  color='#3fb950', s=80, zorder=5)
    ax_xz.scatter(X[-1], Z[-1], color='#f85149', s=80, zorder=5)
    _style(ax_xz, 'X  (depth)', 'Z  (up/down)',
           'XZ  Plane  (side view)', equal=True)

    # ── bottom-right : XY plane ──────────────────────────────────────────────
    ax_xy = fig.add_subplot(2, 2, 4)
    ax_xy.scatter(X, Y, c=t, cmap='plasma', s=6, alpha=0.9)
    ax_xy.plot(X, Y, color='#4a9eff', lw=0.6, alpha=0.30)
    ax_xy.scatter(X[0],  Y[0],  color='#3fb950', s=80, zorder=5)
    ax_xy.scatter(X[-1], Y[-1], color='#f85149', s=80, zorder=5)
    _style(ax_xy, 'X  (depth)', 'Y  (left/right)',
           'XY  Plane  (top view)', equal=True)

    plt.tight_layout()
    return fig


# ─────────────────────────────────────────────────────────────────────────────
#  MAIN
# ─────────────────────────────────────────────────────────────────────────────

def main():
    args       = sys.argv[1:]
    PREVIEW_ONLY = '--preview' in args
    file_args  = [a for a in args if not a.startswith('--')]

    # label from --label flag or filename
    label = 'custom'
    if '--label' in args:
        idx = args.index('--label')
        if idx + 1 < len(args):
            label = args[idx + 1]

    print(f"\n{'='*60}")
    print(f"  send_xyz.py  --  XYZ Points -> URScript")
    print(f"{'='*60}")

    # ── load source ──────────────────────────────────────────────────────────
    if file_args and not file_args[0].startswith('--'):
        src   = file_args[0]
        label = os.path.splitext(os.path.basename(src))[0]
        print(f"\n  Source file : {src}")
    else:
        src = POINTS
        print(f"\n  Source      : inline POINTS list  ({len(POINTS)} rows)")
        print(f"  Tip         : edit the POINTS list at the top of this file,")
        print(f"                or pass a CSV/NPY file as argument.")

    X, Y, Z = load_points(src)

    # ── convert to joints + build script ─────────────────────────────────────
    script, traj = points_to_urscript(X, Y, Z, label)

    print(f"\n  Joint ranges ({len(traj)} waypoints):")
    print(f"    J1 pan   [{min(j[0] for j in traj):.3f}, {max(j[0] for j in traj):.3f}]  left/right")
    print(f"    J2 lift  [{min(j[1] for j in traj):.3f}, {max(j[1] for j in traj):.3f}]  up/down")
    print(f"    J3 elbow [{min(j[2] for j in traj):.3f}, {max(j[2] for j in traj):.3f}]  depth")
    print(f"    J4/J5/J6  locked at home")

    # ── preview ──────────────────────────────────────────────────────────────
    show_preview(X, Y, Z, label)

    if PREVIEW_ONLY:
        print(f"\n  [--preview]  Preview only -- no file saved.")
        plt.show()
        return

    # ── ask filename ─────────────────────────────────────────────────────────
    print()
    suggested = label
    user_name = input(f"  Name for .urscript file [{suggested}]: ").strip()
    if user_name:
        label = user_name.replace(' ', '_').replace('.urscript', '')
        script, traj = points_to_urscript(X, Y, Z, label)  # rebuild with new name

    out_file = f"{label}.urscript"
    here     = os.path.dirname(os.path.abspath(__file__))
    out_dir  = os.path.join(here, 'URScripts')
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, out_file)

    # ── save URScript ─────────────────────────────────────────────────────────
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(script)
    print(f"  Saved -> {out_path}  ({len(script.splitlines())} lines)")

    # ── ask to proceed to cobot ───────────────────────────────────────────────
    print()
    ans = input(f"  Proceed and send '{out_file}' to the cobot? [y/N]: ").strip().lower()
    if ans == 'y':
        _launch_cobot_run(out_path)
    else:
        print(f"  Skipped.  Run manually when ready:")
        print(f"    python cobot_run.py {out_file}")

    plt.show(block=(ans != 'y'))


def _launch_cobot_run(urscript_file):
    """Hand off a saved .urscript to cobot_run.py in the same folder."""
    import subprocess
    here     = os.path.dirname(os.path.abspath(__file__))
    runner   = os.path.join(here, 'cobot_run.py')
    if not os.path.isfile(runner):
        print(f"  [ERROR] cobot_run.py not found at: {runner}")
        return
    print(f"\n  Handing off to cobot_run.py ...")
    subprocess.run([sys.executable, runner, urscript_file], check=False)


def run_interactive(points_source, default_label='pattern'):
    """
    Called from equation_sender.py or any script to:
      1. Load + normalise XYZ points
      2. Show ONE unified 4-panel preview (3D + XY + YZ + XZ)
      3. Ask user for .urscript filename
      4. Save the script
      5. Ask "Proceed to send to cobot?"
      6. Launch cobot_run.py if yes

    points_source : list-of-lists  |  Nx3 np.ndarray  |  .csv path  |  .npy path
    """
    print(f"\n{'='*60}")
    print(f"  send_xyz.py  --  Interactive cobot send")
    print(f"{'='*60}")

    X, Y, Z = load_points(points_source)
    script, traj = points_to_urscript(X, Y, Z, default_label)

    print(f"\n  Joint ranges ({len(traj)} waypoints):")
    print(f"    J1 pan   [{min(j[0] for j in traj):.3f}, {max(j[0] for j in traj):.3f}]  left/right")
    print(f"    J2 lift  [{min(j[1] for j in traj):.3f}, {max(j[1] for j in traj):.3f}]  up/down")
    print(f"    J3 elbow [{min(j[2] for j in traj):.3f}, {max(j[2] for j in traj):.3f}]  depth")

    # ONE window -- 3D + XY + YZ + XZ
    show_preview(X, Y, Z, default_label)
    plt.show(block=False)
    plt.pause(0.3)

    # ── ask filename ─────────────────────────────────────────────────────────
    print()
    user_name = input(f"  Name for .urscript file [{default_label}]: ").strip()
    label = user_name.replace(' ', '_').replace('.urscript', '') if user_name else default_label
    if label != default_label:
        script, _ = points_to_urscript(X, Y, Z, label)

    here     = os.path.dirname(os.path.abspath(__file__))
    out_dir  = os.path.join(here, 'URScripts')
    os.makedirs(out_dir, exist_ok=True)
    out_file = f"{label}.urscript"
    out_path = os.path.join(out_dir, out_file)

    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(script)
    print(f"  Saved -> {out_path}  ({len(script.splitlines())} lines)")

    # ── ask to proceed ────────────────────────────────────────────────────────
    print()
    ans = input(f"  Yes, proceed -- send '{out_file}' to the cobot? [y/N]: ").strip().lower()
    if ans == 'y':
        _launch_cobot_run(out_path)
    else:
        print(f"  Skipped.  Run manually when ready:")
        print(f"    python cobot_run.py {out_file}")

    plt.show(block=True)


if __name__ == '__main__':
    main()
