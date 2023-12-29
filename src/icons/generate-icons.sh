#!/usr/bin/env fish

# Generate PNG icons in various resolutions from SVG file.
# Requires Inkscape: https://inkscape.org/

set PX 32 48 64 96 128 256

for px in $PX
  inkscape \
    --export-filename="generated/icons/icon$px.png" \
    --export-type="png" \
    --export-area-page \
    --export-width=$px  \
    --export-height=$px \
    treetop.svg
end

# Generate social preview icon.

  inkscape \
    --export-filename="generated/misc/treetop-social.png" \
    --export-type="png" \
    --export-area-page \
    --export-width=1280  \
    --export-height=640 \
    treetop-social.svg

  inkscape \
    --export-filename="generated/misc/treetop-promo-small.png" \
    --export-type="png" \
    --export-area-page \
    --export-width=440  \
    --export-height=280 \
    treetop-promo-small.svg

  inkscape \
    --export-filename="generated/misc/treetop-promo-marquee.png" \
    --export-type="png" \
    --export-area-page \
    --export-width=1400  \
    --export-height=560 \
    treetop-promo-marquee.svg

# Generate optimized SVG icon.
# Requires scour: https://github.com/scour-project/scour

scour \
  --strip-xml-prolog \
  --remove-metadata \
  --enable-id-stripping \
  -i treetop.svg \
  -o generated/icons/icon.svg
