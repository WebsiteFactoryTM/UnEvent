#!/bin/bash

# Setup symlinks for node_modules to reduce bloat
# This keeps all dependencies in root node_modules and creates symlinks in app directories

echo "Setting up node_modules symlinks..."

# Remove any existing app-level node_modules
rm -rf apps/*/node_modules
rm -rf packages/*/node_modules

# Create symlinks to root node_modules
ln -sf ../node_modules apps/backend/node_modules
ln -sf ../node_modules apps/frontend/node_modules

# If packages directory exists, symlink those too
if [ -d "packages" ]; then
  for package in packages/*/; do
    if [ -d "$package" ]; then
      ln -sf ../../node_modules "$package/node_modules"
    fi
  done
fi

echo "✅ Symlinks created successfully!"
echo "Root node_modules size: $(du -sh node_modules | cut -f1)"
echo "App symlinks are now 0B each"
