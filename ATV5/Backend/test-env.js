// test-env.js - Test environment variables loading
require('dotenv').config();

console.log('🔍 Testing Environment Variables');
console.log('================================');

const envVars = [
  'NODE_ENV',
  'PORT', 
  'DATABASE_URL',
  'CORS_ORIGIN',
  'LOG_LEVEL'
];

envVars.forEach(envVar => {
  const value = process.env[envVar];
  if (value) {
    // Mask sensitive data in DATABASE_URL
    const displayValue = envVar === 'DATABASE_URL' 
      ? value.replace(/:([^:@]+)@/, ':****@') 
      : value;
    console.log(`✅ ${envVar}: ${displayValue}`);
  } else {
    console.log(`❌ ${envVar}: Not set`);
  }
});

console.log('\n🔍 Raw process.env check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);

console.log('\n📁 Current working directory:', process.cwd());
console.log('📄 Looking for .env at:', require('path').join(process.cwd(), '.env'));

// Check if .env file exists
const fs = require('fs');
const envPath = require('path').join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  console.log('✅ .env file found');
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('📝 .env file content (first 5 lines):');
  envContent.split('\n').slice(0, 5).forEach((line, i) => {
    if (line.trim() && !line.startsWith('#')) {
      console.log(`   ${i + 1}: ${line.split('=')[0]}=...`);
    }
  });
} else {
  console.log('❌ .env file not found at:', envPath);
}