import { Injectable } from "@nestjs/common";
import cloudinary from "../Config/cloud.config";
import { UploadApiResponse } from 'cloudinary';
import { Readable } from "stream";

interface UploadOptions {
  path: string;
  folder?: string;
  public_id?: string;
}

interface UploadStreamOptions {
  stream: Readable;
  folder: string;
}

@Injectable()
export class CloudService {
  async uploadFile({ path, folder, public_id }: UploadOptions): Promise<UploadApiResponse> {
    return cloudinary.uploader.upload(path, { folder, public_id });
  }

  async uploadFiles(files: Express.Multer.File[], folder: string): Promise<object[]> {
    const Images: object[] = [];
    for (const file of files) {
      const { secure_url, public_id } = await this.uploadFile({ path: file.path, folder });
      Images.push({ secure_url, public_id });
    }
    return Images;
  }

  async deleteFile(public_id: string) {
    await cloudinary.uploader.destroy(public_id);
  }

  async deleteFolderResources(path: string) {
    await cloudinary.api.delete_resources_by_prefix(path);
  }

  async deleteFolder(path: string) {
    await this.deleteFolderResources(path);
    await cloudinary.api.delete_folder(path);
  }

  async uploadFileStream({ stream, folder }: UploadStreamOptions): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
        if (error) return reject(error);
        resolve(result!);
      });

      stream.pipe(upload);
    });
  }

  async updateFile(public_id: string, path: string, folder: string) {
    await this.deleteFile(public_id);
  
    return await this.uploadFile({ path, folder, public_id });
  }
}
