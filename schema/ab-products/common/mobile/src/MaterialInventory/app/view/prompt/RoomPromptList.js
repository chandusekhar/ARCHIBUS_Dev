Ext.define('MaterialInventory.view.prompt.RoomPromptList', {
    extend: 'Common.control.field.Prompt',

    config: {
        title: LocaleManager.getLocalizedString('Select Room Location', 'MaterialInventory.view.RoomPromptList'),
        label: '',
        store: 'materialRooms',
        record: null,
        displayFields: [
            {
                name: 'bl_id',
                title: LocaleManager.getLocalizedString('Building Code', 'MaterialInventory.view.RoomPromptList')
            },
            {
                name: 'fl_id',
                title: LocaleManager.getLocalizedString('Floor Code', 'MaterialInventory.view.RoomPromptList')
            },
            {
                name: 'rm_id',
                title: LocaleManager.getLocalizedString('Room Code', 'MaterialInventory.view.RoomPromptList')
            }
        ],
        displayTemplate: '<div class="x-phone-prompt"><span class="prompt-label">' +
        LocaleManager.getLocalizedString('Building:', 'MaterialInventory.view.RoomPromptList') +
        '</span><span>{bl_id}</span></div>' +
        '<div class="x-phone-prompt"><span class="prompt-label">' +
        LocaleManager.getLocalizedString('Floor:', 'MaterialInventory.view.RoomPromptList') +
        '</span><span>{fl_id}</span></div>' +
        '<div class="x-phone-prompt"><span class="prompt-label">' +
        LocaleManager.getLocalizedString('Room:', 'MaterialInventory.view.RoomPromptList') +
        '</span><span>{rm_id}</span></div>',

        headerTemplate: '<div></div>'
    },

    // Overwrite parent function to not clear filters set by the app when creating a new prompt panel.
    resetFilter: function () {
        // do nothing
    }
});