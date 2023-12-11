To start Docker:
docker-compose up -d

To test PDF generation:
http://localhost:3000/form.html

API endpoint:
http://localhost:3000/submit-letter

body format:
{
email: string;
name: string;
letterText: string;
momentGift: string;
signature: string;
}

answer is pdf file

---

http://localhost:3000/send-email

body format:
{
email: string;
name: string;
letterText: string;
momentGift: string;
signature: string;
}

send an email using .env settings
