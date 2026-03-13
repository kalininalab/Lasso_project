#!/usr/bin/env bash

# Usage: ./filter_fasta_by_length.sh input.fasta min_len max_len > output.fasta

fasta="$1"
min_len="$2"
max_len="$3"

awk -v min="$min_len" -v max="$max_len" '
  /^>/ {
    if (seqlen >= min && seqlen <= max && seqlen > 0) {
      print header
      print seq
    }
    header=$0
    seq=""
    seqlen=0
    next
  }
  {
    seq = seq $0
    seqlen += length($0)
  }
  END {
    if (seqlen >= min && seqlen <= max && seqlen > 0) {
      print header
      print seq
    }
  }
' "$fasta"

