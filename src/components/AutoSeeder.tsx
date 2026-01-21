
import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const POKEMONS = [
    { id: 25, name: 'Pikachu', file: 'LCD-knob.stl' },
    { id: 1, name: 'Bulbasaur', file: 'Spool-holder.stl' },
    { id: 4, name: 'Charmander', file: 'y-motor-holder.stl' },
    { id: 7, name: 'Squirtle', file: 'x-end-motor.stl' },
    { id: 39, name: 'Jigglypuff', file: 'x-end-idler.stl' },
    { id: 52, name: 'Meowth', file: 'extruder-body.stl' },
    { id: 54, name: 'Psyduck', file: 'extruder-cover.stl' },
    { id: 94, name: 'Gengar', file: 'extruder-idler.stl' },
    { id: 133, name: 'Eevee', file: 'print-fan-support.stl' },
    { id: 143, name: 'Snorlax', file: 'extruder-body.stl' }
];

export function AutoSeeder() {
    const { user, loading } = useAuth();
    const hasRun = useRef(false);

    useEffect(() => {
        if (loading || !user || hasRun.current) return;

        const seed = async () => {
            hasRun.current = true; // Prevent double execution
            console.log("AutoSeeder: Checking...");

            // Check if Pokemon already exist
            try {
                const { count } = await supabase.from('models')
                    .select('*', { count: 'exact', head: true })
                    .eq('category', 'Characters')
                    .ilike('title', '%Low Poly%');

                if (count !== null && count >= 10) {
                    console.log("AutoSeeder: Pokemon already exist.");
                    return;
                }

                // User Feedback
                const confirmSeed = window.confirm("System: Database seems empty (missing Pokemon). Do you want to auto-generate the 10 Pokemon test models now?");
                if (!confirmSeed) return;

                console.log("AutoSeeder: Seeding...");

                const products = POKEMONS.map((p) => ({
                    seller_id: user.id,
                    title: `${p.name} (Low Poly)`,
                    description: `A 3D printable model of ${p.name}. Perfect for testing the download system. (Note: Geometry uses a placeholder/demo STL file for reliable download testing).`,
                    price: 0,
                    preview_path: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png`,
                    source_url: `https://raw.githubusercontent.com/prusa3d/Original-Prusa-i3/MK3S/Printed-Parts/STL/${p.file}`,
                    file_path: 'external',
                    author_original: 'Nintendo / GameFreak (Fan Art)',
                    license_type: 'CC-BY-NC',
                    is_imported: true,
                    category: 'Characters'
                }));

                const { error } = await supabase.from('models').insert(products);

                if (error) {
                    console.error("AutoSeeder Error:", error);
                    alert("Auto-Seeder Failed: " + error.message);
                } else {
                    alert("Success! 10 Pokemon Models have been generated. The page will now reload.");
                    window.location.reload();
                }
            } catch (err) {
                console.error("AutoSeeder Check Error:", err);
            }
        };

        seed();
    }, [user, loading]);

    return null;
}
