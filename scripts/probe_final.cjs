const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function probe() {
  console.log('--- Probing REAL column names in sources table ---');
  try {
    // Try to insert a row and see what the column names are in the response
    const { data: row, error } = await supabase
      .from('sources')
      .insert([{ title: 'Probe ' + new Date().toISOString() }])
      .select()
      .single();

    if (error) {
      console.error('Insert failed:', error.message);
      // If insert fails because of missing keys, PostgREST often lists valid ones in details
      console.log('Details:', error.details);
      console.log('Hint:', error.hint);
    } else if (row) {
      console.log('SUCCESS! Real columns in "sources":', Object.keys(row));
      // Delete the probe row
      await supabase.from('sources').delete().eq('id', row.id);
    }
  } catch (err) {
    console.error('Crash during probe:', err);
  }
}

probe();
