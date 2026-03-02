import { Resend } from 'resend';
import { ReactElement } from 'react';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(
    to: string,
    subject: string,
    Template: React.FC<any>,
    props: any
) {
    if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY is not set. Skipping email.');
        return;
    }

    try {
        const { data, error } = await resend.emails.send({
            from: `PortalKit <notifications@${process.env.FROM_EMAIL || 'yourdomain.com'}>`,
            to: [to],
            subject: subject,
            react: Template(props) as ReactElement,
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
