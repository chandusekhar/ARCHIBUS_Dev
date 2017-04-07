Ext.define('MaterialInventory.view.prompt.ShelfPromptList', {
    extend: 'Common.control.field.Prompt',

    config: {
        title: LocaleManager.getLocalizedString('Select Shelf Location', 'MaterialInventory.view.ShelfPromptList'),
        label: '',
        store: 'materialShelves',
        record: null,
        displayFields: [
            {
                name: 'bl_id',
                title: LocaleManager.getLocalizedString('Building Code', 'MaterialInventory.view.ShelfPromptList')
            },
            {
                name: 'fl_id',
                title: LocaleManager.getLocalizedString('Floor Code', 'MaterialInventory.view.ShelfPromptList')
            },
            {
                name: 'rm_id',
                title: LocaleManager.getLocalizedString('Room Code', 'MaterialInventory.view.ShelfPromptList')
            },
            {
                name: 'aisle_id',
                title: LocaleManager.getLocalizedString('Aisle Code', 'MaterialInventory.view.ShelfPromptList')
            },
            {
                name: 'cabinet_id',
                title: LocaleManager.getLocalizedString('Cabinet Code', 'MaterialInventory.view.ShelfPromptList')
            },
            {
                name: 'shelf_id',
                title: LocaleManager.getLocalizedString('Shelf Code', 'MaterialInventory.view.ShelfPromptList')
            }
        ],
        displayTemplate: '<div class="x-phone-prompt"><span class="prompt-label">' +
        LocaleManager.getLocalizedString('Building:', 'MaterialInventory.view.ShelfPromptList') +
        '</span><span>{bl_id}</span></div>' +
        '<div class="x-phone-prompt"><span class="prompt-label">' +
        LocaleManager.getLocalizedString('Floor:', 'MaterialInventory.view.ShelfPromptList') +
        '</span><span>{fl_id}</span></div>' +
        '<div class="x-phone-prompt"><span class="prompt-label">' +
        LocaleManager.getLocalizedString('Room:', 'MaterialInventory.view.ShelfPromptList') +
        '</span><span>{rm_id}</span></div>' +
        '<div class="x-phone-prompt"><span class="prompt-label">' +
        LocaleManager.getLocalizedString('Aisle:', 'MaterialInventory.view.ShelfPromptList') +
        '</span><span>{aisle_id}</span></div>' +
        '<div class="x-phone-prompt"><span class="prompt-label">' +
        LocaleManager.getLocalizedString('Cabinet:', 'MaterialInventory.view.ShelfPromptList') +
        '</span><span>{cabinet_id}</span></div>' +
        '<div class="x-phone-prompt"><span class="prompt-label">' +
        LocaleManager.getLocalizedString('Shelf:', 'MaterialInventory.view.ShelfPromptList') +
        '</span><span>{shelf_id}</span></div>',

        headerTemplate: '<div></div>'
    },

    // Overwrite parent function to not clear filters set by the app when creating a new prompt panel.
    resetFilter: function () {
        // do nothing
    }
});