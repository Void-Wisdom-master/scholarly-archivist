import 'dotenv/config';
import { supabase } from './server/db/supabase.js';

async function verifyLiveSchema() {
  console.log('--- Probing Live Supabase Schema ---');
  // Try to list all tables in the public schema
  const { data: tables, error: tErr } = await supabase.from('sources').select('id').limit(0);
  if (tErr) {
    console.error('Initial probe failed:', tErr.message);
  } else {
    console.log('Successfully connected to "sources" table.');
  }

  // Use PostgREST's /rest/v1/sources?select=* to get the schema if possible (header check)
  // But simpler: Attempt an insert into collections where I KNOW it works, and see the response format.
  const { data: colls, error: cErr } = await supabase.from('collections').select('*').limit(1);
  if (colls && colls[0]) {
    console.log('Collections row columns:', Object.keys(colls[0]));
  }

  // Now, try an insert into sources with ONLY the title to find ALL column defaults
  const { data: newSrc, error: sErr } = await supabase
    .from('sources')
    .insert([{ title: 'Schema Probe ' + Date.now() }])
    .select()
    .single();

  if (sErr) {
    console.error('Sources insert probe failed:', sErr.message);
  } else if (newSrc) {
    console.log('REAL COLUMNS in Sources table:', Object.keys(newSrc));
    // Immediately delete the probe row
    await supabase.from('sources').delete().eq('id', newSrc.id);
  }
}

verifyLiveSchema();
