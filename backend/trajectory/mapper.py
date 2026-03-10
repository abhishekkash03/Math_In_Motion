"""
trajectory/mapper.py

Converts mathematical curve coordinates (u,v,w)
into robot XYZ coordinates in millimeters.
"""

import numpy as np


def _norm(arr):
    lo, hi = arr.min(), arr.max()
    return arr if (hi - lo) < 1e-9 else 2.0 * (arr - lo) / (hi - lo) - 1.0


def map_to_xyz(
    u,
    v,
    w=None,
    scale=300,
    plane="YZ",
    offset_axis="Y",
    offset_value=-200
):

    # normalize
    u_s = scale * _norm(u)
    v_s = scale * _norm(v)

    n = len(u_s)

    X = np.zeros(n)
    Y = np.zeros(n)
    Z = np.zeros(n)

    plane = plane.upper()

    if plane == "YZ":
        Y, Z = u_s, v_s

    elif plane == "XZ":
        X, Z = u_s, v_s

    elif plane == "XY":
        X, Y = u_s, v_s

    else:
        raise ValueError("Plane must be XY, YZ, or XZ")


    # apply offset
    axis = offset_axis.upper()

    if axis == "X":
        X = X + offset_value

    elif axis == "Y":
        Y = Y + offset_value

    elif axis == "Z":
        Z = Z + offset_value

    return np.column_stack((X, Y, Z))