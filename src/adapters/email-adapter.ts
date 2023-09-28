import nodemailer from "nodemailer";

/**
 * Метод для отправки сообщения при регистрации. Вызывается в authService
 * В transport задаем настройки почтового сервиса для отправки
 * В mailOptions задаем параметры письма. Отправляем на email из параметра. В ссылку вшиваем код подтверждения.
 * Сейчас сайт для подтверждения обычная заглушка
 * Далее отправляем email и выходим из функцкии
 */
export const emailAdapter = {
    async sendRegistrationMail(email: string, confirmationCode: string) {
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
            subject: 'Registration',
            text: 'Hello world text',
            html: String.raw`
                <h1>Thank for your registration</h1>
                 <p>To finish registration please follow the link below:
                     <a href='https://somesite.com/confirm-email?code=${confirmationCode}'>complete registration</a>
                 </p>`
        }

        await transport.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            }
        })
        return
    }
}