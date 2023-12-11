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
exports.modifyPdf = void 0;
const pdf_lib_1 = require("pdf-lib");
const fontkit_1 = __importDefault(require("@pdf-lib/fontkit"));
const fs_1 = __importDefault(require("fs"));
function drawTextWrappedAndCentered(page, text, font, size, yPos, lineHeight, startXPos = 0 // Добавление нового параметра для начальной позиции X
) {
    return __awaiter(this, void 0, void 0, function* () {
        // Возвращает обновленное значение yPos
        let lastXPos = 0;
        const color = (0, pdf_lib_1.rgb)(0, 0, 0);
        const leftMargin = 450;
        const rightMargin = 450;
        //   const lineHeight = 20; // Отступ между строками в абзаце
        const paragraphSpacing = 60; // Отступ между абзацами
        const paragraphs = text.split("\n"); // Разделение текста на абзацы
        const pageWidth = page.getSize().width;
        const maxLineWidth = pageWidth - leftMargin - rightMargin;
        for (let i = 0; i < paragraphs.length; i++) {
            const paragraph = paragraphs[i];
            let words = paragraph.split(" ");
            let line = "";
            for (const word of words) {
                let testLine = line + word + " ";
                let testLineWidth = font.widthOfTextAtSize(testLine, size);
                if (testLineWidth > maxLineWidth && line !== "") {
                    const lineX = leftMargin + maxLineWidth / 2 - font.widthOfTextAtSize(line, size) / 2;
                    page.drawText(line, { x: lineX, y: yPos, size, font, color });
                    line = word + " ";
                    yPos -= lineHeight; // Отступ между строками внутри абзаца
                }
                else {
                    line = testLine;
                }
            }
            if (line !== "") {
                const lineX = leftMargin + maxLineWidth / 2 - (font.widthOfTextAtSize(line, size) + startXPos) / 2;
                page.drawText(line, { x: lineX, y: yPos, size, font, color });
                lastXPos = lineX + font.widthOfTextAtSize(line, size);
            }
            // Отступ между абзацами, если это не последний абзац
            if (i < paragraphs.length - 1) {
                yPos -= paragraphSpacing;
            }
        }
        return { yPos, xPos: lastXPos };
    });
}
// Функция для добавления кликабельной ссылки
function addLinkToPage(page, text, font, size, xPos, yPos, url) {
    return __awaiter(this, void 0, void 0, function* () {
        // Добавление текста
        page.drawText(text, { x: xPos, y: yPos, size, font, color: (0, pdf_lib_1.rgb)(0, 0, 0) });
        const textWidth = font.widthOfTextAtSize(text, size);
        const textHeight = font.heightAtSize(size);
        // Рассчитываем верхнюю и нижнюю Y-координаты для аннотации
        const linkTopY = yPos + textHeight * 0.5; // Используем половину высоты текста;
        const linkBottomY = yPos;
        // Добавление аннотации для ссылки
        const uriAction = page.doc.context.obj({
            Type: "Action",
            S: "URI",
            URI: pdf_lib_1.PDFString.of(url),
            NewWindow: true, // Пытаемся открыть ссылку в новом окне
        });
        const linkAnnotation = page.doc.context.obj({
            Type: "Annot",
            Subtype: "Link",
            Rect: [xPos, linkBottomY, xPos + textWidth, linkTopY],
            A: uriAction,
            Border: [0, 0, 0],
        });
        // Добавление аннотации ссылки на страницу
        const annotations = page.node.Annots();
        if (annotations) {
            annotations.push(linkAnnotation);
        }
        else {
            page.node.set(pdf_lib_1.PDFName.of("Annots"), page.doc.context.obj([linkAnnotation]));
        }
        // Возвращение новых координат X и Y
        return {
            xPos: xPos + textWidth,
            yPos: yPos,
        };
    });
}
// Функция модификации PDF
function modifyPdf(letterData, fontPaths, existingPdfPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const existingPdfBytes = fs_1.default.readFileSync(existingPdfPath);
        const pdfDoc = yield pdf_lib_1.PDFDocument.load(existingPdfBytes);
        // Регистрация fontkit
        pdfDoc.registerFontkit(fontkit_1.default);
        // Загрузка и встраивание различных начертаний шрифта
        const regularFontBytes = fs_1.default.readFileSync(fontPaths.regular);
        const boldFontBytes = fs_1.default.readFileSync(fontPaths.bold);
        const extraBoldFontBytes = fs_1.default.readFileSync(fontPaths.extraBold);
        const regularFont = yield pdfDoc.embedFont(regularFontBytes);
        const boldFont = yield pdfDoc.embedFont(boldFontBytes);
        const extraBoldFont = yield pdfDoc.embedFont(extraBoldFontBytes);
        //   const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];
        const pageHeight = firstPage.getSize().height;
        let yPos = pageHeight - 2350; // Начальная позиция Y
        // Вставка каждого элемента LetterData
        // Вставка текста
        let result = yield drawTextWrappedAndCentered(firstPage, letterData.name + ",", regularFont, 64, yPos, 80); // Имя
        result.yPos -= 80; // Сдвигаем позицию вниз
        result = yield drawTextWrappedAndCentered(firstPage, letterData.letterText, regularFont, 48, result.yPos, 60); // Основной текст
        result.yPos -= 120; // Дополнительный отступ для следующего абзаца
        let regularText = "И, продолжая добрые истории, я отправляю пожертвование в благотворительный фонд ";
        let linkText = "«свет.дети»";
        let url = "https://clck.ru/36sjWX"; // URL для ссылки
        // Вычисление ширины текста и ссылки
        let linkTextWidth = regularFont.widthOfTextAtSize(linkText, 48);
        // Центрирование комбинации текста и ссылки
        result = yield drawTextWrappedAndCentered(firstPage, regularText, regularFont, 48, result.yPos, 60, linkTextWidth);
        let xPosForLink = result.xPos;
        yield addLinkToPage(firstPage, linkText, boldFont, 48, xPosForLink, result.yPos, url);
        result.yPos -= 120;
        result = yield drawTextWrappedAndCentered(firstPage, letterData.momentGift, regularFont, 48, result.yPos, 60);
        result.yPos -= 60;
        result = yield drawTextWrappedAndCentered(firstPage, letterData.signature, regularFont, 48, result.yPos, 60);
        result.yPos -= 120;
        regularText = "Если вы тоже хотите напомнить кому-то о Светлом моменте, ";
        linkText = "нажми сюда";
        linkTextWidth = regularFont.widthOfTextAtSize(linkText, 48);
        url = "https://clck.ru/36sjbL"; // URL для ссылки
        result = yield drawTextWrappedAndCentered(firstPage, regularText, regularFont, 48, result.yPos, 60);
        xPosForLink = result.xPos;
        result.yPos -= 60;
        result = yield drawTextWrappedAndCentered(firstPage, "", regularFont, 48, result.yPos, 60, linkTextWidth);
        xPosForLink = result.xPos;
        yield addLinkToPage(firstPage, linkText, boldFont, 48, xPosForLink, result.yPos, url);
        // Сохранение изменённого PDF и возврат как массива байт
        return pdfDoc.save();
    });
}
exports.modifyPdf = modifyPdf;
