import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "fs";
import path from "path";
import { LetterData } from "./types";
import { modifyPdf } from "./pdfService";

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

    // const existingPdfBytes = fs.readFileSync(existingPdfPath);

    // const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // Добавление текста
    // const pages = pdfDoc.getPages();
    // const firstPage = pages[0];
    // const fontSize = 12;
    // const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    // firstPage.drawText(`Email: ${letterData.email}`, { x: 50, y: 700, size: fontSize, font });
    // firstPage.drawText(`Name: ${letterData.name}`, { x: 50, y: 680, size: fontSize, font });
    // Добавьте остальные поля аналогично

    // Сериализация PDF-документа
    // const pdfBytes = await pdfDoc.save();
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
