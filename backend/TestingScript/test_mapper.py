import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from patterns.equations import PATTERNS
from trajectory.mapper import map_to_xyz


pattern = PATTERNS["heart"]()

u = pattern["u"]
v = pattern["v"]

xyz = map_to_xyz(u, v)

print("Points:", xyz.shape)
print("First:", xyz[0])
print("Last:", xyz[-1])