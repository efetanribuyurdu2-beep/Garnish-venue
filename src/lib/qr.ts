import QRCode from "qrcode";

/** A QR code as an inline SVG string (dark modules on a light tile: phones read it reliably). */
export async function qrSvg(text: string, dark = "#111111", light = "#ffffff") {
  return QRCode.toString(text, { type: "svg", errorCorrectionLevel: "M", margin: 1, color: { dark, light } });
}
