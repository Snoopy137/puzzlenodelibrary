import { startServer } from './sever';
import { connect } from './config/typeorm';
import { foo, foo1 } from './admin/schedule.admin';

async function main() {
    connect()
    const port: number = 4000;
    const app = await startServer();
    app.listen(port);
    console.log("App running on port", port);
    foo.start();
    foo1.start();
}

main();