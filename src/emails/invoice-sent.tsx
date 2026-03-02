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

interface InvoiceSentEmailProps {
    freelancerName: string;
    invoiceNumber: string;
    amount: string;
    dueDate: string;
    portalUrl: string;
}

export const InvoiceSentEmail = ({
    freelancerName,
    invoiceNumber,
    amount,
    dueDate,
    portalUrl,
}: InvoiceSentEmailProps) => (
    <Html>
        <Head />
        <Preview>New invoice {invoiceNumber} from {freelancerName}</Preview>
        <Body style={main}>
            <Container style={container}>
                <Section style={header}>
                    <Text style={logo}>PORTAL<span style={logoAccent}>KIT</span></Text>
                </Section>
                <Heading style={h1}>New Invoice Received</Heading>
                <Text style={text}>
                    Hi there, {freelancerName} has sent you a new invoice for your project.
                </Text>
                <Section style={invoiceBox}>
                    <Text style={invoiceLabel}>Invoice Number</Text>
                    <Text style={invoiceValue}>{invoiceNumber}</Text>
                    <Text style={invoiceLabel}>Amount Due</Text>
                    <Text style={invoiceValue}>{amount}</Text>
                    <Text style={invoiceLabel}>Due Date</Text>
                    <Text style={invoiceValue}>{dueDate}</Text>
                </Section>
                <Section style={btnContainer}>
                    <Button style={button} href={portalUrl}>
                        View & Pay Invoice
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

export default InvoiceSentEmail;

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

const invoiceBox = {
    backgroundColor: '#f9fafb',
    borderRadius: '12px',
    padding: '24px',
    margin: '32px 0',
    border: '1px solid #e5e7eb',
};

const invoiceLabel = {
    fontSize: '12px',
    textTransform: 'uppercase' as const,
    fontWeight: '900',
    color: '#9ca3af',
    margin: '0 0 4px',
    letterSpacing: '0.05em',
};

const invoiceValue = {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#111827',
    margin: '0 0 16px',
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
