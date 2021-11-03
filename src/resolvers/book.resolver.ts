import { Mutation, Resolver, Arg, InputType, Field, Query, UseMiddleware, Ctx } from 'type-graphql';
import { getRepository, Repository } from "typeorm";
import { Author } from '../entity/author.entity';
import { Book } from '../entity/book.entity';
import { User } from '../entity/user.entity';
import { Length } from 'class-validator';
import { IContext, isAuth } from '../middlewares/auth.middleware';
import moment from 'moment';
import { reporter } from '../admin/schedule.admin';

reporter.on('weekReport', () => console.log('book.resolver'));

@InputType()
class BookInput {

    @Field()
    @Length(3, 64)
    title!: string;

    @Field()
    author!: number;
}

@InputType()
class BookUpdateInput {

    @Field(() => String, { nullable: true })
    @Length(3, 64)
    title?: string;

    @Field(() => Number, { nullable: true })
    author?: number;
}

@InputType()
class BookUpdateParsedInput {

    @Field(() => String, { nullable: true })
    @Length(3, 64)
    title?: string;

    @Field(() => Author, { nullable: true })
    author?: Author;
}

@InputType()
class BookIdInput {

    @Field(() => Number)
    id!: number
}

@InputType()
class BookIdLoanInput {

    @Field(() => Number)
    id!: number

    @Field(() => Boolean)
    isOnLoan = true

    @Field(() => Number)
    user = 0;

    @Field(() => Date)
    returnDate = new Date;
}

@InputType()
class BookIdReturnInput {

    @Field(() => Number)
    id!: number
}

@Resolver()
export class BookResolver {
    bookRepository: Repository<Book>;
    authorRepository: Repository<Author>
    userRepository: Repository<User>

    constructor() {
        this.bookRepository = getRepository(Book);
        this.authorRepository = getRepository(Author);
        this.userRepository = getRepository(User);
    }

    @Mutation(() => Book)
    @UseMiddleware(isAuth)
    async createBook(@Arg("input", () => BookInput) input: BookInput, @Ctx() context: IContext) {
        try {
            const author: Author | undefined = await this.authorRepository.findOne(input.author);

            if (!author) {
                const error = new Error();
                error.message = 'The author for this book does not exist, please double check';
                throw error;
            }

            const book = await this.bookRepository.insert({
                title: input.title,
                author: author,
                isOnLoan: false,
                loanDate: "null"
            });

            return await this.bookRepository.findOne(book.identifiers[0].id, { relations: ['author', 'author.books'] })


        } catch (e) {
            throw new Error(e.message)
        }
    }

    @Query(() => [Book])
    @UseMiddleware(isAuth)
    async getAllBooks(): Promise<Book[]> {
        try {
            return await this.bookRepository.find({ relations: ['author', 'author.books'] })
        } catch (e) {
            throw new Error(e)
        }
    }

    @Query(() => Book)
    @UseMiddleware(isAuth)
    async getBookById(
        @Arg('input', () => BookIdInput) input: BookIdInput
    ): Promise<Book | undefined> {
        try {
            const book = await this.bookRepository.findOne(input.id, { relations: ['author', 'author.books', 'user', 'user.books'] });
            if (!book) {
                const error = new Error();
                error.message = 'Book not found';
                throw error;
            }
            return book;
        } catch (e) {
            throw new Error(e)
        }
    }

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async updateBookById(
        @Arg('bookId', () => BookIdInput) bookId: BookIdInput,
        @Arg('input', () => BookUpdateInput) input: BookUpdateInput,
    ): Promise<Boolean> {
        try {
            await this.bookRepository.update(bookId.id, await this.parseInput(input));
            return true;
        } catch (e) {
            throw new Error(e)
        }
    }

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async deleteBook(
        @Arg("bookId", () => BookIdInput) bookId: BookIdInput
    ): Promise<Boolean> {
        try {
            const result = await this.bookRepository.delete(bookId.id)

            if (result.affected === 0) throw new Error('Book does not exist');

            return true
        } catch (e) {
            throw new Error(e)
        }
    }

    private async parseInput(input: BookUpdateInput) {
        try {
            const _input: BookUpdateParsedInput = {};

            if (input.title) _input['title'] = input.title;

            if (input.author) {
                const author = await this.authorRepository.findOne(input.author);
                if (!author) throw new Error('This author does not exist')
                _input['author'] = await this.authorRepository.findOne(input.author);
            }

            return _input;
        } catch (e) {
            throw new Error(e)
        }
    }
    //
    @Query(() => [Book])
    @UseMiddleware(isAuth)
    async getAvailableBook(): Promise<Book[]> {
        try {
            return await this.bookRepository.find({ where: { isOnLoan: false }, relations: ['author', 'author.books'] })
        } catch (e) {
            throw new Error(e)
        }
    }

    @Mutation(() => Book)
    @UseMiddleware(isAuth)
    async loanBook(
        @Arg("bookLoan", () => BookIdLoanInput) bookLoan: BookIdLoanInput, @Ctx() context: IContext):
        Promise<Book | undefined> {
        try {
            const book = await this.bookRepository.findOne(bookLoan.id);
            if (!book) throw new Error('Book does not exist');
            if (book?.isOnLoan) throw new Error('Book is aready on loan');
            const values = Object.values(context.payload);
            bookLoan.user = +values[0];
            const user = await this.userRepository.findOne(bookLoan.user, { relations: ['books'] });
            if (user && user?.books.length >= 3) throw new Error('Loan limit reached');
            const returnDate = moment(new Date).clone().add(1, 'week').toDate();
            bookLoan.returnDate = returnDate;
            await this.bookRepository.update(bookLoan.id, bookLoan);
            return await this.bookRepository.findOne(bookLoan.id, { relations: ['author', 'author.books', 'user', 'user.books'] });
        } catch (e) {
            throw new Error(e)
        }
    }

    @Mutation(() => Book)
    @UseMiddleware(isAuth)
    async returnBook(
        @Arg("bookReturn", () => BookIdReturnInput) bookReturn: BookIdReturnInput, @Ctx() context: IContext):
        Promise<Book | undefined> {
        try {
            const book = await this.bookRepository.findOne(bookReturn.id, { relations: ['user'] });
            if (!book) throw new Error('Book does not exist');
            if (!book?.isOnLoan) throw new Error('Book is not on loan');
            const userid = +Object.values(context.payload)[0];
            const user = Object.values(book.user)[0];
            if (userid !== user) throw new Error('Other user loaned this book');
            await this.bookRepository.update(bookReturn.id, {
                isOnLoan: false,
                user: undefined,
                returnDate: undefined,
                loanDate: undefined
            });
            return await this.bookRepository.findOne(bookReturn.id);
        } catch (e) {
            throw new Error(e)
        }
    }
}