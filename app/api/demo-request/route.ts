import { NextRequest, NextResponse } from 'next/server';
import * as nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const { name, phone, email } = await req.json();

    if (!name || !phone || !email) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    if (
      String(name).length > 80 ||
      String(phone).length > 20 ||
      String(email).length > 100
    ) {
      return NextResponse.json(
        { error: 'Input exceeds allowed character limit.' },
        { status: 400 },
      );
    }

    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
    const smtpUser = process.env.SMTP_USER || '';
    const smtpPass = process.env.SMTP_PASS || '';
    const fromAddress = process.env.SMTP_FROM || `ConstructDesk <${smtpUser}>`;
    const contactRecipient = process.env.CONTACT_FORM_RECIPIENT || 'info@constructdesk.in';

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    // 1. Notify internal team
    await transporter.sendMail({
      from: fromAddress,
      to: contactRecipient,
      subject: `New Demo Request: ${name}`,
      html: `
        <h2>New Demo Request from Website</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Email:</strong> ${email}</p>
      `,
    });

    // 2. Auto-reply to user
    await transporter.sendMail({
      from: fromAddress,
      to: email,
      subject: 'We received your demo request!',
      html: `
        <p>Hi ${name},</p>
        <p>Thank you for your interest in ConstructDesk!</p>
        <p>We have received your request for a 10-minute demo. One of our product specialists will be in touch shortly at <strong>${phone}</strong>.</p>
        <p>Best regards,<br/>The ConstructDesk Team</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Demo request email error:', error?.message || error);
    return NextResponse.json({ error: 'Failed to send email.' }, { status: 500 });
  }
}
