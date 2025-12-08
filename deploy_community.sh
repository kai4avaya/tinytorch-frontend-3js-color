#!/bin/bash

# 1. Define Absolute Paths
# Source: Your current working directory with the new HTML files
SOURCE_DIR="/home/bakukai/dev/tinytorch_systems/tinytorch_color_3js"

# Target: The specific folder in the other project
TARGET_DIR="/home/bakukai/dev/tinytorch_systems/tinytorch_github/mlsysbook/cs249r_book/tinytorch/site/extra/community"

# 2. Sanity Check: Ensure Target Exists
# We use '-d' to check if it is a directory.
if [ ! -d "$TARGET_DIR" ]; then
    echo "❌ ERROR: Target directory does not exist!"
    echo "   Expected: $TARGET_DIR"
    echo "   Please check your paths or create the folder manually."
    exit 1
fi

# 3. Perform the Update
echo "✅ Target found. Copying files..."
echo "   From: $SOURCE_DIR"
echo "   To:   $TARGET_DIR"

# Copy all files recursively (-r) and force overwrite (-f)
# We use $SOURCE_DIR/* to copy the *contents*, not the folder itself.
# Iterate through each item in the source directory
for item in "$SOURCE_DIR"/*; do
    # Extract the base name of the item
    filename=$(basename "$item")

    # Check if the item is a .md, .txt, or .sh file
    if [[ "$filename" == *.md ]] || [[ "$filename" == *.txt ]] || [[ "$filename" == *.sh ]]; then
        echo "   Skipping: $filename"
        continue
    fi

    # Copy the item if it's not a .md, .txt, or .sh file
    # Use -rf for recursive copy and force overwrite
    echo "   Copying: $filename"
    cp -rf "$item" "$TARGET_DIR"
done

echo "🚀 Update complete!"
