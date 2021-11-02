import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { Book } from './book.entity';
import { Field, ObjectType } from 'type-graphql';

@ObjectType()
@Entity()
export class User {

    @Field()
    @PrimaryGeneratedColumn()
    id!: number

    @Field()
    @Column()
    fullName!: string

    @Field()
    @Column()
    email!: string

    @Field()
    @Column()
    password!: string

    @Field()
    @CreateDateColumn({ type: 'timestamp' })
    createdAt!: string

    @Field(() => [Book], { nullable: true })
    @OneToMany(() => Book, book => book.user, { nullable: true, onDelete: 'CASCADE' })
    books!: Book[]
}