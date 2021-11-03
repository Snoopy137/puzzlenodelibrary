import { startServer } from './sever';
import { connect } from './config/typeorm';
import { schedule } from 'node-cron';
import {} from 'node

async function main() {
    schedule('* * * * *', () => {
        console.log('running a task every minute');
        main.addEventListener("click", modifyText, false);
    });
    connect()
    const port: number = 4000;
    const app = await startServer();
    app.listen(port);
    console.log("App running on port", port);
}

main();