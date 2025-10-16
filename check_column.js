const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkColumn() {
  try {
    const { data, error } = await supabase.from('orders').select('shipping_address').limit(1);
    if (error) {
      console.log('Error:', error.message);
      if (error.message.includes('column') && error.message.includes('does not exist')) {
        console.log('La columna shipping_address NO existe');
      }
    } else {
      console.log('La columna shipping_address existe');
    }
  } catch (err) {
    console.log('Error de conexión:', err.message);
  }
}

checkColumn();