// app/actions/upload.ts
"use server"

import { v2 as cloudinary } from "cloudinary"

// 1. Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

interface UploadResult {
  url: string;
  public_id: string;
}

export async function uploadImage(formData: FormData): Promise<UploadResult | null> {
  const file = formData.get("file") as File
  
  if (!file) {
    throw new Error("No file found in form data")
  }

  // 2. Convert file to buffer for Cloudinary
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // 3. Upload to Cloudinary using a Promise wrapper
  // We wrap this because Cloudinary's stream API is callback-based
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: "student-verifications", // Optional: organize in folders
        resource_type: "auto",           // Auto-detect image/pdf
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Upload Error:", error)
          reject(error)
        } else {
          resolve({
            url: result?.secure_url || "",
            public_id: result?.public_id || ""
          })
        }
      }
    ).end(buffer) // Write the buffer to the stream
  })
}