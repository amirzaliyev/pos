from django.forms import ModelForm

from inventory.models import Product


class ProductFormModel(ModelForm):

    class Meta:
        model = Product
        fields = ("name", "category", "bar_code", "unit", "description")
