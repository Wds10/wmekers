const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = 'public/demos';

try {
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
} catch (e) { }

// STL Writer
function writeSTL(filename, facets, name) {
    const fullPath = path.join(OUTPUT_DIR, filename);
    const stream = fs.createWriteStream(fullPath);

    stream.write('solid ' + name + '\\n');
    facets.forEach(function (f) {
        stream.write('facet normal ' + f.normal.x + ' ' + f.normal.y + ' ' + f.normal.z + '\\n');
        stream.write('outer loop\\n');
        f.verts.forEach(function (v) {
            stream.write('vertex ' + v.x + ' ' + v.y + ' ' + v.z + '\\n');
        });
        stream.write('endloop\\n');
        stream.write('endfacet\\n');
    });
    stream.write('endsolid ' + name + '\\n');
    stream.end();
    console.log('Generated: ' + filename);
}

// Cube Helper
function cubeFacets(ox, oy, oz, sx, sy, sz) {
    const v = [
        [ox, oy, oz], [ox + sx, oy, oz], [ox + sx, oy + sy, oz], [ox, oy + sy, oz],
        [ox, oy, oz + sz], [ox + sx, oy, oz + sz], [ox + sx, oy + sy, oz + sz], [ox, oy + sy, oz + sz]
    ];

    const facets = [];

    function addQ(a, b, c, d, nx, ny, nz) {
        const n = { x: nx, y: ny, z: nz };
        const p = function (idx) { return { x: v[idx][0], y: v[idx][1], z: v[idx][2] } };

        facets.push({ normal: n, verts: [p(a), p(b), p(c)] });
        facets.push({ normal: n, verts: [p(a), p(c), p(d)] });
    }

    addQ(0, 1, 5, 4, 0, -1, 0);
    addQ(1, 2, 6, 5, 1, 0, 0);
    addQ(2, 3, 7, 6, 0, 1, 0);
    addQ(3, 0, 4, 7, -1, 0, 0);
    addQ(4, 5, 6, 7, 0, 0, 1);
    addQ(0, 3, 2, 1, 0, 0, -1);
    return facets;
}

// Generators for Functional Prints
const gens = {
    // 1. Phone Stand (Simple wedge shape)
    'phone_stand.stl': function () {
        const f = [];
        // Base plate
        f.push.apply(f, cubeFacets(0, 0, 0, 60, 80, 5));
        // Back support (angled mostly upright)
        // I'll cheat and just make a block
        f.push.apply(f, cubeFacets(10, 20, 5, 40, 50, 2)); // Resting plate
        f.push.apply(f, cubeFacets(10, 60, 5, 40, 10, 40)); // Back prop
        f.push.apply(f, cubeFacets(10, 20, 7, 40, 5, 5)); // Lip to hold phone
        return f;
    },
    // 2. Headphone Holder (Clamp style)
    'headphone_holder.stl': function () {
        const f = [];
        // Desk Clamp Top
        f.push.apply(f, cubeFacets(0, 0, 0, 50, 60, 5));
        // Vertical Drop
        f.push.apply(f, cubeFacets(0, 0, -40, 5, 60, 40));
        // Clamp Bottom
        f.push.apply(f, cubeFacets(0, 0, -45, 50, 60, 5));
        // Hook for headphones
        f.push.apply(f, cubeFacets(50, 20, 0, 40, 20, 5)); // Arm out
        f.push.apply(f, cubeFacets(85, 20, 5, 5, 20, 10)); // Lip up
        return f;
    }
};

Object.keys(gens).forEach(function (name) {
    try {
        writeSTL(name, gens[name](), name);
    } catch (e) { console.error(e); }
});
