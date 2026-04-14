# Configurazione Email in Sviluppo Locale

## Come funziona in locale (DEBUG=True)

Per impostazione predefinita **`ACCOUNT_EMAIL_VERIFICATION` è `mandatory`**: dopo la registrazione **non ricevi JWT** finché non confermi l’email (stesso comportamento che avrai in produzione).

In ambiente di sviluppo con `EMAIL_BACKEND` su **console**, il backend **non invia email reali**: il messaggio di conferma viene **stampato nel terminale** dove gira `runserver` (oggetto, destinatario, link da aprire).

### Dove trovare l'email di conferma registrazione

1. Avvia il backend:
   ```bash
   python manage.py runserver
   ```

2. Quando ti registri dal frontend, l'email di conferma NON arriva a un indirizzo reale

3. **Guarda nella console/terminale dove gira il backend Django** - vedrai l'email stampata lì, includendo:
   - Oggetto (subject)
   - Destinatario
   - Link di conferma da cliccare

Esempio di output in console:
```
Content-Type: text/plain; charset="utf-8"
MIME-Version: 1.0
Content-Transfer-Encoding: 7bit
Subject: [example.com] Please Confirm Your E-mail Address
From: noreply@example.com
To: test@example.com
Date: ...

Please confirm your email address...
http://localhost:8000/auth/registration/verify-email/TOKEN/
```

### Disabilitare verifica email in locale (opzionale)

Se vuoi saltare completamente la verifica email durante lo sviluppo:

1. Crea un file `.env` nella cartella `backend/` con:
   ```
   ACCOUNT_EMAIL_VERIFICATION=none
   ```

2. Riavvia il server backend
3. Ora puoi registrarti senza dover confermare l'email

### Link di conferma email (SPA)

Il link nell'email punta al backend (`/auth/registration/account-confirm-email/<key>/`), che **reindirizza** al frontend:

- `http://localhost:5173/it/verify-email?token=<key>` (predefinito)

Imposta la base del frontend se diversa:

```bash
FRONTEND_BASE_URL=https://tuodominio.com
```

### Configurazione Email in Produzione

In produzione, imposta queste variabili d'ambiente:

```bash
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com  # o il tuo provider SMTP
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=tua-email@gmail.com
EMAIL_HOST_PASSWORD=tua-password-o-app-password
DEFAULT_FROM_EMAIL=noreply@tuo-dominio.com
ACCOUNT_EMAIL_VERIFICATION=mandatory
```

Per Gmail, genera una [App Password](https://myaccount.google.com/apppasswords) se hai 2FA attivo.
