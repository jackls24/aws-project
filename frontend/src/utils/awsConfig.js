/**
 * Controlla se l'utente è autenticato
 */
export const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    return !!token;
};

/**
 * Pulisce i token di autenticazione
 */
export const clearTokens = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('refreshToken');
};
