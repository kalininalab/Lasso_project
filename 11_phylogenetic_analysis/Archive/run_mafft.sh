conda activate mafft
mafft --localpair --maxiterate 1000 non-rre_protease_WP_012286029.1.faa --thread 16 > proteins_aln.faa
