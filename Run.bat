@echo off
echo ==============================
echo 🚀 Avvio configurazione progetto
echo ==============================

:: Sposta nella directory del backend
cd /d "%~dp0backend"

:: Attiva l'ambiente virtuale
call env\Scripts\activate

:: Installa dipendenze backend
echo 📦 Installazione dipendenze backend...
pip install -r requirements.txt

:: Applica migrazioni
echo 📊 Applicazione migrazioni...
python manage.py migrate

:: Avvia il backend in una nuova finestra
echo 🚀 Avvio del backend...
start cmd /k "cd /d %~dp0backend && call env\Scripts\activate && python manage.py runserver"

:: Sposta nella directory del frontend
cd /d "%~dp0frontend"

:: Installa dipendenze frontend (solo se node_modules non esiste)
if not exist node_modules (
    echo 📦 Installazione dipendenze frontend...
    npm install
)

:: Avvia il frontend in una nuova finestra
echo 🚀 Avvio del frontend...
start cmd /k "cd /d %~dp0frontend && npm run dev"

echo ==============================
echo ✅ Configurazione completata!
echo ==============================

