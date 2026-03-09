import { Resend } from 'resend';
import type { ReactElement } from 'react';

export async function sendEmail<T extends Record<string, unknown>>(
  to: string,
  subject: string,
  Template: (props: T) => ReactElement,
  props: T
) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn('RESEND_API_KEY is not set. Skipping email.');
      return;
    }

    const resend = new Resend(apiKey);

    try {
        const { data, error } = await resend.emails.send({
            from: `PortalKit <notifications@${process.env.FROM_EMAIL || 'yourdomain.com'}>`,
            to: [to],
            subject: subject,
            react: Template(props),
        });

        if (error) {
            console.error('Failed to send email:', error);
        } else {
            console.log('Email sent successfully:', data?.id);
        }
    } catch (err) {
        console.error('Resend execution error:', err);
    }
}
