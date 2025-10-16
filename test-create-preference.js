const http = require('http');

const testEndpoint = () => {
  const data = JSON.stringify({
    items: [{
      title: 'Test Product',
      quantity: 1,
      unit_price: 100
    }],
    payer: {
      name: 'Test User'
    }
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/mercadopago/create-preference',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  console.log('Testing MercadoPago create-preference endpoint...');

  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => {
      body += chunk;
    });
    res.on('end', () => {
      console.log('Status:', res.statusCode);
      try {
        const response = JSON.parse(body);
        console.log('Response:', JSON.stringify(response, null, 2));
        if (res.statusCode === 200 && response.id) {
          console.log('✅ Preference created successfully!');
          console.log('Preference ID:', response.id);
          console.log('Init point:', response.init_point);
        } else {
          console.log('❌ Error creating preference');
        }
      } catch (e) {
        console.log('Raw response:', body);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Error de conexión:', error.message);
  });

  req.write(data);
  req.end();
};

// Esperar 5 segundos para que el servidor esté listo
setTimeout(testEndpoint, 5000);
