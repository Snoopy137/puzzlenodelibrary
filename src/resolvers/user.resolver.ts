import { Mutation, Resolver, Arg, InputType, Field, Query, UseMiddleware, Ctx } from 'type-graphql';
import { getRepository, Repository } from "typeorm";
import { User } from '../entity/user.entity';

@Resolver()
export class UserResolver {

    userRepository: Repository<User>

    constructor() {
        this.userRepository = getRepository(User);
    }

    @Query(() => [User])
    async getAllUser(): Promise<User[]> {
        try {
            return this.userRepository.find({ relations: ['books'] });
        } catch (e) {
            throw new Error(e);
        }
    }

    @Query(() => [User])
    async getUsersWithLoans(): Promise<User[]> {
        try {
            const users = this.userRepository.find({ relations: ['books'] });
            return (await users).filter((user) => user.books.length > 0);
        } catch (e) {
            throw new Error(e);
        }
    }
}