import { PDFDocument, PDFPage, rgb, PDFFont, StandardFonts, PDFHexString, PDFName, PDFWidgetAnnotation, PDFString } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import fs from "fs";
import { LetterData } from "./types";

async function drawTextWrappedAndCentered(
  page: PDFPage,
  text: string,
  font: PDFFont,
  size: number,
  yPos: number,
  lineHeight: number,
  startXPos: number = 0 // Добавление нового параметра для начальной позиции X
): Promise<{ yPos: number; xPos: number }> {
  // Возвращает обновленное значение yPos
  let lastXPos = 0;
  const color = rgb(0, 0, 0);
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
      } else {
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
}

// Функция для добавления кликабельной ссылки
async function addLinkToPage(
  page: PDFPage,
  text: string,
  font: PDFFont,
  size: number,
  xPos: number,
  yPos: number,
  url: string
): Promise<{ xPos: number; yPos: number }> {
  // Добавление текста
  page.drawText(text, { x: xPos, y: yPos, size, font, color: rgb(0, 0, 0) });
  const textWidth = font.widthOfTextAtSize(text, size);
  const textHeight = font.heightAtSize(size);

  // Рассчитываем верхнюю и нижнюю Y-координаты для аннотации
  const linkTopY = yPos + textHeight * 0.5; // Используем половину высоты текста;
  const linkBottomY = yPos;

  // Добавление аннотации для ссылки
  const uriAction = page.doc.context.obj({
    Type: "Action",
    S: "URI",
    URI: PDFString.of(url),
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
  } else {
    page.node.set(PDFName.of("Annots"), page.doc.context.obj([linkAnnotation]));
  }

  // Возвращение новых координат X и Y
  return {
    xPos: xPos + textWidth,
    yPos: yPos,
  };
}

// Функция модификации PDF
export async function modifyPdf(
  letterData: LetterData,
  fontPaths: { regular: string; bold: string; extraBold: string },
  existingPdfPath: string
): Promise<Uint8Array> {
  const existingPdfBytes = fs.readFileSync(existingPdfPath);
  const pdfDoc = await PDFDocument.load(existingPdfBytes);

  // Регистрация fontkit
  pdfDoc.registerFontkit(fontkit);
  // Загрузка и встраивание различных начертаний шрифта
  const regularFontBytes = fs.readFileSync(fontPaths.regular);
  const boldFontBytes = fs.readFileSync(fontPaths.bold);
  const extraBoldFontBytes = fs.readFileSync(fontPaths.extraBold);

  const regularFont = await pdfDoc.embedFont(regularFontBytes);
  const boldFont = await pdfDoc.embedFont(boldFontBytes);
  const extraBoldFont = await pdfDoc.embedFont(extraBoldFontBytes);
  //   const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const pages = pdfDoc.getPages();
  const firstPage = pages[0];

  const pageHeight = firstPage.getSize().height;
  let yPos = pageHeight - 2350; // Начальная позиция Y

  // Вставка каждого элемента LetterData
  // Вставка текста
  let result = await drawTextWrappedAndCentered(firstPage, letterData.name + ",", regularFont, 64, yPos, 80); // Имя
  result.yPos -= 80; // Сдвигаем позицию вниз
  result = await drawTextWrappedAndCentered(firstPage, letterData.letterText, regularFont, 48, result.yPos, 60); // Основной текст
  result.yPos -= 120; // Дополнительный отступ для следующего абзаца

  let regularText = "И, продолжая добрые истории, я отправляю пожертвование в благотворительный фонд ";
  let linkText = "«свет.дети»";
  let url = "https://clck.ru/36sjWX"; // URL для ссылки

  // Вычисление ширины текста и ссылки
  let linkTextWidth = regularFont.widthOfTextAtSize(linkText, 48);
  // Центрирование комбинации текста и ссылки

  result = await drawTextWrappedAndCentered(firstPage, regularText, regularFont, 48, result.yPos, 60, linkTextWidth);
  let xPosForLink = result.xPos;
  await addLinkToPage(firstPage, linkText, boldFont, 48, xPosForLink, result.yPos, url);

  result.yPos -= 120;
  result = await drawTextWrappedAndCentered(firstPage, letterData.momentGift, regularFont, 48, result.yPos, 60);
  result.yPos -= 60;
  result = await drawTextWrappedAndCentered(firstPage, letterData.signature, regularFont, 48, result.yPos, 60);
  result.yPos -= 120;

  regularText = "Если вы тоже хотите напомнить кому-то о Светлом моменте, ";
  linkText = "нажми сюда";
  linkTextWidth = regularFont.widthOfTextAtSize(linkText, 48);
  url = "https://clck.ru/36sjbL"; // URL для ссылки
  result = await drawTextWrappedAndCentered(firstPage, regularText, regularFont, 48, result.yPos, 60);
  xPosForLink = result.xPos;
  result.yPos -= 60;
  result = await drawTextWrappedAndCentered(firstPage, "", regularFont, 48, result.yPos, 60, linkTextWidth);
  xPosForLink = result.xPos;
  await addLinkToPage(firstPage, linkText, boldFont, 48, xPosForLink, result.yPos, url);

  // Сохранение изменённого PDF и возврат как массива байт
  return pdfDoc.save();
}
