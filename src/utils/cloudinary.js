import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilepath) => {
  try {
    if (!localFilepath) return null;
    const response = await cloudinary.uploader.upload(localFilepath, {
      resource_type: "auto",
    });
    console.log("File uploaded. File src: " + response.url);

    //once the file is uploaded to cloudinary then we need to delete the file from our server
    fs.unlinkSync(localFilepath);
    return response;
  } catch (error) {
    //if there is error in reaching the filepath then we need to remove/delete the file from our server
    //and return null as nothing resides at that path
    fs.unlinkSync(localFilepath);
    return null;
  }
};

const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log("Deleted from cloudinary... PublicId:", publicId);
  } catch (error) {
    console.log("Error deleting images from cloudinary", error);
    return null;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
