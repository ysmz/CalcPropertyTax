import os, csv
from django.apps import AppConfig
from culc_property_tax.settings import CONFIG_URL

class DepreciableAssetsConfig(AppConfig):
    name = 'depreciable_assets'
    devalued_rates = {}
    def ready(self):
        with open(os.path.join(CONFIG_URL, 'devalued_rates.csv')) as f:
            reader = csv.reader(f)
            for row in reader:
                self.devalued_rates[row[0]] = [row[1], row[2]]
            