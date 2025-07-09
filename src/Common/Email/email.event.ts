import { EventEmitter } from "events";
import { sendEmail } from "./send-email";
import { otpTemplate } from "./otpTemplate";


export const emailEmitter = new EventEmitter();

emailEmitter.on("sendEmail", async (email: string, subject: string , message: string , from?: string) => {
    const mailFromApp = from ? false : true
    await sendEmail({ from, to: email, subject, html: otpTemplate(message, subject, mailFromApp) })
        .then(ele => console.log(`📧 Email sent successfully to ${email}`)
        ).catch(error =>
        console.error(`🚨 Error sending email to ${email}:`, error.message)
    
)})