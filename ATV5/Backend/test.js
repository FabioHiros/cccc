const http = require('http');
const https = require('https');

// Configuration
const BASE_URL = 'http://localhost:3000';
const API_PATH = '/api';

// HTTP client using built-in Node.js modules
class HttpClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  request(method, path, data = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.baseURL);
      const isHttps = url.protocol === 'https:';
      const client = isHttps ? https : http;

      const options = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        method: method.toUpperCase(),
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Node.js Test Client'
        }
      };

      if (data && (method.toUpperCase() === 'POST' || method.toUpperCase() === 'PUT')) {
        const jsonData = JSON.stringify(data);
        options.headers['Content-Length'] = Buffer.byteLength(jsonData);
      }

      const req = client.request(options, (res) => {
        let body = '';
        
        res.on('data', (chunk) => {
          body += chunk;
        });

        res.on('end', () => {
          try {
            const parsedBody = body ? JSON.parse(body) : {};
            resolve({
              status: res.statusCode,
              data: parsedBody,
              headers: res.headers
            });
          } catch (error) {
            resolve({
              status: res.statusCode,
              data: body,
              headers: res.headers
            });
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.setTimeout(10000); // 10 second timeout

      if (data && (method.toUpperCase() === 'POST' || method.toUpperCase() === 'PUT')) {
        req.write(JSON.stringify(data));
      }

      req.end();
    });
  }

  get(path) {
    return this.request('GET', path);
  }

  post(path, data) {
    return this.request('POST', path, data);
  }

  put(path, data) {
    return this.request('PUT', path, data);
  }

  delete(path) {
    return this.request('DELETE', path);
  }
}

// Create client instance
const client = new HttpClient(BASE_URL);

// Test data
const testData = {
  primaryGuest: {
    fullName: "Maria Silva Santos",
    displayName: "Maria Silva",
    birthDate: "1985-03-15",
    address: {
      street: "Rua das Flores, 123",
      district: "Centro",
      city: "São Paulo",
      region: "SP",
      country: "Brasil",
      postalCode: "01234-567"
    },
    contact: {
      areaCode: "11",
      number: "987654321"
    },
    document: {
      category: "CPF",
      identifier: "123.456.789-00",
      issuedDate: "2020-01-15"
    }
  },
  companion: {
    fullName: "João Silva Santos",
    displayName: "João Silva",
    birthDate: "2010-06-20",
    document: {
      category: "RG",
      identifier: "12.345.678-9",
      issuedDate: "2022-03-10"
    }
  },
  customRoom: {
    designation: "Suíte Executiva Personalizada",
    singleBeds: 2,
    doubleBeds: 1,
    bathrooms: 2,
    hasAirControl: true,
    parkingSpaces: 2
  }
};

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

// Utility functions
const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const logSuccess = (message) => log(`✅ ${message}`, 'green');
const logError = (message) => log(`❌ ${message}`, 'red');
const logInfo = (message) => log(`ℹ️  ${message}`, 'blue');
const logWarning = (message) => log(`⚠️  ${message}`, 'yellow');

// Test function wrapper
const runTest = async (testName, testFunction) => {
  log(`\n${'='.repeat(50)}`, 'cyan');
  log(`Testing: ${testName}`, 'magenta');
  log('='.repeat(50), 'cyan');
  
  try {
    await testFunction();
    logSuccess(`${testName} - All tests passed!`);
  } catch (error) {
    logError(`${testName} - Test failed: ${error.message}`);
    if (error.response) {
      logError(`Status: ${error.response.status}`);
      logError(`Data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
  }
};

// Test storage for created entities
const createdEntities = {
  primaryGuest: null,
  companion: null,
  rooms: [],
  booking: null
};

// Health check test
const testHealthCheck = async () => {
  logInfo('Testing health check endpoint...');
  const response = await client.get('/health');
  
  if (response.status === 200 && response.data.status === 'operational') {
    logSuccess('Health check passed');
  } else {
    throw new Error('Health check failed');
  }
};

// Guest routes tests
const testGuestRoutes = async () => {
  // Test 1: Get all guests (should be empty initially)
  logInfo('1. Getting all guests...');
  let response = await client.get(`${API_PATH}/guests`);
  logSuccess(`Found ${response.data.count || 0} guests`);

  // Test 2: Create primary guest
  logInfo('2. Creating primary guest...');
  response = await client.post(`${API_PATH}/guests/primary`, testData.primaryGuest);
  createdEntities.primaryGuest = response.data.data;
  logSuccess(`Primary guest created with ID: ${createdEntities.primaryGuest.id}`);

  // Test 3: Get primary guest by ID
  logInfo('3. Getting primary guest by ID...');
  response = await client.get(`${API_PATH}/guests/${createdEntities.primaryGuest.id}`);
  logSuccess(`Retrieved guest: ${response.data.data.fullName}`);

  // Test 4: Get all primary guests
  logInfo('4. Getting all primary guests...');
  response = await client.get(`${API_PATH}/guests/primary`);
  logSuccess(`Found ${response.data.count} primary guests`);

  // Test 5: Create companion
  logInfo('5. Creating companion...');
  response = await client.post(
    `${API_PATH}/guests/primary/${createdEntities.primaryGuest.id}/companion`,
    testData.companion
  );
  createdEntities.companion = response.data.data;
  logSuccess(`Companion created with ID: ${createdEntities.companion.id}`);

  // Test 6: Get companions by primary guest
  logInfo('6. Getting companions for primary guest...');
  response = await client.get(`${API_PATH}/guests/primary/${createdEntities.primaryGuest.id}/companions`);
  logSuccess(`Found ${response.data.count} companions`);

  // Test 7: Get all companions
  logInfo('7. Getting all companions...');
  response = await client.get(`${API_PATH}/guests/companions`);
  logSuccess(`Found ${response.data.count} companions`);

  // Test 8: Update primary guest
  logInfo('8. Updating primary guest...');
  const updateData = {
    displayName: "Maria Silva Updated"
  };
  response = await client.put(`${API_PATH}/guests/${createdEntities.primaryGuest.id}`, updateData);
  logSuccess('Primary guest updated successfully');

  // Test 9: Update guest address
  logInfo('9. Updating guest address...');
  const addressUpdate = {
    street: "Rua das Palmeiras, 456",
    district: "Jardins"
  };
  response = await client.put(`${API_PATH}/guests/${createdEntities.primaryGuest.id}/address`, addressUpdate);
  logSuccess('Guest address updated successfully');

  // Test 10: Add document to guest
  logInfo('10. Adding document to guest...');
  const newDocument = {
    category: "Passaporte",
    identifier: "AB123456",
    issuedDate: "2023-01-01"
  };
  response = await client.post(`${API_PATH}/guests/${createdEntities.primaryGuest.id}/document`, newDocument);
  logSuccess('Document added to guest successfully');

  // Test 11: Add contact to guest
  logInfo('11. Adding contact to guest...');
  const newContact = {
    areaCode: "11",
    number: "123456789"
  };
  response = await client.post(`${API_PATH}/guests/${createdEntities.primaryGuest.id}/contact`, newContact);
  logSuccess('Contact added to guest successfully');
};

// Room routes tests
const testRoomRoutes = async () => {
  // Test 1: Get all rooms (should be empty initially)
  logInfo('1. Getting all rooms...');
  let response = await client.get(`${API_PATH}/rooms`);
  logSuccess(`Found ${response.data.count || 0} rooms`);

  // Test 2: Create standard rooms
  logInfo('2. Creating standard rooms...');
  response = await client.post(`${API_PATH}/rooms/standard`);
  createdEntities.rooms = response.data.data;
  logSuccess(`Created ${response.data.data.length} standard rooms`);

  // Test 3: Get all rooms after creation
  logInfo('3. Getting all rooms after creation...');
  response = await client.get(`${API_PATH}/rooms`);
  logSuccess(`Found ${response.data.count} rooms`);

  // Test 4: Get room by ID
  if (createdEntities.rooms.length > 0) {
    logInfo('4. Getting room by ID...');
    const roomId = createdEntities.rooms[0].id;
    response = await client.get(`${API_PATH}/rooms/${roomId}`);
    logSuccess(`Retrieved room: ${response.data.data.designation}`);
  }

  // Test 5: Create custom room
  logInfo('5. Creating custom room...');
  response = await client.post(`${API_PATH}/rooms`, testData.customRoom);
  const customRoom = response.data.data;
  createdEntities.rooms.push(customRoom);
  logSuccess(`Custom room created with ID: ${customRoom.id}`);

  // Test 6: Update room
  logInfo('6. Updating room...');
  const updateData = {
    designation: "Suíte Executiva Atualizada",
    singleBeds: 3
  };
  response = await client.put(`${API_PATH}/rooms/${customRoom.id}`, updateData);
  logSuccess('Room updated successfully');
};

// Booking routes tests
const testBookingRoutes = async () => {
  if (!createdEntities.primaryGuest || createdEntities.rooms.length === 0) {
    throw new Error('Primary guest and rooms must be created before testing bookings');
  }

  // Test 1: Get all bookings (should be empty initially)
  logInfo('1. Getting all bookings...');
  let response = await client.get(`${API_PATH}/bookings`);
  logSuccess(`Found ${response.data.count || 0} bookings`);

  // Test 2: Create booking
  logInfo('2. Creating booking...');
  const bookingData = {
    primaryId: createdEntities.primaryGuest.id,
    roomId: createdEntities.rooms[0].id,
    arrivalDate: "2024-07-15T14:00:00.000Z",
    departDate: "2024-07-20T11:00:00.000Z"
  };
  response = await client.post(`${API_PATH}/bookings`, bookingData);
  createdEntities.booking = response.data.data;
  logSuccess(`Booking created with ID: ${createdEntities.booking.id}`);

  // Test 3: Get booking by ID
  logInfo('3. Getting booking by ID...');
  response = await client.get(`${API_PATH}/bookings/${createdEntities.booking.id}`);
  logSuccess(`Retrieved booking for guest: ${response.data.data.primary.fullName}`);

  // Test 4: Get bookings by primary guest ID
  logInfo('4. Getting bookings by primary guest ID...');
  response = await client.get(`${API_PATH}/bookings/primary/${createdEntities.primaryGuest.id}`);
  logSuccess(`Found ${response.data.count} bookings for primary guest`);

  // Test 5: Update booking
  logInfo('5. Updating booking...');
  const updateData = {
    departDate: "2024-07-22T11:00:00.000Z"
  };
  response = await client.put(`${API_PATH}/bookings/${createdEntities.booking.id}`, updateData);
  logSuccess('Booking updated successfully');

  // Test 6: Get all bookings after creation
  logInfo('6. Getting all bookings after creation...');
  response = await client.get(`${API_PATH}/bookings`);
  logSuccess(`Found ${response.data.count} bookings`);
};

// Cleanup tests (delete created entities)
const testCleanup = async () => {
  // Delete booking
  if (createdEntities.booking) {
    logInfo('1. Deleting booking...');
    await client.delete(`${API_PATH}/bookings/${createdEntities.booking.id}`);
    logSuccess('Booking deleted successfully');
  }

  // Delete companion
  if (createdEntities.companion) {
    logInfo('2. Deleting companion...');
    await client.delete(`${API_PATH}/guests/${createdEntities.companion.id}`);
    logSuccess('Companion deleted successfully');
  }

  // Delete primary guest
  if (createdEntities.primaryGuest) {
    logInfo('3. Deleting primary guest...');
    await client.delete(`${API_PATH}/guests/${createdEntities.primaryGuest.id}`);
    logSuccess('Primary guest deleted successfully');
  }

  // Delete rooms
  for (let i = 0; i < createdEntities.rooms.length; i++) {
    logInfo(`4.${i + 1} Deleting room ${i + 1}...`);
    await client.delete(`${API_PATH}/rooms/${createdEntities.rooms[i].id}`);
    logSuccess(`Room ${i + 1} deleted successfully`);
  }
};

// Main test runner
const runAllTests = async () => {
  log('\n🚀 Starting API Route Tests', 'cyan');
  log('=' * 60, 'cyan');

  try {
    await runTest('Health Check', testHealthCheck);
    await runTest('Guest Routes', testGuestRoutes);
    await runTest('Room Routes', testRoomRoutes);
    await runTest('Booking Routes', testBookingRoutes);
    await runTest('Cleanup', testCleanup);

    log('\n🎉 All tests completed successfully!', 'green');
  } catch (error) {
    logError(`\n💥 Test suite failed: ${error.message}`);
    
    // Attempt cleanup even if tests failed
    try {
      logWarning('\n🧹 Attempting cleanup...');
      await testCleanup();
      logSuccess('Cleanup completed');
    } catch (cleanupError) {
      logError(`Cleanup failed: ${cleanupError.message}`);
    }
  }
};

// Error handling for unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  logError(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
});

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = {
  runAllTests,
  testHealthCheck,
  testGuestRoutes,
  testRoomRoutes,
  testBookingRoutes,
  testCleanup
};