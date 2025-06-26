// simple-test.js - Basic test without tsx
const http = require('http');

const testData = {
  fullName: "Test User",
  displayName: "Test",
  birthDate: "1990-01-15"
};

// Test guest creation
function testCreateGuest() {
  const postData = JSON.stringify(testData);
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/guests',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response:', data);
    });
  });

  req.on('error', (e) => {
    console.error(`Request error: ${e.message}`);
  });

  req.write(postData);
  req.end();
}

// Test get guests
function testGetGuests() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/guests',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`GET Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('GET Response:', data);
    });
  });

  req.on('error', (e) => {
    console.error(`GET Request error: ${e.message}`);
  });

  req.end();
}

console.log('🧪 Running simple API tests...');
console.log('Testing GET /api/v1/guests:');
testGetGuests();

setTimeout(() => {
  console.log('\nTesting POST /api/v1/guests:');
  testCreateGuest();
}, 1000);