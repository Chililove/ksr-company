<template>
  <div id="app">
    <NavBar @change-tab="handleTabChange" />

    <div v-if="activeTab === 'photos'">
      <ImageGallery />
    </div>

    <div v-else-if="activeTab === 'videos'">
      <h2>Videos</h2>
      <VideoGallery />
    </div>

    <div v-else-if="activeTab === 'drone'">
      <h2>Drone Videos</h2>
      <p>Here will be drone videos maybe</p>
    </div>

    <div v-else-if="activeTab === 'upload'">
      <UploadFilesForm />
    </div>

    <img alt="Vue logo" src="./assets/logo.png" />
    <!-- <HelloWorld msg="Welcome to Your Vue.js App" /> -->
  </div>
</template>

<script>
//import HelloWorld from './components/HelloWorld.vue';
import ImageGallery from './components/ImageGallery.vue';
import UploadFilesForm from './components/UploadFilesForm.vue';
import NavBar from './components/NavBar.vue';
import VideoGallery from './components/VideoGallery.vue';

export default {
  name: 'App',
  components: {
    // HelloWorld,
    ImageGallery,
    UploadFilesForm,
    NavBar,
    VideoGallery
  },
  data() {
    return {
      activeTab: 'photos', // Default tab
    };
  },
  methods: {
    handleTabChange(tab) {
      this.activeTab = tab; // Update the active tab based on Navbar click
    },
  },
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
