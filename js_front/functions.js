function updateInfo() {

    let info = ipc.requestInfo()
    let info_tab = document.getElementById('info_tab')

    while (info_tab.firstChild) {
        info_tab.removeChild(info_tab.firstChild);
    }

    for (let item of info) {
        let div = document.createElement('div');
        let span = document.createElement('span');

        div.style.display = 'inline-block';
        div.style.width = 'fit-content';
        div.textContent = item.display_name + ' ';
        span.textContent = '[' + item.catalog_count + ']';
        span.style.color = 'var(--positive)';
        div.className = 'info';

        div.appendChild(span);
        info_tab.appendChild(div);
    }

}

function updateChart(data) {

    let newData = []
    let newLabel = []
    let themeColor = getComputedStyle(document.body).getPropertyValue('--positive')

    for (let sale of data.sales) {

        let time = Math.floor(sale.TIME / 1000)
        let firstTime = Math.floor(data.sales[0].TIME / 1000)

        newData.push(sale.TOTAL)
        newLabel.push(time - firstTime)

    }

    chart.data.datasets[0].data = newData
    chart.data.labels = newLabel

    Chart.defaults.backgroundColor = themeColor
    Chart.defaults.borderColor = themeColor

    chart.update()

}

function updateData() {

    let data = ipc.requestData()
    let date = new Date(data.LATEST_TIME)
    let popular = (() => {
        let toBeat = 0
        let mostPopular = null
        for (let name in data.items) {
            if (data.items[name] > toBeat) {
                mostPopular = name
                toBeat = data.items[name]
            }
        }
        return mostPopular
    })();

    let gross_revenue = document.getElementById('gross_revenue')
    let gross_sales = document.getElementById('gross_sales')
    let revenue_by_sales = document.getElementById('revenue_by_sales')
    let total_transactions = document.getElementById('total_transactions')
    let most_popular = document.getElementById('most_popular')
    let latest_time = document.getElementById('latest_time')

    gross_revenue.getElementsByClassName('value')[0].textContent = data.GROSS_REVENUE;
    gross_sales.getElementsByClassName('value')[0].textContent = data.GROSS_SALES;
    revenue_by_sales.getElementsByClassName('value')[0].textContent = data.GROSS_SALES > 0 ?
        (data.GROSS_REVENUE / data.GROSS_SALES) * 100 : 0;
    total_transactions.getElementsByClassName('value')[0].textContent = data.sales.length;
    most_popular.getElementsByClassName('value')[0].textContent = popular;
    popular_sold.getElementsByClassName('value')[0].textContent = data.items[popular];
    latest_time.getElementsByClassName('value')[0].textContent = date.toUTCString();

    updateChart(data)

}