import puter from "@heyputer/puter.js";
import { AI_IMAGE_MODEL, ROOMIFY_RENDER_PROMPT } from "./constants";

export const fetchAsDataUrl = async (url: string): Promise<string> => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }

  const blob = await response.blob();
  if (!blob.size || (blob.type && !blob.type.startsWith("image/"))) {
    throw new Error("The image service did not return a valid image.");
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("We couldn't read the generated image."));
    };
    reader.onerror = () =>
      reject(reader.error || new Error("We couldn't read the generated image."));
    reader.onabort = () => reject(new Error("Reading the image was canceled."));
    reader.readAsDataURL(blob);
  });
};

export const generate3DView = async ({ sourceImage }: Generate3DViewParams) => {
  if (!sourceImage.trim()) throw new Error("A floor plan image is required.");

  const response = await puter.ai.txt2img(ROOMIFY_RENDER_PROMPT, {
    model: AI_IMAGE_MODEL,
    // Puter accepts hosted URLs and complete data URIs directly. This avoids
    // a browser-side CORS fetch before the image-to-image request.
    input_images: [sourceImage],
    ratio: { w: 1, h: 1 },
    quality: "1K",
  });

  const rawImageUrl = response?.src;

  if (!rawImageUrl) {
    throw new Error("The image service returned no image. Please try again.");
  }

  const renderedImage = rawImageUrl.startsWith("data:")
    ? rawImageUrl
    : await fetchAsDataUrl(rawImageUrl);

  return { renderedImage, renderedPath: undefined };
};
