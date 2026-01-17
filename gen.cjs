const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = 'public/demos';

try {
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
} catch (e) {
    // ignore
}

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
}

// Geometry Helpers
function cubeFacets(ox, oy, oz, s) {
    const v = [
        [ox, oy, oz], [ox + s, oy, oz], [ox + s, oy + s, oz], [ox, oy + s, oz],
        [ox, oy, oz + s], [ox + s, oy, oz + s], [ox + s, oy + s, oz + s], [ox, oy + s, oz + s]
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

// Generators
const gens = {
    'eiffel.stl': function () {
        const f = [];
        f.push.apply(f, cubeFacets(-5, -5, 0, 10));
        f.push.apply(f, cubeFacets(-3, -3, 10, 6));
        return f;
    },
    'charizard.stl': function () {
        const f = [];
        f.push.apply(f, cubeFacets(-4, -4, 0, 8));
        f.push.apply(f, cubeFacets(4, 0, 4, 2));
        return f;
    },
    'pistol.stl': function () {
        const f = [];
        f.push.apply(f, cubeFacets(0, 0, 0, 2));
        f.push.apply(f, cubeFacets(0, 1, 2, 6));
        return f;
    },
    'car.stl': function () {
        const f = [];
        f.push.apply(f, cubeFacets(0, 0, 1, 8));
        f.push.apply(f, cubeFacets(0, 0, 0, 2));
        return f;
    },
    'sword.stl': function () {
        const f = [];
        f.push.apply(f, cubeFacets(0, 0, 0, 2));
        f.push.apply(f, cubeFacets(0, 0, 2, 8));
        return f;
    },
    'phone_stand.stl': function () {
        const f = [];
        f.push.apply(f, cubeFacets(0, 0, 0, 5));
        f.push.apply(f, cubeFacets(0, 2, 0, 5));
        return f;
    },
    'dragon_skull.stl': function () {
        const f = [];
        f.push.apply(f, cubeFacets(0, 0, 0, 6));
        return f;
    },
    'helmet.stl': function () {
        const f = [];
        f.push.apply(f, cubeFacets(0, 0, 0, 6));
        return f;
    },
    'building.stl': function () {
        const f = [];
        f.push.apply(f, cubeFacets(0, 0, 0, 10));
        return f;
    },
    'gears.stl': function () {
        const f = [];
        f.push.apply(f, cubeFacets(0, 0, 0, 4));
        return f;
    }
};

// Run
Object.keys(gens).forEach(function (name) {
    try {
        console.log('Generating ' + name);
        writeSTL(name, gens[name](), name);
    } catch (e) {
        console.error("Error: " + e.message);
    }
});
