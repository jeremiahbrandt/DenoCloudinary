import { config } from "https://deno.land/x/dotenv/mod.ts";
import { Cloudinary } from "./Cloudinary.ts";

main();

async function main() {
  const { CLOUD_NAME, API_KEY, API_SECRET } = config({ safe: true });
  const fileName = await (await prompt("Enter file name"));
  const blob = new Blob([(await Deno.readFile(fileName)).buffer]);

  const cloudinary = new Cloudinary({
    cloudName: CLOUD_NAME,
    apiKey: API_KEY,
    apiSecret: API_SECRET,
  });
  cloudinary.uploadImage(fileName.split(".")[0], blob);
}

async function prompt(message: string) {
  const buf = new Uint8Array(1024);
  await Deno.stdout.write(new TextEncoder().encode(message + ": "));
  const n = <number> await Deno.stdin.read(buf);
  return new TextDecoder().decode(buf.subarray(0, n)).trim();
}
