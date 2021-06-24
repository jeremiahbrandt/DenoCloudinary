import { Sha256 } from "https://deno.land/std@0.99.0/hash/sha256.ts";

type ErrorCode = { message: string };
interface IUploadResponse {
  secure_url: string;
  error?: ErrorCode;
}

interface IDestroyResponse {
  result: string;
  error?: ErrorCode;
}

interface ICloudinary {
  uploadImage(imageName: string, image: Blob): Promise<string>;
  destroyImage(imageName: string): Promise<void>;
}

interface ICloudinaryOptions {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

interface IAuthorization {
  timestamp: string;
  signature: string;
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
    const { timestamp, signature } = this.generateAuthorization(imageName);

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

  public async destroyImage(imageName: string): Promise<void> {
    const { timestamp, signature } = this.generateAuthorization(imageName);
    const formData = new FormData();
    formData.append("public_id", imageName);
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);
    formData.append("api_key", this.apiKey);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${this.cloudName}/image/destroy`,
      {
        method: "POST",
        body: formData,
      },
    );

    const json = await response.json() as IDestroyResponse;
    if (json.error) {
      throw new Error(json.error.message);
    }
  }

  private generateAuthorization(publicId: string): IAuthorization {
    const timestamp = Math.round((new Date()).getTime() / 1000).toString();
    const params = `public_id=${publicId}&timestamp=${timestamp}`;
    const signature = new Sha256().update(`${params}${this.apiSecret}`).hex();

    return { timestamp, signature };
  }
}
