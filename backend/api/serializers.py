from rest_framework import serializers
from .models import Item, CVData, Payment, UserProfile


class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = '__all__'


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['id', 'email', 'first_name', 'last_name', 'plan', 'is_email_verified', 'date_joined']
        read_only_fields = ['id', 'date_joined', 'is_email_verified']


class CVDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = CVData
        fields = ['id', 'slug', 'language', 'template_slug', 'is_published',
                  'original_filename', 'raw_json', 'created_at', 'updated_at']
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']


class CVDataListSerializer(serializers.ModelSerializer):
    """Versione leggera per le liste — esclude raw_json."""
    class Meta:
        model = CVData
        fields = ['id', 'slug', 'language', 'template_slug', 'is_published',
                  'original_filename', 'created_at']
        read_only_fields = fields


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'stripe_payment_id', 'amount', 'currency', 'status', 'description', 'created_at']
        read_only_fields = fields