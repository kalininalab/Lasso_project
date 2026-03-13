#!/usr/bin/env bash
# Usage: bash run_antismash.sh input_dir

set -euo pipefail

INPUT_DIR="$1"

DB_PATH="/wibicomfs/LTBS/chen/Other-databases/antismash_db_v8/"

for fasta in "$INPUT_DIR"/*.fasta; do
    record_name=$(basename "$fasta" .fasta)

    mkdir -p "$record_name"

    echo "=== Running antiSMASH on $record_name ==="

    if antismash "$fasta" \
        -c 32 \
        --cb-general \
        --cb-knownclusters \
        --cb-subclusters \
        --asf \
        --pfam2go \
        --smcog-trees \
        --genefinding-tool prodigal \
        --databases "$DB_PATH" \
        --output-dir "$record_name" \
        --output-basename "$record_name"; then

        echo "Finished $record_name"
    else
        echo O"ERROR: Failed processing $record_name (exit code: $?)"
    fi
done

echo "All antiSMASH runs completed."

