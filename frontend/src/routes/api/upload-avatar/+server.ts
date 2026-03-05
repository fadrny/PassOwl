import { json } from '@sveltejs/kit';
import { v2 as cloudinary } from 'cloudinary';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

interface CloudinaryUploadResult {
	secure_url: string;
	public_id: string;
}

export const POST: RequestHandler = async ({ request }) => {
	try {
		// Kontrola environment variables
		const cloudName = env.SECRET_CLOUDINARY_CLOUD_NAME;
		const apiKey = env.SECRET_CLOUDINARY_API_KEY;
		const apiSecret = env.SECRET_CLOUDINARY_API_SECRET;

		if (!cloudName || !apiKey || !apiSecret) {
			console.error('Missing Cloudinary credentials:', {
				cloudName: !!cloudName,
				apiKey: !!apiKey,
				apiSecret: !!apiSecret
			});
			return json({ error: 'Chyba konfigurace serveru' }, { status: 500 });
		}

		// Konfigurace Cloudinary
		cloudinary.config({
			cloud_name: cloudName,
			api_key: apiKey,
			api_secret: apiSecret
		});

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

		console.log('Uploading to Cloudinary...');

		// Nahrání do Cloudinary s transformacemi
		const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
			cloudinary.uploader
				.upload_stream(
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
						if (error) {
							console.error('Cloudinary upload error:', error);
							reject(error);
						} else if (!result) {
							reject(new Error('Cloudinary upload returned no result'));
						} else {
							console.log('Cloudinary upload success:', result.secure_url);
							resolve(result);
						}
					}
				)
				.end(buffer);
		});

		return json({
			url: result.secure_url,
			public_id: result.public_id
		});
	} catch (error) {
		console.error('Upload error:', error);
		return json({ error: 'Chyba při nahrávání obrázku' }, { status: 500 });
	}
};
