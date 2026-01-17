import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = 'https://gyyvbyynogdkbayslptg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5eXZieXlub2dka2JheXNscHRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1NzEyMDIsImV4cCI6MjA4NDE0NzIwMn0.VWNz5NIjYusIBBlCl94DHgug6TQiP_hjYhFEpwDdo0c';
const ARTIFACTS_DIR = 'C:/Users/54113/.gemini/antigravity/brain/d251180b-fb3a-4103-93ea-c7093a65a212';
const PUBLIC_DIR = 'public/demos';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const imageMappings = [
    { img: 'bunny_studio_1768590636912.png', dest: 'demos/bunny_studio.png' },
    { img: 'beetle_studio_1768590650731.png', dest: 'demos/beetle_studio.png' },
    { img: 'pistol_studio_1768590664899.png', dest: 'demos/pistol_studio.png' },
    { img: 'armadillo_studio_1768590679519.png', dest: 'demos/armadillo_studio.png' },
    { img: 'pen_cup_studio_1768590695280.png', dest: 'demos/pen_cup_studio.png' }
];

async function uploadAssets() {
    // 1. Images
    for (const m of imageMappings) {
        const localPath = path.join(ARTIFACTS_DIR, m.img);
        if (!fs.existsSync(localPath)) continue;
        const buffer = fs.readFileSync(localPath);
        console.log(`Uploading ${m.dest}...`);
        await supabase.storage.from('previews').upload(m.dest, buffer, { upsert: true, contentType: 'image/png' });
    }

    // 2. Pen Cup STL
    const penPath = path.join(PUBLIC_DIR, 'pen_cup.stl');
    if (fs.existsSync(penPath)) {
        console.log('Uploading pen_cup.stl...');
        const buffer = fs.readFileSync(penPath);
        await supabase.storage.from('models').upload('demos/pen_cup.stl', buffer, { upsert: true });
    }
}

uploadAssets();
