<template>
    <nav class="navbar">
        <ul class="nav-list">
            <li @click="setActiveTab('photos')" :class="{ active: activeTab === 'photos' }">Photos</li>
            <li @click="setActiveTab('videos')" :class="{ active: activeTab === 'videos' }">Videos</li>
            <li @click="setActiveTab('drone')" :class="{ active: activeTab === 'drone' }">Drone Videos</li>
            <li @click="setActiveTab('upload')" :class="{ active: activeTab === 'upload' }">Upload</li>

        </ul>
    </nav>
</template>

<script>
export default {
    data() {
        return {
            activeTab: 'photos',
        };
    },
    methods: {
        setActiveTab(tab) {
            this.activeTab = tab;
            this.$emit('change-tab', tab);  // Emit event to parent
        },
    },
};
</script>

<style scoped>
.navbar {
    background-color: #333;
    padding: 1rem;
}

.nav-list {
    display: flex;
    list-style: none;
    justify-content: space-around;
}

.nav-list li {
    color: white;
    cursor: pointer;
    padding: 0.5rem 1rem;
}

.nav-list li.active {
    background-color: #555;
}

@media (max-width: 600px) {
    .nav-list {
        flex-direction: column;
    }

    .nav-list li {
        text-align: center;
    }
}
</style>