<template>
    <div>
        <h2>Gallery</h2>
        <div v-if="media.length === 0">No media available</div>
        <div class="media-grid">
            <div v-for="item in media" :key="item._id" class="media-item">
                <h3>{{ item.title }}</h3>
                <p>{{ item.description }}</p>
                <div v-if="item.mediaType === 'image'">
                    <img :src="'http://localhost:3000/' + item.filePath" alt="Image" />
                </div>
                <div v-else>
                    <video controls :src="'http://localhost:3000/' + item.filePath"></video>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: 'ImageGallery',
    data() {
        return {
            media: [],
        };
    },
    async mounted() {
        try {
            const response = await axios.get('http://localhost:3000/media');
            this.media = response.data;
        } catch (error) {
            console.error('Error fetching media', error);
        }
    }
};
</script>

<style>
.media-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
}

.media-item img,
.media-item video {
    width: 100%;
}
</style>