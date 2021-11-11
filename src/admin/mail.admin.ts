import { createTransport } from 'nodemailer';
import { environment } from '../config/environment';
import { UserResolver } from '../resolvers/user.resolver';
import { BookResolver } from '../resolvers/book.resolver';
import { User } from '../entity/user.entity';
import { getRepository, Repository } from "typeorm";

export class mail {

    userRepository: Repository<User>

    constructor() {
        this.userRepository = getRepository(User);
    }

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
                console.log(`message sent to ${user.fullName}`);
            } catch (e) {
                console.log(e);
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
        booksOnLoan.forEach((book) => {
            loanedBookDetail += `<li>${book.title} from author ${book.author.fullName} is on loan since ${book.loanDate} by user ${this.userRepository.findOne(book.user).fullName} and will be due on ${book.returnDate}</li>`;
        });
        loanedBookDetail += `</ul>`;
        let notlLoanedBookDetail = `<p>Books available for loan</p><ul>`;
        booksNotOnLoan.forEach((book) => {
            notlLoanedBookDetail += `<li>${book.title} from author ${book.author.fullName} is available for loan</li>`;
        });
        loanedBookDetail += `</ul>`;

        const header = `<h1>Detail about books</h1>`;

        const message = await header + loanedBookDetail + notlLoanedBookDetail;

        const messageOptions = {
            from: environment.MAILADDRES,
            to: environment.MAILADDRES,
            subject: 'Week Report',
            html: message
        };
        console.log('end');
        await transport.sendMail(messageOptions);

    }
}
