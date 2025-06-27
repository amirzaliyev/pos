from django.db.models import CASCADE, CharField, ForeignKey, Model


# Create your models here.
class Company(Model):
    name = CharField(max_length=255)
    owner = ForeignKey("users.User", on_delete=CASCADE)


class Branch(Model):
    name = CharField(max_length=255)
    company = ForeignKey("company.Company", on_delete=CASCADE)
