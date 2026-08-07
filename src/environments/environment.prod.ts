export const environment = {
  production: true,
  auth0: {
    domain: 'dev-fzslqbhihrhb8va0.us.auth0.com',
    clientId: '0ack0PPx1NHjUHy5ym4R3rsmBjjnzBwN',
    authorizationParams: {
      redirect_uri: window.location.origin + '/painel',
      audience: 'https://api.tcc-ng.com',
    }
  },
  api: {
    // Substitua pela URL real do seu backend no Render após o deploy
    serverUrl: 'https://tcc-api.onrender.com',
  }
};
