#!/usr/bin/env python3
import os
import argparse
from Bio import SeqIO
import pandas as pd

def parse_antismash_gbk(gbk_path):
    rows = []
    for record in SeqIO.parse(gbk_path, "genbank"):
        contig_len = len(record.seq)

        for feature in record.features:
            if feature.type != "region":
                continue

            start = int(feature.location.start) + 1  # 1-based
            end = int(feature.location.end)
            region_num = feature.qualifiers.get("region_number", ["NA"])[0]

            # --- products: keep ALL products (can be multiple) ---
            products = feature.qualifiers.get("product", [])
            # some antiSMASH/GenBank variants may use "products"
            if not products:
                products = feature.qualifiers.get("products", [])

            products = [p.strip() for p in products if str(p).strip()]
            products_str = ";".join(products) if products else "NA"
            n_products = len(products)

            note = feature.qualifiers.get("note", ["NA"])[0]

            contig_edge_raw = feature.qualifiers.get("contig_edge", ["False"])[0]
            contig_edge = str(contig_edge_raw).strip().lower() == "true"

            rows.append({
                "File": os.path.basename(gbk_path),
                "Contig": record.id,
                "Region": region_num,
                "Start": start,
                "End": end,
                "Length": end - start + 1,
                "Products": products_str,     
                "N_Products": n_products,     
                "Note": note,
                "Contig_Length": contig_len,
                "Contig_Edge": contig_edge
            })
    return rows


def main():
    ap = argparse.ArgumentParser(description="Extract BGC product info from antiSMASH GBK files.")
    ap.add_argument("input_dir", help="Directory containing antiSMASH .gbk files")
    ap.add_argument("-o", "--output", default="antismash_products.tsv",
                    help="Output TSV file (default: antismash_products.tsv)")
    args = ap.parse_args()

    all_rows = []
    for root, _, files in os.walk(args.input_dir):
        for fn in files:
            if fn.endswith(".gbk"):
                all_rows.extend(parse_antismash_gbk(os.path.join(root, fn)))

    if not all_rows:
        print("No region features found.")
        return

    df = pd.DataFrame(all_rows)
    df.to_csv(args.output, sep="\t", index=False)
    print(f"Wrote {len(df)} regions from {df['File'].nunique()} files -> {args.output}")

if __name__ == "__main__":
    main()
