#!/usr/bin/env python3
from __future__ import annotations
import argparse, json, subprocess, time
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def main():
    p=argparse.ArgumentParser(); p.add_argument("--iterations",type=int,default=100); args=p.parse_args(); started=time.monotonic(); total=0
    for _ in range(args.iterations):
        result=subprocess.run(["python3",str(ROOT/"bridge/searchbridge.py"),"search-performance","--fixture","--offline","--deterministic"],capture_output=True,check=True); total+=len(result.stdout)
    print(json.dumps({"schema":"searchbridge.benchmark/v1","iterations":args.iterations,"seconds":round(time.monotonic()-started,3),"output_bytes":total},sort_keys=True))
if __name__=="__main__": main()
