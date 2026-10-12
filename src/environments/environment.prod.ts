export const environment = {
  production: true,
  // TODO: replace with the real production API host.
  apiBaseUrl: 'https://api.example.com',
  apiScopes: [
    'api://<your-api-client-id>/read',
    'api://<your-api-client-id>/write',
  ] as string[],
};
