import socket


def send_script(robot_ip, script, port=30002, execute=False):

    if not execute:
        return {"status": "SAFE_MODE", "message": "Script not sent to robot"}

    try:

        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

        sock.connect((robot_ip, port))

        sock.sendall(script.encode("utf-8"))

        sock.close()

        return {"status": "EXECUTED", "message": "Script sent to robot"}

    except Exception as e:

        return {"status": "ERROR", "message": str(e)}