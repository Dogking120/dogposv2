var DisplayState = {
    TOTAL: 0,
    CURRENT_COUNT: 0,
    ITEM_NAME: 'NONE',
    IMG_SRC: "icon.png"
};

const mainElement = {
    TOTAL: document.getElementById('total'),
    CURRENT_COUNT: document.getElementById('currentCount'),
    ITEM_NAME: document.getElementById('currentItem'),
    IMG_SRC: document.getElementById('item_image')
}

/**
    State of the front-end display data, 
    stuff our cashier see
DisplayState = {
    TOTAL : Total cost of all goods
    CURRENT_COUNT : Total requested amount of current item
    ITEM_NAME : Name of current item
    IMG_SRC : Image source of current item
}
**/

const updateState = (state) => {

    if (state === undefined) { return false }

    DisplayState.TOTAL = state.TOTAL;
    DisplayState.CURRENT_COUNT = state.CURRENT_COUNT;
    DisplayState.ITEM_NAME = state.ITEM_NAME;
    DisplayState.IMG_SRC = state.IMG_SRC;

    return true

}

function updateDisplay() {

    mainElement.TOTAL.getElementsByClassName('value')[0].textContent = DisplayState.TOTAL;
    mainElement.CURRENT_COUNT.getElementsByClassName('value')[0].textContent = DisplayState.CURRENT_COUNT;
    mainElement.ITEM_NAME.getElementsByClassName('value')[0].textContent = DisplayState.ITEM_NAME;
    mainElement.IMG_SRC.src = DisplayState.IMG_SRC;

    updateInfo()

}

const ctx = document.getElementById('chart')
const chart = new Chart(ctx, {
    type: 'line',
    data: {

        datasets: [
            {
                label: 'Revenue per Sale',
                fill: false,
                tension: 0.2,
                data: []
            }
        ],
        labels: []
    },
    options: {
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function (value, index, ticks) {
                        return '$' + value;
                    },
                    stepSize: 2
                }
            },
            x: {
                beginAtZero: true,
                ticks: {
                    callback: function (value, index, ticks) {
                        return this.getLabelForValue(value) + 's';
                    },
                    align: 'start'
                }
            }
        }
    }
});

updateState(ipc.changeItem())
updateDisplay()