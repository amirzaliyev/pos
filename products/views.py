from django.views.generic import TemplateView

# Create your views here.
class ProductsListView(TemplateView):
    template_name = 'products/index.html'
