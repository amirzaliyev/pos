from django.urls import path

from inventory.views import InventoryTemplateView, ProductsListView

urlpatterns = [
    path("products/", ProductsListView.as_view(), name="product-list"),
    path("", InventoryTemplateView.as_view(), name="inventory"),
]
