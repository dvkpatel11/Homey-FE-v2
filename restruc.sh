#!/bin/bash

# Script to extract contents of forms folder for TypeScript migration
# Usage: ./extract_forms.sh

FORMS_DIR="src/lib/hooks/form"
OUTPUT_FILE="forms_extraction.txt"

# Check if forms directory exists
if [ ! -d "$FORMS_DIR" ]; then
    echo "Error: Directory '$FORMS_DIR' not found!"
    exit 1
fi

# Create or overwrite the output file
echo "=== FORMS FOLDER CONTENTS EXTRACTION ===" > "$OUTPUT_FILE"
echo "Generated on: $(date)" >> "$OUTPUT_FILE"
echo "Directory: $FORMS_DIR" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Function to extract file contents with header
extract_file() {
    local file_path="$1"
    local file_name=$(basename "$file_path")
    
    echo "=== FILE: $file_name ===" >> "$OUTPUT_FILE"
    echo "Path: $file_path" >> "$OUTPUT_FILE"
    echo "Lines: $(wc -l < "$file_path")" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
    
    # Add file contents
    cat "$file_path" >> "$OUTPUT_FILE"
    
    echo "" >> "$OUTPUT_FILE"
    echo "=== END OF $file_name ===" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
}

# Extract all .js files in the forms directory
echo "Extracting forms folder contents..."
echo ""

for file in "$FORMS_DIR"/*.js; do
    if [ -f "$file" ]; then
        echo "Processing: $(basename "$file")"
        extract_file "$file"
    fi
done

# Also extract the index file if it exists
if [ -f "$FORMS_DIR/index.js" ]; then
    echo "Processing: index.js"
    extract_file "$FORMS_DIR/index.js"
fi

echo ""
echo "Extraction complete! Contents saved to: $OUTPUT_FILE"
echo ""
echo "Files extracted:"
ls -la "$FORMS_DIR"/*.js 2>/dev/null | awk '{print "  - " $9}' | sed 's|.*/||'

echo ""
echo "Total lines in output file: $(wc -l < "$OUTPUT_FILE")"

# Optional: Display a summary of what was extracted
echo ""
echo "=== SUMMARY ==="
echo "Files found in $FORMS_DIR:"
for file in "$FORMS_DIR"/*.js; do
    if [ -f "$file" ]; then
        lines=$(wc -l < "$file")
        echo "  - $(basename "$file"): $lines lines"
    fi
done

echo ""
echo "You can now use '$OUTPUT_FILE' as context for TypeScript migration."
echo "To view the extracted content, run: cat $OUTPUT_FILE"