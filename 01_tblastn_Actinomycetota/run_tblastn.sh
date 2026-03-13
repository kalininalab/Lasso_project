
# run tblastn
tblastn \
  -query ../my_analysis/mcyB.faa \
  -db /wibicomfs/LTBS/Genomes/Actinobacteria/Actinobacteria \
  -outfmt "6 qseqid sseqid pident length mismatch gapopen qstart qend sstart send evalue bitscore sseq" \
  > results_with_seq.tsv

# filter out with matched sequence length
awk -F'\t' -v min=170 -v max=215 '$4>=min && $4<=max' results_with_seq.tsv > results_len_170_215.tsv

# extract sequences
cut -f2,13 results_len_170_215.tsv | awk '{print ">"$1"\n"$2}' > hits_translated_len_170_215.faa

