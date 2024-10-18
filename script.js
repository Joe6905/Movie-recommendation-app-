function refreshPage() {
  location.reload(); // This reloads the page
}

const API_KEY = '71bfde29fd3664879c4993e76a919e8a';
const API_URL = 'https://api.themoviedb.org/3';
const GENRES = {
  action: 28,
  drama: 18,
  romance: 10749,
  scifi: 878,
  thriller: 53,
  horror: 27,
  family: 10751,
  adult: 10770,
  kids: 16,
  animation: 16
};

let currentPage = 1;

async function fetchMoviesByGenre(genreId, page = 1) {
  try {
    const response = await fetch(`${API_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&page=${page}`);
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Error fetching movies by genre:", error);
    return [];
  }
}

async function fetchRelatedMovies(movieId) {
  const creditsResponse = await fetch(`${API_URL}/movie/${movieId}/credits?api_key=${API_KEY}`);
  const credits = await creditsResponse.json();
  const actorIds = credits.cast.slice(0, 3).map(actor => actor.id).join(',');

  const relatedResponse = await fetch(`${API_URL}/discover/movie?api_key=${API_KEY}&with_cast=${actorIds}`);
  const relatedMovies = await relatedResponse.json();
  return relatedMovies.results;
}

async function fetchActorId(actorName) {
  try {
    const response = await fetch(`${API_URL}/search/person?api_key=${API_KEY}&query=${encodeURIComponent(actorName)}`);
    const data = await response.json();
    if (data.results.length > 0) {
      return data.results[0].id; // Return the ID of the first matching actor
    } else {
      return null; // No actor found
    }
  } catch (error) {
    console.error("Error fetching actor ID:", error);
    return null;
  }
}

async function fetchMoviesByActor(actorId) {
  try {
    const response = await fetch(`${API_URL}/discover/movie?api_key=${API_KEY}&with_cast=${actorId}`);
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Error fetching movies by actor:", error);
    return [];
  }
}

async function displayGenres() {
  const container = document.getElementById('genres-container');
  for (const [genreName, genreId] of Object.entries(GENRES)) {
    const genreSection = document.createElement('div');
    genreSection.classList.add('genre-section');

    const genreTitle = document.createElement('h2');
    genreTitle.innerText = capitalize(genreName);
    genreSection.appendChild(genreTitle);

    const carousel = document.createElement('div');
    carousel.classList.add('carousel');

    // Fetch and display movies for the genre
    const movies = await fetchMoviesByGenre(genreId);
    movies.forEach(movie => {
      const movieCard = document.createElement('div');
      movieCard.classList.add('movie-card');
      movieCard.innerHTML = `
        <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
        <h3>${movie.title}</h3>
      `;

      movieCard.addEventListener('click', () => {
        displayMovieDetails(movie.id);
      });

      carousel.appendChild(movieCard);
    });

    // More button
    const moreButton = document.createElement('div');
    moreButton.classList.add('more-button');
    moreButton.innerText = 'More';
    moreButton.addEventListener('click', async () => {
      currentPage++;
      const moreMovies = await fetchMoviesByGenre(genreId, currentPage);
      moreMovies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.classList.add('movie-card');
        movieCard.innerHTML = `
          <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
          <h3>${movie.title}</h3>
        `;

        movieCard.addEventListener('click', () => {
          displayMovieDetails(movie.id);
        });

        carousel.appendChild(movieCard);
      });
    });

    genreSection.appendChild(carousel);
    genreSection.appendChild(moreButton);
    container.appendChild(genreSection);
  }
}

async function displayMovieDetails(movieId) {
  const detailsDiv = document.getElementById('movie-details');
  const moviePoster = document.getElementById('movie-poster');
  const movieTitle = document.getElementById('movie-title');
  const movieOverview = document.getElementById('movie-overview');
  const movieReleaseDate = document.getElementById('movie-release-date');
  const movieRating = document.getElementById('movie-rating');
  const relatedMoviesContainer = document.getElementById('related-movies');
  const backButton = document.getElementById('back-button');
  const genresContainer = document.getElementById('genres-container');
  const searchContainer = document.querySelector('.search-bar-container');

  genresContainer.style.opacity = '0';
  setTimeout(async () => {
    const response = await fetch(`${API_URL}/movie/${movieId}?api_key=${API_KEY}`);
    const movie = await response.json();

    relatedMoviesContainer.innerHTML = '';

    moviePoster.src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
    movieTitle.innerText = movie.title;
    movieOverview.innerText = movie.overview;
    movieReleaseDate.innerText = movie.release_date;
    movieRating.innerText = movie.vote_average;

    const relatedMovies = await fetchRelatedMovies(movieId);
    const relatedMoviesHeading = document.createElement('h3');
    relatedMoviesHeading.innerText = 'Related Movies';
    relatedMoviesContainer.appendChild(relatedMoviesHeading);

    const relatedMoviesCarousel = document.createElement('div');
    relatedMoviesCarousel.classList.add('carousel');

    relatedMovies.forEach(relatedMovie => {
      const relatedMovieCard = document.createElement('div');
      relatedMovieCard.classList.add('movie-card');
      relatedMovieCard.innerHTML = `
        <img src="https://image.tmdb.org/t/p/w500${relatedMovie.poster_path}" alt="${relatedMovie.title}">
        <h3>${relatedMovie.title}</h3>
      `;
      relatedMovieCard.addEventListener('click', () => {
        displayMovieDetails(relatedMovie.id);
      });

      relatedMoviesCarousel.appendChild(relatedMovieCard);
    });

    relatedMoviesContainer.appendChild(relatedMoviesCarousel);

    detailsDiv.style.display = 'block';
    detailsDiv.style.opacity = '1';
    detailsDiv.style.transition = 'opacity 0.5s ease';
    
    backButton.style.display = 'block';
    genresContainer.style.display = 'none';

  }, 500); 
}

document.getElementById('back-button').addEventListener('click', () => {
  const detailsDiv = document.getElementById('movie-details');
  const genresContainer = document.getElementById('genres-container');
  const backButton = document.getElementById('back-button');

  detailsDiv.style.opacity = '0';
  setTimeout(() => {
    detailsDiv.style.display = 'none';
    genresContainer.style.display = 'block';
    genresContainer.style.opacity = '1';
    backButton.style.display = 'none';
  }, 500);
});

document.getElementById('search-button').addEventListener('click', async () => {
  const query = document.getElementById('search-bar').value;
  if (query) {
    const container = document.getElementById('genres-container');
    container.innerHTML = ''; 

    const response = await fetch(`${API_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
    const searchResults = await response.json();
    displaySearchResults(searchResults.results, 'Search Results for: ' + query);
  }
});

function displaySearchResults(movies, title) {
  const container = document.getElementById('genres-container');
  
  const searchResultsSection = document.createElement('div');
  searchResultsSection.classList.add('genre-section');
  const searchResultsTitle = document.createElement('h2');
  searchResultsTitle.innerText = title;
  searchResultsSection.appendChild(searchResultsTitle);

  const searchResultsCarousel = document.createElement('div');
  searchResultsCarousel.classList.add('carousel');

  movies.forEach(movie => {
    const movieCard = document.createElement('div');
    movieCard.classList.add('movie-card');
    movieCard.innerHTML = `
      <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
      <h3>${movie.title}</h3>
    `;
    
    movieCard.addEventListener('click', () => {
      displayMovieDetails(movie.id);
    });

    searchResultsCarousel.appendChild(movieCard);
  });

  searchResultsSection.appendChild(searchResultsCarousel);
  container.appendChild(searchResultsSection);
}

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

displayGenres();
