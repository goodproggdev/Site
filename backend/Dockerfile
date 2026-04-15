FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# LibreOffice headless: conversione .doc/.docx → PDF per l’estrazione CV (cv_text_extract).
RUN apt-get update && apt-get install -y --no-install-recommends \
    libreoffice-writer \
    && rm -rf /var/lib/apt/lists/*
ENV CV_LIBREOFFICE_BIN=/usr/bin/soffice

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt && \
    python -m spacy download en_core_web_sm && \
    python -m spacy download it_core_news_sm && \
    python -c "import nltk; \
[ nltk.download(p, quiet=True) for p in ('punkt','stopwords','averaged_perceptron_tagger','wordnet','omw-1.4') ]"

COPY . .

EXPOSE 8000

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
