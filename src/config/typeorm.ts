import { createConnection } from 'typeorm';
import path from 'path';
import { BookResolver } from '../resolvers/book.resolver';
import { environment } from './environment';

export async function connect() {
    await createConnection({
        type: 'mysql',
        host: environment.DB_HOST,
        port: Number(environment.DB_PORT),
        username: environment.DB_USERNAME,
        password: environment.DB_PASSWORD,
        database: environment.DB_DATABASE,
        entities: [
            path.join(__dirname, '../entity/**/**.ts'),
        ],
        synchronize: true,
    })
    console.log("Database running");
    const bookResolver = await new BookResolver();
}