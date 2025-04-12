import { Injectable } from '@angular/core';
import * as mobilenet from '@tensorflow-models/mobilenet';
import * as tf from '@tensorflow/tfjs';

@Injectable({
  providedIn: 'root',
})
export class TensorflowService {
  private model: mobilenet.MobileNet | null = null;
  private modelLoaded = false;

  constructor() {
    this.loadModel();
  }

  private async loadModel() {
    await tf.ready();
    this.model = await mobilenet.load();
    this.modelLoaded = true;
  }

  private async ensureModelLoaded() {
    if (!this.modelLoaded) {
      await this.loadModel();
    }
  }

  async getTensorflowMobilenetTags(imageFile: File): Promise<string[]> {
    await this.ensureModelLoaded();
    if (!this.model) {
      console.warn('Model not loaded!');
      return [];
    }

    return new Promise((resolve) => {
      const imgSrc = URL.createObjectURL(imageFile);
      const image = new Image();
      image.src = imgSrc;
      image.onload = async () => {
        const predictions = await this.model!.classify(image);
        const tags = predictions.map((p) => p.className);
        console.log('Predicted Tags:', tags);
        resolve(tags);
      };
    });
  }
}
