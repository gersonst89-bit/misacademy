fetch('http://127.0.0.1:8000/api/cursos')
  .then(r => r.json())
  .then(d => console.log(JSON.stringify(d, null, 2)))
  .catch(e => console.error(e));
