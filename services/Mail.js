import nodemailer from 'nodemailer';
import ejs from 'ejs';
import path from 'path';

// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: process.env.EMAIL,
//         pass: process.env.EMAIL_PASSWORD,
//     }
// })

//test version
const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'nathaniel.langworth85@ethereal.email',
        pass: 'FMykF8DhAvWfWsTUym'
    }
});
export const sendMail = async ({to, subject, templateData, template,attachments=null}) => {
    try {
        const templatePath = path.resolve('./views/email/',`${template}.ejs`);
        const htmlData = await ejs.renderFile(templatePath,templateData);

        const mailOptions = {
            to:to,
            from: process.env.EMAIL,
            subject: subject,
            html:htmlData,
        }

        if (attachments){
            mailOptions.attachments = attachments;
        }
        const info = await transporter.sendMail(mailOptions)

        console.log(`Mail sent: ${info.response}`);
    }catch (error) {
        console.error(`Error sending email: ${error.message}`, error);
        throw new Error('Email could not be sent');    }
}