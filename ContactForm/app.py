from flask import Flask, request, jsonify
from flask_cors import CORS  # Importa Flask-CORS
import smtplib
from email.mime.text import MIMEText

app = Flask(__name__)
CORS(app)  # Abilita CORS per tutte le route

# Configurazione del server SMTP
SMTP_SERVER = 'smtp.gmail.com'
SMTP_PORT = 587
SMTP_USERNAME = 'sitiegestionali@gmail.com'  # Inserisci il tuo indirizzo email
SMTP_PASSWORD = ''  #TODO: Password Inserisci la tua password o chiave API
@app.route('/send-email', methods=['POST'])
def send_email():
    try:
        data = request.json
        name = data.get('name')
        email = data.get('email')
        message = data.get('message')

        # Creazione del contenuto dell'email
        msg = MIMEText(f"Nome: {name}\nEmail: {email}\nMessaggio: {message}")
        msg['Subject'] = 'Nuovo messaggio da contatto'
        msg['From'] = SMTP_USERNAME
        msg['To'] = SMTP_USERNAME  # Puoi aggiungere destinatari separati da una virgola

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.send_message(msg)

        return jsonify({'status': 'success', 'message': 'Email inviata con successo!'})

    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
