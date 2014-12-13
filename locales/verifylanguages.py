import json
import sys
import fnmatch
import os

files = []
for root, dirnames, filenames in os.walk('.'):
  for filename in fnmatch.filter(filenames, '*.json'):
      files.append(os.path.join(root, filename))

res = 0
for fn in files:
    sys.stdout.write("% 30s ... " % fn)
    try:
        f = open(fn, 'r')
        json.load(f)
        f.close()
        print("ok")
    except:
        print("ERROR")
        res = 1
        pass

os.system("pause")
#sys.exit(res)
