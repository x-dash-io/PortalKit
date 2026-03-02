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

interface ApprovalRequestEmailProps {
    approvalTitle: string;
    projectTitle: string;
    description: string;
    type: string;
    portalUrl: string;
}

export const ApprovalRequestEmail = ({
    approvalTitle,
    projectTitle,
    description,
    type,
    portalUrl,
}: ApprovalRequestEmailProps) => (
    <Html>
        <Head />
        <Preview>Review requested: {approvalTitle}</Preview>
        <Body style={main}>
            <Container style={container}>
                <Section style={header}>
                    <Text style={logo}>PORTAL<span style={logoAccent}>KIT</span></Text>
                </Section>
                <Heading style={h1}>Review Requested</Heading>
                <Text style={text}>
                    A new asset for <strong>{projectTitle}</strong> is ready for your review.
                </Text>
                <Section style={box}>
                    <Text style={label}>Item to Review</Text>
                    <Text style={value}>{approvalTitle}</Text>
                    <Text style={label}>Type</Text>
                    <Section style={badge}>{type.replace('_', ' ')}</Section>
                    <Text style={label}>Description</Text>
                    <Text style={descriptionText}>{description}</Text>
                </Section>
                <Section style={btnContainer}>
                    <Button style={button} href={portalUrl}>
                        Go to Portal & Review
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

export default ApprovalRequestEmail;

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
    fontSize: '24px',
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

const value = {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#111827',
    margin: '0 0 20px',
};

const descriptionText = {
    fontSize: '14px',
    color: '#4b5563',
    lineHeight: '20px',
    margin: '0',
};

const badge = {
    backgroundColor: '#e0e7ff',
    color: '#4338ca',
    fontSize: '10px',
    fontWeight: 'bold',
    textTransform: 'uppercase' as const,
    padding: '4px 8px',
    borderRadius: '4px',
    display: 'inline-block',
    margin: '0 0 20px',
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
