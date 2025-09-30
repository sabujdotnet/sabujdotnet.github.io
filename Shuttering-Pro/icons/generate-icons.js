// generate-icons.js - Run with Node.js to create placeholder icons
const fs = require('fs');
const { createCanvas } = require('canvas');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

sizes.forEach(size => {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = '#2c3e50';
  ctx.fillRect(0, 0, size, size);
  
  // Text
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${size * 0.3}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('JS', size/2, size/2);
  
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(`icons/icon-${size}x${size}.png`, buffer);
});

console.log('Icons generated successfully!');
