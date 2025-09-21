#!/usr/bin/env node

/**
 * Vercel Build Script
 * 
 * This script builds both the client and server for Vercel deployment.
 * It's designed to work with Vercel's build process.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Vercel build process...\n');

try {
  // Step 1: Install dependencies for client
  console.log('📦 Installing client dependencies...');
  execSync('npm install', { 
    cwd: path.join(__dirname, 'client'),
    stdio: 'inherit'
  });

  // Step 2: Build the client
  console.log('\n🏗️  Building client...');
  execSync('npm run build', { 
    cwd: path.join(__dirname, 'client'),
    stdio: 'inherit'
  });

  // Step 3: Install dependencies for server
  console.log('\n📦 Installing server dependencies...');
  execSync('npm install', { 
    cwd: path.join(__dirname, 'server'),
    stdio: 'inherit'
  });

  // Step 4: Create server package.json for Vercel
  console.log('\n📝 Creating server package.json for Vercel...');
  const serverPackagePath = path.join(__dirname, 'server', 'package.json');
  const serverPackage = JSON.parse(fs.readFileSync(serverPackagePath, 'utf8'));
  
  // Add Vercel-specific scripts
  serverPackage.scripts = {
    ...serverPackage.scripts,
    'vercel-build': 'echo "Server build complete"',
    'start': 'node index.js'
  };

  fs.writeFileSync(serverPackagePath, JSON.stringify(serverPackage, null, 2));

  // Step 5: Copy client build to root for Vercel
  console.log('\n📋 Copying client build to root...');
  const clientDistPath = path.join(__dirname, 'client', 'dist');
  const rootDistPath = path.join(__dirname, 'dist');
  
  if (fs.existsSync(rootDistPath)) {
    fs.rmSync(rootDistPath, { recursive: true });
  }
  
  if (fs.existsSync(clientDistPath)) {
    fs.cpSync(clientDistPath, rootDistPath, { recursive: true });
  }

  console.log('\n✅ Vercel build completed successfully!');
  console.log('📁 Client build copied to /dist');
  console.log('🔧 Server ready for Vercel deployment');

} catch (error) {
  console.error('\n❌ Build failed:', error.message);
  process.exit(1);
}
