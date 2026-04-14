from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin, Group, Permission
from django.utils import timezone
import uuid


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
    email_verification_token = models.CharField(max_length=64, blank=True, db_index=True)
    email_verification_sent_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    groups = models.ManyToManyField(
        Group,
        blank=True,
        related_name="api_userprofile_set",
        related_query_name="api_userprofile",
    )
    user_permissions = models.ManyToManyField(
        Permission,
        blank=True,
        related_name="api_userprofile_set",
        related_query_name="api_userprofile",
    )

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

    def generate_email_verification_token(self):
        """Generate a new email verification token."""
        import secrets
        self.email_verification_token = secrets.token_urlsafe(32)
        self.email_verification_sent_at = timezone.now()
        self.save(update_fields=['email_verification_token', 'email_verification_sent_at'])
        return self.email_verification_token

    def verify_email(self, token):
        """Verify email with the given token."""
        from datetime import timedelta
        if not self.email_verification_token or self.email_verification_token != token:
            return False, 'Invalid verification token'

        # Token expires after 24 hours
        if self.email_verification_sent_at:
            expiry = self.email_verification_sent_at + timedelta(hours=24)
            if timezone.now() > expiry:
                return False, 'Verification token has expired'

        self.is_email_verified = True
        self.email_verification_token = ''
        self.email_verification_sent_at = None
        self.save(update_fields=['is_email_verified', 'email_verification_token', 'email_verification_sent_at'])
        return True, 'Email verified successfully'

    def resend_verification_email(self):
        """Resend verification email if needed."""
        if self.is_email_verified:
            return False, 'Email is already verified'

        # Rate limit: can only resend after 60 seconds
        from datetime import timedelta
        if self.email_verification_sent_at:
            cooldown = self.email_verification_sent_at + timedelta(seconds=60)
            if timezone.now() < cooldown:
                remaining = int((cooldown - timezone.now()).total_seconds())
                return False, f'Please wait {remaining} seconds before requesting another email'

        token = self.generate_email_verification_token()
        return True, token


# ==============================================================================
# ENTITLEMENT (Payment-based feature access)
# ==============================================================================

class Entitlement(models.Model):
    """Tracks one-time payment entitlement for CV publishing."""
    FEATURE_CHOICES = [
        ('cv_publish', 'CV Publishing'),
        ('premium_template', 'Premium Template Access'),
        ('job_search', 'Job Search Access'),
    ]

    user = models.ForeignKey(
        UserProfile,
        on_delete=models.CASCADE,
        related_name='entitlements',
    )
    feature = models.CharField(max_length=50, choices=FEATURE_CHOICES)
    is_active = models.BooleanField(default=True)
    payment = models.ForeignKey(
        'Payment',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='entitlements',
    )
    activated_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        verbose_name = 'Entitlement'
        verbose_name_plural = 'Entitlements'
        unique_together = ['user', 'feature', 'is_active']

    def __str__(self):
        return f"{self.user.email} - {self.feature} ({'active' if self.is_active else 'inactive'})"

    def is_valid(self):
        """Check if entitlement is currently valid."""
        if not self.is_active:
            return False
        if self.expires_at and timezone.now() > self.expires_at:
            return False
        return True


# ==============================================================================
# CV LINK POLICY (Privacy and visibility settings)
# ==============================================================================

class CVLinkPolicy(models.Model):
    """Configuration for CV link visibility and access control."""
    VISIBILITY_CHOICES = [
        ('public_with_expiry', 'Public with Expiry'),
        ('private_tokenized', 'Private with Token'),
    ]

    cv = models.OneToOneField(
        'CVData',
        on_delete=models.CASCADE,
        related_name='link_policy',
    )
    visibility = models.CharField(
        max_length=50,
        choices=VISIBILITY_CHOICES,
        default='public_with_expiry',
    )
    expires_at = models.DateTimeField(null=True, blank=True)
    access_token = models.CharField(max_length=255, blank=True, db_index=True)
    is_revoked = models.BooleanField(default=False)
    revoked_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'CV Link Policy'
        verbose_name_plural = 'CV Link Policies'

    def __str__(self):
        return f"{self.cv.slug} - {self.visibility}"

    def generate_token(self):
        """Generate a new access token for private links."""
        self.access_token = f"tk_{uuid.uuid4().hex[:20]}"
        self.save(update_fields=['access_token', 'updated_at'])
        return self.access_token

    def revoke(self):
        """Revoke access to this CV link."""
        self.is_revoked = True
        self.revoked_at = timezone.now()
        self.save(update_fields=['is_revoked', 'revoked_at'])

    def is_accessible(self):
        """Check if CV is currently accessible based on policy."""
        if self.is_revoked:
            return False
        if self.visibility == 'public_with_expiry' and self.expires_at:
            return timezone.now() < self.expires_at
        return True

    def get_public_url(self, base_url=''):
        """Get the public URL for this CV."""
        if self.visibility == 'private_tokenized':
            return f"{base_url}/cv/private/{self.access_token}"
        return f"{base_url}/cv/public/{self.cv.slug}"


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
        null=True,
        blank=True,
    )
    raw_json = models.JSONField(default=dict)
    structured_profile = models.JSONField(
        default=dict,
        help_text="Structured profile data extracted from CV: skills, experience, seniority, etc."
    )
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
            unique_id = str(uuid.uuid4().hex)[:6]
            user_part = self.user.email.split('@')[0]
            self.slug = f"{user_part}-{unique_id}"
        super().save(*args, **kwargs)


# ==============================================================================
# JOB PROFILE (Extracted from CV for matching)
# ==============================================================================

class JobProfile(models.Model):
    """Structured job profile extracted from user's CV."""
    user = models.OneToOneField(
        UserProfile,
        on_delete=models.CASCADE,
        related_name='job_profile',
    )
    cv = models.ForeignKey(
        CVData,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='job_profiles',
    )
    # Structured data
    title = models.CharField(max_length=255, blank=True)
    seniority = models.CharField(max_length=50, blank=True)  # junior, mid, senior, executive
    years_experience = models.PositiveIntegerField(null=True, blank=True)
    skills = models.JSONField(default=list, help_text="List of normalized skills")
    industries = models.JSONField(default=list)
    locations = models.JSONField(default=list, help_text="Preferred work locations")
    salary_min = models.PositiveIntegerField(null=True, blank=True)
    salary_max = models.PositiveIntegerField(null=True, blank=True)
    languages = models.JSONField(default=list)
    remote_preference = models.CharField(max_length=50, blank=True)
    # Metadata
    extracted_at = models.DateTimeField(auto_now=True)
    confidence_score = models.FloatField(default=0.0, help_text="AI extraction confidence")

    class Meta:
        verbose_name = 'Job Profile'
        verbose_name_plural = 'Job Profiles'

    def __str__(self):
        return f"{self.user.email} - {self.title or 'Unknown'}"


# ==============================================================================
# JOB MATCH (Matched opportunities)
# ==============================================================================

class JobMatch(models.Model):
    """Job opportunities matched to user's profile."""
    STATUS_CHOICES = [
        ('new', 'New'),
        ('viewed', 'Viewed'),
        ('saved', 'Saved'),
        ('applied', 'Applied'),
        ('dismissed', 'Dismissed'),
    ]

    job_profile = models.ForeignKey(
        JobProfile,
        on_delete=models.CASCADE,
        related_name='matches',
    )
    external_id = models.CharField(max_length=255, help_text="Job ID from external source")
    source = models.CharField(max_length=100, help_text="Job board source (LinkedIn, Indeed, etc.)")
    title = models.CharField(max_length=255)
    company = models.CharField(max_length=255)
    location = models.CharField(max_length=255, blank=True)
    salary = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)
    url = models.URLField()
    posted_at = models.DateTimeField(null=True, blank=True)
    # Matching
    match_score = models.FloatField(help_text="0-100 match score")
    match_reasons = models.JSONField(default=list, help_text="Why this job matches")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Job Match'
        verbose_name_plural = 'Job Matches'
        unique_together = ['job_profile', 'external_id']
        ordering = ['-match_score', '-created_at']

    def __str__(self):
        return f"{self.title} @ {self.company} ({self.match_score}%)"


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
