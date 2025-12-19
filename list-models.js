
const fs = require('fs');
const apiKey = 'AIzaSyCk8EGyUcZG-qDi_i7n2Iftk-LV3MUtLC4'; // Using your secondary key
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

fetch(url)
    .then(res => res.json())
    .then(data => {
        if (data.models) {
            const names = data.models.map(m => m.name).join('\n');
            fs.writeFileSync('models.txt', names);
            console.log('Wrote models to models.txt');
        } else {
            fs.writeFileSync('models.txt', 'Error: ' + JSON.stringify(data, null, 2));
        }
    })
    .catch(err => {
        fs.writeFileSync('models.txt', 'Request failed: ' + err.message);
    });
