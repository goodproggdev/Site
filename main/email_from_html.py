import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
from flask import Flask, request, render_template, session
import secrets

# Carica le variabili dal file .env
load_dotenv()

EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASS = os.getenv("EMAIL_PASS")

app = Flask(__name__)

# Protezione CSRF (token)
app.secret_key = secrets.token_hex(16)

# Funzione per inviare l'email
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
        return True
    except Exception as e:
        print(f"Errore: {e}")
        return str(e)
    finally:
        server.quit()

# Genera il token CSRF
def generate_csrf_token():
    if '_csrf_token' not in session:
        session['_csrf_token'] = secrets.token_hex(16)
    return session['_csrf_token']

@app.route('/', methods=['GET', 'POST'])
def contact():
    # Genera un token CSRF per il modulo
    csrf_token = generate_csrf_token()

    if request.method == 'POST':
        # Controlla il token CSRF
        if request.form.get('_csrf_token') != session['_csrf_token']:
            return "CSRF token mismatch. Please try again.", 400
        
        subject = request.form['subject']
        body = request.form['body']
        
        # Invia l'email
        result = send_email(
            to_email="sitiegestionali@gmail.com",  # Puoi cambiare l'indirizzo di destinazione
            subject=subject,
            body=body
        )
        
        if result is True:
            return "Message sent successfully!"
        else:
            return f"Error: {result}"

    return render_template('contact.html', csrf_token=csrf_token)

if __name__ == "__main__":
    app.run(debug=True)
