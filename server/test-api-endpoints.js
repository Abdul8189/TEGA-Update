import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5001/api';

const testEndpoints = async () => {
  console.log('🧪 Testing TEGA Exam API Endpoints...\n');
  
  const tests = [
    {
      name: 'Health Check',
      url: `${API_BASE}/health`,
      method: 'GET'
    },
    {
      name: 'TEGA Exam Payment Check',
      url: `${API_BASE}/payments/check-tega-exam-payment`,
      method: 'GET',
      headers: {
        'Authorization': 'Bearer test-token' // This will fail auth but test route
      }
    }
  ];
  
  for (const test of tests) {
    try {
      console.log(`🔍 Testing: ${test.name}`);
      console.log(`   URL: ${test.url}`);
      
      const response = await fetch(test.url, {
        method: test.method,
        headers: test.headers || {}
      });
      
      console.log(`   Status: ${response.status}`);
      
      if (response.status === 200) {
        const data = await response.json();
        console.log(`   ✅ SUCCESS: ${JSON.stringify(data).substring(0, 100)}...`);
      } else if (response.status === 401) {
        console.log(`   ⚠️  AUTH REQUIRED: Endpoint exists but needs authentication`);
      } else if (response.status === 404) {
        console.log(`   ❌ NOT FOUND: Endpoint does not exist`);
      } else {
        console.log(`   ⚠️  STATUS: ${response.status}`);
      }
      
    } catch (error) {
      console.log(`   ❌ ERROR: ${error.message}`);
    }
    
    console.log('');
  }
  
  console.log('🏁 API Endpoint Testing Complete');
};

testEndpoints();
