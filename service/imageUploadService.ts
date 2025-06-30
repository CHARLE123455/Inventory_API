import cloudinary  from 'cloudinary';
import config from '../config/config';

cloudinary.v2.config({
    cloud_name: config.cloudName,
    api_key: config.apiKey,
    api_secret: config.apiSecret,
});

async function uploadImageToCloudinary(file: Express.Multer.File): Promise<string> {
    const result = await cloudinary.v2.uploader.upload(file.path, {
        folder: 'inventory_items',
    });
    return result.secure_url;
}


export default uploadImageToCloudinary