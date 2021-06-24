import { Sha256 } from "https://deno.land/std/hash/sha256.ts";

interface IUploadResponse {
  secure_url: string;
  error?: { message: string };
}

interface ICloudinary {
  uploadImage(imageName: string, image: Blob): Promise<string>;
}

interface ICloudinaryOptions {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

export class Cloudinary implements ICloudinary {
  cloudName: string;
  apiKey: string;
  apiSecret: string;

  constructor(options: ICloudinaryOptions) {
    this.cloudName = options.cloudName;
    this.apiKey = options.apiKey;
    this.apiSecret = options.apiSecret;
  }

  public async uploadImage(
    imageName: string,
    image: Blob,
  ): Promise<string> {
    const timestamp = Math.round((new Date()).getTime() / 1000).toString();
    const params = `public_id=${imageName}&timestamp=${timestamp}`;
    const signature = new Sha256().update(`${params}${this.apiSecret}`).hex();

    const formData = new FormData();
    formData.append("file", image);
    formData.append("public_id", imageName);
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);
    formData.append("api_key", this.apiKey);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      },
    );
    const json = await response.json() as IUploadResponse;
    if (json.error) {
      throw new Error(json.error.message);
    }
    return json.secure_url;
  }
}
