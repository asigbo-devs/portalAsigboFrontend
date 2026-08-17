const appName = 'Portal Asigbo';

// El backend monta todas sus rutas bajo /api, por lo que VITE_SERVER_HOST debe incluirlo.
// Se agrega si falta para evitar 404 cuando la variable se define solo con el dominio
// (ej: https://api.staging.asigbo.org).
const host = (import.meta.env.VITE_SERVER_HOST ?? '/api').replace(/\/+$/, '');
const serverHost = host.endsWith('/api') ? host : `${host}/api`;

export { appName, serverHost };
