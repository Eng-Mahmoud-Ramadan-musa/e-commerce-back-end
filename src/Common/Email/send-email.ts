import * as nodemailer from 'nodemailer'

export async function sendEmail(sendMailOption: nodemailer.SendMailOptions) {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASS
        }
    })
  const fromAddress = sendMailOption.from
    ? `E-Commerce App <${sendMailOption.from}>`
    : `E-Commerce App <${process.env.EMAIL}>`;

  const info = await transporter.sendMail({
    ...sendMailOption,
    from: fromAddress,
  });

  return info.rejected.length === 0;
}