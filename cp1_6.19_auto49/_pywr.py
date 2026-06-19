echo 'import sys, os' >> _pywr.py
echo 'p = sys.argv[1]' >> _pywr.py
echo 'm = sys.argv[2]' >> _pywr.py
echo 'c = sys.stdin.read()' >> _pywr.py
echo 'with open(p, m, encoding="utf-8") as f:' >> _pywr.py
echo '    f.write(c)' >> _pywr.py
echo 'print("ok", len(c))' >> _pywr.py
cat _pywr.py
