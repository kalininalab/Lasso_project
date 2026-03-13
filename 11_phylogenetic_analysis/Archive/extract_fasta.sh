#!/usr/bin/env bash
# Usage: bash extract_fasta_by_accession.sh accession_list.txt input.fasta output.fasta

set -euo pipefail

if [ "$#" -ne 3 ]; then
    echo "Usage: $0 accession_list.txt input.fasta output.fasta" >&2
    exit 1
fi

ACC_LIST="$1"
INPUT_FASTA="$2"
OUTPUT_FASTA="$3"

awk '
    # First file: accession list -> store each accession as a key
    NR == FNR {
        acc[$1] = 1
        next
    }
    # Second file: FASTA
    /^>/ {
        # header line: extract accession from first field, strip leading ">"
        split($1, f, " ")
        a = substr(f[1], 2)
        keep = (a in acc)
    }
    # Print header + sequence lines if keep==true
    keep
' "$ACC_LIST" "$INPUT_FASTA" > "$OUTPUT_FASTA"
