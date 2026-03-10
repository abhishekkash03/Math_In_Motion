import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from patterns.equations import PATTERNS

pattern = PATTERNS["batman"]()

print(pattern["label"])
print(len(pattern["u"]))