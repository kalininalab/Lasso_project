#!/bin/bash

# ClusteredNR database download
mkdir -p ClusteredNR_Sept_2025
cd ClusteredNR_Sept_2025

lftp ftp.ncbi.nlm.nih.gov
cd blast/db/experimental/
mirror --verbose
bye

for f in ClusteredNR_Sept_2025/nr_cluster_seq.*.tar.gz; do tar -xzf "$f" -C ClusteredNR_Sept_2025_fasta/; done

# Extract fasta sequences
conda activate blast
blastdbcmd -db nr_cluster_seq -dbtype prot -entry all -out ../clusterednr.fasta -outfmt %f

# HMM search
hmmsearch --tblout hits_table.tsv -o results.txt -A msa.tsv --domtblout domtblout.tsv --pfamtblout pfamtblout.tsv --cpu 16 ../../4_HMM/mcyB_profile.hmm /wibicomfs/LTBS/chen/Other-databases/clusterednr.fasta

# Extract Hit IDs
awk '$1 !~ /^#/' hits_table.tsv | awk '{print $1}' | sort -u > hit_ids.txt

# Extract Hit Sequences
seqkit grep -f hit_ids.txt /wibicomfs/LTBS/chen/Other-databases/clusterednr.fasta > matched_sequences.faa

