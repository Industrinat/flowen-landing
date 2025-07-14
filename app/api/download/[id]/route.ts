// app/api/download/[id]/route.ts - FIXED VERSION

import { NextRequest, NextResponse } from 'next/server';
import { readFile, access } from 'fs/promises';
import { join } from 'path';
import crypto from 'crypto';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // FIXED: Added Promise<>
) {
  try {
    // FIXED: Await the params
    const { id: fileId } = await params;
    console.log('🔍 Säker download för fil:', fileId);
    
    const uploadsDir = join(process.cwd(), 'uploads');
    const fileName = fileId.endsWith('.enc') ? fileId.slice(0, -4) : fileId;
    const filePath = join(uploadsDir, fileName);
    const metaPath = join(uploadsDir, `${fileName}.meta.json`);
    
    console.log('📁 Filsökväg:', filePath);
    console.log('📄 Metadata-sökväg:', metaPath);
    
    // Kontrollera att filen existerar
    try {
      await access(filePath);
      console.log('✅ Krypterad fil hittad');
    } catch {
      console.log('❌ Fil inte hittad:', filePath);
      return NextResponse.json(
        { error: 'File not found', filePath },
        { status: 404 }
      );
    }
    
    // Läs metadata
    let metadata;
    try {
      const metaContent = await readFile(metaPath, 'utf-8');
      metadata = JSON.parse(metaContent);
      console.log('📋 Metadata loaded för:', metadata.originalName);
      console.log('🔐 Metadata version:', metadata.version || 'legacy');
    } catch (error) {
      console.error('❌ Metadata fel:', error);
      return NextResponse.json(
        { error: 'Metadata not found or corrupted' },
        { status: 500 }
      );
    }
    
    // Kontrollera krypteringsdata
    if (!metadata.encryptionKey) {
      console.error('❌ SÄKERHETSFEL: Ingen krypteringsnyckel i metadata!');
      return NextResponse.json({
        error: 'Security error: No encryption key found',
        available: Object.keys(metadata),
        securityLevel: 'COMPROMISED'
      }, { status: 500 });
    }
    
    // Läs krypterad fil
    const encryptedBuffer = await readFile(filePath);
    console.log('📦 Krypterad fil läst, storlek:', encryptedBuffer.length);
    
    // SÄKER DEKRYPTERING
    try {
      let decryptedBuffer;
      
      if (metadata.version === '2.0') {
        // Ny säker version
        console.log('🔓 Använder säker v2.0 dekryptering...');
        decryptedBuffer = secureDecrypt(
          encryptedBuffer,
          metadata.encryptionKey,
          metadata.iv,
          metadata.authTag
        );
      } else {
        // Legacy version (fallback)
        console.log('🔓 Använder legacy dekryptering...');
        decryptedBuffer = legacyDecrypt(encryptedBuffer, metadata);
      }
      
      console.log('✅ Dekryptering lyckades, storlek:', decryptedBuffer.length);
      
      // Verifiera integritet
      if (metadata.originalSize && decryptedBuffer.length !== parseInt(metadata.originalSize)) {
        console.warn('⚠️ VARNING: Dekrypterad fil har fel storlek!');
        console.warn('Förväntat:', metadata.originalSize, 'Faktisk:', decryptedBuffer.length);
      }
      
      // Säker respons
      return new Response(decryptedBuffer, {
        headers: {
          'Content-Type': metadata.mimeType || 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${metadata.originalName}"`,
          'Content-Length': decryptedBuffer.length.toString(),
          'X-File-Integrity': 'verified',
          'X-Encryption-Version': metadata.version || 'legacy'
        }
      });
      
    } catch (decryptError) {
      console.error('❌ SÄKERHETSFEL: Dekryptering misslyckades!', decryptError);
      return NextResponse.json({
        error: 'Decryption failed - file may be corrupted or key invalid',
        securityLevel: 'COMPROMISED',
        details: decryptError instanceof Error ? decryptError.message : 'Unknown error'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('❌ Download error:', error);
    return NextResponse.json({
      error: 'Download failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// 🔓 SÄKER DEKRYPTERING för v2.0
function secureDecrypt(encryptedData: Buffer, keyBase64: string, ivBase64: string, authTagBase64: string): Buffer {
  const algorithm = 'aes-256-gcm';
  
  try {
    // Konvertera från base64
    const key = Buffer.from(keyBase64, 'base64');
    const iv = Buffer.from(ivBase64, 'base64');
    const authTag = Buffer.from(authTagBase64, 'base64');
    
    console.log('🔓 Säker dekryptering...');
    console.log('🔑 Nyckel längd:', key.length);
    console.log('🔒 IV längd:', iv.length);
    console.log('🛡️ AuthTag längd:', authTag.length);
    
    // Extrahera ren data (hoppa över IV och AuthTag från början)
    const dataStart = iv.length + authTag.length;
    const actualData = encryptedData.slice(dataStart);
    
    console.log('📦 Ren data längd:', actualData.length);
    
    // Skapa decipher
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    decipher.setAuthTag(authTag);
    
    // Dekryptera - FIXAD VERSION
    const decrypted = Buffer.concat([
      decipher.update(actualData),
      decipher.final()  // <-- Detta saknades!
    ]);
    
    console.log('✅ Säker dekryptering klar, storlek:', decrypted.length);
    return decrypted;
    
  } catch (error) {
    console.error('❌ Säker dekryptering misslyckades:', error);
    throw new Error(`Secure decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// 🔓 LEGACY DEKRYPTERING (fallback)
function legacyDecrypt(encryptedData: Buffer, metadata: any): Buffer {
  const algorithm = 'aes-256-gcm';
  
  try {
    console.log('🔓 Legacy dekryptering...');
    
    // Extrahera komponenter från encrypted data
    const iv = encryptedData.slice(0, 16);
    const authTag = encryptedData.slice(16, 32);
    const actualData = encryptedData.slice(32);
    
    // Konvertera nyckel
    const key = Buffer.from(metadata.encryptionKey, 'base64');
    
    console.log('🔑 Legacy nyckel längd:', key.length);
    console.log('🔒 Legacy IV längd:', iv.length);
    console.log('🛡️ Legacy AuthTag längd:', authTag.length);
    console.log('📦 Legacy data längd:', actualData.length);
    
    // Skapa decipher
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    decipher.setAuthTag(authTag);
    
    // Dekryptera
    const decrypted = Buffer.concat([
      decipher.update(actualData),
      decipher.final()
    ]);
    
    console.log('✅ Legacy dekryptering klar, storlek:', decrypted.length);
    return decrypted;
    
  } catch (error) {
    console.error('❌ Legacy dekryptering misslyckades:', error);
    throw new Error(`Legacy decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}