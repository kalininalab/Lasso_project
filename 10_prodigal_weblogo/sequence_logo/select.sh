#!/bin/bash

input_file=$1
folder=$2
destination=$3

while IFS= read -r line; do
    line=${line%$'\r'}
    echo "Processing: $line"
    cp -r "$folder"/"$line"* "$destination"/
done < "$input_file"
