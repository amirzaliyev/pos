from django.urls import path

from inventory.views import ProductsListView

urlpatterns = [
    path("", ProductsListView.as_view(), name="product-list"),
]
