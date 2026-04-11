/**
 * Ticket — PDF generation + on-screen QR display
 * Uses jsPDF + qrcode libraries
 */

import { EVENT } from './invitation.js';

// ── On-screen QR ────────────────────────────────────────────────
export async function showQROnScreen(qrToken, container) {
  if (!container || !qrToken) return;
  try {
    const QRCode = (await import('qrcode')).default;
    const canvas = document.createElement('canvas');
    await QRCode.toCanvas(canvas, qrToken, {
      width: 180,
      margin: 1,
      color: { dark: '#0d2137', light: '#ffffff' },
    });
    container.innerHTML = '';
    container.appendChild(canvas);
  } catch (err) {
    console.error('QR error:', err);
  }
}

// ── PDF Generation ───────────────────────────────────────────────
export async function generateTicketPDF(guest) {
  try {
    const { jsPDF }  = await import('jspdf');
    const QRCode      = (await import('qrcode')).default;

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' });
    const W   = pdf.internal.pageSize.getWidth();  // 148mm
    const H   = pdf.internal.pageSize.getHeight(); // 210mm

    // ---- Background ----
    pdf.setFillColor(13, 33, 55); // --navy-dark
    pdf.rect(0, 0, W, H, 'F');

    // ---- Silver border ----
    pdf.setDrawColor(192, 192, 192);
    pdf.setLineWidth(0.5);
    pdf.rect(6, 6, W - 12, H - 12, 'S');
    pdf.setLineWidth(0.2);
    pdf.rect(8, 8, W - 16, H - 16, 'S');

    // ---- Header: XV AÑOS ----
    pdf.setFont('times', 'italic');
    pdf.setFontSize(10);
    pdf.setTextColor(192, 192, 192);
    pdf.text('XV AÑOS', W / 2, 22, { align: 'center' });

    // ---- Silver line ----
    pdf.setDrawColor(192, 192, 192);
    pdf.setLineWidth(0.3);
    pdf.line(20, 25, W - 20, 25);

    // ---- Main name ----
    pdf.setFont('times', 'bolditalic');
    pdf.setFontSize(22);
    pdf.setTextColor(240, 240, 240);
    pdf.text('Diana Yaretzi', W / 2, 38, { align: 'center' });
    pdf.setFontSize(14);
    pdf.setTextColor(192, 192, 192);
    pdf.text('Hdz Pérez', W / 2, 46, { align: 'center' });

    // ---- Silver line ----
    pdf.line(20, 50, W - 20, 50);

    // ---- Boleto label ----
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);
    pdf.setTextColor(140, 140, 140);
    pdf.text('BOLETO DE ENTRADA', W / 2, 58, { align: 'center', charSpace: 2 });

    // ---- Guest name ----
    pdf.setFont('times', 'bold');
    pdf.setFontSize(16);
    pdf.setTextColor(245, 240, 232);
    pdf.text(guest.nombre, W / 2, 68, { align: 'center', maxWidth: W - 40 });

    // ---- Tickets ----
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(192, 192, 192);
    pdf.text(`Válido para ${guest.numBoletos} ${guest.numBoletos === 1 ? 'persona' : 'personas'}`, W / 2, 76, { align: 'center' });

    // ---- Date / Time / Venue ----
    pdf.setFont('times', 'italic');
    pdf.setFontSize(11);
    pdf.setTextColor(220, 215, 205);
    pdf.text('04 de Julio de 2026 · 7:00 PM', W / 2, 86, { align: 'center' });
    if (EVENT.venue && EVENT.venue !== 'Por confirmar') {
      pdf.setFontSize(9);
      pdf.setTextColor(150, 150, 150);
      pdf.text(EVENT.venue, W / 2, 93, { align: 'center' });
    }

    // ---- Silver line ----
    pdf.line(20, 98, W - 20, 98);

    // ---- QR Code ----
    const qrCanvas  = document.createElement('canvas');
    await QRCode.toCanvas(qrCanvas, guest.qrToken, {
      width: 200, margin: 1,
      color: { dark: '#0d2137', light: '#ffffff' },
    });
    const qrImg = qrCanvas.toDataURL('image/png');
    const qrSize = 55;
    pdf.addImage(qrImg, 'PNG', (W - qrSize) / 2, 102, qrSize, qrSize);

    // ---- QR label ----
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.setTextColor(100, 100, 100);
    pdf.text('Presenta este boleto en la entrada', W / 2, 162, { align: 'center', charSpace: 0.5 });

    // ---- Silver line ----
    pdf.line(20, 166, W - 20, 166);

    // ---- Ticket ID ----
    pdf.setFontSize(7);
    pdf.setTextColor(80, 80, 80);
    const shortId = guest.id ? guest.id.slice(-8).toUpperCase() : 'ID------';
    pdf.text(`ID: ${shortId}`, W / 2, 172, { align: 'center', charSpace: 1 });

    // ---- Corner ornaments ----
    pdf.setFont('times', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text('✦', 14, 24);
    pdf.text('✦', W - 14, 24, { align: 'right' });

    // ---- Save ----
    const filename = `Boleto-XV-DianaYaretzi-${guest.nombre.replace(/\s+/g, '-')}.pdf`;
    try {
      pdf.save(filename);
    } catch {
      // Mobile fallback: open in new tab
      const blob   = pdf.output('blob');
      const url    = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    }

    window.showToast?.('🎟️ Boleto descargado');
  } catch (err) {
    console.error('PDF error:', err);
    window.showToast?.('Error al generar el PDF. Intenta de nuevo.');
  }
}
