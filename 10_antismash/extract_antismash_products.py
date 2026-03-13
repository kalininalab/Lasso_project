#!/usr/bin/env python3
import os
import argparse
from Bio import SeqIO
import pandas as pd

def parse_antismash_gbk(gbk_path):
    records_data = []
    for record in SeqIO.parse(gbk_path, "genbank"):
        contig_len = len(record.seq)
        for feature in record.features:
            if feature.type == "region":
                start = int(feature.location.start) + 1
                end = int(feature.location.end)
                region_num = feature.qualifiers.get("region_number", ["NA"])[0]
                product = feature.qualifiers.get("product", ["NA"])[0]
                note = feature.qualifiers.get("note", ["NA"])[0]
                contig_edge = feature.qualifiers.get("contig_edge", ["False"])[0]

                # Normalize capitalization (sometimes "true"/"True"/"TRUE")
                contig_edge = contig_edge.strip().lower() == "true"

                records_data.append({
                    "File": os.path.basename(gbk_path),
                    "Contig": record.id,
                    "Region": region_num,
                    "Start": start,
                    "End": end,
                    "Length": end - start + 1,
                    "Product": product,
                    "Note": note,
                    "Contig_Length": contig_len,
                    "Contig_Edge": contig_edge
                })
    return records_data


def main():
    parser = argparse.ArgumentParser(description="Extract BGC product info from antiSMASH GBK files.")
    parser.add_argument("input_dir", help="Directory containing antiSMASH .gbk files")
    parser.add_argument("-o", "--output", default="antismash_products.tsv",
                        help="Output TSV file (default: antismash_products.tsv)")
    args = parser.parse_args()

    all_data = []
    for root, _, files in os.walk(args.input_dir):
        for f in files:
            if f.endswith(".gbk"):
                gbk_path = os.path.join(root, f)
                data = parse_antismash_gbk(gbk_path)
                if data:
                    all_data.extend(data)

    if not all_data:
        print("⚠️ No regions found in provided directory.")
        return

    df = pd.DataFrame(all_data)
    df.to_csv(args.output, sep="\t", index=False)
    print(f"✅ Extracted {len(df)} regions from {len(df['File'].unique())} files → saved to {args.output}")


if __name__ == "__main__":
    main()

