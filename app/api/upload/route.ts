// app/api/upload/route.ts - JWT-SÄKRAD VERSION

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import crypto from 'crypto';
import { verifyAccessToken } from '@/lib/auth/jwt';

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Startar JWT-säkrad upload process...');
    
    // JWT AUTH CHECK
    const token = request.headers.get('authorization')?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json(
        { error: 'No authentication token provided' },
        { status: 401 }
      );
    }

    const user = verifyAccessToken(token);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    console.log('✅ User authenticated:', user.email);
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    // Skapa säker filstruktur MED användarinfo
    const uploadsDir = join(process.cwd(), 'uploads');
    await mkdir(uploadsDir, { recursive: true });
    
    // Generera säkert filnamn med teamId
    const timestamp = Date.now();
    const randomId = Math.random().toString().substring(2);
    const fileName = `${user.teamId || 'default'}-${timestamp}-${randomId}`;
    
    console.log('📁 Skapar fil för team:', user.teamId || 'default');
    console.log('📁 Filnamn:', fileName);
    
    // Läs fil-data
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    console.log('📦 Original filstorlek:', fileBuffer.length);
    
    // STARK KRYPTERING (din befintliga logik)
    const encryptionResult = encryptFile(fileBuffer);
    console.log('🔐 Fil krypterad, krypterad storlek:', encryptionResult.encryptedData.length);
    
    // Spara krypterad fil
    const filePath = join(uploadsDir, fileName);
    await writeFile(filePath, encryptionResult.encryptedData);
    console.log('✅ Krypterad fil sparad:', filePath);
    
    // Skapa KOMPLETT metadata med JWT user info
    const metadata = {
      encryptionKey: encryptionResult.key,
      iv: encryptionResult.iv,
      authTag: encryptionResult.authTag,
      algorithm: 'aes-256-gcm',
      originalName: file.name,
      originalSize: fileBuffer.length,
      encryptedSize: encryptionResult.encryptedData.length,
      mimeType: file.type,
      uploadTime: new Date().toISOString(),
      encryptedFilename: fileName,
      // JWT USER INFO
      uploadedBy: user.userId,
      userEmail: user.email,
      teamId: user.teamId || 'default-team',
      version: '3.0-jwt'
    };
    
    // Spara metadata
    const metaPath = join(uploadsDir, `${fileName}.meta.json`);
    await writeFile(metaPath, JSON.stringify(metadata, null, 2));
    console.log('📋 Metadata sparad:', metaPath);
    
    // Verifiera dekryptering (din befintliga logik)
    try {
      const testDecrypted = decryptFile(
        encryptionResult.encryptedData,
        encryptionResult.key,
        encryptionResult.iv,
        encryptionResult.authTag
      );
      console.log('✅ Dekryptering verifierad, storlek:', testDecrypted.length);
      
      if (testDecrypted.length !== fileBuffer.length) {
        throw new Error('Dekrypterad fil har fel storlek!');
      }
    } catch (verifyError) {
      console.error('❌ KRITISKT: Dekryptering misslyckades!', verifyError);
      return NextResponse.json({
        error: 'Encryption verification failed',
        details: verifyError instanceof Error ? verifyError.message : 'Unknown error'
      }, { status: 500 });
    }
    
    // Returnera säker response med user info
    return NextResponse.json({
      success: true,
      encrypted: true,
      url: `/api/download/${fileName}`,
      fileName: fileName,
      originalName: file.name,
      mimeType: file.type,
      size: fileBuffer.length,
      encryptedSize: encryptionResult.encryptedData.length,
      uploadTime: metadata.uploadTime,
      uploadedBy: user.email,
      teamId: user.teamId || 'default-team',
      version: '3.0-jwt'
    });
    
  } catch (error) {
    console.error('❌ Upload error:', error);
    return NextResponse.json({
      error: 'Upload failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// 🔐 SÄKER KRYPTERINGSFUNKTION (din befintliga)
function encryptFile(fileBuffer: Buffer) {
  const algorithm = 'aes-256-gcm';
  const key = crypto.randomBytes(32);
  const iv = crypto.randomBytes(12);
  
  console.log('🔐 Genererar kryptering...');
  console.log('🔑 Nyckel längd:', key.length, 'bytes');
  console.log('🔒 IV längd:', iv.length, 'bytes');
  
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(fileBuffer),
    cipher.final()
  ]);
  
  const authTag = cipher.getAuthTag();
  const encryptedData = Buffer.concat([iv, authTag, encrypted]);
  
  return {
    encryptedData,
    key: key.toString('base64'),
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64')
  };
}

// 🔓 DEKRYPTERINGSFUNKTION för verifiering (din befintliga)
function decryptFile(encryptedData: Buffer, keyBase64: string, ivBase64: string, authTagBase64: string): Buffer {
  const algorithm = 'aes-256-gcm';
  
  try {
    const key = Buffer.from(keyBase64, 'base64');
    const iv = Buffer.from(ivBase64, 'base64');
    const authTag = Buffer.from(authTagBase64, 'base64');
    
    const dataStart = iv.length + authTag.length;
    const actualData = encryptedData.slice(dataStart);
    
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    decipher.setAuthTag(authTag);
    
    const decrypted = Buffer.concat([
      decipher.update(actualData),
      decipher.final()
    ]);
    
    return decrypted;
    
  } catch (error) {
    throw new Error(`Dekryptering misslyckades: ${error instanceof Error ? error.message : 'Okänt fel'}`);
  }
}