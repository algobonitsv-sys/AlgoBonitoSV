const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function runMigration() {
  try {
    console.log('Creando función exec_sql...');

    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
      RETURNS json AS $$
      BEGIN
        EXECUTE sql;
        RETURN json_build_object('success', true, 'message', 'SQL executed successfully');
      EXCEPTION
        WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'error', SQLERRM, 'sql', sql);
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;

    const { error: funcError } = await supabase.rpc('exec_sql', { sql: createFunctionSQL });
    if (funcError) {
      console.log('La función exec_sql ya existe o no se pudo crear');
    } else {
      console.log('✅ Función exec_sql creada');
    }

    console.log('Ejecutando ALTER TABLE...');

    // Ejecutar ALTER TABLE
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address TEXT;'
    });

    if (alterError) {
      console.log('Error en ALTER TABLE:', alterError);
    } else {
      console.log('✅ Columna shipping_address agregada');
    }

    // Verificar que la columna existe
    const { data, error: selectError } = await supabase.from('orders').select('shipping_address').limit(1);
    if (selectError) {
      console.log('Error verificando columna:', selectError.message);
    } else {
      console.log('✅ Columna shipping_address verificada');
    }

  } catch (err) {
    console.log('Error general:', err.message);
  }
}

runMigration();