import { describe, it, expect, vi, beforeEach } from 'vitest';
import { resizeImageToBlob } from './imageResize';

// Canvas API のモック
function createMockCanvas(blobResult: Blob | null = new Blob(['mock'], { type: 'image/jpeg' })) {
  return {
    width: 0,
    height: 0,
    getContext: vi.fn().mockReturnValue({
      drawImage: vi.fn(),
    }),
    toBlob: vi.fn().mockImplementation((callback: (blob: Blob | null) => void) => {
      callback(blobResult);
    }),
  };
}

// Image のモック（width/height を設定可能）
function mockImage(width: number, height: number) {
  const img = {
    onload: null as (() => void) | null,
    onerror: null as (() => void) | null,
    src: '',
    width,
    height,
  };

  // src が設定されたら onload を呼び出す
  Object.defineProperty(img, 'src', {
    set(val: string) {
      if (val && img.onload) {
        setTimeout(() => img.onload?.(), 0);
      }
    },
  });

  return img;
}

describe('resizeImageToBlob', () => {
  beforeEach(() => {
    // FileReader のモック
    vi.stubGlobal('FileReader', class {
      result: string | null = null;
      onload: ((e: { target: { result: string } }) => void) | null = null;
      onerror: (() => void) | null = null;
      readAsDataURL() {
        setTimeout(() => {
          this.result = 'data:image/jpeg;base64,mock';
          this.onload?.({ target: { result: this.result } });
        }, 0);
      }
    });
  });

  it('400×400 以内の画像はリサイズされない（scale=1）', async () => {
    const canvas = createMockCanvas();
    vi.stubGlobal('document', {
      createElement: vi.fn().mockReturnValue(canvas),
    });

    const imgInstance = mockImage(200, 200);
    vi.stubGlobal('Image', vi.fn().mockImplementation(() => imgInstance));

    const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
    const blob = await resizeImageToBlob(file, 400, 0.85);

    expect(canvas.width).toBe(200);
    expect(canvas.height).toBe(200);
    expect(blob).toBeInstanceOf(Blob);
  });

  it('800×600 の画像が 400×300 にリサイズされる（横長）', async () => {
    const canvas = createMockCanvas();
    vi.stubGlobal('document', {
      createElement: vi.fn().mockReturnValue(canvas),
    });

    const imgInstance = mockImage(800, 600);
    vi.stubGlobal('Image', vi.fn().mockImplementation(() => imgInstance));

    const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
    await resizeImageToBlob(file, 400, 0.85);

    expect(canvas.width).toBe(400);
    expect(canvas.height).toBe(300);
  });

  it('600×800 の画像が 300×400 にリサイズされる（縦長）', async () => {
    const canvas = createMockCanvas();
    vi.stubGlobal('document', {
      createElement: vi.fn().mockReturnValue(canvas),
    });

    const imgInstance = mockImage(600, 800);
    vi.stubGlobal('Image', vi.fn().mockImplementation(() => imgInstance));

    const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
    await resizeImageToBlob(file, 400, 0.85);

    expect(canvas.width).toBe(300);
    expect(canvas.height).toBe(400);
  });

  it('正方形 800×800 の画像が 400×400 にリサイズされる', async () => {
    const canvas = createMockCanvas();
    vi.stubGlobal('document', {
      createElement: vi.fn().mockReturnValue(canvas),
    });

    const imgInstance = mockImage(800, 800);
    vi.stubGlobal('Image', vi.fn().mockImplementation(() => imgInstance));

    const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
    await resizeImageToBlob(file, 400, 0.85);

    expect(canvas.width).toBe(400);
    expect(canvas.height).toBe(400);
  });

  it('戻り値が Blob であること', async () => {
    const mockBlob = new Blob(['jpeg-data'], { type: 'image/jpeg' });
    const canvas = createMockCanvas(mockBlob);
    vi.stubGlobal('document', {
      createElement: vi.fn().mockReturnValue(canvas),
    });

    const imgInstance = mockImage(200, 200);
    vi.stubGlobal('Image', vi.fn().mockImplementation(() => imgInstance));

    const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
    const result = await resizeImageToBlob(file, 400, 0.85);

    expect(result).toBeInstanceOf(Blob);
  });

  it('MIME タイプが image/jpeg であること', async () => {
    const mockBlob = new Blob(['jpeg-data'], { type: 'image/jpeg' });
    const canvas = createMockCanvas(mockBlob);
    vi.stubGlobal('document', {
      createElement: vi.fn().mockReturnValue(canvas),
    });

    const imgInstance = mockImage(200, 200);
    vi.stubGlobal('Image', vi.fn().mockImplementation(() => imgInstance));

    const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
    const result = await resizeImageToBlob(file, 400, 0.85);

    expect(result.type).toBe('image/jpeg');
  });

  it('Canvas toBlob が null を返した場合はエラーをスローする', async () => {
    const canvas = createMockCanvas(null);
    vi.stubGlobal('document', {
      createElement: vi.fn().mockReturnValue(canvas),
    });

    const imgInstance = mockImage(200, 200);
    vi.stubGlobal('Image', vi.fn().mockImplementation(() => imgInstance));

    const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
    await expect(resizeImageToBlob(file, 400, 0.85)).rejects.toThrow('CANVAS_TO_BLOB_ERROR');
  });
});
