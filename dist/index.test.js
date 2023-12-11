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
const supertest_1 = __importDefault(require("supertest"));
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const index_1 = require("./index"); // Импорт функции startServer из вашего файла сервера
describe("POST /submit-letter PDF Generation", () => {
    let server;
    beforeAll(() => {
        // Запуск сервера на определенном порту
        server = (0, index_1.startServer)(3000);
    });
    afterAll((done) => {
        // Закрытие сервера после выполнения тестов
        server.close(done);
    });
    it("should generate a PDF with the submitted data", () => __awaiter(void 0, void 0, void 0, function* () {
        // Тестовые данные для отправки
        const testData = {
            email: "example@example.com",
            name: "John Doe",
            letterText: "Пример текста письма",
            momentGift: "Подаренный момент",
            signature: "Подпись",
        };
        // Отправка POST-запроса с тестовыми данными
        const response = yield (0, supertest_1.default)(server).post("/submit-letter").send(testData).expect(200).expect("Content-Type", /pdf/);
        // Проверка, что в ответе есть содержимое
        expect(response.body).toBeDefined();
        expect(response.body.length).toBeGreaterThan(0);
        // Анализ полученного PDF
        const pdfData = yield (0, pdf_parse_1.default)(response.body);
        const pdfText = pdfData.text;
        // Проверка наличия тестовых данных в тексте PDF
        expect(pdfText).toContain(testData.email);
        expect(pdfText).toContain(testData.name);
        // expect(pdfText).toContain(testData.letterText);
        // expect(pdfText).toContain(testData.momentGift);
        // expect(pdfText).toContain(testData.signature);
    }));
});
