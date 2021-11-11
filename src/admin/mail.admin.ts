import { createTransport } from 'nodemailer';
import { environment } from '../config/environment';
import { UserResolver } from '../resolvers/user.resolver';
import { BookResolver } from '../resolvers/book.resolver';

export class Mail {

    async sendMailToUser() {
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

        const userResolver = new UserResolver();
        const users = await userResolver.getUsersWithLoans();
        users.forEach(async (user) => {
            let loanDetail = `<p>Books soon to be returned</p><ul>`;
            let overdueDetail = `<p>Books overdue</p><ul>`;
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
                let header = `<h1>Report of your loaned books</h1>`;
                const detail = loanDetail + overdueDetail
                header += detail;
                const messageOptions = {
                    from: environment.MAILADDRES,
                    to: user.email,
                    subject: 'Week Report',
                    html: header
                };
                await transport.sendMail(messageOptions);
            } catch (e) {
                throw new Error(e);
            }
        });
    }

    async sendMailToAdmin() {
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

        const bookResolver = new BookResolver();
        const booksOnLoan = await bookResolver.getLoanedeBookForAdmin();
        const booksNotOnLoan = await bookResolver.getAvailableBookForAdmin();
        let loanedBookDetail = `<p>Books on loan</p><ul>`;
        let loanedOverDueBookDetail = `<p>Books overdue on loan</p><ul>`;
        let notlLoanedBookDetail = `<p>Books available for loan</p><ul>`;

        booksOnLoan.filter((bookoverdue) => new Date(bookoverdue.returnDate) < new Date()).
            forEach((book) => {
                const user = (Object.values(book.user)[1]);
                loanedOverDueBookDetail += `<li>${book.title} from author ${book.author.fullName} is on loan since ${book.loanDate} by user ${user} and should have been returned on ${book.returnDate}</li>`
            });

        booksOnLoan.filter((bookoverdue) => new Date(bookoverdue.returnDate) > new Date()).
            forEach((book) => {
                const user = (Object.values(book.user)[1]);
                loanedBookDetail += `<li>${book.title} from author ${book.author.fullName} is on loan since ${book.loanDate} by user ${user} and will be due on ${book.returnDate}</li>`
            });

        try {
            loanedBookDetail += `</ul>`;
            booksNotOnLoan.forEach((book) => {
                notlLoanedBookDetail += `<li>${book.title} from author ${book.author.fullName} is available for loan</li>`;
            });
            loanedBookDetail += `</ul>`;
            loanedOverDueBookDetail += `</ul>`;
            const header = `<h1>Detail about books</h1>`;

            const message = header + loanedOverDueBookDetail + loanedBookDetail + notlLoanedBookDetail;

            const messageOptions = {
                from: environment.MAILADDRES,
                to: 'alandsn137@gmail.com',
                subject: 'Week Report',
                html: message
            };
            await transport.sendMail(messageOptions);

        } catch (e) {
            throw new Error(e);
        }
    }

    sendConfirmationEmail(email: String, jwt: String) {
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

        const messageOptions = {
            from: environment.MAILADDRES,
            to: email.toString(),
            subject: 'Account Confirmation',
            html: `<p>Use this code to confirm your account</p>
                <p>${jwt}</p>`
        };

        transport.sendMail(messageOptions);
    }
}
