import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from patterns.equations import PATTERNS
from trajectory.mapper import map_to_xyz
from robot.urscript_generator import generate_urscript


pattern = PATTERNS["heart"]()

xyz = map_to_xyz(pattern["u"], pattern["v"])

script = generate_urscript(xyz)

print(script[:300])
