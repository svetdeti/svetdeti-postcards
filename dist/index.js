"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = void 0;
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const path_1 = __importDefault(require("path"));
const pdfService_1 = require("./pdfService");
const app = (0, express_1.default)();
const port = 3000;
app.use(express_1.default.static("public")); // Раздача статических файлов
app.use(express_1.default.urlencoded({ extended: true })); // Для разбора данных формы
app.use(body_parser_1.default.json());
app.post("/submit-letter", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const letterData = req.body;
        // Загрузка шаблона PDF
        const existingPdfPath = path_1.default.join(__dirname, "postcard.pdf");
        const fontPaths = {
            regular: path_1.default.join(__dirname, "Rubik/static/Rubik-Regular.ttf"),
            bold: path_1.default.join(__dirname, "Rubik/static/Rubik-Bold.ttf"),
            extraBold: path_1.default.join(__dirname, "Rubik/static/Rubik-ExtraBold.ttf"),
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
        const pdfBytes = yield (0, pdfService_1.modifyPdf)(letterData, fontPaths, existingPdfPath);
        // Отправка файла клиенту
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "attachment; filename=postcard-modified.pdf");
        res.send(Buffer.from(pdfBytes));
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: "Произошла неизвестная ошибка" });
        }
    }
}));
function startServer(port) {
    const server = app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
    return server;
}
exports.startServer = startServer;
// Запускаем сервер, если файл запущен напрямую, а не через require (например, в тестах)
if (require.main === module) {
    startServer(3000);
}
exports.default = app;
