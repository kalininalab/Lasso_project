#!/bin/bash

#input_dir="/wibicomfs/STBS/chen/Project_active/Lasso/analysis//9_finding_genomic_region/region_6K_RRE/genomic_regions"
input_dir="/wibicomfs/STBS/chen/Project_active/Lasso/analysis//9_finding_genomic_region/region_6K_non-RRE/genomic_regions"
for f in "$input_dir"/*.fasta; do
  base=$(basename "$f" .fasta)
  mkdir -p "$base"
  cd "$base" || exit
  prodigal -i "$f" -o "${base}.genes" -a "${base}.faa" -p meta
  cd ..
done
