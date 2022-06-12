const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('ipc', {

    load_data: (file) => ipcRenderer.send('load_data', file),

    save: () => ipcRenderer.send('save'),

    requestData: () => ipcRenderer.sendSync('requestData'),

    requestInfo: () => ipcRenderer.sendSync('requestInfo'),

    addItems: (amount) => ipcRenderer.sendSync('addItems', amount),

    changeItem: () => ipcRenderer.sendSync('changeItem'),

    sell: (state) => ipcRenderer.sendSync('sell', state)

})