import { Resend } from "resend";
import { getAppUrl, requireEnv } from "@/lib/env";

let resendClient: Resend | null = null;

const getResendClient = () => {
  const apiKey = requireEnv("RESEND_API_KEY");

  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }

  return resendClient;
};

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

export const getInviteLink = (token: string) => {
  const inviteUrl = new URL("/signup", getAppUrl());
  inviteUrl.searchParams.set("token", token);
  return inviteUrl.toString();
};

export async function sendInviteEmail({
  to,
  organizationName,
  invitedBy,
  token,
}: {
  to: string;
  organizationName: string;
  invitedBy: string;
  token: string;
}) {
  const inviteLink = getInviteLink(token);
  const safeOrganizationName = escapeHtml(organizationName);
  const safeInvitedBy = escapeHtml(invitedBy);
  const safeInviteLink = escapeHtml(inviteLink);
  const resend = getResendClient();

  const { data, error } = await resend.emails.send({
    from:
      process.env.NODE_ENV === "production"
        ? requireEnv("RESEND_FROM_EMAIL")
        : process.env.RESEND_FROM_EMAIL || "Otogent <onboarding@resend.dev>",
    to: [to],
    subject: `Invitation to join ${organizationName} on Otogent`,
    html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #1e293b; margin-bottom: 16px;">You've been invited!</h2>
          <p style="color: #475569; font-size: 16px; line-height: 24px;">
            <strong>${safeInvitedBy}</strong> has invited you to join the <strong>${safeOrganizationName}</strong> workspace on Otogent.
          </p>
          <p style="color: #475569; font-size: 16px; line-height: 24px; margin-bottom: 24px;">
            Otogent helps teams build and manage AI workforces to automate complex workflows.
          </p>
          <a href="${safeInviteLink}" style="display: inline-block; background-color: #0f172a; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500;">
            Accept Invitation
          </a>
          <p style="color: #94a3b8; font-size: 14px; margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
            If you didn't expect this invitation, you can safely ignore this email.
          </p>
        </div>
      `,
  });

  if (error) {
    throw new Error(`Failed to send invite email: ${error.message}`);
  }

  return { success: true, data };
}
