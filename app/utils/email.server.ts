import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL;

if (!RESEND_API_KEY) {
  console.warn("RESEND_API_KEY is not set. Email sending will be disabled.");
}

if (!FROM_EMAIL) {
  console.warn("FROM_EMAIL is not set. Email sending will be disabled.");
}

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

interface ConfirmationEmailOptions {
  email: string;
  token: string;
  request: Request;
}

export async function sendConfirmationEmail({
  email,
  token,
  request,
}: ConfirmationEmailOptions) {
  if (!resend || !FROM_EMAIL) {
    console.error("Email sending is not configured.");
    // In a real app, you might want to throw an error or handle this case differently
    return;
  }

  const url = new URL(request.url);
  const confirmationLink = `${url.protocol}//${url.host}/auth/confirm/${token}`;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Confirm your email for FlickPicks",
      html: `
        <h1>Welcome to FlickPicks!</h1>
        <p>Click the link below to confirm your email address and activate your account:</p>
        <a href="${confirmationLink}" target="_blank">Confirm Email</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't sign up for an account, you can safely ignore this email.</p>
      `,
    });
  } catch (error) {
    console.error("Failed to send confirmation email:", error);
    // It might be useful to re-throw the error to be handled by the caller
    throw new Error("Failed to send confirmation email.");
  }
}
