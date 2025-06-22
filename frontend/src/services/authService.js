import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

class AuthService {
    constructor() {
        this.client = axios.create({
            baseURL: API_BASE_URL,
            timeout: 30000,
        });
    }

    async login(username, password) {
        try {
            const response = await this.client.post('/auth/login', {
                username,
                password
            });

            // Verifica se la risposta contiene un errore
            if (response.data.error) {
                throw new Error(response.data.error);
            }

            return response.data;
        } catch (error) {
            console.error('Errore durante il login:', error);
            if (error.response?.data?.error) {
                throw new Error(error.response.data.error);
            }
            throw error;
        }
    }

    async register(username, password, email) {
        try {
            const response = await this.client.post('/auth/signup', {
                username,
                password,
                email
            });

            // Salviamo l'username in sessionStorage per riutilizzarlo nella pagina di conferma
            sessionStorage.setItem('pendingConfirmation', username);

            return response.data;
        } catch (error) {
            console.error('Errore durante la registrazione:', error);
            throw error.response?.data || { detail: 'Errore di connessione al server' };
        }
    }

    async confirmAccount(username, confirmationCode) {
        try {
            const response = await this.client.post('/auth/confirm', {
                username,
                confirmation_code: confirmationCode
            });

            // Rimuoviamo l'username dalla sessione dopo la conferma
            sessionStorage.removeItem('pendingConfirmation');

            return response.data;
        } catch (error) {
            console.error('Errore durante la conferma:', error);
            throw error.response?.data || { detail: 'Errore di connessione al server' };
        }
    }

    async resendConfirmationCode(username) {
        try {
            const response = await this.client.post('/auth/resend-code', {
                username
            });

            return response.data;
        } catch (error) {
            console.error('Errore durante l\'invio del codice:', error);
            throw error.response?.data || { detail: 'Errore di connessione al server' };
        }
    }

    async getUserInfo() {
        try {
            const response = await this.client.get('/auth/me');
            return response.data;
        } catch (error) {
            console.error('Errore durante il recupero delle informazioni utente:', error);
            throw error.response?.data || { detail: 'Errore di connessione al server' };
        }
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('username');
    }

    isLoggedIn() {
        return !!localStorage.getItem('token');
    }

    getPendingConfirmation() {
        return sessionStorage.getItem('pendingConfirmation');
    }
}

export default new AuthService();
