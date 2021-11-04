import { createTransport } from 'nodemailer';
import { environment } from '../config/environment';
import { reporter } from './schedule.admin';

reporter.on('weekReport', () => console.log('working'));

export class mail {
    async sendMail1(to: string) {
        try {
            const transport = createTransport({
                host: environment.SMTPHOST,
                port: Number(environment.SMTPPORT),
                secure: false,
                auth: {
                    user: environment.MAILADDRES,
                    pass: environment.MAILPASS
                },
                tls: {
                    rejectUnauthorized: false,
                },
            });
            const messageOptions = {
                from: environment.MAILADDRES,
                to: to,
                subject: 'Week Report',
                text: 'You have books overdue.'
            };

            transport.sendMail(messageOptions, function(error) {
                if (error) {
                    throw error;
                } else {
                    console.log('Email successfully sent!');
                }
            });
        }
        catch (error) {
            throw new Error(error)
        }
    }
}