var devalued_rates = {}

function displayResult() {
    var price = Number(document.getElementById('assets-value').value);
    var life = Number(document.getElementById('assets-life').value);

    if (price == 0 || life == 0 || isNaN(price) || isNaN(life)) {
        alert('０より大きい数字を入力してください');
        return;
    }

    if (!devalued_rates[life]) {
        alert('耐用年数が定義されていません');
        return;
    }

    var assets_date_value = document.getElementById('assets-date').value;

    if (assets_date_value.length != 5) {
        alert('取得年月を50106のように入力してください');
        return;
    }

    var tax_year_date = new Date(Number(convertYearsJpToUs(document.getElementById('tax-year').innerHTML)), 1, 1);

    createResultTable(document.getElementById('assets-name').value, assets_date_value, life, price, tax_year_date);
}

function createResultTable(assets_name, assets_date_value, life, price, tax_year_date) {
    var valuation = calcTaxPrice(life, price, getAssetsDate(assets_date_value), tax_year_date);

    var items = [assets_name, convertDisplayYear(assets_date_value), life, separate(price), separate(valuation), '<input type=\"checkbox\"></input>']

    var result_table = document.getElementById('result');
    var row = result_table.insertRow(-1);

    for (var i = 0; i < result_table.rows[0].cells.length; i++) {
        var cell = row.insertCell(-1);
        // 課税標準額が5%になった場合赤字にする
        cell.innerHTML = ((i == 4 && valuation == price * 0.05) ? ("<font color=\"red\">" + items[i] + "</font>") : items[i]);
    }

    setValuationSum(deleteSeparateNumber(document.getElementById('sum').innerHTML) + valuation);
}

function recalcTaxPrice(tax_year) {
    var tax_year_tag = document.getElementById('tax-year');
    var tax_year_val = convertYearsJpToUs(tax_year_tag.innerHTML) + tax_year;
    tax_year_tag.innerHTML = convertYearsUsToJp(Number(tax_year_val));

    var result_table = document.getElementById('result');
    var tax_year_date = new Date(tax_year_val, 1, 1);

    var valuation_sum = 0;
    for (var i = 1; i < result_table.rows.length; i++) {

        var assets_date = getAssetsDate(result_table.rows[i].cells[1].innerHTML.replace('.', ''));

        var valuation = calcTaxPrice(Number(result_table.rows[i].cells[2].innerHTML), deleteSeparateNumber(result_table.rows[i].cells[3].innerHTML), assets_date, tax_year_date);

        result_table.rows[i].cells[4].innerHTML = separate(valuation);
        valuation_sum += valuation;
    }

    setValuationSum(valuation_sum);
}

function calcTaxPrice(life, price, assets_date, tax_year_date) {

    if (assets_date.getFullYear() >= tax_year_date.getFullYear()) return 0;

    var v = price;

    for (var i = 0; i < (tax_year_date.getFullYear() - assets_date.getFullYear()); i++) {
        v = Math.floor(Math.max(price * 0.05, v * (i == 0 ? devalued_rates[life][0] : devalued_rates[life][1])));
    }

    return v;
}

function deleteItems() {
    var result_table = document.getElementById('result');


    for (var i = 1; i < result_table.rows.length; i++) {
        if (!result_table.rows[i].cells[5].firstChild.checked) continue;

        setValuationSum(deleteSeparateNumber(document.getElementById('sum').innerHTML) - deleteSeparateNumber(result_table.rows[i].cells[4].innerHTML));

        result_table.deleteRow(i);
        i -= 1;
    }
}

function setValuationSum(valuation_sum) {
    document.getElementById('sum').innerHTML = separate(valuation_sum);

    var tax = Math.floor((valuation_sum * 0.014) / 100) * 100;

    document.getElementById('tax').innerHTML = (valuation_sum < 1500000 ? 0 : separate(tax));
}

function backThisYear() {
    recalcTaxPrice((new Date()).getFullYear() - Number(convertYearsJpToUs(document.getElementById('tax-year').innerHTML)));
}

function convertYearsJpToUs(style) {
    var startYear = 0;
    switch (style.substring(1, 0)) {
        case '5':
        case '令':
            startYear = 2018;
            break;
        case '4':
        case '平':
            startYear = 1988;
            break;
        case '3':
        case '昭':
            startYear = 1925;
            break;
        case '2':
        case '大':
            startYear = 1911;
            break;
    }

    return startYear + Number(style.substring(1, 3));
}

function convertYearsDisplayYearToJp(style) {
    var year = 0;
    switch (style.substring(1, 0)) {
        case '令':
            year = 5;
            break;
        case '平':
            year = 4;
            break;
        case '昭':
            year = 3;
            break;
        case '大':
            year = 2;
            break;
    }

    return year + style.replace('.', '').slice(1);
}

function convertYearsUsToJp(year) {
    if (year > 2019) return '令' + (year - 2018);
    if (year > 1989) return '平' + (year - 1988);
    if (year > 1926) return '昭' + (year - 1925);
    if (year > 1912) return '大' + (year - 1911);

    return null;
}

function convertDisplayYear(style) {
    var prefix = '';
    switch (style.substring(1, 0)) {
        case '5':
            prefix = '令';
            break;
        case '4':
            prefix = '平';
            break;
        case '3':
            prefix = '昭';
            break;
        case '2':
            prefix = '大';
            break;
    }

    return prefix + style.substring(1, 3) + '.' + style.substring(3);
}

function getAssetsDate(dateString) {
    return (new Date(convertYearsJpToUs(dateString), Number(dateString.substring(3)) - 1, 1));
}

function separate(num) {
    return String(num).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
}

function deleteSeparateNumber(num) {
    return Number(String(num).split(',').join(''));
}

function fileDownload() {
    var fileName = document.getElementById('save-file-name').value;

    if (fileName == "" || fileName == null) {
        alert("ファイル名を入力してください");
        return;
    }

    fileName = fileName + ".csv";

    document.getElementById("save-csv").download = fileName;

    var content = "";
    var result_table = document.getElementById('result');

    for (var i = 1; i < result_table.rows.length; i++) {
        var items = [result_table.rows[i].cells[0].innerHTML, convertYearsDisplayYearToJp(result_table.rows[i].cells[1].innerHTML), result_table.rows[i].cells[2].innerHTML, deleteSeparateNumber(result_table.rows[i].cells[3].innerHTML)]
        content = content + items.join(",") + "\n";
    }

    var blob = new Blob([content], { "type": "text/plain;charset=utf-8" });

    if (window.navigator.msSaveBlob) {
        window.navigator.msSaveBlob(blob, fileName);
    } else {
        document.getElementById("save-csv").href = window.URL.createObjectURL(blob);
    }
}

$(function() {
    document.getElementById("select-file").addEventListener('change', function(e) {
        var file = e.target.files[0];
        var reader = new FileReader();

        reader.readAsText(file);

        reader.addEventListener('load', function() {
            var result_table = document.getElementById('result');
            while (result_table.rows[1]) result_table.deleteRow(1);
            setValuationSum(0);
            document.getElementById('input-file-name').innerHTML = file.name;


            var lines = reader.result.split('\n');
            var tax_year_date = new Date(Number(convertYearsJpToUs(document.getElementById('tax-year').innerHTML)), 1, 1);

            for (var i = 0; i < lines.length; i++) {
                var row = lines[i].split(",");

                if (row.length != 4) continue;

                createResultTable(row[0], row[1], row[2], row[3], tax_year_date);
            }

        });
    });

    document.getElementById('excel-download').addEventListener('click', function(e) {
        console.log($('#result').tableToJSON());
        document.download.result_json.value = JSON.stringify($('#result').tableToJSON());
    });

    devalued_rates = JSON.parse(document.getElementById('devalued-rates').textContent);

    document.getElementById('tax-year').innerHTML = convertYearsUsToJp((new Date()).getFullYear());
});