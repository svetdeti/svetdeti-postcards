import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import fs from "fs";
import path from "path";
import { LetterData } from "./types";
import { modifyPdf } from "./pdfService";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { Attachment } from "nodemailer/lib/mailer";

const app = express();
const port = 3000;

app.use(express.static("public")); // Раздача статических файлов
app.use(express.urlencoded({ extended: true })); // Для разбора данных формы

app.use(bodyParser.json());

app.post("/submit-letter", async (req: Request, res: Response) => {
  try {
    const letterData: LetterData = req.body;

    // Загрузка шаблона PDF
    const existingPdfPath = path.join(__dirname, "postcard.pdf");
    const fontPaths = {
      regular: path.join(__dirname, "Rubik/static/Rubik-Regular.ttf"),
      bold: path.join(__dirname, "Rubik/static/Rubik-Bold.ttf"),
      extraBold: path.join(__dirname, "Rubik/static/Rubik-ExtraBold.ttf"),
    };

    const pdfBytes = await modifyPdf(letterData, fontPaths, existingPdfPath);

    // Отправка файла клиенту
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=postcard-modified.pdf");
    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Произошла неизвестная ошибка" });
    }
  }
});

app.post("/send-email", async (req: Request, res: Response) => {
  try {
    const letterData: LetterData = req.body;

    // Загрузка шаблона PDF
    const existingPdfPath = path.join(__dirname, "postcard.pdf");
    const fontPaths = {
      regular: path.join(__dirname, "Rubik/static/Rubik-Regular.ttf"),
      bold: path.join(__dirname, "Rubik/static/Rubik-Bold.ttf"),
      extraBold: path.join(__dirname, "Rubik/static/Rubik-ExtraBold.ttf"),
    };

    const pdfBytes = await modifyPdf(letterData, fontPaths, existingPdfPath);
    dotenv.config();
    // Create a Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: process.env.SMTP_SERVICE,
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"), // Use the correct SMTP port for your email service
      secure: true, // Use secure connection (SSL/TLS) if required by your email service
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Define email options
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: letterData.email,
      subject: "Your Subject",
      text: "Text content of the email",
      html: "<p>HTML content of the email</p>",
      attachments: [
        {
          filename: `${letterData.name}-postcard.pdf`,
          content: pdfBytes,
        } as Attachment, // Type assertion to match the Attachment type
      ],
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "An error occurred while sending the email" });
  }
});

export function startServer(port: number) {
  const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });

  return server;
}

// Запускаем сервер, если файл запущен напрямую, а не через require (например, в тестах)
if (require.main === module) {
  startServer(3000);
}

export default app;
