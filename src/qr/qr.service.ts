import qr, { Options } from 'qr-image'

async function generateQr(data: string) {
    const qrCodeOptions: Options = {
        ec_level: 'H',
        margin: 1,
        size: 9,
    };

    const qr_png = qr.imageSync(data, qrCodeOptions);
    // return qr_png;

    const response = new Response(qr_png, {
        headers: {
            'Content-Type': 'image/png',
        },
    });
    return response;
}

export const qrService = {
    generateQr
};

export default qrService;

export type QrService = typeof qrService;