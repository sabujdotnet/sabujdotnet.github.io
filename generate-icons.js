// generate-icons.js
// Node.js script to generate PWA icons for Shuttering/Formwork Pro
const fs = require('fs');
const { createCanvas, loadImage, registerFont } = require('canvas');
const path = require('path');

// Icon sizes for different devices and platforms
const ICON_SIZES = [72, 96, 128, 144, 152, 167, 180, 192, 384, 512];
const SHORTCUT_SIZES = [96];

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Main function to generate all icons
async function generateIcons() {
  console.log('🚀 Generating PWA icons for Shuttering/Formwork Pro...\n');

  try {
    // Generate main app icons
    console.log('📱 Generating main app icons...');
    for (const size of ICON_SIZES) {
      await generateIcon(size, size, `icon-${size}x${size}.png`);
    }

    // Generate shortcut icons
    console.log('🎯 Generating shortcut icons...');
    await generateShortcutIcon(96, 96, 'invoice-shortcut.png', 'INV');
    await generateShortcutIcon(96, 96, 'dashboard-shortcut.png', 'DASH');

    // Generate Safari pinned tab icon
    console.log('🔗 Generating Safari pinned tab icon...');
    await generateSafariPinnedTab();

    // Generate favicon
    console.log('🌐 Generating favicon...');
    await generateFavicon();

    console.log('\n✅ All icons generated successfully!');
    console.log('📁 Icons saved in: ' + iconsDir);
    console.log('\n📋 Generated files:');
    
    const files = fs.readdirSync(iconsDir);
    files.forEach(file => {
      const stats = fs.statSync(path.join(iconsDir, file));
      console.log(`   📄 ${file} (${(stats.size / 1024).toFixed(1)} KB)`);
    });

  } catch (error) {
    console.error('❌ Error generating icons:', error);
    process.exit(1);
  }
}

// Generate a single icon
async function generateIcon(width, height, filename) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background with gradient
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#2c3e50');  // Dark blue
  gradient.addColorStop(1, '#3498db');  // Light blue
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Add border
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = Math.max(2, width * 0.02);
  ctx.strokeRect(
    ctx.lineWidth / 2, 
    ctx.lineWidth / 2, 
    width - ctx.lineWidth, 
    height - ctx.lineWidth
  );

  // Icon content - Construction theme
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = Math.max(2, width * 0.03);

  if (width >= 128) {
    // Detailed icon for larger sizes
    drawConstructionIcon(ctx, width, height);
  } else {
    // Simplified icon for smaller sizes
    drawSimpleIcon(ctx, width, height);
  }

  // Save the icon
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(iconsDir, filename), buffer);
  
  console.log(`   ✅ Generated ${filename}`);
}

// Draw detailed construction icon
function drawConstructionIcon(ctx, width, height) {
  const centerX = width / 2;
  const centerY = height / 2;
  const size = Math.min(width, height) * 0.6;

  // Hard hat
  ctx.beginPath();
  ctx.arc(centerX, centerY - size * 0.1, size * 0.3, 0, Math.PI * 2);
  ctx.fill();
  
  // Hat brim
  ctx.beginPath();
  ctx.ellipse(centerX, centerY + size * 0.1, size * 0.4, size * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Hammer handle
  ctx.beginPath();
  ctx.roundRect(centerX - size * 0.4, centerY + size * 0.2, size * 0.8, size * 0.05, size * 0.02);
  ctx.fill();
  
  // Hammer head
  ctx.beginPath();
  ctx.roundRect(centerX - size * 0.1, centerY + size * 0.15, size * 0.2, size * 0.15, size * 0.02);
  ctx.fill();
}

// Draw simplified icon for small sizes
function drawSimpleIcon(ctx, width, height) {
  const centerX = width / 2;
  const centerY = height / 2;
  const size = Math.min(width, height) * 0.5;

  // Simple hammer icon
  ctx.beginPath();
  
  // Handle
  ctx.moveTo(centerX - size * 0.3, centerY);
  ctx.lineTo(centerX + size * 0.3, centerY);
  ctx.lineTo(centerX + size * 0.3, centerY + size * 0.1);
  ctx.lineTo(centerX - size * 0.3, centerY + size * 0.1);
  ctx.closePath();
  ctx.fill();
  
  // Head
  ctx.beginPath();
  ctx.roundRect(centerX - size * 0.1, centerY - size * 0.2, size * 0.2, size * 0.3, size * 0.05);
  ctx.fill();
}

// Generate shortcut icon
async function generateShortcutIcon(width, height, filename, text) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#e74c3c');  // Red
  gradient.addColorStop(1, '#c0392b');  // Dark red
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Border
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = Math.max(2, width * 0.02);
  ctx.strokeRect(
    ctx.lineWidth / 2, 
    ctx.lineWidth / 2, 
    width - ctx.lineWidth, 
    height - ctx.lineWidth
  );

  // Text
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${width * 0.3}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, height / 2);

  // Save
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(iconsDir, filename), buffer);
  
  console.log(`   ✅ Generated ${filename}`);
}

// Generate Safari pinned tab icon (monochrome SVG)
async function generateSafariPinnedTab() {
  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
  <path fill="#2c3e50" d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 14c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6z"/>
  <path fill="#2c3e50" d="M7 3h2v5H7z"/>
  <path fill="#2c3e50" d="M5 8h6v2H5z"/>
</svg>`;

  fs.writeFileSync(path.join(iconsDir, 'safari-pinned-tab.svg'), svgContent);
  console.log('   ✅ Generated safari-pinned-tab.svg');
}

// Generate favicon (ICO format is complex, so we'll use PNG)
async function generateFavicon() {
  const canvas = createCanvas(32, 32);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#2c3e50';
  ctx.fillRect(0, 0, 32, 32);

  // Simple hammer icon
  ctx.fillStyle = '#ffffff';
  
  // Hammer handle
  ctx.fillRect(8, 15, 16, 3);
  
  // Hammer head
  ctx.fillRect(13, 8, 6, 10);

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(iconsDir, 'favicon-32x32.png'), buffer);
  
  // Also create a 16x16 version
  const canvas16 = createCanvas(16, 16);
  const ctx16 = canvas16.getContext('2d');
  
  ctx16.fillStyle = '#2c3e50';
  ctx16.fillRect(0, 0, 16, 16);
  
  ctx16.fillStyle = '#ffffff';
  ctx16.fillRect(4, 7, 8, 2);
  ctx16.fillRect(6, 4, 4, 5);

  const buffer16 = canvas16.toBuffer('image/png');
  fs.writeFileSync(path.join(iconsDir, 'favicon-16x16.png'), buffer16);
  
  console.log('   ✅ Generated favicon-16x16.png');
  console.log('   ✅ Generated favicon-32x32.png');
}

// Run the icon generation
generateIcons();
