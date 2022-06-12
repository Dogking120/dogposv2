const update = (state) => {
    updateState(state)
    updateDisplay()
}

function addItems(amount) {
    let state = ipc.addItems(amount)
    update(state)
}

function changeItem() {
    let state = ipc.changeItem()
    update(state)
}

function sell() {
    let state = ipc.sell(DisplayState)
    update(state)
}

function changeView(view) {

    document.getElementById('sell_view').dataset.selected = "false"
    document.getElementById('data_view').dataset.selected = "false"
    document.getElementById('manage_view').dataset.selected = 'false'

    document.getElementById('data').style.display = 'none';
    document.getElementById('main').style.display = 'none';
    document.getElementById('manage').style.display = 'none';

    switch (view) {
        case 'data_view':
            document.getElementById('data').style.display = 'flex';
            document.getElementById('data_view').dataset.selected = 'true'
            updateData()
            break;
        case 'sell_view':
            document.getElementById('main').style.display = 'flex';
            document.getElementById('sell_view').dataset.selected = 'true'
            break;
        case 'manage_view':
            document.getElementById('manage').style.display = 'flex';
            document.getElementById('manage_view').dataset.selected = 'true'
            break;
    }

}

function saveData() {
    ipc.save()
}

function loadData() {
    var file = new FileReader();
    const input = document.getElementById('load_data').firstElementChild
    input.click();

    input.onchange = () => {
        if (input.files[0] === undefined) { return }
        file.readAsText(input.files[0]);
        file.onload = () => {
            ipc.load_data(file.result)
            updateData()
        }
    }
}

function themeToggle() {
    const theme = document.body.className
    const themeToggle = document.getElementById('theme_toggle')
    if (theme === 'dark') {
        document.body.className = 'light'
        themeToggle.textContent = 'DARK MODE'
    } else {
        document.body.className = 'dark'
        themeToggle.textContent = 'LIGHT MODE'
    }
}