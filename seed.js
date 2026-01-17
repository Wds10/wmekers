import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const SUPABASE_URL = 'https://gyyvbyynogdkbayslptg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5eXZieXlub2dka2JheXNscHRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1NzEyMDIsImV4cCI6MjA4NDE0NzIwMn0.VWNz5NIjYusIBBlCl94DHgug6TQiP_hjYhFEpwDdo0c';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename); // unused

async function seed() {
    console.log("Seeding...");

    // 1. Create Seeder User
    const email = `seeder_${Date.now()}@w3d.com`;
    const password = 'Password123!';

    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
    });

    if (authError) {
        console.error("Auth Error:", authError);
        return;
    }

    const userId = authData.user?.id;
    if (!userId) return;

    console.log("Created Seeder User:", userId);

    // Authenticate Client logic for RLS to work?
    // The client automatically uses the token from signUp in memory for subsequent requests.
    // HOWEVER, we need to make sure we await properly.

    // 2. Create Profile
    // We need to wait a sec to ensure auth state propogates? No, signUp returns session.
    // Actually, let's login explicitly to be safe and set session.
    await supabase.auth.signInWithPassword({ email, password });

    await supabase.from('profiles').insert({
        id: userId,
        email,
        full_name: 'W3D Official',
        role: 'creator',
        country: 'Argentina'
    });

    // 3. Upload Cube STL (Once)
    const cubePath = path.resolve('public/cube.stl');
    // Check if file exists
    if (!fs.existsSync(cubePath)) {
        console.error("Cube file not found at " + cubePath);
        // Create it if missing?
        fs.writeFileSync(cubePath, "solid cube\nendsolid cube");
    }

    const cubeBuffer = fs.readFileSync(cubePath);
    const fileName = 'official_cube.stl';

    // Using 'upsert' can be optional, but upload is fine
    const { error: uploadError } = await supabase.storage
        .from('models')
        .upload(`${userId}/${fileName}`, cubeBuffer);

    if (uploadError) console.error("Upload Error (might exist):", uploadError.message);

    const filePath = `${userId}/${fileName}`;

    // 4. Seed Models
    const models = [
        { title: "Low Poly Charizard", price: 0, cat: "Characters" },
        { title: "Eiffel Tower Scale", price: 0, cat: "Props" },
        { title: "Phone Stand v2", price: 0, cat: "Props" },
        { title: "Cyberpunk Pistol", price: 15.00, cat: "Weapons" },
        { title: "Fantasy Sword", price: 0, cat: "Weapons" },
        { title: "Racing Car Chassis", price: 25.00, cat: "Vehicles" },
        { title: "Dragon Skull", price: 0, cat: "Animals" },
        { title: "Mechanical Gear Set", price: 5.00, cat: "Props" },
        { title: "Space Marine Helmet", price: 0, cat: "Characters" },
        { title: "Modular Building Pack", price: 40.00, cat: "Environment" },
        { title: "Free Cube Test", price: 0, cat: "Props" },
    ];

    for (const m of models) {
        const { error: dbError } = await supabase.from('models').insert({
            seller_id: userId,
            title: m.title,
            description: `This is a demo model for ${m.title}. High quality STL ready to print.`,
            price: m.price,
            category: m.cat || 'Props',
            license: m.price === 0 ? 'Creative Commons' : 'Standard',
            file_path: filePath, // ALL point to the same cube
            preview_path: null
        });

        if (dbError) console.error("DB Error:", dbError.message);
        else console.log(`Created: ${m.title} ($${m.price})`);
    }

    console.log("Seeding Complete!");
}

seed();
