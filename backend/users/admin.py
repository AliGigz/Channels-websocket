from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .forms import CustomUserCreationForm, CustomUserChangeForm
from .models import CustomUser


class CustomUserAdmin(UserAdmin):
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = CustomUser
    list_display = ['username', 'password', 'is_staff', 'is_active']
    list_filter = ['username', 'is_staff', 'is_active']
    fieldsets = [
        [None, {'fields': ['username', 'password', 'profile']}],
        ['Permissions', {'fields': ['is_staff', 'is_active', 'groups', 'user_permissions']}],
    ]
    add_fieldsets = [
        [None, {
            'classes': ['wide'],
            'fields': [
                'username', 'password1', 'password2', 'is_staff',
                'is_active', 'groups', 'user_permissions'
        ]}
        ],
    ]
    search_fields = ['username']
    ordering = ['-date_created']


admin.site.register(CustomUser, CustomUserAdmin)
