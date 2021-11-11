import { IsEmail, Length } from "class-validator";
import { Arg, Field, InputType, Mutation, ObjectType, Resolver, UseMiddleware } from "type-graphql";
import { getRepository, Repository } from "typeorm";
import { User } from "../entity/user.entity";
import { hash, compareSync } from 'bcryptjs';
import { sign } from "jsonwebtoken";
import { environment } from '../config/environment';
import { Mail } from '../admin/mail.admin';
import { validateMail } from '../middlewares/auth.middleware';

@InputType()
class UserInput {

    @Field()
    @Length(3, 64)
    fullName!: string;

    @Field()
    @IsEmail()
    email!: string;

    @Field()
    @Length(8, 254)
    password!: string;
}

@InputType()
class LoginInput {

    @Field()
    @IsEmail()
    email!: string;

    @Field()
    password!: string;
}

@InputType()
class ValidateEmailInput {

    @Field()
    @IsEmail()
    email!: string;

}

@InputType()
class RecoverPaswordInput {

    @Field()
    @IsEmail()
    email!: string;

}

@ObjectType()
class EmailValidationResponse {

    @Field()
    user!: User;

    @Field()
    message!: String;
}

@ObjectType()
class LoginResponse {

    @Field()
    userId!: number;

    @Field()
    jwt!: string;
}

@ObjectType()
class RegisterResponse {

    @Field()
    id!: number;

    @Field()
    message!: string;
}

@ObjectType()
class RecoverPasswordResponse {

    @Field()
    message!: string;

}

@InputType()
class ChangePasswordInput {

    @Field()
    email!: string;

    @Field()
    password!: string;

}

@Resolver()
export class AuthResolver {

    userRepository: Repository<User>;

    constructor() {
        this.userRepository = getRepository(User);
    }

    @Mutation(() => RegisterResponse)
    async register(
        @Arg('input', () => UserInput) input: UserInput
    ) {

        try {
            const { fullName, email, password } = input;

            const userExists = await this.userRepository.findOne({ where: { email } });

            if (userExists) {
                const error = new Error();
                error.message = 'Email is not available';
                throw error;
            }

            const hashedPassword = await hash(password, 10);

            const newUser = await this.userRepository.insert({
                fullName,
                password: hashedPassword,
                email,
                isEmailValid: false
            });
            const user = await this.userRepository.findOne(newUser.identifiers[0].id);
            const id = user?.id;
            const jwt: string = sign({ exp: Math.floor(Date.now() / 1000) + (60 * 15), email }, environment.JWT_SECRET);
            new Mail().sendConfirmationEmail(email, jwt);
            return {
                id: id,
                message: 'Confirm your email account (a message has been sent to your inbox, remember to see on spam folder)'
            }


        } catch (error) {
            throw new Error(error.message)
        }
    }

    @Mutation(() => LoginResponse)
    async login(
        @Arg('input', () => LoginInput) input: LoginInput
    ) {
        try {
            const { email, password } = input;

            const userFound = await this.userRepository.findOne({ where: { email } });

            if (!userFound) {
                const error = new Error();
                error.message = 'Invalid credentials';
                throw error;
            }

            const isValidPasswd: boolean = compareSync(password, userFound.password);

            if (!isValidPasswd) {
                const error = new Error();
                error.message = 'Invalid credentials';
                throw error;
            }

            const isEmailValid: boolean = userFound.isEmailValid;

            if (!isEmailValid) {
                const error = new Error();
                error.message = 'email must be confirmed';
                throw error;
            }

            const jwt: string = sign({ id: userFound.id }, environment.JWT_SECRET);

            return {
                userId: userFound.id,
                jwt: jwt,
            }
        } catch (error) {
            throw new Error(error.message)
        }
    }

    @Mutation(() => EmailValidationResponse)
    @UseMiddleware(validateMail)
    async valiDateMail(
        @Arg('input', () => ValidateEmailInput) input: ValidateEmailInput
    ) {
        try {
            const { email } = input;

            const userFound = await this.userRepository.findOne({ where: { email } });

            if (!userFound) {
                const error = new Error();
                error.message = 'Email not found, register first';
                throw error;
            }

            userFound.isEmailValid = true;

            await this.userRepository.update(userFound.id, userFound);

            return {
                user: userFound,
                message: 'email confirmed'
            }
        } catch (error) {
            throw new Error(error.message)
        }
    }

    @Mutation(() => RecoverPasswordResponse)
    async recoverPassword(
        @Arg('input', () => RecoverPaswordInput) input: RecoverPaswordInput
    ) {

        try {
            const { email } = input;

            const userExists = await this.userRepository.findOne({ where: { email } });

            if (userExists) {
                const error = new Error();
                error.message = 'This account is not register on our system';
                throw error;
            }

            const jwt: string = sign({ exp: Math.floor(Date.now() / 1000) + (60 * 15), email }, environment.JWT_SECRET);
            new Mail().sendConfirmationEmail(email, jwt);
            return {
                message: 'User your secreet code to change your password (a message has been sent to your inbox, remember to see on spam folder)'
            }

        } catch (error) {
            throw new Error(error.message)
        }
    }

    @Mutation(() => RecoverPasswordResponse)
    @UseMiddleware(validateMail)
    async changePassword(
        @Arg('input', () => ChangePasswordInput) input: ChangePasswordInput
    ) {
        try {
            const { email, password } = input;

            const userFound = await this.userRepository.findOne({ where: { email } });

            if (!userFound) {
                const error = new Error();
                error.message = 'Email not found, register first';
                throw error;
            }

            userFound.isEmailValid = true;

            const hashedPassword = await hash(password, 10);

            userFound.password = hashedPassword;

            await this.userRepository.update(userFound.id, userFound);

            return {
                message: 'email confirmed'
            }
        } catch (error) {
            throw new Error(error.message)
        }
    }

}