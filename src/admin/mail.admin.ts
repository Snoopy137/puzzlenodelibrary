import { createTransport } from 'nodemailer';
import { environment } from '../config/environment';
import { UserResolver } from '../resolvers/user.resolver';
import { User } from '../entity/user.entity';

export class mail {

    transport = createTransport({
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

    async createMessage() {

        const userResolver = new UserResolver();
        const users = await userResolver.getUsersWithLoans();
        users.forEach((user) => {
            user.books.forEach((book) => console.log(''));
        });
    }

    async sendMail1(recipent: User, message: String) {
        try {
            let header = `<h1>Report of your loaned books</h1>
                            `;
            header += message;
            const messageOptions = {
                from: environment.MAILADDRES,
                to: recipent.email,
                subject: 'Week Report',
                html: header
            };

            this.transport.sendMail(messageOptions, function(error) {
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