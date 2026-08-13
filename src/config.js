const appName = 'Portal Asigbo';

const serverHost = (import.meta.env.VITE_SERVER_HOST ?? '/api').replace(/\/+$/, '');

export { appName, serverHost };
