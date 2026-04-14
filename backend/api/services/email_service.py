"""
Email service for sending transactional emails.
Supports console backend for development and SMTP/SendGrid for production.
"""
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags


def send_verification_email(user, token, frontend_url):
    """Send email verification link to user."""
    verification_url = f"{frontend_url}/verify-email?token={token}"

    subject = 'Verify your email - CV Platform'

    # Plain text version
    message = f"""Hi {user.get_full_name()},

Thank you for signing up! Please verify your email address by clicking the link below:

{verification_url}

This link will expire in 24 hours.

If you didn't create an account, you can safely ignore this email.

Best regards,
CV Platform Team
"""

    # HTML version (simplified)
    html_message = f"""<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .button {{ display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; }}
        .footer {{ margin-top: 30px; font-size: 12px; color: #666; }}
    </style>
</head>
<body>
    <div class="container">
        <h2>Verify Your Email</h2>
        <p>Hi {user.get_full_name()},</p>
        <p>Thank you for signing up! Please verify your email address by clicking the button below:</p>
        <p><a href="{verification_url}" class="button">Verify Email</a></p>
        <p>Or copy and paste this link into your browser:</p>
        <p>{verification_url}</p>
        <p>This link will expire in 24 hours.</p>
        <div class="footer">
            <p>If you didn't create an account, you can safely ignore this email.</p>
            <p>Best regards,<br>CV Platform Team</p>
        </div>
    </div>
</body>
</html>"""

    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        html_message=html_message,
        fail_silently=False,
    )


def send_password_reset_email(user, token, frontend_url):
    """Send password reset link to user."""
    reset_url = f"{frontend_url}/reset-password?token={token}"

    subject = 'Reset your password - CV Platform'

    message = f"""Hi {user.get_full_name()},

You requested a password reset. Click the link below to set a new password:

{reset_url}

This link will expire in 1 hour.

If you didn't request this, you can safely ignore this email.

Best regards,
CV Platform Team
"""

    html_message = f"""<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .button {{ display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; }}
        .footer {{ margin-top: 30px; font-size: 12px; color: #666; }}
    </style>
</head>
<body>
    <div class="container">
        <h2>Reset Your Password</h2>
        <p>Hi {user.get_full_name()},</p>
        <p>You requested a password reset. Click the button below to set a new password:</p>
        <p><a href="{reset_url}" class="button">Reset Password</a></p>
        <p>Or copy and paste this link into your browser:</p>
        <p>{reset_url}</p>
        <p>This link will expire in 1 hour.</p>
        <div class="footer">
            <p>If you didn't request this, you can safely ignore this email.</p>
            <p>Best regards,<br>CV Platform Team</p>
        </div>
    </div>
</body>
</html>"""

    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        html_message=html_message,
        fail_silently=False,
    )


def send_welcome_email(user):
    """Send welcome email after successful verification."""
    subject = 'Welcome to CV Platform!'

    message = f"""Hi {user.get_full_name()},

Welcome to CV Platform! Your email has been verified successfully.

You can now:
- Create your professional CV
- Access job matching features
- Share your CV with employers

Get started by creating your first CV:
{settings.FRONTEND_URL}/dashboard

Best regards,
CV Platform Team
"""

    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=True,
    )
