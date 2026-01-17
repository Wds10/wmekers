const fs = require('fs');
const path = require('path');
const https = require('https');

const DEMO_DIR = 'public/demos';

try {
    if (!fs.existsSync(DEMO_DIR)) {
        fs.mkdirSync(DEMO_DIR, { recursive: true });
    }
} catch (e) { }

// Using verified repo for real models
const assets = [
    // Charizard replacer (Creature)
    { name: 'charizard.obj', url: 'https://raw.githubusercontent.com/alecjacobson/common-3d-test-models/master/data/stanford-bunny.obj' },
    // Dragon replacer (Creature)
    { name: 'dragon_skull.obj', url: 'https://raw.githubusercontent.com/alecjacobson/common-3d-test-models/master/data/armadillo.obj' },
    // Car replacer (Vehicle) - Trying beetle.obj, commonly in these datasets
    { name: 'car.obj', url: 'https://raw.githubusercontent.com/alecjacobson/common-3d-test-models/master/data/beetle.obj' },
    // Eiffel replacer - Fallback to cube if not found, or maybe 'fertility.obj' (statue)
    { name: 'eiffel.obj', url: 'https://raw.githubusercontent.com/alecjacobson/common-3d-test-models/master/data/fertility.obj' },
    // Sword replacer - using 'rocker-arm.obj' (mechanical)
    { name: 'pistol.obj', url: 'https://raw.githubusercontent.com/alecjacobson/common-3d-test-models/master/data/rocker-arm.obj' },
];

function downloadFile(item) {
    const dest = path.join(DEMO_DIR, item.name);
    console.log('Downloading ' + item.name + ' from ' + item.url + '...');
    const file = fs.createWriteStream(dest);

    https.get(item.url, function (response) {
        if (response.statusCode === 200) {
            response.pipe(file);
            file.on('finish', function () {
                file.close(function () {
                    console.log('Success: ' + item.name);
                });
            });
        } else {
            console.log('Error: ' + response.statusCode + ' for ' + item.url);
            fs.unlink(dest, function () { });
        }
    }).on('error', function (err) {
        console.log('Error: ' + err.message);
        fs.unlink(dest, function () { });
    });
}

assets.forEach(downloadFile);
