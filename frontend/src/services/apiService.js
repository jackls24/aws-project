import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

class ApiService {
    constructor() {
        this.client = axios.create({
            baseURL: API_BASE_URL,
            timeout: 30000,
        });

        // Interceptor per aggiungere il token appropriato a ogni richiesta
        this.client.interceptors.request.use(
            (config) => {
                // Per le operazioni AWS (S3), usa ID Token
                if (config.url.startsWith('/api/')) {
                    const idToken = localStorage.getItem('idToken');
                    if (idToken) {
                        config.headers['Authorization'] = `Bearer ${idToken}`;
                    }
                }
                // Per le operazioni di autenticazione, usa Access Token
                else if (config.url.startsWith('/auth/')) {
                    const accessToken = localStorage.getItem('token'); // Access Token
                    if (accessToken) {
                        config.headers['Authorization'] = `Bearer ${accessToken}`;
                    }
                }
                // Per altre operazioni, utilizza qualsiasi token disponibile
                else {
                    const token = localStorage.getItem('token') || localStorage.getItem('idToken');
                    if (token) {
                        config.headers['Authorization'] = `Bearer ${token}`;
                    }
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );
    }

    // Health check
    async healthCheck() {
        const response = await this.client.get('/health');
        return response.data;
    }

    // Upload immagine
    async uploadImage(formData) {
        // Non ricreiamo un nuovo FormData, usiamo quello passato come parametro
        const response = await this.client.post('/api/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }

    // Elimina immagine
    async deleteImage(filename) {
        const response = await this.client.delete(`/api/delete/${filename}`);
        return response.data;
    }

    // Lista immagini utente
    async getUserImages(userId) {
        try {
            // Temporaneo: ottieni tutte le immagini dal backend
            const response = await this.client.get('/api/upload');
            return { images: response.data || [] };
        } catch (error) {
            console.error('Errore nel recupero immagini', error);
            return { images: [] };
        }
    }

    // Cerca immagini per tag
    async searchImagesByTag(userId, tag) {
        try {
            // Per ora simula una ricerca per tag
            const allImages = await this.getUserImages(userId);
            const filtered = allImages.images.filter(img =>
                img.tags && img.tags.includes(tag)
            );
            return { images: filtered };
        } catch (error) {
            console.error('Errore nella ricerca per tag', error);
            return { images: [] };
        }
    }

    // Ottieni tag popolari
    async getPopularTags(userId, maxTags = 20) {
        try {
            return {
                tags: [
                    { tag: "natura", count: 5 },
                    { tag: "città", count: 3 },
                    { tag: "persone", count: 2 }
                ]
            };
        } catch (error) {
            console.error('Errore nel recupero tag', error);
            return { tags: [] };
        }
    }
}

export default new ApiService();
