#!/bin/bash

# Config Context Builder - Outputs all root-level config files for TypeScript migration analysis

echo "🔍 Building context of all root-level configuration files..."
echo "=========================================="
echo ""

# Define config files to analyze
CONFIG_FILES=(
    "package.json"
    "jsconfig.json"
    "postcss.config.js"
    "tailwind.config.js"
    "vite.config.js"
)

# Function to display file content with header
show_file_content() {
    local file="$1"
    
    if [ -f "$file" ]; then
        echo "📄 FILE: $file"
        echo "$(wc -l < "$file") lines"
        echo "----------------------------------------"
        cat "$file"
        echo ""
        echo "========================================"
        echo ""
    else
        echo "❌ FILE NOT FOUND: $file"
        echo "========================================"
        echo ""
    fi
}

# Output all config files
for file in "${CONFIG_FILES[@]}"; do
    show_file_content "$file"
done

# Also check for any other common config files
echo "🔍 Checking for additional config files..."
echo "----------------------------------------"

OTHER_CONFIGS=(
    "tsconfig.json"
    "babel.config.js"
    ".eslintrc.js"
    ".eslintrc.json"
    ".prettierrc"
    "vitest.config.js"
    "jest.config.js"
)

for file in "${OTHER_CONFIGS[@]}"; do
    if [ -f "$file" ]; then
        echo "📄 ADDITIONAL CONFIG FOUND: $file"
        show_file_content "$file"
    fi
done

echo "✅ Context building complete!"
echo ""
echo "🎯 For TypeScript migration, you'll typically need to:"
echo "1. Add TypeScript dependencies to package.json"
echo "2. Create/update tsconfig.json"
echo "3. Update vite.config.js for TypeScript support"
echo "4. Rename .jsx files to .tsx"
echo "5. Add type definitions for your UI components"