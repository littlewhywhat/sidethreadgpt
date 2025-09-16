# remove dist and build
rm -rf dist
rm -rf build

# create dist and build
mkdir -p dist
mkdir -p build

# copy content.* and manifest.json to dist
cp content.js dist/content.js
cp content.css dist/content.css
cp manifest.json dist/manifest.json

# zip dist to build with timestamp
timestamp=$(date +%Y%m%d%H%M%S)
zip -r build/dist_$timestamp.zip dist
