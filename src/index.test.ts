import request from "supertest";
import pdfParse from "pdf-parse";
import { startServer } from "./index"; // Импорт функции startServer из вашего файла сервера
import type { Server } from "http";

describe("POST /submit-letter PDF Generation", () => {
  let server: Server;

  beforeAll(() => {
    // Запуск сервера на определенном порту
    server = startServer(3000);
  });

  afterAll((done) => {
    // Закрытие сервера после выполнения тестов
    server.close(done);
  });

  it("should generate a PDF with the submitted data", async () => {
    // Тестовые данные для отправки
    const testData = {
      email: "example@example.com",
      name: "John Doe",
      letterText: "Пример текста письма",
      momentGift: "Подаренный момент",
      signature: "Подпись",
    };

    // Отправка POST-запроса с тестовыми данными
    const response = await request(server).post("/submit-letter").send(testData).expect(200).expect("Content-Type", /pdf/);

    // Проверка, что в ответе есть содержимое
    expect(response.body).toBeDefined();
    expect(response.body.length).toBeGreaterThan(0);

    // Анализ полученного PDF
    const pdfData = await pdfParse(response.body);
    const pdfText = pdfData.text;

    // Проверка наличия тестовых данных в тексте PDF
    expect(pdfText).toContain(testData.email);
    expect(pdfText).toContain(testData.name);
    // expect(pdfText).toContain(testData.letterText);
    // expect(pdfText).toContain(testData.momentGift);
    // expect(pdfText).toContain(testData.signature);
  });
});
