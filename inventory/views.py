from django.views.generic import CreateView, TemplateView

from inventory.models import Product

from .forms import ProductFormModel


# Create your views here.
class ProductsListView(TemplateView):
    template_name = "inventory/products.html"


class InventoryTemplateView(TemplateView):
    template_name = "inventory/index.html"


class CreateProductView(CreateView):
    model = Product

    form_class = ProductFormModel
