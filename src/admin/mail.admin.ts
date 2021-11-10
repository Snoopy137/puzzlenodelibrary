import { createTransport, Transport } from 'nodemailer';
import { environment } from '../config/environment';
import { UserResolver } from '../resolvers/user.resolver';
import { User } from '../entity/user.entity';

export class mail {

    async createMessage() {
        const transport = createTransport({
            host: environment.SMTPHOST,
            port: Number(environment.SMTPPORT),
            secure: false,
            pool: true,
            maxConnections: 1,
            auth: {
                user: environment.MAILADDRES,
                pass: environment.MAILPASS
            },
            tls: {
                rejectUnauthorized: false,
            },
        });
        let loanDetail = `<p>Books soon to be returned</p>
        <ul>`;
        let overdueDetail = `<p>Books overdue</p>
        <ul>`;
        const userResolver = new UserResolver();
        const users = await userResolver.getUsersWithLoans();
        users.forEach(async (user) => {
            try {
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
                let header = `<h1>Report of your loaned books</h1>
                            `;
                const detail = loanDetail + overdueDetail
                header += detail;
                const messageOptions = {
                    from: environment.MAILADDRES,
                    to: user.email,
                    subject: 'Week Report',
                    html: header
                };
                await transport.sendMail(messageOptions);
                console.log(`message sent to ${user.fullName}`);
            } catch (e) {
                console.log(e);
            }
        });
    }
}
