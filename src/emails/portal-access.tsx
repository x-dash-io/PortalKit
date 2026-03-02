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

interface PortalAccessEmailProps {
    projectTitle: string;
    portalUrl: string;
}

export const PortalAccessEmail = ({
    projectTitle,
    portalUrl,
}: PortalAccessEmailProps) => (
    <Html>
        <Head />
        <Preview>Your project portal is ready — {projectTitle}</Preview>
        <Body style={main}>
            <Container style={container}>
                <Section style={header}>
                    <Text style={logo}>PORTAL<span style={logoAccent}>KIT</span></Text>
                </Section>
                <Heading style={h1}>Internal Access Granted</Heading>
                <Text style={text}>
                    Your project portal for <strong>{projectTitle}</strong> is now live. Through this portal, you can:
                </Text>
                <Section style={list}>
                    <Text style={listItem}>• Download deliverables and assets</Text>
                    <Text style={listItem}>• Review and approve project milestones</Text>
                    <Text style={listItem}>• Manage and pay invoices securely</Text>
                </Section>
                <Section style={btnContainer}>
                    <Button style={button} href={portalUrl}>
                        Open Project Portal
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

export default PortalAccessEmail;

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

const list = {
    padding: '24px 0',
};

const listItem = {
    fontSize: '15px',
    color: '#4b5563',
    margin: '0 0 10px',
};

const btnContainer = {
    textAlign: 'center' as const,
    marginTop: '20px',
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
