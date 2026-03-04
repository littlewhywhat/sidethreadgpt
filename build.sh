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
mkdir -p dist/icons
cp icons/icon16.png dist/icons/icon16.png
cp icons/icon48.png dist/icons/icon48.png
cp icons/icon128.png dist/icons/icon128.png

# zip dist to build with timestamp
timestamp=$(date +%Y%m%d%H%M%S)
zip -r build/dist_$timestamp.zip dist
