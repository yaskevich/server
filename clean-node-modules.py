from sys import argv
from pathlib import Path
from shutil import rmtree
# https://stackoverflow.com/questions/303200/how-do-i-remove-delete-a-folder-that-is-not-empty
# https://stackoverflow.com/questions/1392413/calculating-a-directorys-size-using-python
    
def check_dir(directory):
    for item in directory.iterdir():
        if item.is_dir():
            name = Path(item).name
            if name == "node_modules":
                print(f"DELETE {item}")
                rmtree(item)
            elif name != ".git":
                # print(f"check... {item}")
                check_dir(item)
    pass

if len(argv) > 1:
    cur_dir = Path(argv[1]).resolve()
    if cur_dir.exists():
        print(f"\nDIR {cur_dir}\n")
        check_dir(cur_dir)
    else:
        print(f"Path does not exist! {cur_dir}")
