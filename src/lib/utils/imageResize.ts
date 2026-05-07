/**
 * Canvas API を使用して画像をリサイズし JPEG Blob を返すユーティリティ。
 * リサイズ後の最大辺は maxSize px 以内、アスペクト比は維持する。
 */
export async function resizeImageToBlob(
  file: File,
  maxSize: number = 400,
  quality: number = 0.85
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (readerEvent) => {
      const dataUrl = readerEvent.target?.result;
      if (typeof dataUrl !== 'string') {
        reject(new Error('FILEREADER_ERROR'));
        return;
      }

      const img = new Image();
      img.onload = () => {
        const { width, height } = img;

        // 両辺が maxSize 以内の場合はリサイズ不要（scale = 1）
        const scale = Math.min(maxSize / width, maxSize / height, 1);
        const targetWidth = Math.round(width * scale);
        const targetHeight = Math.round(height * scale);

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('CANVAS_CONTEXT_ERROR'));
          return;
        }

        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('CANVAS_TO_BLOB_ERROR'));
              return;
            }
            resolve(blob);
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => reject(new Error('IMAGE_LOAD_ERROR'));
      img.src = dataUrl;
    };

    reader.onerror = () => reject(new Error('FILEREADER_ERROR'));
    reader.readAsDataURL(file);
  });
}
