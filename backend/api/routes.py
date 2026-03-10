from fastapi import APIRouter
from api.models import PatternRequest

from robot.socket_client import send_script


from services.script_loader import load_script


ROBOT_IP = "192.168.1.20"

router = APIRouter()


# ------------------------------------------------
# Execute pattern on robot
# ------------------------------------------------

@router.post("/execute")
def execute_pattern(request: PatternRequest):

    pattern_name = request.pattern
    run = getattr(request, "run", False)

    print(pattern_name)



    # generate SAFE URScript using original pipeline
    script = load_script(pattern_name)

   

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















# ------------------------------------------------
# List available patterns
# ------------------------------------------------

# @router.get("/patterns")
# def get_patterns():

#     return {"patterns": list(PATTERNS.keys())}


# ------------------------------------------------
# Preview pattern (no robot movement)
# ------------------------------------------------

# @router.post("/preview")
# def preview_pattern(request: PatternRequest):

#     pattern_name = request.pattern

#     if pattern_name not in PATTERNS:
#         return {"error": "Pattern not found"}

#     pattern = PATTERNS[pattern_name]()

#     u = pattern["u"]
#     v = pattern["v"]

#     xyz = map_to_xyz(u, v)

#     return {
#         "pattern": pattern_name,
#         "points": xyz.tolist(),
#         "count": len(xyz)
#     }

