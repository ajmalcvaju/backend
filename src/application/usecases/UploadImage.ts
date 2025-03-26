import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDNAME as string,
  api_key: process.env.CLOUDAPIKEY as string,
  api_secret: process.env.CLOUDINARYSECRET as string,
});

export const uploadedImage = async (files: Express.Multer.File[]): Promise<string[]> => {
  const uploadedImages: string[] = [];
  try {
    for (const file of files) {
      const result = await cloudinary.uploader.upload(file.path);
      uploadedImages.push(result.url);
    }
    return uploadedImages;
  } catch (error) {
    console.error("Error uploading images: ", error);
    throw new Error("Failed to upload images. Please try again.");
  }
};
