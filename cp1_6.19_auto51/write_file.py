import sys

def write_file(path, content):
    with open(path, 'w') as f:
        f.write(content)
    print(f"Written: {path}")

if __name__ == "__main__":
    if len(sys.argv) >= 3:
        path = sys.argv[1]
        content = sys.argv[2]
        write_file(path, content)
