# SPlit proteins into RRE hits and non-RRE hits:
seqkit grep -f RRE_list.txt ../6_Filtering/filtered_matched_sequences.faa -n > RRE.fasta
seqkit grep -v -f RRE_list.txt ../6_Filtering/filtered_matched_sequences.faa -n > non-RRE.fasta
