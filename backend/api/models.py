from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone


# ==============================================================================
# CUSTOM USER MANAGER
# ==============================================================================

class UserProfileManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('L\'email è obbligatoria')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        return self.create_user(email, password, **extra_fields)


# ==============================================================================
# USER PROFILE
# ==============================================================================

class UserProfile(AbstractBaseUser, PermissionsMixin):
    PLAN_CHOICES = [
        ('free', 'Free'),
        ('pro', 'Pro'),
        ('enterprise', 'Enterprise'),
    ]

    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100, blank=True)
    plan = models.CharField(max_length=20, choices=PLAN_CHOICES, default='free')
    stripe_customer_id = models.CharField(max_length=255, blank=True)
    is_email_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserProfileManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    class Meta:
        verbose_name = 'Profilo Utente'
        verbose_name_plural = 'Profili Utenti'

    def __str__(self):
        return self.email

    def get_full_name(self):
        return f"{self.first_name} {self.last_name}".strip() or self.email


# ==============================================================================
# CV DATA
# ==============================================================================

class CVData(models.Model):
    LANGUAGE_CHOICES = [
        ('it', 'Italiano'),
        ('en', 'English'),
        ('de', 'Deutsch'),
        ('fr', 'Français'),
        ('es', 'Español'),
    ]

    user = models.ForeignKey(
        UserProfile,
        on_delete=models.CASCADE,
        related_name='cv_list',
        null=True,  # Allow anonymous CV parses
        blank=True,
    )
    raw_json = models.JSONField(default=dict)          # Dati estratti dal parser
    template_slug = models.CharField(max_length=100, default='default')
    language = models.CharField(max_length=5, choices=LANGUAGE_CHOICES, default='it')
    is_published = models.BooleanField(default=False)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    original_filename = models.CharField(max_length=255, blank=True)
    visits_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Dati CV'
        verbose_name_plural = 'Dati CV'
        ordering = ['-created_at']

    def __str__(self):
        return f"CV di {self.user} — {self.slug or 'non pubblicato'}"

    def save(self, *args, **kwargs):
        if not self.slug and self.user:
            import uuid
            unique_id = str(uuid.uuid4().hex)[:6]
            user_part = self.user.email.split('@')[0]
            self.slug = f"{user_part}-{unique_id}"
        super().save(*args, **kwargs)


# ==============================================================================
# PAYMENT
# ==============================================================================

class Payment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'In attesa'),
        ('paid', 'Pagato'),
        ('failed', 'Fallito'),
        ('refunded', 'Rimborsato'),
    ]

    user = models.ForeignKey(
        UserProfile,
        on_delete=models.SET_NULL,
        null=True,
        related_name='payments',
    )
    stripe_payment_id = models.CharField(max_length=255, unique=True)
    stripe_session_id = models.CharField(max_length=255, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='eur')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Pagamento'
        verbose_name_plural = 'Pagamenti'
        ordering = ['-created_at']

    def __str__(self):
        return f"Payment {self.stripe_payment_id} — {self.status}"


# ==============================================================================
# ITEM (legacy — mantenuto per compatibilità)
# ==============================================================================

class Item(models.Model):
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name