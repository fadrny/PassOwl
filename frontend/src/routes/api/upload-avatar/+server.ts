import { json } from '@sveltejs/kit';
import { v2 as cloudinary } from 'cloudinary';
import type { RequestHandler } from './$types';

// Konfigurace Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export const POST: RequestHandler = async ({ request }) => {
    try {
        const formData = await request.formData();
        const file = formData.get('avatar') as File;
        
        if (!file || file.size === 0) {
            return json({ error: 'Nebyl vybrán žádný soubor' }, { status: 400 });
        }

        // Kontrola typu souboru
        if (!file.type.startsWith('image/')) {
            return json({ error: 'Povoleny jsou pouze obrázky' }, { status: 400 });
        }

        // Kontrola velikosti (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return json({ error: 'Obrázek je příliš velký (max 5MB)' }, { status: 400 });
        }

        // Převod File na buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Nahrání do Cloudinary s transformacemi
        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    folder: 'passowl/avatars',
                    transformation: [
                        { width: 200, height: 200, crop: 'fill', gravity: 'face' },
                        { quality: 'auto' },
                        { format: 'webp' }
                    ],
                    public_id: `avatar_${Date.now()}`
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            ).end(buffer);
        });

        return json({ 
            url: (result as any).secure_url,
            public_id: (result as any).public_id
        });

    } catch (error) {
        console.error('Upload error:', error);
        return json({ error: 'Chyba při nahrávání obrázku' }, { status: 500 });
    }
};