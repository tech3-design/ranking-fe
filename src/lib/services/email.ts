interface SendOtpEmailParams {
  email: string;
  otp: string;
}

export async function sendOtpEmail({ email, otp }: SendOtpEmailParams) {
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.FROM_EMAIL || "noreply@carboncut.co";

  if (!apiKey) {
    throw new Error("SENDGRID_API_KEY is not configured");
  }

  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email }] }],
      from: { email: fromEmail },
      subject: "Your verification code",
      content: [
        {
          type: "text/html",
          value: `<h2>Your verification code is: <strong>${otp}</strong></h2><p>This code expires in 10 minutes.</p>`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error("SendGrid error:", response.status, body);
    throw new Error("Failed to send OTP email");
  }
}
