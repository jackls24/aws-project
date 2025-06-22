import apiService from './apiService';

class S3Service {
    constructor() {
        this.config = {
            region: 'us-east-1',
            bucketName: 'imagegallery-1-us-east-1'
        };
    }

    // Verifica se il servizio è configurato correttamente
    isConfigured() {
        return !!localStorage.getItem('token'); // Se abbiamo un token di autenticazione, possiamo operare
    }

    getConfig() {
        return this.config;
    }

    // Upload di un file tramite il backend
    async uploadFile(file, metadata = {}, userId = null) {
        try {
            // Crea un FormData per l'upload multiparte
            const formData = new FormData();
            formData.append('file', file);

            // Aggiungi tutti i metadati al form
            Object.keys(metadata).forEach(key => {
                formData.append(key, metadata[key]);
            });

            // Aggiungi lo userId se fornito
            if (userId) {
                formData.append('userId', userId);
            }

            // Usa il servizio API per caricare il file
            const response = await apiService.uploadImage(formData);

            console.log('File caricato con successo:', response);
            return {
                success: true,
                data: {
                    url: response.url,
                    key: response.filename,
                    bucket: this.config.bucketName,
                    name: response.name,
                    tags: response.tags || []
                }
            };
        } catch (error) {
            console.error('Errore durante il caricamento del file:', error);
            return {
                success: false,
                error: error.message || 'Errore durante il caricamento del file'
            };
        }
    }

    // Elimina un file tramite il backend
    async deleteFile(filename) {
        try {
            // Usa il servizio API per eliminare il file
            await apiService.deleteImage(filename);
            console.log('File eliminato con successo:', filename);
            return true;
        } catch (error) {
            console.error('Errore durante l\'eliminazione del file:', error);
            return false;
        }
    }

    // Scarica un file
    async downloadFile(key, fileName) {
        try {
            // Costruisci l'URL pubblico del file su S3
            const fileUrl = `https://${this.config.bucketName}.s3.${this.config.region}.amazonaws.com/${key}`;

            // Crea un link temporaneo per il download
            const link = document.createElement('a');
            link.href = fileUrl;
            link.setAttribute('download', fileName || key);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            return true;
        } catch (error) {
            console.error('Errore durante il download del file:', error);
            return false;
        }
    }
}

export default new S3Service();