from Bio import SeqIO
import matplotlib.pyplot as plt
import sys
import numpy as np

def plot_protein_length_distribution(fasta_file, output_file='protein_length_distribution.png'):
    lengths = [len(record.seq) for record in SeqIO.parse(fasta_file, "fasta")]

    plt.figure(figsize=(10, 6))
    bins = 50
    counts, bins_edges, _ = plt.hist(lengths, bins=bins, edgecolor='black')

    x_min, x_max = int(min(lengths)), int(max(lengths))
    tick_interval = (x_max - x_min) // 20 
    tick_interval = max(10, tick_interval) 
    plt.xticks(np.arange(x_min, x_max + tick_interval, tick_interval), rotation=45)

    plt.title('Protein Length Distribution')
    plt.xlabel('Protein Length (aa)')
    plt.ylabel('Frequency')
    plt.grid(axis='y', linestyle='--', alpha=0.7)
    plt.tight_layout()
    plt.savefig(output_file, dpi=300)
    plt.show()

fasta_path = sys.argv[1]
plot_protein_length_distribution(fasta_path)

