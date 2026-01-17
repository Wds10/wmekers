import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = 'https://gyyvbyynogdkbayslptg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5eXZieXlub2dka2JheXNscHRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1NzEyMDIsImV4cCI6MjA4NDE0NzIwMn0.VWNz5NIjYusIBBlCl94DHgug6TQiP_hjYhFEpwDdo0c';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function verifyDownloads() {
    console.log("Verifying content...");

    const files = [
        'demos/eiffel.stl', 'demos/charizard.stl', 'demos/pistol.stl', 'demos/car.stl'
    ];

    for (const f of files) {
        const { data, error } = await supabase.storage.from('models').download(f);
        if (error) {
            console.error(`Error downloading ${f}:`, error.message);
        } else {
            const text = await data.text();
            const solidName = text.match(/solid (.*)/)?.[1] || 'unknown';
            const size = data.size;
            console.log(`File: ${f} | Size: ${size} bytes | Internal Name: ${solidName}`);
        }
    }
}

verifyDownloads();
