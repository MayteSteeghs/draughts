#!/bin/sed -Ef

# Script to convert spaces to tabs
# Usage: ./tabulate.sed file1 file2 ... fileN

:l
s/^(\t*)    /\1\t/
t l
