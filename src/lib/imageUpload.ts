/**
 * Prepara una foto per il server: la rimpicciolisce (lato lungo al massimo 2000 px, JPEG) così parte in fretta anche con
 * poca rete e resta sotto il limite delle funzioni. Un PDF passa così com'è, se non è troppo grande.
 */
const MAX_SIDE = 2000;
const MAX_PDF_BYTES = 6 * 1024 * 1024;

const readAsBase64 = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
    reader.onerror = () => reject(new Error('Non riesco a leggere il file.'));
    reader.readAsDataURL(blob);
  });

const loadImage = (file: File) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Questa foto non si apre: prova a scattarla di nuovo.'));
    };
    img.src = url;
  });

export async function prepareUpload(file: File): Promise<{ data: string; mimeType: string }> {
  if (file.type === 'application/pdf') {
    if (file.size > MAX_PDF_BYTES) throw new Error('Il PDF è troppo grande (massimo 6 MB).');
    return { data: await readAsBase64(file), mimeType: 'application/pdf' };
  }
  if (!file.type.startsWith('image/')) throw new Error('Carica una foto o un PDF.');
  const img = await loadImage(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.naturalWidth * scale);
  canvas.height = Math.round(img.naturalHeight * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Non riesco a preparare la foto.');
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85));
  if (!blob) throw new Error('Non riesco a preparare la foto.');
  return { data: await readAsBase64(blob), mimeType: 'image/jpeg' };
}
