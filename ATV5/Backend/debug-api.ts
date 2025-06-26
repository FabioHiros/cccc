#!/usr/bin/env tsx
// debug-api.ts - Debug script to identify specific issues

import { HttpClient } from './test-api';

const CONFIG = {
  baseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
  apiPrefix: '/api/v1'
};

async function debugHealthCheck() {
  console.log('🔍 Debugging Health Check...');
  try {
    const response = await HttpClient.get(`${CONFIG.baseUrl}/api/health`);
    console.log(`✅ Health Status: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      const data = JSON.parse(response.body);
      console.log('📊 Health Data:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.log('❌ Health Check Failed:', error);
  }
}

async function debugDatabaseConnection() {
  console.log('\n🔍 Debugging Database Connection...');
  try {
    const response = await HttpClient.get(`${CONFIG.baseUrl}/api/health/ready`);
    console.log(`✅ Database Ready Status: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      const data = JSON.parse(response.body);
      console.log('🗄️ Database Status:', JSON.stringify(data.data, null, 2));
    } else {
      console.log('❌ Database Response:', response.body);
    }
  } catch (error) {
    console.log('❌ Database Check Failed:', error);
  }
}

async function debugGuestCreation() {
  console.log('\n🔍 Debugging Guest Creation...');
  
  const testGuestData = {
    fullName: "Debug Test User",
    displayName: "Debug User",
    birthDate: "1990-01-15",
    address: {
      street: "123 Debug Street",
      district: "Debug District", 
      city: "Debug City",
      region: "Debug State",
      country: "Debug Country",
      postalCode: "12345"
    },
    contact: {
      areaCode: "11",
      number: "999999999"
    },
    document: {
      category: "CPF",
      identifier: "12345678901",
      issuedDate: "2020-01-01"
    }
  };

  try {
    const response = await HttpClient.post(
      `${CONFIG.baseUrl}${CONFIG.apiPrefix}/guests`,
      testGuestData
    );
    
    console.log(`Status Code: ${response.statusCode}`);
    console.log('Response Headers:', response.headers);
    console.log('Response Body:', response.body);
    
    if (response.statusCode !== 201) {
      console.log('❌ Guest creation failed');
      const errorData = JSON.parse(response.body);
      console.log('Error Details:', JSON.stringify(errorData, null, 2));
    } else {
      console.log('✅ Guest created successfully');
      const data = JSON.parse(response.body);
      return data.data.id;
    }
  } catch (error) {
    console.log('❌ Guest Creation Request Failed:', error);
  }
  
  return null;
}

async function debugGetGuests() {
  console.log('\n🔍 Debugging Get All Guests...');
  
  try {
    const response = await HttpClient.get(`${CONFIG.baseUrl}${CONFIG.apiPrefix}/guests`);
    
    console.log(`Status Code: ${response.statusCode}`);
    console.log('Response Body:', response.body);
    
    if (response.statusCode !== 200) {
      console.log('❌ Get guests failed');
      if (response.body) {
        try {
          const errorData = JSON.parse(response.body);
          console.log('Error Details:', JSON.stringify(errorData, null, 2));
        } catch (e) {
          console.log('Raw Error Response:', response.body);
        }
      }
    } else {
      console.log('✅ Get guests successful');
    }
  } catch (error) {
    console.log('❌ Get Guests Request Failed:', error);
  }
}

async function debugPrismaSchema() {
  console.log('\n🔍 Checking Prisma Schema and Database...');
  
  // Check if Prisma client is generated
  try {
    const { execSync } = require('child_process');
    
    console.log('📋 Checking Prisma client generation...');
    const generateOutput = execSync('npx prisma generate', { encoding: 'utf8' });
    console.log('✅ Prisma client generated');
    
    console.log('\n📋 Checking database connection...');
    const dbOutput = execSync('npx prisma db push --accept-data-loss', { encoding: 'utf8' });
    console.log('✅ Database schema pushed');
    
  } catch (error) {
    console.log('❌ Prisma/Database Error:', error.message);
  }
}

async function debugServerLogs() {
  console.log('\n🔍 Making requests to check server logs...');
  console.log('💡 Check your server console for detailed error messages');
  
  // Make a simple request to trigger server logging
  try {
    await HttpClient.get(`${CONFIG.baseUrl}${CONFIG.apiPrefix}/guests`);
  } catch (error) {
    // Ignore error, we just want to trigger server logs
  }
}

async function debugRoutes() {
  console.log('\n🔍 Testing Route Availability...');
  
  const routes = [
    '/api/health',
    '/api/health/ready', 
    '/api/v1/guests',
    '/api/v1/rooms',
    '/api/v1/bookings'
  ];
  
  for (const route of routes) {
    try {
      const response = await HttpClient.get(`${CONFIG.baseUrl}${route}`);
      console.log(`${route}: ${response.statusCode === 404 ? '❌' : '✅'} ${response.statusCode}`);
    } catch (error) {
      console.log(`${route}: ❌ Error - ${error.message}`);
    }
  }
}

async function checkEnvironmentVariables() {
  console.log('\n🔍 Checking Environment Variables...');
  
  const requiredEnvVars = ['DATABASE_URL', 'NODE_ENV', 'PORT'];
  
  requiredEnvVars.forEach(envVar => {
    const value = process.env[envVar];
    if (value) {
      // Mask sensitive data
      const displayValue = envVar === 'DATABASE_URL' 
        ? value.replace(/:([^:@]+)@/, ':****@') 
        : value;
      console.log(`✅ ${envVar}: ${displayValue}`);
    } else {
      console.log(`❌ ${envVar}: Not set`);
    }
  });
}

async function main() {
  console.log('🐛 Hotel Management API Debug Suite\n');
  
  // Check if server is running
  try {
    await HttpClient.get(`${CONFIG.baseUrl}/api/health`);
    console.log('✅ Server is running\n');
  } catch (error) {
    console.log('❌ Server is not available');
    console.log('🚀 Start the server with: npm run dev');
    process.exit(1);
  }
  
  // Run debug checks
  await checkEnvironmentVariables();
  await debugHealthCheck();
  await debugDatabaseConnection();
  await debugRoutes();
  await debugPrismaSchema();
  await debugGuestCreation();
  await debugGetGuests();
  await debugServerLogs();
  
  console.log('\n🔧 Debugging complete!');
  console.log('💡 Check your server console for additional error details');
  console.log('💡 Common fixes:');
  console.log('   1. Run: npm run db:generate');
  console.log('   2. Run: npm run db:push');
  console.log('   3. Check DATABASE_URL in .env');
  console.log('   4. Restart server: npm run dev');
}

if (require.main === module) {
  main().catch(error => {
    console.error('Debug script error:', error);
    process.exit(1);
  });
}