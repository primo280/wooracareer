import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { randomUUID } from "crypto"

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
      return NextResponse.json({ error: 'No file received.' }, { status: 400 })
    }

    // Validate file type
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    const allowedPdfTypes = ['application/pdf']
    const allowedTypes = [...allowedImageTypes, ...allowedPdfTypes]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({
        error: 'Invalid file type. Only images (JPEG, PNG, GIF, WebP) and PDFs are allowed.'
      }, { status: 400 })
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({
        error: 'File too large. Maximum size is 10MB.'
      }, { status: 400 })
    }

    // Generate unique filename
    const extension = file.name.split('.').pop()
    const filename = `${randomUUID()}.${extension}`

    // Determine upload directory based on file type
    const isImage = allowedImageTypes.includes(file.type)
    const uploadDir = isImage ? 'images' : 'pdfs'

    // Create directory if it doesn't exist
    const uploadPath = join(process.cwd(), 'public', 'uploads', uploadDir)
    try {
      await mkdir(uploadPath, { recursive: true })
    } catch (error) {
      // Directory might already exist, continue
    }

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filePath = join(uploadPath, filename)
    await writeFile(filePath, buffer)

    // Return the public URL
    const publicUrl = `/uploads/${uploadDir}/${filename}`

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: filename,
      type: isImage ? 'image' : 'pdf'
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json({ error: 'Error uploading file.' }, { status: 500 })
  }
}
