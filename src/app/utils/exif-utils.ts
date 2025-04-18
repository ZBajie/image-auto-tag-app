import * as piexif from 'piexifjs';

export async function readExifMetaData(imageFile: File) {
  const imageData64 = await convertFileToBase64(imageFile);

  try {
    if (!imageData64.startsWith('data:image/jpeg;base64,')) {
      console.warn('Not a JPEG image. EXIF data may not be present.');
      return null;
    }

    const exifData = piexif.load(imageData64);
    return exifData;
  } catch (error) {
    console.error('Error reading EXIF metadata:', error);
    return null;
  }
}

export function convertFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}
