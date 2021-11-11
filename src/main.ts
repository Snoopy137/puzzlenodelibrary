import { startServer } from './sever';
import { connect } from './config/typeorm';
import { foo } from './admin/schedule.admin';

async function main() {
    await connect()
    const port: number = 4000;
    const app = await startServer();
    app.listen(port);
    console.log("App running on port", port);
    foo.start();
}

main();