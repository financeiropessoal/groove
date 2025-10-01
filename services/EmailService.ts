// A mock email service that logs to the console instead of sending real emails.
// This is useful for development and for applications where a full email setup is not required.

export class EmailService {

    /**
     * Simulates sending an email notification.
     * @param to The recipient's email address.
     * @param subject The subject of the email.
     * @param body The HTML or text body of the email.
     */
    static async sendEmail(to: string, subject: string, body: string): Promise<boolean> {
        console.group(`[EmailService] Sending Email`);
        console.log(`%cTo:%c ${to}`, 'font-weight: bold;', 'font-weight: normal;');
        console.log(`%cSubject:%c ${subject}`, 'font-weight: bold;', 'font-weight: normal;');
        console.log('-------------------- BODY --------------------');
        console.log(body);
        console.log('--------------------------------------------');
        console.groupEnd();
        
        // In a real implementation, you would use a service like Nodemailer, SendGrid, or Mailgun here.
        // For this simulation, we'll assume the email is always sent successfully.
        await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
        
        return true;
    }
}
