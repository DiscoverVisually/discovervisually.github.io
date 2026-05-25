#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();
const requiredFiles = [
  'index.html',
  'styles.css',
  'images/hero/hero-3d-book-field.jpg',
  'images/hero/hero-main-book.png',
  'images/hero/hero-side-book-left.png',
  'images/hero/hero-side-book-right.png',
  'images/hero/hero-side-book-far.png',
  'images/categories/spiritual-card.jpg',
  'images/categories/romantasy-card.jpg',
  'images/categories/children-card.jpg',
  'images/categories/arts-education-card.jpg',
  'images/categories/non-english-card.jpg'
];

const missing = requiredFiles.filter((file) => !fs.existsSync(path.join(root, file)));

if (missing.length > 0) {
  console.error('Build check failed. Missing required files:');
  for (const file of missing) console.error(`- ${file}`);
  process.exit(1);
}

const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const requiredSnippets = [
  'DiscoverVisually',
  'Shop by category',
  'Non-English Books',
  'Explore Romantasy',
  'Shop Spiritual'
];

const missingSnippets = requiredSnippets.filter((snippet) => !html.includes(snippet));
if (missingSnippets.length > 0) {
  console.error('Build check failed. Missing required homepage copy markers:');
  for (const snippet of missingSnippets) console.error(`- ${snippet}`);
  process.exit(1);
}

console.log('Build check passed. Core files and homepage content are present.');
