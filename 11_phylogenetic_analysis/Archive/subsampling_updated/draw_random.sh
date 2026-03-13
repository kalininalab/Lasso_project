shuf -n "$(($(wc -l < file.txt) / 10))" file.txt > sampled.txt

