from fastapi import APIRouter
from api.models import PatternRequest

from robot.send_xyz import points_to_urscript, _norm
from robot.socket_client import send_script

from patterns.equations import PATTERNS
from trajectory.mapper import map_to_xyz

from services.script_loader import load_script


ROBOT_IP = "192.168.1.20"

router = APIRouter()


# ------------------------------------------------
# List available patterns
# ------------------------------------------------

@router.get("/patterns")
def get_patterns():

    return {"patterns": list(PATTERNS.keys())}


# ------------------------------------------------
# Preview pattern (no robot movement)
# ------------------------------------------------

@router.post("/preview")
def preview_pattern(request: PatternRequest):

    pattern_name = request.pattern

    if pattern_name not in PATTERNS:
        return {"error": "Pattern not found"}

    pattern = PATTERNS[pattern_name]()

    u = pattern["u"]
    v = pattern["v"]

    xyz = map_to_xyz(u, v)

    return {
        "pattern": pattern_name,
        "points": xyz.tolist(),
        "count": len(xyz)
    }


# ------------------------------------------------
# Execute pattern on robot
# ------------------------------------------------

@router.post("/execute")
def execute_pattern(request: PatternRequest):

    pattern_name = request.pattern
    run = getattr(request, "run", False)

    print(pattern_name)

    # if pattern_name not in PATTERNS:
    #     return {"error": "Pattern not found"}

    # # generate pattern
    # pattern = PATTERNS[pattern_name]()

    # u = pattern["u"]
    # v = pattern["v"]

    # # map to workspace
    # xyz = map_to_xyz(u, v)

    # # normalize coordinates
    # Xn = _norm(xyz[:, 0])
    # Yn = _norm(xyz[:, 1])
    # Zn = _norm(xyz[:, 2])

    # generate SAFE URScript using original pipeline
    script = load_script(pattern_name)


    # if script is None:
    #     return {"error": f"No script found for {pattern_name}"}
    # else:
    #     print(pattern_name)

   

    # send to robot
    result = send_script(
        robot_ip=ROBOT_IP,
        script=script,
        execute=run
    )

    return {
        "pattern": pattern_name,
        # "points": len(xyz),
        "robot": result
    }