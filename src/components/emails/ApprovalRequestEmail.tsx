import * as React from 'react';
import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Text,
    Button,
} from '@react-email/components';

interface ApprovalRequestEmailProps {
    freelancerName: string;
    projectTitle: string;
    approvalTitle: string;
    portalUrl: string;
}

export const ApprovalRequestEmail = ({
    freelancerName,
    projectTitle,
    approvalTitle,
    portalUrl,
}: ApprovalRequestEmailProps) => (
    <Html>
        <Head />
        <Preview>Approval needed for {approvalTitle} in {projectTitle}</Preview>
        <Body style={main}>
            <Container style={container}>
                <Heading style={h1}>Approval Requested</Heading>
                <Text style={text}>
                    Hello,
                </Text>
                <Text style={text}>
                    {freelancerName} has requested your approval for <strong>{approvalTitle}</strong> in the project <strong>{projectTitle}</strong>.
                </Text>
                <Section style={btnContainer}>
                    <Button style={button} href={portalUrl}>
                        View and Respond
                    </Button>
                </Section>
                <Text style={footer}>
                    Powered by PortalKit
                </Text>
            </Container>
        </Body>
    </Html>
);

const main = {
    backgroundColor: '#f6f9fc',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '20px 0 48px',
    marginBottom: '64px',
};

const h1 = {
    color: '#333',
    fontSize: '24px',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    margin: '30px 0',
};

const text = {
    color: '#333',
    fontSize: '16px',
    lineHeight: '26px',
    padding: '0 40px',
};

const btnContainer = {
    textAlign: 'center' as const,
    margin: '32px 0',
};

const button = {
    backgroundColor: '#6366f1',
    borderRadius: '3px',
    color: '#fff',
    fontSize: '16px',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'block',
    padding: '12px 24px',
};

const footer = {
    color: '#8898aa',
    fontSize: '12px',
    lineHeight: '16px',
    textAlign: 'center' as const,
    marginTop: '48px',
};
