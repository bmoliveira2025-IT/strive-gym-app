const exercises = require('./assets/exercises.json');
const bodyParts = new Set();
exercises.forEach(e => {
    if (Array.isArray(e.body_parts)) {
        e.body_parts.forEach(p => bodyParts.add(p));
    } else if (typeof e.body_parts === 'string') {
        bodyParts.add(e.body_parts);
    }
});
console.log(JSON.stringify(Array.from(bodyParts), null, 2));
