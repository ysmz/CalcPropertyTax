from django.shortcuts import render
from depreciable_assets.apps import DepreciableAssetsConfig
import openpyxl, json, os 
from django.http import HttpResponse
from calc_property_tax.settings import TEMPLATES_URL
from . import utils

# Create your views here.
def index(request):
    context = {'devalued_rates': DepreciableAssetsConfig.devalued_rates}
    return render(request, 'depreciable_assets/index.html', context)

def download(request):
    read_json = json.loads(request.POST.get('result_json'))

    wb = set_depreciable_assets_to_excel(read_json)

    response = HttpResponse(content_type='application/vnd.ms-excel')
    response['Content-Disposition'] = 'attachment; filename=syuruibetumeisaisyo.xlsx'

    wb.save(response)
    return response

def set_depreciable_assets_to_excel(read_json):
    wb = openpyxl.load_workbook(os.path.join(TEMPLATES_URL, 'syuruibetumeisaisyo.xlsx'))
    sheet = wb[wb.sheetnames[0]]
    line_cnt = 8

    for v in read_json:
        sheet['E' + str(line_cnt)].value = v["名称"]
        sheet['H' + str(line_cnt)].value = utils.convert_jp_to_jp_num(v["取得年月"][0])
        sheet['I' + str(line_cnt)].value = v["取得年月"][1:3]
        sheet['J' + str(line_cnt)].value = v["取得年月"][4:6]
        sheet['L' + str(line_cnt)].value = v["取得価格"]
        #sheet['N' + str(line_cnt)].value = v[2][len(v[2])-7:len(v[2])-4]
        #sheet['O' + str(line_cnt)].value = v[2][len(v[2])-4:len(v[2])-1]
        sheet['P' + str(line_cnt)].value = v["耐用年数"]
        line_cnt+=1

    return wb