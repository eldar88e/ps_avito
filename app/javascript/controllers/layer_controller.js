import { Controller } from "@hotwired/stimulus";
import Uppy from "@uppy/core"
import Dashboard from "@uppy/dashboard"
import ImageEditor from "@uppy/image-editor"
import XHRUpload from "@uppy/xhr-upload";

export default class extends Controller {

  static targets = ["dashboard", "preview", "imageUrl"];

  connect() {
    this.initializeUppy();
  }

  initializeUppy() {
    this.uppy = new Uppy({
      id: 'uppy',
      autoProceed: false,
      restrictions: {
        maxFileSize: 5000000, // 5 MB
        maxNumberOfFiles: 1,
        minNumberOfFiles: 1,
        allowedFileTypes: ['image/*']
      }
    })
        .use(Dashboard, {
          inline: true,
          target: this.dashboardTarget,
          showProgressDetails: true,
          height: 500
        })
        .use(ImageEditor, {
          quality: 0.8
        })
        .use(XHRUpload, {
          endpoint: '/upload',
          formData: true,
          fieldName: 'image_layer[layer]'
        });

    this.uppy.on('file-added', (file) => {
      this.updatePreview(file);
    });

    this.uppy.on('upload-success', (file, response) => {
      this.imageUrlTarget.value = response.body.url;
      console.log('Upload successful:', response);
    });
  }

  updatePreview(file) {
    const reader = new FileReader();
    reader.onload = () => {
      const previewImage = this.previewTarget.querySelector('img');
      previewImage.src = reader.result;
    };
    reader.readAsDataURL(file.data);
  }
}
