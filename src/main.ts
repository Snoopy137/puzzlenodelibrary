import { startServer } from './sever';
import { connect } from './config/typeorm';
import { foo } from './admin/schedule.admin';
import { mail } from './admin/mail.admin';

async function main() {
    connect()
    const port: number = 4000;
    const app = await startServer();
    app.listen(port);
    console.log("App running on port", port);
    //const sendmail = new mail();
    //await sendmail.sendMail1('');
    //foo.start();
}

main();