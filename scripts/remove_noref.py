
fileName = "zh.ts"
f = open("./src/translations/" + fileName, "r")
nf = open("./src/translations/" + "new_" + fileName, "w")

import subprocess, os

startFilter = False
deleteCount = 0

for line in f.readlines():
    if not startFilter:
        if not line.startswith("export const "):
            nf.write(line)
        else:
            startFilter = True
            nf.write(line)

    else:
        if line == "":
            continue
        if line.startswith("}"):
            startFilter = False
            nf.write(line)
        else:
            sline = line.strip()
            pos = sline.find(":")
            if pos == -1:
                nf.write(line)
                print("ERROR: ", line)
                continue
            key = sline[:pos].strip()
            if key.startswith('"'):
                key = key[1:]
            if key.endswith('"'):
                key = key[:-1]

            if key == "unStandard": 
                nf.write(line)
            else:
                exec = "git grep " + "'translations." + key + "' ./src"
                ret = subprocess.run([exec], capture_output=True, shell=True, text=True)
                if ret.returncode == 0:
                    if len(ret.stdout) > 0:
                        nf.write(line)
                    else:
                        deleteCount += 1
                        print("delete key: ", key)
                else:
                    deleteCount += 1
                    print("delete key: ", key)

print("delete: ", deleteCount)
f.close()
nf.close()


            
    
