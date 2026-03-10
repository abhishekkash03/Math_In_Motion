import sys
import os

# add backend root to python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from robot.socket_client import send_script

ROBOT_IP = "192.168.1.20"

# load known-good URScript
with open(r"D:\2026\Math In Motion\Matplot\math_in_motion\URScripts\heart.urscript") as f:
    script = f.read()

# send to robot
result = send_script(
    robot_ip=ROBOT_IP,
    script=script,
    execute=True
)

print(result)