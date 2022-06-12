const Electron = require('electron');
const path = require('path');
const fs = require('fs');

const { app, BrowserWindow, ipcMain } = require('electron');

const rootPATH = path.dirname(__dirname);
const libPATH = path.join(rootPATH, 'lib')

const Transaction = require(path.join(libPATH, 'transactions.js'));

const localPATH = path.join(rootPATH, 'local');
const itemsPATH = path.join(localPATH, 'items');
const imagesPATH = path.join(itemsPATH, 'images');

const transactionLogsPATH = path.join(localPATH, 'transactionLogs');

const inventoryFILE = fs.readFileSync(path.join(itemsPATH, 'inventory.json'));
const InventoryObject = JSON.parse(inventoryFILE);

const createWindow = () => {

    var primaryDisplay = Electron.screen.getPrimaryDisplay();
    var displaySize = primaryDisplay.size;

    const win = new BrowserWindow({
        width: displaySize.width,
        height: displaySize.height,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    win.on('close', () => {

        if (Transaction.TransactionsLog.GROSS_REVENUE > 0) {
            let raw = JSON.stringify(Transaction.TransactionsLog)
            fs.writeFileSync(path.join(transactionLogsPATH, Date.now() + '.json'), raw)
        }

    });

    win.loadFile('index.html');
}

app.whenReady().then(() => {
    createWindow();
});

const createDisplayState = (TOTAL, CURRENT_COUNT, ITEM_NAME, IMG_SRC) => {

    let state = {};

    state.TOTAL = TOTAL;
    state.CURRENT_COUNT = CURRENT_COUNT;
    state.ITEM_NAME = ITEM_NAME;
    state.IMG_SRC = IMG_SRC;

    return state;

}

var Catalog = (() => {

    let catalog = {};
    catalog.inventory = [];

    for (let item of InventoryObject.inventory) {

        item.catalog_count = item.count;
        item.count = 0;
        item.image = path.join(imagesPATH, item.image)
        catalog.inventory.push(item);

    }

    catalog.CURRENT_INDEX = 0;
    catalog.TOTAL = 0;
    catalog.CURRENT_COUNT = 0;
    catalog.ITEM_NAME = catalog.inventory[catalog.CURRENT_INDEX].display_name;
    catalog.IMG_SRC = catalog.inventory[catalog.CURRENT_INDEX].image

    return catalog;

})()

function calculatePrice(cost, batch_size, batch_cost, count) {
    let remainder = (count % batch_size)
    let batches = (count - remainder) / batch_size
    return remainder * cost + batches * batch_cost
}

ipcMain.on('addItems', (event, amount) => {

    Catalog.inventory[Catalog.CURRENT_INDEX].count = Math.max(
        (Catalog.inventory[Catalog.CURRENT_INDEX].count + amount),
        0
    )

    Catalog.TOTAL = (() => {
        let total = 0;
        Catalog.inventory.forEach((item) => {
            total += calculatePrice(
                item.cost,
                item.batch_size,
                item.batch_cost,
                item.count
            );
        });
        return total
    })();

    event.returnValue = createDisplayState(
        Catalog.TOTAL,
        Catalog.inventory[Catalog.CURRENT_INDEX].count,
        Catalog.inventory[Catalog.CURRENT_INDEX].display_name,
        Catalog.inventory[Catalog.CURRENT_INDEX].image
    );
})

ipcMain.on('changeItem', (event) => {

    Catalog.CURRENT_INDEX = (Catalog.CURRENT_INDEX + 1) % Catalog.inventory.length;

    event.returnValue = createDisplayState(
        Catalog.TOTAL,
        Catalog.inventory[Catalog.CURRENT_INDEX].count,
        Catalog.inventory[Catalog.CURRENT_INDEX].display_name,
        Catalog.inventory[Catalog.CURRENT_INDEX].image
    );
})

function sellTransaction() {

    let items = [];
    let time = Date.now();
    let total = Catalog.TOTAL;
    let sales = 0;

    for (let item of Catalog.inventory) {
        sales += item.count;
        items.push(
            (() => {
                let object = {}
                object.display_name = item.display_name,
                object.count = item.count,
                object.cost = calculatePrice(
                    item.cost,
                    item.batch_size,
                    item.batch_cost,
                    item.count
                )
                return object
            })()
        )
    }

    let transaction = Transaction.transaction(
        items, time, total, sales
    );
    Transaction.saveTransaction(transaction);

}

ipcMain.on('sell', (event, state) => {

    if (Catalog.TOTAL === 0) {
        event.returnValue = state;
        return;
    }

    sellTransaction();

    Catalog.TOTAL = 0;
    Catalog.CURRENT_COUNT = 0;
    for (let item of Catalog.inventory) {
        item.catalog_count -= item.count;
        item.count = 0;
    }

    event.returnValue = createDisplayState(
        Catalog.TOTAL,
        Catalog.inventory[Catalog.CURRENT_INDEX].count,
        Catalog.inventory[Catalog.CURRENT_INDEX].display_name,
        Catalog.inventory[Catalog.CURRENT_INDEX].image
    );
})

ipcMain.on('requestInfo', (event) => {

    let request = []
    for (let item of Catalog.inventory) {
        request.push(item)
    }

    event.returnValue = request
})

ipcMain.on('requestData', (event) => {

    event.returnValue = Transaction.TransactionsLog

})

ipcMain.on('save', (event) => {

    if (Transaction.TransactionsLog.GROSS_REVENUE > 0) {
        let raw = JSON.stringify(Transaction.TransactionsLog)
        fs.writeFileSync(path.join(transactionLogsPATH, Date.now() + '.json'), raw)
    }

})

ipcMain.on('load_data', (event, raw) => {

    let TransactionsLogOBJECT = JSON.parse(raw)
    Transaction.TransactionsLog = TransactionsLogOBJECT

})