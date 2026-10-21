"""Small test bot: respond with the first legal action, one JSON line per turn."""
import json
import sys

for line in sys.stdin:
    observation = json.loads(line)
    moves = observation.get("legalActions", [])
    move = moves[0] if moves else {}
    print(json.dumps({"from": move.get("from"), "to": move.get("to")}), flush=True)
