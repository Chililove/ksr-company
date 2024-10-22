<template>
    <div>
      <h2>Gallery</h2>
  
      <!-- Show if no media is available -->
      <div v-if="media.length === 0">No media available</div>
  
      <!-- Display gallery of uploaded media -->
      <!-- <div class="media-grid">
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
      </div> -->
  
      <!-- Pre-made gallery boxes for placing images -->
      <h3>Assign Images to Gallery Slots</h3>
      <div class="image-boxes">
        <div
          v-for="(box, index) in imageBoxes"
          :key="index"
          class="image-box"
          @click="selectBox(index)"
        >
          <h3>Box {{ index + 1 }}</h3>
          <img v-if="box" :src="'http://localhost:3000/' + box.filePath" alt="Selected Image" />
          <p v-else>Select an image for this box</p>
        </div>
      </div>
  
      <!-- Hidden file input for each box -->
      <input
        type="file"
        ref="fileInput"
        style="display: none;"
        @change="onFileChange"
        v-show="true"
      />
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    name: 'ImageGallery',
    data() {
      return {
        media: [], // All uploaded media
        imageBoxes: [null, null, null, null], // Predefined gallery boxes (4 slots)
        selectedBoxIndex: null, // Track which gallery box is selected
        selectedFile: null, // Store the file selected by the user
      };
    },
    async mounted() {
        try {
        const response = await axios.get('http://localhost:3000/media');
        this.media = response.data;

        // Assign images to their respective boxes
        this.media.forEach(item => {
            if (item.boxIndex !== undefined && item.boxIndex !== null) {
                this.imageBoxes[item.boxIndex] = {
                    filePath: item.filePath,
                    mediaType: item.mediaType,
                };
            }
        });
    } catch (error) {
        console.error('Error fetching media', error);
    }
    },
    methods: {
      // Select a gallery box and open file input
      selectBox(index) {
        this.selectedBoxIndex = index;
        this.$refs.fileInput.click(); // Trigger hidden file input
      },
      // Handle file change (when a file is selected)
      async onFileChange(event) {
        this.selectedFile = event.target.files[0];
        const maxSize = 10 * 1024 * 1024;
        if (this.selectedFile.size > maxSize){
            alert('File is too large. Max. is 10MB.');
            return;
        }
        if (this.selectedFile) {
          await this.uploadFile();
        }
      },
      // Upload selected file and assign it to the selected gallery box
      async uploadFile() {
        const formData = new FormData();
        formData.append('media', this.selectedFile);
        formData.append('mediaType', this.selectedFile.type.startsWith('image') ? 'image' : 'video');
        formData.append('boxIndex', this.selectedBoxIndex);
  
        try {
          const response = await axios.post('http://localhost:3000/upload', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
  
        // Directly assign the uploaded media to the selected box in the array
        this.imageBoxes[this.selectedBoxIndex] = {
            filePath: response.data.filePath,
            mediaType: response.data.mediaType,
          };
  
                  // Immediately update the media array to reflect changes without refreshing
        this.media.push(response.data);


          this.selectedBoxIndex = null; // Reset selection after upload
        } catch (error) {
          console.error('Error uploading file:', error);
          alert('Error uploading media');
        }
      },
    },
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
  
  .image-boxes {
    display: flex;
    justify-content: space-around;
    margin-top: 20px;
  }
  
  .image-box {
    width: 150px;
    height: 150px;
    border: 1px solid #ccc;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    cursor: pointer;
  }
  
  .image-box img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  </style>
  