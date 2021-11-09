import { createTransport } from 'nodemailer';
import { environment } from '../config/environment';
import { UserResolver } from '../resolvers/user.resolver';
import { User } from '../entity/user.entity';

export class mail {

    transPort;

    constructor() {
        this.transPort = createTransport({
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
    }

    async createMessage() {
        let loanDetail = `<p>Books soon to be returned</p>
        <ul>`;
        let overdueDetail = `<p>Books overdue</p>
        <ul>`;
        const userResolver = new UserResolver();
        const users = await userResolver.getUsersWithLoans();
        users.forEach((user) => {
            user.books.forEach((book) => {
                if (new Date(book.returnDate) < new Date()) {
                    overdueDetail += `<li>${book.title} should have been returned on ${book.returnDate}</li>`;
                }
                else {
                    loanDetail += `<li>${book.title} loan will expire on ${book.returnDate}</li>`;
                }
            })
            loanDetail += `</ul>`;
            overdueDetail += `</ul>`;
            this.transPort.close();
            this.sendMailToUser(user, loanDetail + overdueDetail);
            loanDetail = `<p>Books soon to be returned</p>
            <ul>`;
            overdueDetail = `<p>Books overdue</p>
            <ul>`;
        });
    }

    async sendMailToUser(recipent: User, detail: String) {
        let header = `<h1>Report of your loaned books</h1>
                            `;
        header += detail;
        const messageOptions = {
            from: environment.MAILADDRES,
            to: recipent.email,
            subject: 'Week Report',
            html: header
        };

        this.transPort.sendMail(messageOptions, function(error) {
            if (error) {
                throw error;
            } else {
                console.log('Email successfully sent!');
            }
        });
    }
}
