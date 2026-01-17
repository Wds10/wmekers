import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = 'https://gyyvbyynogdkbayslptg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5eXZieXlub2dka2JheXNscHRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1NzEyMDIsImV4cCI6MjA4NDE0NzIwMn0.VWNz5NIjYusIBBlCl94DHgug6TQiP_hjYhFEpwDdo0c';
const ARTIFACTS_DIR = 'C:/Users/54113/.gemini/antigravity/brain/d251180b-fb3a-4103-93ea-c7093a65a212';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const mappings = [
    {
        imgName: 'phone_stand_preview_1768585586636.png',
        uploadName: 'demos/phone_stand_prev.png'
    },
    {
        imgName: 'headphone_holder_preview_1768585601362.png',
        uploadName: 'demos/headphone_holder_prev.png'
    }
];

async function updateFunctionalPreviews() {
    for (const m of mappings) {
        const localPath = path.join(ARTIFACTS_DIR, m.imgName);
        if (!fs.existsSync(localPath)) continue;

        const buffer = fs.readFileSync(localPath);
        console.log(`Uploading ${m.uploadName}...`);

        const { error: upErr } = await supabase.storage
            .from('previews')
            .upload(m.uploadName, buffer, { upsert: true, contentType: 'image/png' });

        if (upErr) console.error(upErr.message);
        else console.log(`Success: ${m.uploadName}`);
    }
}

updateFunctionalPreviews();
