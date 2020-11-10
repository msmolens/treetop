#!/usr/bin/env fish

# Generate PNG icons in various resolutions from SVG file.
# Requires Inkscape: https://inkscape.org/

set PX 32 48 64 96 128 256

for px in $PX
  inkscape \
    --export-filename="generated/icon$px.png" \
    --export-type="png" \
    --export-area-page \
    --export-width=$px  \
    --export-height=$px \
    treetop.svg
end

# Generate optimized SVG icon.
# Requires scour: https://github.com/scour-project/scour

scour \
  --strip-xml-prolog \
  --remove-metadata \
  --enable-id-stripping \
  -i treetop.svg \
  -o generated/icon.svg
