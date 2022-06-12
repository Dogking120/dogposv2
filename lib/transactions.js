var TransactionsLog = {
    sales: [],
    items: {},
    GROSS_SALES: 0,
    GROSS_REVENUE: 0,
    LATEST_TIME: null
};

const transaction = (items, time, total, sales) => {

    let object = {};

    object.items = items;

    object.TIME = time;
    object.TOTAL = total;
    object.SALES = sales;

    return object;

};

const saveTransaction = (transaction) => {

    TransactionsLog.sales.push(transaction);

    for (let item of transaction.items) {
        TransactionsLog.items[item.display_name] = TransactionsLog.items[item.display_name] === undefined ?
            item.count : TransactionsLog.items[item.display_name] + item.count
    }

    TransactionsLog.GROSS_REVENUE += transaction.TOTAL;
    TransactionsLog.GROSS_SALES += transaction.SALES;
    TransactionsLog.LATEST_TIME = Date()

};

module.exports = {
    TransactionsLog,
    transaction,
    saveTransaction
}