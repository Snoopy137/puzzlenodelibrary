import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, UpdateDateColumn } from 'typeorm';
import { Author } from './author.entity';
import { User } from './user.entity';
import { Field, ObjectType } from 'type-graphql';
import { reporter } from '../admin/schedule.admin';

@ObjectType()
@Entity()
export class Book {

    @Field()
    @PrimaryGeneratedColumn()
    id!: number

    @Field()
    @Column()
    title!: String

    @Field(() => Author)
    @ManyToOne(() => Author, author => author.books, { onDelete: 'CASCADE' })
    author!: Author

    @Field()
    @CreateDateColumn({ type: 'timestamp' })
    createdAt!: string

    @Field()
    @Column()
    isOnLoan!: Boolean;

    @Field({ nullable: true })
    @UpdateDateColumn({ nullable: true, type: 'timestamp' })
    loanDate!: String

    @Field(() => String, { nullable: true })
    @Column({ nullable: true, type: 'date' })
    returnDate!: Date

    @Field(() => User, { nullable: true })
    @ManyToOne(() => User, user => user.books, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
    user!: number
}