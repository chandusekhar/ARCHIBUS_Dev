Ext.define('MaterialInventory.control.prompt.Room', {
    extend: 'MaterialInventory.control.BarcodePromptField',

    xtype: 'roomBarcodePrompt',

    config: {
        name: 'rm_id',
        label: LocaleManager.getLocalizedString('Room Code', 'MaterialInventory.control.prompt.Room'),
        title: LocaleManager.getLocalizedString('Rooms', 'MaterialInventory.control.prompt.Room'),
        store: 'materialRooms',

        displayFields: [
            {
                name: 'rm_id',
                title: LocaleManager.getLocalizedString('Room Code', 'MaterialInventory.control.prompt.Room')
            },
            {
                name: 'fl_id',
                title: LocaleManager.getLocalizedString('Floor Code', 'MaterialInventory.control.prompt.Room')
            },
            {
                name: 'bl_id',
                title: LocaleManager.getLocalizedString('Building Code', 'MaterialInventory.control.prompt.Room')
            }
        ],
        childFields: ['aisle_id', 'cabinet_id', 'shelf_id', 'bin_id'],
        parentFields: ['site_id', 'bl_id', 'fl_id'],

        displayTemplate: {
            phone: '<div class="x-phone-prompt"><span class="prompt-label">' +
            LocaleManager.getLocalizedString('Room Code:', 'MaterialInventory.control.prompt.Room') +
            '</span><span class="prompt-code-value">{rm_id}</span></div>' +
            '<div class="x-phone-prompt"><span class="prompt-label">' +
            LocaleManager.getLocalizedString('Building/Floor:', 'MaterialInventory.control.prompt.Room') +
            '</span><span>{bl_id}/{fl_id}</span></div>'
        },

        headerTemplate: {
            phone: '<div></div>'
        }
    }
});
