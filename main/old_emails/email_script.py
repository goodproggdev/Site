import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

# Carica le variabili dal file .env
load_dotenv()

EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASS = os.getenv("EMAIL_PASS")

def send_email(to_email, subject, body):
    smtp_server = "smtp.gmail.com"
    smtp_port = 587  # Porta per TLS

    # Creare il messaggio email
    msg = MIMEMultipart()
    msg['From'] = EMAIL_USER
    msg['To'] = to_email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain'))

    try:
        # Connettersi al server SMTP
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()  # Abilita la crittografia TLS
        server.login(EMAIL_USER, EMAIL_PASS)  # Autenticazione
        server.send_message(msg)
        print("Email inviata con successo!")
    except Exception as e:
        print(f"Errore: {e}")
    finally:
        server.quit()

# Testa la funzione
send_email(
    to_email="sitiegestionali@gmail.com",
    subject="Email di Test",
    body="Ciao! Questa è una email di test inviata da Python."
)
