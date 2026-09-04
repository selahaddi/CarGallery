import PDFDocument from 'pdfkit';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

// Vercel limits Serverless Functions, we generate the PDF in memory.
export default async function handler(req, res) {
  // CORS setup for local development
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const data = req.body;
    const customer = data.customer || {};
    const car = data.car || {};

    const price = parseFloat(car.price || 0);
    const downPayment = parseFloat(car.down_payment || 0);
    const monthlyRate = parseFloat(car.monthly_rate || 0);
    const termMonths = parseInt(car.term_months || 48, 10);
    const interestRate = parseFloat(car.interest_rate || 3.8);

    const netLoan = price - downPayment;
    const totalLoanPayment = monthlyRate * termMonths;
    const totalInterest = Math.max(0, totalLoanPayment - netLoan);
    const totalCost = totalLoanPayment + downPayment;

    // 1. Generate PDF with PDFKit
    const pdfBuffer = await new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Colors
      const brandRed = '#e11d48';
      const brandBlack = '#111827';
      const brandGray = '#6b7280';

      // Header
      doc.fontSize(24).font('Helvetica-Bold').fillColor(brandBlack).text('Auto', 50, 50, { continued: true });
      doc.fillColor(brandRed).text('Raten');
      doc.fontSize(12).font('Helvetica').fillColor(brandBlack).text('OFFER #AR-2024-' + Math.floor(Math.random() * 1000), { align: 'right' }, 55);
      
      doc.moveDown();
      doc.rect(50, 90, 495, 4).fill(brandRed);
      
      // Customer Info
      doc.fontSize(16).font('Helvetica-Bold').fillColor(brandBlack).text('Kunde (Müşteri)', 50, 120);
      doc.fontSize(10).font('Helvetica').fillColor(brandGray).text('Name:');
      doc.fontSize(12).font('Helvetica-Bold').fillColor(brandBlack).text((customer.name || 'N/A').toUpperCase());
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica').fillColor(brandGray).text('E-Mail:');
      doc.fontSize(12).font('Helvetica-Bold').fillColor(brandBlack).text(customer.email || 'N/A');
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica').fillColor(brandGray).text('Tel:');
      doc.fontSize(12).font('Helvetica-Bold').fillColor(brandBlack).text(customer.phone || 'N/A');

      // Car Info
      doc.fontSize(16).font('Helvetica-Bold').fillColor(brandBlack).text('Fahrzeug (Araç)', 300, 120);
      doc.fontSize(10).font('Helvetica').fillColor(brandGray).text('Modell:', 300, 145);
      doc.fontSize(14).font('Helvetica-Bold').fillColor(brandBlack).text((car.title || 'N/A').toUpperCase(), 300, 160, { width: 250 });
      
      // Finance Details Box
      doc.rect(50, 320, 495, 300).lineWidth(1).stroke('#d1d5db');
      doc.rect(50, 320, 495, 40).fill('#f3f4f6');
      doc.fontSize(16).font('Helvetica-Bold').fillColor(brandBlack).text('Finanzierungsdetails', 65, 332);
      
      const rows = [
        ["Fahrzeugpreis (Araç Fiyatı):", `${price.toLocaleString('de-DE', {minimumFractionDigits: 2})} EUR`],
        ["Anzahlung (Peşinat):", `${downPayment.toLocaleString('de-DE', {minimumFractionDigits: 2})} EUR`],
        ["Nettodarlehensbetrag (Net Kredi):", `${netLoan.toLocaleString('de-DE', {minimumFractionDigits: 2})} EUR`],
        ["Laufzeit (Vade):", `${termMonths} Monate`],
        ["Sollzins p.a. (Yıllık Faiz):", `${interestRate} %`],
        ["Gesamtzins (Toplam Faiz):", `${totalInterest.toLocaleString('de-DE', {minimumFractionDigits: 2})} EUR`],
        ["Gesamtkosten (Toplam Ödenecek):", `${totalCost.toLocaleString('de-DE', {minimumFractionDigits: 2})} EUR`]
      ];

      let ry = 380;
      rows.forEach(([lbl, val]) => {
        doc.fontSize(12).font('Helvetica').fillColor(brandBlack).text(lbl, 65, ry);
        doc.font('Helvetica-Bold').text(val, 50, ry, { align: 'right', width: 480 });
        doc.moveTo(65, ry + 18).lineTo(530, ry + 18).lineWidth(0.5).stroke('#e5e7eb');
        ry += 25;
      });

      // Big Monthly Rate highlight
      doc.rect(50, ry + 10, 495, 80).fill(brandRed);
      doc.fontSize(20).font('Helvetica-Bold').fillColor('#ffffff').text('MONATLICHE RATE', 70, ry + 25);
      doc.fontSize(12).font('Helvetica').text('(AYLIK TAKSİT)', 70, ry + 50, { fill: '#fcd34d' });
      doc.fontSize(30).font('Helvetica-Bold').fillColor('#ffffff').text(`${monthlyRate.toLocaleString('de-DE', {minimumFractionDigits: 2})} EUR`, 50, ry + 35, { align: 'right', width: 480 });

      // Footer
      doc.fontSize(9).font('Helvetica').fillColor(brandGray).text('Alle Preisangaben inklusive Mehrwertsteuer. Dieses Angebot ist unverbindlich.', 50, 750, { align: 'center' });
      doc.text('Gültig bis zum Widerruf oder Änderung der Konditionen.', 50, 765, { align: 'center' });

      doc.end();
    });

    // 2. Insert into Supabase Securely
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; 

    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { error: insertError } = await supabase.from('offers').insert([{
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone,
        car_id: car.id,
        car_title: car.title,
        price: price || null,
        down_payment: downPayment || null,
        term_months: termMonths || null,
        monthly_rate: monthlyRate || null
      }]);
      if (insertError) {
        console.error("Supabase Insert Error:", insertError);
        // We log the error but don't stop the email
      }
    } else {
      console.warn("SUPABASE_SERVICE_ROLE_KEY is missing. Not inserting to Supabase from backend.");
    }

    // 3. Send Email with Nodemailer
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (smtpUser && smtpPass) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });

      const mailOptions = {
        from: `"Auto Raten" <${smtpUser}>`,
        to: customer.email,
        subject: `Ihr Angebot für den ${car.title} ist da!`,
        text: `Hallo ${customer.name},\n\nIm Anhang finden Sie das PDF-Angebot für den ${car.title}.\n\nMit freundlichen Grüßen,\nAuto Raten Team`,
        attachments: [
          {
            filename: 'Angebot.pdf',
            content: pdfBuffer,
            contentType: 'application/pdf'
          }
        ]
      };

      await transporter.sendMail(mailOptions);
    } else {
      console.warn("SMTP_USER or SMTP_PASS missing. Email not sent.");
    }

    // Success response
    return res.status(200).json({ success: true, message: 'PDF generated and email sent successfully.' });
    
  } catch (error) {
    console.error("Generate Offer Error:", error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
