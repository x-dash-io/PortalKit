import {
    Body,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Link,
    Preview,
    Section,
    Text,
    Button,
} from '@react-email/components';
import * as React from 'react';

interface ApprovalRespondedEmailProps {
    approvalTitle: string;
    status: string;
    comment?: string;
    dashboardUrl: string;
}

export const ApprovalRespondedEmail = ({
    approvalTitle,
    status,
    comment,
    dashboardUrl,
}: ApprovalRespondedEmailProps) => (
    <Html>
        <Head />
        <Preview>Client {status.replace('_', ' ')}: {approvalTitle}</Preview>
        <Body style={main}>
            <Container style={container}>
                <Section style={header}>
                    <Text style={logo}>PORTAL<span style={logoAccent}>KIT</span></Text>
                </Section>
                <Heading style={h1}>Approval Response Received</Heading>
                <Text style={text}>
                    Your client has responded to your approval request for <strong>{approvalTitle}</strong>.
                </Text>
                <Section style={box}>
                    <Text style={label}>Status</Text>
                    <Section style={statusBadge(status)}>{status.replace('_', ' ')}</Section>
                    {comment && (
                        <>
                            <Text style={label}>Comment</Text>
                            <Text style={commentText}>&quot;{comment}&quot;</Text>
                        </>
                    )}
                </Section>
                <Section style={btnContainer}>
                    <Button style={button} href={dashboardUrl}>
                        View inside Dashboard
                    </Button>
                </Section>
                <Hr style={hr} />
                <Text style={footer}>
                    Securely managed via PortalKit.
                </Text>
            </Container>
        </Body>
    </Html>
);

const statusBadge = (status: string) => ({
    backgroundColor: status === 'approved' ? '#dcfce7' : '#fef2f2',
    color: status === 'approved' ? '#166534' : '#991b1b',
    fontSize: '12px',
    fontWeight: '900',
    textTransform: 'uppercase' as const,
    padding: '4px 12px',
    borderRadius: '6px',
    display: 'inline-block',
    margin: '0 0 20px',
});

export default ApprovalRespondedEmail;

const main = {
    backgroundColor: '#ffffff',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
    margin: '0 auto',
    padding: '20px 0 48px',
    width: '580px',
};

const header = {
    padding: '32px 0',
};

const logo = {
    fontSize: '24px',
    fontWeight: '900',
    color: '#000000',
    letterSpacing: '-0.5px',
};

const logoAccent = {
    color: '#6366f1',
};

const h1 = {
    fontSize: '22px',
    fontWeight: 'bold',
    margin: '40px 0',
    padding: '0',
    color: '#111827',
};

const text = {
    fontSize: '16px',
    lineHeight: '26px',
    color: '#4b5563',
};

const box = {
    backgroundColor: '#f9fafb',
    borderRadius: '12px',
    padding: '24px',
    margin: '32px 0',
    border: '1px solid #e5e7eb',
};

const label = {
    fontSize: '11px',
    textTransform: 'uppercase' as const,
    fontWeight: '900',
    color: '#9ca3af',
    margin: '0 0 4px',
    letterSpacing: '0.05em',
};

const commentText = {
    fontSize: '15px',
    color: '#1f2937',
    fontStyle: 'italic',
    lineHeight: '24px',
    margin: '0',
};

const btnContainer = {
    textAlign: 'center' as const,
};

const button = {
    backgroundColor: '#6366f1',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '600',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'block',
    padding: '12px 24px',
};

const hr = {
    borderColor: '#e5e7eb',
    margin: '40px 0',
};

const footer = {
    color: '#9ca3af',
    fontSize: '12px',
    fontWeight: 'bold',
};
