import { Mutation, Resolver, Arg, InputType, Field, Query, UseMiddleware, Ctx } from 'type-graphql';
import { getRepository, Repository } from "typeorm";
import { User } from '../entity/user.entity';

@InputType()
export class UserIdInput {

    constructor(id: number) {
        this.id = id;
    }

    @Field(() => Number)
    id!: number
}

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

    @Query(() => User)
    async getUsersById(
        @Arg('input', () => Number) input: UserIdInput
    ): Promise<User | undefined> {
        try {
            const user = this.userRepository.findOne(input.id, { relations: ['books'] });
            if (!user) {
                const error = new Error();
                error.message = 'user not found';
                throw error;
            }
            return user
        } catch (e) {
            throw new Error(e);
        }
    }
}