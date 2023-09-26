import nodemailer from "nodemailer";

export const emailAdapter = {
    async sendRegistrationMail(email: string) {
        let transport = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            auth: {
                user: process.env.GMAIL_EMAIL,
                pass: process.env.GMAIL_PASSWORD
            }
        })

        let mailOptions = {
            from: 'Dmitry Melnikov <melnykovtestdev@gmail.com>',
            to: email,
            subject: 'Hello world',
            text: 'Hello world text',
            html: "<b>Hello world text</b>"
        }

        transport.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            }
        })
        return
    }
}