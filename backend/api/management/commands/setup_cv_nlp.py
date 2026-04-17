"""
Scarica corpora NLTK richiesti da pyresparser e verifica i modelli spaCy per il parsing CV.

Uso (dalla cartella backend, venv attivo):
    python manage.py setup_cv_nlp

Su Windows, se `python -m spacy download` fallisce, installa i wheel da pip:
    python -m pip install \\
      https://github.com/explosion/spacy-models/releases/download/en_core_web_sm-3.8.0/en_core_web_sm-3.8.0-py3-none-any.whl \\
      https://github.com/explosion/spacy-models/releases/download/it_core_news_sm-3.8.0/it_core_news_sm-3.8.0-py3-none-any.whl
"""

from __future__ import annotations

from django.core.management.base import BaseCommand


NLTK_PACKAGES = (
    "stopwords",
    "punkt",
    "wordnet",
    "omw-1.4",
    "averaged_perceptron_tagger",
    "maxent_ne_chunker",
    "words",
    "brown",
)


class Command(BaseCommand):
    help = "Scarica dati NLTK per pyresparser e verifica modelli spaCy (en_core_web_sm, it_core_news_sm)."

    def handle(self, *args, **options):
        import nltk

        self.stdout.write("Scarico corpora NLTK…")
        for pkg in NLTK_PACKAGES:
            nltk.download(pkg, quiet=True)
            self.stdout.write(f"  - {pkg}")

        self.stdout.write("Verifica spaCy…")
        try:
            import spacy

            for model in ("en_core_web_sm", "it_core_news_sm"):
                spacy.load(model)
                self.stdout.write(self.style.SUCCESS(f"  OK: {model}"))
        except OSError as e:
            self.stdout.write(
                self.style.WARNING(
                    f"Modello spaCy mancante: {e}\n"
                    "Installa con pip (wheel) come nel docstring di questo comando, oppure su Linux/Mac:\n"
                    "  python -m spacy download en_core_web_sm && python -m spacy download it_core_news_sm"
                )
            )
            raise SystemExit(1) from e

        self.stdout.write(self.style.SUCCESS("setup_cv_nlp completato."))
