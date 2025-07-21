import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const COGNITO_DOMAIN = process.env.REACT_APP_USER_POOL_DOMAIN;
const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
const REDIRECT_URI = process.env.REACT_APP_REDIRECT_URI;

class AuthService {
    constructor() {
        this.client = axios.create({
            baseURL: API_BASE_URL,
            timeout: 30000,
        });
    }

    redirectToLogin() {
        const params = new URLSearchParams({
            response_type: 'code',
            client_id: CLIENT_ID,
            redirect_uri: REDIRECT_URI,
            scope: 'openid'
        });

        window.location.href = `${COGNITO_DOMAIN}/oauth2/authorize?${params.toString()}`;
    }

    async exchangeCodeForTokens(code) {
        try {
            const response = await this.client.post('/auth/exchange-code', {
                code,
                redirect_uri: REDIRECT_URI
            });
            console.log(code);
            console.log(REDIRECT_URI)
            return response.data;
        } catch (error) {
            console.log("error", error);
            throw new Error(error.response);
        }
    }

    parseIdToken(idToken) {
        try {
            const payload = JSON.parse(atob(idToken.split('.')[1]));
            return {
                username: payload['cognito:username'],
                email: payload.email,
                sub: payload.sub
            };
        } catch (error) {
            console.error('Errore nel parsing del token:', error);
            return {};
        }
    }

    logoutLocal() {
        localStorage.removeItem('token');
        localStorage.removeItem('idToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('username');

        sessionStorage.clear();

        if ('caches' in window) {
            caches.keys().then(names => {
                names.forEach(name => {
                    caches.delete(name);
                });
            });
        }
    }

    logout() {
        this.logoutLocal();

        if (!COGNITO_DOMAIN || !CLIENT_ID) {
            window.location.href = '/login';
            return;
        }

        const logoutUri = process.env.REACT_APP_LOGOUT_URI;

        const params = new URLSearchParams({
            client_id: CLIENT_ID,
            logout_uri: logoutUri
        });

        const domain = COGNITO_DOMAIN.endsWith('/') ? COGNITO_DOMAIN.slice(0, -1) : COGNITO_DOMAIN;
        const logoutUrl = `${domain}/logout?${params.toString()}`;
        console.log('Redirecting to logout URL:', logoutUrl);
        //window.location.replace(logoutUrl);
    }

    async login(username, password) {
        this.redirectToLogin();
    }

    isLoggedIn() {
        const idToken = localStorage.getItem('idToken');
        if (!idToken) return false;
        try {
            const payload = JSON.parse(atob(idToken.split('.')[1]));
            const exp = payload.exp * 1000;
            if (Date.now() >= exp) {
                this.logoutLocal();
                return false;
            }
            return true;
        } catch (error) {
            this.logoutLocal();
            return false;
        }
    }
}

const authServiceInstance = new AuthService();
export default authServiceInstance;