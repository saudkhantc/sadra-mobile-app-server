import { Resend } from "resend";

const resend = new Resend("re_FThCdSTB_2vWTq1fGNHzHqZSzRpwUpJbw");

export async function SendEmail(email, link) {
  const htmlContent = `
      <div style="padding: 20px; text-align: center;">
          <p style="font-size: 16px; line-height: 24px; color: #4b5563;">We received a request to reset your password. Click the button below to reset your password.</p>
          <a href="${link}" style="display: inline-block; padding: 12px 24px; margin: 20px 0; background-color: #34d399; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 700;">Reset Password</a>
      </div>
    `;

  const { data, error } = await resend.emails.send({
    from: "Acme <onboarding@resend.dev>",
    to: [email],
    subject: "RESET PASSWORD",
    html: htmlContent,
  });

  if (error) {
    return console.error({ error });
  }
}
