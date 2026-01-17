import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = 'https://gyyvbyynogdkbayslptg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5eXZieXlub2dka2JheXNscHRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1NzEyMDIsImV4cCI6MjA4NDE0NzIwMn0.VWNz5NIjYusIBBlCl94DHgug6TQiP_hjYhFEpwDdo0c';
const ARTIFACTS_DIR = 'C:/Users/54113/.gemini/antigravity/brain/d251180b-fb3a-4103-93ea-c7093a65a212';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const mappings = [
    {
        keyword: 'Charizard',
        imgName: 'charizard_preview_3d_1768578389981.png',
        uploadName: 'demos/charizard_prev.png'
    },
    {
        keyword: 'Eiffel',
        imgName: 'eiffel_tower_preview_3d_1768578404452.png',
        uploadName: 'demos/eiffel_prev.png'
    },
    {
        keyword: 'Pistol',
        imgName: 'cyberpunk_pistol_preview_3d_1768578420065.png',
        uploadName: 'demos/pistol_prev.png'
    },
    {
        keyword: 'Car',
        imgName: 'racing_car_preview_3d_1768578434409.png',
        uploadName: 'demos/car_prev.png'
    }
    // Generic fallback for others? I'll probably leave them or reuse one.
];

async function updatePreviews() {
    console.log("Updating Previews...");

    for (const m of mappings) {
        const localPath = path.join(ARTIFACTS_DIR, m.imgName);
        if (!fs.existsSync(localPath)) {
            console.error(`Missing file: ${localPath}`);
            continue;
        }

        const buffer = fs.readFileSync(localPath);
        console.log(`Uploading ${m.uploadName}...`);

        // 1. Upload Image
        const { error: upErr } = await supabase.storage
            .from('previews')
            .upload(m.uploadName, buffer, { upsert: true, contentType: 'image/png' });

        if (upErr) {
            console.error(`Upload failed for ${m.uploadName}:`, upErr.message);
            continue;
        }

        // 2. Update DB
        console.log(`Updating DB for ${m.keyword}...`);
        const { error: dbErr } = await supabase
            .from('models')
            .update({ preview_path: m.uploadName })
            .ilike('title', `%${m.keyword}%`);

        if (dbErr) console.error(`DB Update failed for ${m.keyword}:`, dbErr.message);
        else console.log(`Success for ${m.keyword}`);
    }
}

updatePreviews();
