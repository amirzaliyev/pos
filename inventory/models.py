from django.db.models import (CASCADE, SET_NULL, CharField, DateTimeField,
                              ForeignKey, Model, PositiveIntegerField,
                              SlugField, TextChoices, TextField)
from django.utils.translation import gettext_lazy as _

# Create your models here.


class Unit(Model):
    name = CharField(max_length=255, unique=True)
    description = TextField(null=True, blank=True)

    def __str__(self) -> str:
        return self.name  # type: ignore

    def __repr__(self) -> str:
        return f"<Unit {self.__str__()}>"


class Category(Model):
    name = CharField(max_length=150, unique=True)
    description = TextField(null=True, blank=True)
    slug = SlugField(unique=True, max_length=255)

    created_at = DateTimeField(auto_now_add=True)
    update_at = DateTimeField(auto_now=True)

    class Meta:
        db_table = "inventory_categories"
        verbose_name = _("categoy")
        verbose_name_plural = _("categories")

    def __str__(self) -> str:
        return self.name  # type: ignore

    def __repr__(self) -> str:
        return f"<Category {self.__str__()}>"


class Product(Model):
    name = CharField(max_length=150)
    bar_code = CharField(max_length=50, unique=True, blank=True, null=True)
    slug = SlugField(max_length=255, unique=True)
    category = ForeignKey(
        "inventory.Category", on_delete=CASCADE, related_name="products"
    )
    unit = ForeignKey(
        "inventory.Unit",
        null=True,
        blank=True,
        on_delete=SET_NULL,
        help_text=_(
            "The unit measurement for the product (e.g., kg)",
        ),
    )
    description = TextField(
        null=True,
        blank=True,
        help_text=_("Detailed description of the product (optional)."),
    )

    created_at = DateTimeField(auto_now_add=True)
    update_at = DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return self.name  # type: ignore

    def __repr__(self) -> str:
        return f"<Product {self.__str__()}>"


class Inventory(Model):
    product = ForeignKey("inventory.Product", on_delete=CASCADE)
    quantity = PositiveIntegerField()
    branch = ForeignKey("company.Branch", on_delete=CASCADE)

    created_at = DateTimeField(auto_now_add=True)
    update_at = DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"<Inventory {self.product.name}>"

    def __repr__(self) -> str:
        return self.__str__()


class StockMovement(Model):
    class MovementTypes(TextChoices):
        IN = "in", _("In")
        OUT = "out", _("Out")

    product = ForeignKey("inventory.Product", on_delete=CASCADE)
    quantity = PositiveIntegerField()
    type = CharField(
        max_length=5,
        choices=MovementTypes,
        default=MovementTypes.IN,
        help_text=_("Identifies whether product has been added or withdrawed"),
    )
    reason = CharField(
        max_length=255,
        null=True,
        blank=True,
        help_text=_("Simple explanation for stock movement."),
    )

    created_at = DateTimeField(auto_now_add=True)
    update_at = DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"{self.product.name} -- {self.type}"

    def __repr__(self) -> str:
        return f"<StockMovement {self.__str__()}>"
