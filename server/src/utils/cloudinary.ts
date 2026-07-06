import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'mock',
  api_key: process.env.CLOUDINARY_API_KEY || 'mock',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'mock',
});

export const uploadToCloudinary = async (fileBuffer: Buffer, folder = 'arbeit_sports'): Promise<string> => {
  return new Promise((resolve, reject) => {
    // If not configured, write locally and serve as static file
    if (process.env.CLOUDINARY_CLOUD_NAME === 'mock' || !process.env.CLOUDINARY_CLOUD_NAME) {
      console.warn('Cloudinary not configured. Writing file to local uploads directory.');
      
      const uploadsDir = path.join(__dirname, '../../uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.jpg`;
      const filepath = path.join(uploadsDir, filename);

      try {
        fs.writeFileSync(filepath, fileBuffer);
        return resolve(`/uploads/${filename}`);
      } catch (err) {
        console.error('Error writing file locally:', err);
        return reject(err);
      }
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'auto' },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return reject(error);
        }
        resolve(result?.secure_url || '');
      }
    );

    uploadStream.end(fileBuffer);
  });
};
