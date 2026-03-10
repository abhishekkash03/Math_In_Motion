import os

SCRIPT_DIR = os.path.join(os.path.dirname(__file__), "..", "scripts")

def load_script(pattern_name):

    filename = f"{pattern_name}.urscript"
    path = os.path.join(SCRIPT_DIR, filename)

    if not os.path.exists(path):
        return None

    with open(path, "r") as f:
        return f.read()