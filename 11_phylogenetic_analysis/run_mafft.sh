conda activate mafft
mafft --localpair --maxiterate 1000 --thread 16 Subsampled_public_fused_RRE_protease.fasta > proteins_aln.faa
