<template>
    <div>
        <h2>Upload Media</h2>
        <form @submit.prevent="uploadMedia">
            <input v-model="title" type="text" placeholder="Title" required />
            <input v-model="description" type="text" placeholder="Description" required />
            <select v-model="mediaType">
                <option value="image">Image</option>
                <option value="video">Video</option>
            </select>
            <input type="file" @change="onFileChange" required />
            <button type="submit">Upload</button>
        </form>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: 'UploadFilesForm',
    data() {
        return {
            title: '',
            description: '',
            mediaType: 'image',
            selectedFile: null,
        };
    },
    methods: {
        onFileChange(event) {
            this.selectedFile = event.target.files[0];
        },
        async uploadMedia() {
            const formData = new FormData();
            formData.append('title', this.title);
            formData.append('description', this.description);
            formData.append('mediaType', this.mediaType);
            formData.append('media', this.selectedFile);

            try {
                const response = await axios.post('http://localhost:3000/upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                alert(response.data.message);
            } catch (error) {
                console.error('Error uploading media:', error);
                alert('Error uploading media');
            }
        }
    }
};
</script>