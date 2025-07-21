import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

class ApiService {


    constructor() {
        this.client = axios.create({
            baseURL: API_BASE_URL,
            timeout: 30000,
        });

        this.client.interceptors.request.use(
            (config) => {
                if (config.url.startsWith('/api/')) {
                    const idToken = localStorage.getItem('idToken');
                    if (idToken) {
                        config.headers['Authorization'] = `Bearer ${idToken}`;
                    }
                }
                else if (config.url.startsWith('/auth/')) {
                    const accessToken = localStorage.getItem('token');
                    if (accessToken) {
                        config.headers['Authorization'] = `Bearer ${accessToken}`;
                    }
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );
    }

    async createAlbum(albumName, userId) {
        const token = localStorage.getItem('idToken');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const response = await this.client.post('/api/albums', { albumName, userId }, { headers });
        return response.data;
    }

    async deleteAlbum(userId, albumName) {
        const token = localStorage.getItem('idToken');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const response = await this.client.delete(`/api/albums/${userId}/${albumName}`, { headers });
        return response.data;
    }


    async healthCheck() {
        const response = await this.client.get('/health');
        return response.data;
    }

    async uploadImage(formData, idToken = null, metadata = {}) {
        const token = idToken || localStorage.getItem('idToken');
        const headers = {
            'Content-Type': 'multipart/form-data',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        };

        Object.entries(metadata).forEach(([key, value]) => {
            headers[`x-amz-meta-${key}`] = value;
        });

        const response = await this.client.post('/api/upload', formData, { headers });
        return response.data;
    }

    async deleteImage(filename) {
        const response = await this.client.delete(`/api/delete/${filename}`);
        return response.data;
    }

    async getUserImages(userId) {
        try {
            const response = await this.client.get(`/api/images/${userId}`);
            return {
                images: response.data.images || [],
                album: response.data.album || []
            };
        } catch (error) {
            console.error('Errore nel recupero immagini', error);
            throw error;
        }
    }

    async searchImagesByTag(userId, tag) {
        try {
            const allImages = await this.getUserImages(userId);
            const filtered = allImages.images.filter(img =>
                img.tags && img.tags.some(imgTag =>
                    imgTag.toLowerCase().includes(tag.toLowerCase())
                )
            );
            return { images: filtered };
        } catch (error) {
            console.error('Errore nella ricerca per tag', error);
            return { images: [] };
        }
    }

    async getPopularTags(userId, maxTags = 20) {
        try {
            const response = await this.client.get(`/api/tags/${userId}`);
            const tags = response.data.tags || [];
            return { tags: tags.slice(0, maxTags) };
        } catch (error) {
            console.error('Errore nel recupero tag', error);
            return { tags: [] };
        }
    }

    async moveImageToAlbum(userId, filename, targetAlbum) {
        const token = localStorage.getItem('idToken');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const response = await this.client.post(`/api/images/move`, {
            userId,
            filename,
            targetAlbum
        }, { headers });
        return response.data;
    }
}

const apiServiceInstance = new ApiService();
export default apiServiceInstance;