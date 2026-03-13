#!/usr/bin/env python3
from Bio import Entrez, SeqIO
from tqdm import tqdm
import os
import argparse
import time
import sys
from datetime import datetime


def parse_fasta_ids(fasta_path):
    ids = []
    for record in SeqIO.parse(fasta_path, "fasta"):
        acc = record.id.split()[0]
        ids.append(acc)
    return ids


def log_message(logfile, message):
    with open(logfile, "a") as log:
        log.write(f"{datetime.now().isoformat()}  {message}\n")


def fetch_genomic_region(protein_id, window, outdir, cache_dir, pbar=None, logfile=None):
    Entrez.email = "guangyi.chen@helmholtz-hips.de"

    try:
        # find linked nucleotide record
        link_handle = Entrez.elink(
            dbfrom="protein", db="nuccore", id=protein_id, linkname="protein_nuccore"
        )
        links = Entrez.read(link_handle)
        link_handle.close()

        if not links or not links[0].get("LinkSetDb"):
            msg = f"[WARN] No nucleotide record linked for {protein_id}"
            tqdm.write(msg)
            if logfile:
                log_message(logfile, msg)
            return False

        nuc_id = links[0]["LinkSetDb"][0]["Link"][0]["Id"]

        
        # check cache
        gb_path = os.path.join(cache_dir, f"{nuc_id}.gb")
        if not os.path.exists(gb_path):
            gb_handle = Entrez.efetch(db="nuccore", id=nuc_id, rettype="gbwithparts", retmode="text")
            with open(gb_path, "w") as out:
                out.write(gb_handle.read())
            gb_handle.close()
            time.sleep(0.4) 

        # load GenBank record
        with open(gb_path) as gb_handle:
            record = SeqIO.read(gb_handle, "genbank")

        # find CDS feature matching our protein_id
        cds_feat = None
        for feat in record.features:
            if feat.type == "CDS" and "protein_id" in feat.qualifiers:
                if protein_id in feat.qualifiers["protein_id"]:
                    cds_feat = feat
                    break

        if cds_feat is None:
            msg = f"[WARN] CDS not found for {protein_id} in {record.id}"
            tqdm.write(msg)
            if logfile:
                log_message(logfile, msg)
            return False

        start = int(cds_feat.location.start)
        end = int(cds_feat.location.end)
        strand = cds_feat.location.strand

        # extract longest possible region within record bounds
        rec_len = len(record.seq)

        desired_start = start - window
        desired_end = end + window

        seq_start = max(0, desired_start)
        seq_end = min(rec_len, desired_end)

        region_seq = record.seq[seq_start:seq_end]

        # compute how much window we actually got
        upstream_got = start - seq_start          
        downstream_got = seq_end - end            

        # output FASTA
        header = (
            f"{record.id}:{seq_start}-{seq_end}({strand}) "
            f"around {protein_id} | upstream={upstream_got}bp downstream={downstream_got}bp "
            f"(requested={window}bp)"
        )
        out_path = os.path.join(outdir, f"{protein_id}_region.fasta")
        with open(out_path, "w") as f:
            f.write(f">{header}\n{region_seq}\n")

        # log whether truncated
        if upstream_got < window or downstream_got < window:
            msg = (
                f"[OK/TRUNC] {protein_id} -> {record.id}:{start}-{end} "
                f"(requested ±{window}, got -{upstream_got}/+{downstream_got})"
            )
        else:
            msg = f"[OK] {protein_id} -> {record.id}:{start}-{end} (±{window} bp)"

        if logfile:
            log_message(logfile, msg)
        return True

    except Exception as e:
        msg = f"[ERROR] {protein_id}: {e}"
        tqdm.write(msg)
        if logfile:
            log_message(logfile, msg)
        return False

    finally:
        if pbar:
            pbar.update(1)

def temp(protein_id):
    Entrez.email = "guangyi.chen@helmholtz-hips.de"
    handle = Entrez.efetch(
        db="protein",
        id=protein_id,
        rettype="gb",
        retmode="text"
    )
    record = SeqIO.read(handle, "genbank")
    handle.close()
    # extract CDS to nucleotide accession
    for feature in record.features:
        if feature.type == "CDS":
            nuc_acc = feature.location.parts[0].ref
            print("Nucleotide accession:", nuc_acc)

def main():
    parser = argparse.ArgumentParser(description="Extract genomic regions around protein accessions (±window bp)")
    parser.add_argument("fasta", help="Input FASTA file with protein sequences")
    parser.add_argument("--window", type=int, default=5000, help="Number of bp upstream/downstream (default: 5000)")
    parser.add_argument("--outdir", default="genomic_regions", help="Output directory (default: genomic_regions)")
    parser.add_argument("--cache", default="genome_cache", help="Cache directory for GenBank files")
    parser.add_argument("--log", default="extraction_log.txt", help="Path to log file (default: extraction_log.txt)")
    args = parser.parse_args()

    os.makedirs(args.outdir, exist_ok=True)
    os.makedirs(args.cache, exist_ok=True)

    # initialize log
    with open(args.log, "w") as log:
        log.write(f"# Genomic region extraction log\n# Started: {datetime.now().isoformat()}\n\n")

    ids = parse_fasta_ids(args.fasta)
    total = len(ids)
    print(f"Found {total} protein sequences in {args.fasta}\n")

    success = 0
    with tqdm(total=total, desc="Fetching genomic regions", ncols=100, dynamic_ncols=True) as pbar:
        for pid in ids:
            ok = fetch_genomic_region(pid, args.window, args.outdir, args.cache, pbar, args.log)
            if ok:
                success += 1

    summary = f"\nCompleted: {success}/{total} successfully fetched.\nResults saved in: {args.outdir}\nLog file: {args.log}\nGenBank cache: {args.cache}\n"
    tqdm.write(summary)
    log_message(args.log, summary)


if __name__ == "__main__":
    if not sys.argv[1:]:
        print("Usage example:")
        print("python extract_genomic_window.py filtered_matched_sequences.faa --window 5000")
        sys.exit(1)
    main()
