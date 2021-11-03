import { createTransport } from 'nodemailer';
import { environment } from '../config/environment';
import { reporter, repo } from '../admin/schedule.admin';

reporter.on('weekReport', () => console.log('event from mail.resolver'));
repo.on('test', () => console.log('test on mail resolver'));

export async function sendMail1(to: string) {
    try {
        const transport = createTransport({
            host: environment.SMTPHOST,
            port: Number(environment.SMTPPORT),
            secure: true,
            auth: {
                user: environment.MAILADDRES,
                pass: environment.MAILPASS
            }
        });
        const messageOptions = {
            from: environment.MAILADDRES,
            to: to,
            subject: 'Week Report',
            text: 'You have books overdue.'
        };
        //return transport;
        console.log('mail sent');
    }
    catch (error) {
        throw new Error(error)
    }
}