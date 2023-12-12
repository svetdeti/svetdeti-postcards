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

// app.use(express.static("public")); // Раздача статических файлов
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
    const transporter = nodemailer.createTransport(process.env.SMTP_URL);

    // Define email options
    const mailOptions = {
      from: `Команда «свет.дети» ${process.env.EMAIL_FROM}`,
      to: letterData.email,
      subject: "Ваша открытка со светлым моментом",
      text: `Здравствуйте!

      Ваша новогодняя открытка прилагается к этому письму. Спасибо, что делитесь светлыми моментами и помогаете детям выздоравливать!
      
      Искренне ваша,
      команда фонда «свет.дети»
      
      Если у вас есть вопросы или предложения, напишите нам на letters@fondsvet.org.`,
      html: `
      
      <head>
        <title>Ваша открытка со светлым моментом</title><!--[if !mso]><!-->
        <meta http-equiv="X-UA-Compatible" content="IE=edge"><!--<![endif]-->
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <style type="text/css">
          #outlook a {
            padding: 0;
          }
      
          body {
            margin: 0;
            padding: 0;
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
          }
      
          table,
          td {
            border-collapse: collapse;
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
          }
      
          img {
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
            -ms-interpolation-mode: bicubic;
          }
      
          p {
            display: block;
            margin: 13px 0;
          }
        </style><!--[if mso]>
              <noscript>
              <xml>
              <o:OfficeDocumentSettings>
                <o:AllowPNG/>
                <o:PixelsPerInch>96</o:PixelsPerInch>
              </o:OfficeDocumentSettings>
              </xml>
              </noscript>
              <![endif]--><!--[if lte mso 11]>
              <style type="text/css">
                .mj-outlook-group-fix { width:100% !important; }
              </style>
              <![endif]--><!--[if !mso]><!-->
        <link href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700" rel="stylesheet" type="text/css">
        <link href="https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700" rel="stylesheet" type="text/css">
        <style type="text/css">
          @import url(https://fonts.googleapis.com/css?family=Roboto:300,400,500,700);
          @import url(https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700);
        </style><!--<![endif]-->
        <style type="text/css">
          @media only screen and (min-width:350px) {
            .mj-column-per-100 {
              width: 100% !important;
              max-width: 100%;
            }
      
            .mj-column-per-20 {
              width: 20% !important;
              max-width: 20%;
            }
      
            .mj-column-per-80 {
              width: 80% !important;
              max-width: 80%;
            }
          }
        </style>
        <style media="screen and (min-width:350px)">
          .moz-text-html .mj-column-per-100 {
            width: 100% !important;
            max-width: 100%;
          }
      
          .moz-text-html .mj-column-per-20 {
            width: 20% !important;
            max-width: 20%;
          }
      
          .moz-text-html .mj-column-per-80 {
            width: 80% !important;
            max-width: 80%;
          }
        </style>
        <style type="text/css">
          @media only screen and (max-width:350px) {
            table.mj-full-width-mobile {
              width: 100% !important;
            }
      
            td.mj-full-width-mobile {
              width: auto !important;
            }
          }
      
      
          noinput.mj-menu-checkbox {
            display: block !important;
            max-height: none !important;
            visibility: visible !important;
          }
      
          @media only screen and (max-width:350px) {
            .mj-menu-checkbox[type="checkbox"]~.mj-inline-links {
              display: none !important;
            }
      
            .mj-menu-checkbox[type="checkbox"]:checked~.mj-inline-links,
            .mj-menu-checkbox[type="checkbox"]~.mj-menu-trigger {
              display: block !important;
              max-width: none !important;
              max-height: none !important;
              font-size: inherit !important;
            }
      
            .mj-menu-checkbox[type="checkbox"]~.mj-inline-links>a {
              display: block !important;
            }
      
            .mj-menu-checkbox[type="checkbox"]:checked~.mj-menu-trigger .mj-menu-icon-close {
              display: block !important;
            }
      
            .mj-menu-checkbox[type="checkbox"]:checked~.mj-menu-trigger .mj-menu-icon-open {
              display: none !important;
            }
          }
        </style>
      </head>
      
      <body style="word-spacing:normal;background-color:#1c2430;">
        <div
          style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
          Ваша новогодняя открытка — в приложении к этому письму.</div>
        <div style="background-color:#1c2430;">
          <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:500px;" width="500" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
          <div style="margin:0px auto;max-width:500px;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
              <tbody>
                <tr>
                  <td style="direction:ltr;font-size:0px;padding:25px;text-align:center;">
                    <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr></tr></table><![endif]-->
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:500px;" width="500" bgcolor="#ffffff" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
          <div style="background:#ffffff;background-color:#ffffff;margin:0px auto;border-radius:10px;max-width:500px;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation"
              style="background:#ffffff;background-color:#ffffff;width:100%;border-radius:10px;">
              <tbody>
                <tr>
                  <td style="direction:ltr;font-size:0px;padding:20px 0;text-align:center;">
                    <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" width="500px" ><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:500px;" width="500" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
                    <div style="margin:0px auto;max-width:500px;">
                      <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation"
                        style="width:100%;">
                        <tbody>
                          <tr>
                            <td style="direction:ltr;font-size:0px;padding:10px 0 15px;text-align:center;">
                              <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:500px;" ><![endif]-->
                              <div class="mj-column-per-100 mj-outlook-group-fix"
                                style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                                <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
                                  <tbody>
                                    <tr>
                                      <td style="vertical-align:top;padding:10px 0 30px;">
                                        <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
                                          <tbody>
                                            <tr>
                                              <td align="left" style="font-size:0px;padding:0 40px;word-break:break-word;">
                                                <table border="0" cellpadding="0" cellspacing="0" role="presentation"
                                                  style="border-collapse:collapse;border-spacing:0px;">
                                                  <tbody>
                                                    <tr>
                                                      <td style="width:96px;"><a
                                                          href="https://svetdeti.org/?utm_source=mail&utm_medium=link&utm_term=dec_23&utm_content=postcard_sent&utm_campaign=main"
                                                          target="_blank"><img alt="свет.дети" height="auto"
                                                            src="https://193027.selcdn.ru/cdn/emails/new/svetdeti_logo_main.png"
                                                            style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;"
                                                            width="96"></a></td>
                                                    </tr>
                                                  </tbody>
                                                </table>
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div><!--[if mso | IE]></td><td class="" style="vertical-align:top;width:500px;" ><![endif]-->
                              <div class="mj-column-per-100 mj-outlook-group-fix"
                                style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                                <table border="0" cellpadding="0" cellspacing="0" role="presentation"
                                  style="vertical-align:top;" width="100%">
                                  <tbody>
                                    <tr>
                                      <td align="left" style="font-size:0px;padding:10px 40px 15px;word-break:break-word;">
                                        <div
                                          style="font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif;font-size:20px;font-weight:700;line-height:30px;text-align:left;color:#1F2937;">
                                          Ваша открытка со&nbsp;светлым моментом</div>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td align="center" style="font-size:0px;padding:10px 0;word-break:break-word;">
                                        <table border="0" cellpadding="0" cellspacing="0" role="presentation"
                                          style="border-collapse:collapse;border-spacing:0px;">
                                          <tbody>
                                            <tr>
                                              <td style="width:500px;"><img height="auto"
                                                  src="https://c67ae493-911e-4e87-b127-1deec08cf7a1.selstorage.ru/emails/ny-2024.jpg"
                                                  style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;"
                                                  width="500"></td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div><!--[if mso | IE]></td></tr></table><![endif]-->
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <!--[if mso | IE]></td></tr></table></td></tr><tr><td class="" width="500px" ><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:500px;" width="500" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
                    <div style="margin:0px auto;max-width:500px;">
                      <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation"
                        style="width:100%;">
                        <tbody>
                          <tr>
                            <td style="direction:ltr;font-size:0px;padding:10px 0;text-align:center;">
                              <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:500px;" ><![endif]-->
                              <div class="mj-column-per-100 mj-outlook-group-fix"
                                style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                                <table border="0" cellpadding="0" cellspacing="0" role="presentation"
                                  style="vertical-align:top;" width="100%">
                                  <tbody>
                                    <tr>
                                      <td align="left" style="font-size:0px;padding:0 40px 0;word-break:break-word;">
                                        <div
                                          style="font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif;font-size:18px;font-weight:700;line-height:1;text-align:left;color:#1F2937;">
                                          Здравствуйте!</div>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td align="left" style="font-size:0px;padding:15px 40px 10px;word-break:break-word;">
                                        <div
                                          style="font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif;font-size:16px;font-weight:400;line-height:24px;text-align:left;color:#1F2937;">
                                          Ваша новогодняя открытка — в приложении к этому письму.</div>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td align="left" style="font-size:0px;padding:0 40px 30px;word-break:break-word;">
                                        <div
                                          style="font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif;font-size:16px;font-weight:400;line-height:24px;text-align:left;color:#1F2937;">
                                          Спасибо, что делитесь светлыми моментами и помогаете детям выздоравливать!</div>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div><!--[if mso | IE]></td></tr></table><![endif]-->
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <!--[if mso | IE]></td></tr></table></td></tr><tr><td class="" width="500px" ><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:500px;" width="500" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
                    <div style="margin:0px auto;max-width:500px;">
                      <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation"
                        style="width:100%;">
                        <tbody>
                          <tr>
                            <td
                              style="border-top:1px dashed #E5E7EB;direction:ltr;font-size:0px;padding:20px 20px 0;text-align:center;">
                              <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="width:460px;" ><![endif]-->
                              <div class="mj-column-per-100 mj-outlook-group-fix"
                                style="font-size:0;line-height:0;text-align:left;display:inline-block;width:100%;direction:ltr;">
                                <!--[if mso | IE]><table border="0" cellpadding="0" cellspacing="0" role="presentation" ><tr><td style="vertical-align:top;width:92px;" ><![endif]-->
                                <div class="mj-column-per-20 mj-outlook-group-fix"
                                  style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:20%;">
                                  <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
                                    <tbody>
                                      <tr>
                                        <td style="vertical-align:top;padding:10px 10px;">
                                          <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
                                            <tbody>
                                              <tr>
                                                <td align="center" style="font-size:0px;padding:0;word-break:break-word;">
                                                  <table border="0" cellpadding="0" cellspacing="0" role="presentation"
                                                    style="border-collapse:collapse;border-spacing:0px;">
                                                    <tbody>
                                                      <tr>
                                                        <td style="width:60px;"><img height="auto"
                                                            src="https://geteml.com/ru/user_file?resource=himg&user_id=4659052&name=6xiu47538gj1378z5dt35htzyzsp79w7w3wxacd1f8emn8mcep3ja84qwhuyxxn6t8t3k5fg3o4imcbqqu79iwsb6r4fs1yajkha1x6y"
                                                            style="border:0;border-radius:50%;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;"
                                                            width="60"></td>
                                                      </tr>
                                                    </tbody>
                                                  </table>
                                                </td>
                                              </tr>
                                            </tbody>
                                          </table>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div><!--[if mso | IE]></td><td style="vertical-align:top;width:368px;" ><![endif]-->
                                <div class="mj-column-per-80 mj-outlook-group-fix"
                                  style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:80%;">
                                  <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
                                    <tbody>
                                      <tr>
                                        <td style="vertical-align:top;padding:10px;">
                                          <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
                                            <tbody>
                                              <tr>
                                                <td align="left" style="font-size:0px;padding:0;word-break:break-word;">
                                                  <div
                                                    style="font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif;font-size:16px;font-weight:700;line-height:1;text-align:left;color:#374151;">
                                                    Искренне ваша,</div>
                                                </td>
                                              </tr>
                                              <tr>
                                                <td align="left"
                                                  style="font-size:0px;padding:0;padding-top:7px;word-break:break-word;">
                                                  <div
                                                    style="font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif;font-size:12px;font-weight:400;line-height:1;text-align:left;color:#9CA3AF;">
                                                    команда фонда «свет.дети»</div>
                                                </td>
                                              </tr>
                                              <tr>
                                                <td align="left"
                                                  style="font-size:0px;padding:0;padding-top:15px;word-break:break-word;">
                                                  <div
                                                    style="font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif;font-size:14px;font-weight:400;line-height:21px;text-align:left;color:#6B7280;">
                                                    Если у вас есть вопросы или предложения, <a
                                                      href="mailto:letters@fondsvet.org">напишите нам.</a></div>
                                                </td>
                                              </tr>
                                            </tbody>
                                          </table>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div><!--[if mso | IE]></td></tr></table><![endif]-->
                              </div><!--[if mso | IE]></td></tr></table><![endif]-->
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div><!--[if mso | IE]></td></tr></table></td></tr></table><![endif]-->
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:500px;" width="500" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
          <div style="margin:0px auto;max-width:500px;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
              <tbody>
                <tr>
                  <td style="direction:ltr;font-size:0px;padding:10px;text-align:center;">
                    <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr></tr></table><![endif]-->
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:500px;" width="500" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
          <div style="margin:0px auto;max-width:500px;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
              <tbody>
                <tr>
                  <td style="direction:ltr;font-size:0px;padding:0;text-align:center;">
                    <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:500px;" ><![endif]-->
                    <div class="mj-column-per-100 mj-outlook-group-fix"
                      style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                      <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;"
                        width="100%">
                        <tbody>
                          <tr>
                            <td align="center" style="font-size:0px;word-break:break-word;"><!--[if !mso><!--> <input
                                type="checkbox" id="4e6217ec03ffb186" class="mj-menu-checkbox"
                                style="display:none !important; max-height:0; visibility:hidden;"><!--<![endif]-->
                              <div class="mj-menu-trigger"
                                style="display:none;max-height:0px;max-width:0px;font-size:0px;overflow:hidden;"><label
                                  for="4e6217ec03ffb186" class="mj-menu-label"
                                  style="display:block;cursor:pointer;mso-hide:all;-moz-user-select:none;user-select:none;color:#ffffff;font-size:30px;font-family:Ubuntu, Helvetica, Arial, sans-serif;text-transform:uppercase;text-decoration:none;line-height:30px;padding:10px;"
                                  align="center"><span class="mj-menu-icon-open" style="mso-hide:all;">&#9776; </span><span
                                    class="mj-menu-icon-close" style="display:none;mso-hide:all;">&#8855;</span></label></div>
                              <div class="mj-inline-links">
                                <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center"><tr><td style="padding:15px 10px;" class="" ><![endif]-->
                                <a class="mj-link"
                                  href="https://svetdeti.org/stories?utm_source=mail&utm_medium=link&utm_term=dec_23&utm_content=postcard_sent&utm_campaign=stories"
                                  target="_blank"
                                  style="display:inline-block;color:#ffffff;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif;font-size:11px;font-weight:700;line-height:22px;text-decoration:none;text-transform:uppercase;padding:15px 10px;">Истории
                                </a><!--[if mso | IE]></td><td style="padding:15px 10px;" class="" ><![endif]--> <a
                                  class="mj-link"
                                  href="https://svetdeti.org/projects?utm_source=mail&utm_medium=link&utm_term=dec_23&utm_content=postcard_sent&utm_campaign=projects"
                                  target="_blank"
                                  style="display:inline-block;color:#ffffff;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif;font-size:11px;font-weight:700;line-height:22px;text-decoration:none;text-transform:uppercase;padding:15px 10px;">Проекты
                                </a><!--[if mso | IE]></td><td style="padding:15px 10px;" class="" ><![endif]--> <a
                                  class="mj-link"
                                  href="https://svetdeti.org/events?utm_source=mail&utm_medium=link&utm_term=dec_23&utm_content=postcard_sent&utm_campaign=events"
                                  target="_blank"
                                  style="display:inline-block;color:#ffffff;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif;font-size:11px;font-weight:700;line-height:22px;text-decoration:none;text-transform:uppercase;padding:15px 10px;">События
                                </a><!--[if mso | IE]></td><td style="padding:15px 10px;" class="" ><![endif]--> <a
                                  class="mj-link"
                                  href="https://svetdeti.org/reports?utm_source=mail&utm_medium=link&utm_term=dec_23&utm_content=postcard_sent&utm_campaign=reports"
                                  target="_blank"
                                  style="display:inline-block;color:#ffffff;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif;font-size:11px;font-weight:700;line-height:22px;text-decoration:none;text-transform:uppercase;padding:15px 10px;">Отчеты
                                </a><!--[if mso | IE]></td></tr></table><![endif]--></div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div><!--[if mso | IE]></td></tr></table><![endif]-->
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <!--[if mso | IE]></td></tr></table><![endif]--><!-- Social icons --><!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:500px;" width="500" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
          <div style="margin:0px auto;max-width:500px;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
              <tbody>
                <tr>
                  <td style="direction:ltr;font-size:0px;padding:0;text-align:center;">
                    <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:500px;" ><![endif]-->
                    <div class="mj-column-per-100 mj-outlook-group-fix"
                      style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                      <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;"
                        width="100%">
                        <tbody>
                          <tr>
                            <td align="center" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                              <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" ><tr><td><![endif]-->
                              <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation"
                                style="float:none;display:inline-table;">
                                <tbody>
                                  <tr>
                                    <td style="padding:8px;vertical-align:middle;">
                                      <table border="0" cellpadding="0" cellspacing="0" role="presentation"
                                        style="background:transparent;border-radius:3px;width:25px;">
                                        <tbody>
                                          <tr>
                                            <td style="font-size:0;height:25px;vertical-align:middle;width:25px;"><a
                                                href="https://t.me/svetdeti" target="_blank"><img height="25"
                                                  src="https://193027.selcdn.ru/cdn/emails/new/telegram.png"
                                                  style="border-radius:3px;display:block;" width="25"></a></td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </td>
                                  </tr>
                                </tbody>
                              </table><!--[if mso | IE]></td><td><![endif]-->
                              <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation"
                                style="float:none;display:inline-table;">
                                <tbody>
                                  <tr>
                                    <td style="padding:8px;vertical-align:middle;">
                                      <table border="0" cellpadding="0" cellspacing="0" role="presentation"
                                        style="background:transparent;border-radius:3px;width:25px;">
                                        <tbody>
                                          <tr>
                                            <td style="font-size:0;height:25px;vertical-align:middle;width:25px;"><a
                                                href="https://vk.com/svetdeti" target="_blank"><img height="25"
                                                  src="https://193027.selcdn.ru/cdn/emails/new/vk.png"
                                                  style="border-radius:3px;display:block;" width="25"></a></td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </td>
                                  </tr>
                                </tbody>
                              </table><!--[if mso | IE]></td><td><![endif]-->
                              <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation"
                                style="float:none;display:inline-table;">
                                <tbody>
                                  <tr>
                                    <td style="padding:8px;vertical-align:middle;">
                                      <table border="0" cellpadding="0" cellspacing="0" role="presentation"
                                        style="background:transparent;border-radius:3px;width:25px;">
                                        <tbody>
                                          <tr>
                                            <td style="font-size:0;height:25px;vertical-align:middle;width:25px;"><a
                                                href="https://ok.ru/svetdeti" target="_blank"><img height="25"
                                                  src="https://193027.selcdn.ru/cdn/emails/new/ok.png"
                                                  style="border-radius:3px;display:block;" width="25"></a></td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </td>
                                  </tr>
                                </tbody>
                              </table><!--[if mso | IE]></td></tr></table><![endif]-->
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div><!--[if mso | IE]></td></tr></table><![endif]-->
                  </td>
                </tr>
              </tbody>
            </table>
          </div><!--[if mso | IE]></td></tr></table><![endif]-->
        </div>
      </body>
 `,
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
