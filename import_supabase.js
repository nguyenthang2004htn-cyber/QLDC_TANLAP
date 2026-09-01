import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.join(process.cwd(), 'backend', '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Order of insertion is important due to foreign key constraints!
const tablesToImport = [
  'DonVi', 
  'CanBo', 
  'TaiKhoan', 
  'ThongBao', 
  'PhanAnh', 
  'HoGiaDinh', 
  'NhatKy'
];

const backupDir = path.join(process.cwd(), 'database_backup_mssql');

async function importData() {
  for (const table of tablesToImport) {
    const filePath = path.join(backupDir, `${table}.json`);
    
    if (!fs.existsSync(filePath)) {
      console.log(`Skipping ${table}: No backup file found at ${filePath}`);
      continue;
    }

    const dataRaw = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(dataRaw);

    if (data.length === 0) {
      console.log(`Skipping ${table}: Backup file is empty.`);
      continue;
    }

    // Lọc bỏ cột khu_vuc_quan_ly không có trong DB Postgres
    if (table === 'TaiKhoan') {
      data.forEach(item => {
        delete item.khu_vuc_quan_ly;
      });
    }

    console.log(`Importing ${data.length} rows into ${table}...`);
    
    // For large tables, we should insert in batches, but since this is a small DB, we can insert all at once or chunk by 100.
    const chunkSize = 100;
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      
      const { data: insertedData, error } = await supabase
        .from(table)
        .upsert(chunk)
        .select();

      if (error) {
        console.error(`Error inserting into ${table}:`, error.message, error.details);
        // Continue but alert
      } else {
        console.log(`Successfully inserted chunk into ${table}`);
      }
    }
  }
  
  console.log("Migration completed!");
}

importData();
