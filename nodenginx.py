import subprocess, re, os

def run(params):
    return subprocess.run(params, stdout=subprocess.PIPE).stdout.decode('utf-8')

directory = "/etc/nginx/sites-enabled"
reg = re.compile("^\s*proxy_pass\s+http\:\/\/127\.0\.0\.1\:(.*?)\;$")
proc = ''
cmd = ''
ok = True
data = dict()

for line in run(['lsof', '-i', '-P', '-Fpcfn']).splitlines():
    field = line[0]
    if field == "p": proc = line
    elif field == "c": cmd, ok = [line, re.search("^cnode(?=\s|$)", line)]
    elif field == "n" and ok:
        out = run(['ls', '-d', '-l', "/proc/" + proc[1:] + "/cwd"]).split()
        if out:
            port = re.sub("\D", "", line)
            data[port] = [cmd[1:], out[10]]

for filename in os.listdir(directory):
    filepath = os.path.join(directory, filename)
    if os.path.isfile(filepath):
        textfile = open(filepath, 'r')
        matches = []
        for line in textfile: matches += reg.findall(line)
        textfile.close()
        if matches:
            port = matches[0]
            if port in data:
                print("\033[92m●\033[00m {: <40} {: <6} {: <40} {: <20}".format(filename, port, data[port][1], data[port][0]))
            else:
                print("\033[91m●\033[00m {: <40} {: <6}".format(filename, port))
        else:
            print("● {: <40}".format(filename))
