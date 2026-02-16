from django.contrib.auth.models import BaseUserManager

class UserManager(BaseUserManager):
    def create_user(self, phone, email, full_name, role, password=None):
        if not email:
            raise ValueError('Users must have an email address')
        if not phone:
            raise ValueError('Users must have a phone number')

        user = self.model(
            email=self.normalize_email(email),
            phone=phone,
            full_name=full_name,
            role=role,
        )

        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, phone, email, full_name, password):
        user = self.create_user(
            phone=phone,
            email=email,
            full_name=full_name,
            password=password,
            role='admin',  # or whatever default role for superuser
        )
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user
