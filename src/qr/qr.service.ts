import qr, { Options } from "qr-image";

async function generateQr(data: string) {
  const qrCodeOptions: Options = {
    ec_level: "H",
    margin: 1,
    size: 9,
  };

  const qr_png = qr.imageSync(data, qrCodeOptions);
  // return qr_png;

  const response = new Response(qr_png, {
    headers: {
      "Content-Type": "image/png",
    },
  });
  return response;
}

async function generateQrUri(data: string) {
  const qrCodeOptions: Options = {
    ec_level: "H",
    margin: 1,
    size: 9,
  };

  const qr_png = qr.imageSync(data, qrCodeOptions);
  const qrBase64 = qr_png.toString("base64");
  const qrURI = `data:image/png;base64,${qrBase64}`;

  return qrURI;
}

export const qrService = {
  generateQr,
  generateQrUri,
};

export default qrService;

export type QrService = typeof qrService;
