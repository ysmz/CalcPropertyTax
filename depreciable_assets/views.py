from django.shortcuts import render
from depreciable_assets.apps import DepreciableAssetsConfig

# Create your views here.
def culc(request):
    context = {'devalued_rates': DepreciableAssetsConfig.devalued_rates}
    return render(request, 'depreciable_assets/culc.html', context)