import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from patterns.equations import PATTERNS
from trajectory.mapper import map_to_xyz
from robot.urscript_generator import generate_urscript
from robot.socket_client import send_script


pattern = PATTERNS["heart"]()

xyz = map_to_xyz(pattern["u"], pattern["v"])

script = generate_urscript(xyz)

robot_ip = "192.168.1.20"

send_script(robot_ip, script)