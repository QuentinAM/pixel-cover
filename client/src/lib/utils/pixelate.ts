import type { CoverType } from "$lib/type";
import type { Cover } from "$lib/websocket/types";

export async function PixelateImage(url: any, pixelate_factor: number, callback: any)
{
    const response = await fetch(url);
    const blob = await response.blob();
    const img = new Image();
    img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Pixelate image
        for (let y = 0; y < canvas.height; y += pixelate_factor) {
            for (let x = 0; x < canvas.width; x += pixelate_factor) {
                const i = (y * canvas.width + x) * 4;
                for (let dy = 0; dy < pixelate_factor; dy++) {
                    for (let dx = 0; dx < pixelate_factor; dx++) {
                        const j = ((y + dy) * canvas.width + (x + dx)) * 4;
                        data[j] = data[i];
                        data[j + 1] = data[i + 1];
                        data[j + 2] = data[i + 2];
                    }
                }
            }
        }

        ctx.putImageData(imageData, 0, 0);
        callback(canvas.toDataURL());
    };
    img.src = URL.createObjectURL(blob);
}

export async function PixelateCovers(covers: CoverType[], pixelate_factor: number): Promise<Cover[]> {
    return new Promise(async (resolve, reject) => {
        let res: any = [];
        for (let i = 0; i < covers.length; i++) {
            const cover = covers[i];
            await PixelateImage(cover.link, pixelate_factor, (url: string) => {
                res.push({
                    link: url,
                    title: cover.title,
                    artist: cover.artist,
                    first_to_found_id: [],
                    others_to_found_id: []
                });
                if (i === covers.length - 1) {
                    resolve(res);
                }
            });
        }
    });
}