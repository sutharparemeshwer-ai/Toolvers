document.getElementById('searchBtn').addEventListener('click', () => {
  const query = document.getElementById('searchInput').value.trim();
  if (!query) return alert('Enter an anime title');

  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = 'Loading...';

  const data = null;
  const xhr = new XMLHttpRequest();
  xhr.withCredentials = true;

  xhr.addEventListener('readystatechange', function () {
    if (this.readyState === this.DONE) {
      try {
        const response = JSON.parse(this.responseText);
        if (!response.data || response.data.length === 0) {
          resultsDiv.innerHTML = 'No results found 😢';
          return;
        }

        resultsDiv.innerHTML = '';
        response.data.forEach(anime => {
          const card = document.createElement('div');
          card.className = 'card ani';
          card.innerHTML = `
            <img src="${anime.image}" alt="${anime.title}">
            <br>
            <h2>${anime.title}</h2>
            <p><strong>Genres:</strong> ${anime.genres.join(', ')}</p>
         
          `;
          resultsDiv.appendChild(card);
        });
      } catch (err) {
        console.error(err);
        resultsDiv.innerHTML = 'Error parsing response 😢';
      }
    }
  });

  xhr.open('GET', `https://anime-db.p.rapidapi.com/anime?page=1&size=10&search=${encodeURIComponent(query)}`);
  xhr.setRequestHeader('x-rapidapi-key', '885f4f1b25msh4f00a32addbb01ep1b0275jsn56eea84ba9b1');
  xhr.setRequestHeader('x-rapidapi-host', 'anime-db.p.rapidapi.com');
  xhr.send(data);
});
