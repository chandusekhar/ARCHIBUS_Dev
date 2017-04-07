Ext.define('MaterialInventory.view.prompt.BinPromptList', {
    extend: 'Common.control.field.Prompt',

    config: {
        title: LocaleManager.getLocalizedString('Select Bin Location', 'MaterialInventory.view.BinPromptList'),
        label: '',
        store: 'materialBins',
        record: null,
        displayFields: [
            {
                name: 'bl_id',
                title: LocaleManager.getLocalizedString('Building Code', 'MaterialInventory.view.BinPromptList')
            },
            {
                name: 'fl_id',
                title: LocaleManager.getLocalizedString('Floor Code', 'MaterialInventory.view.BinPromptList')
            },
            {
                name: 'rm_id',
                title: LocaleManager.getLocalizedString('Room Code', 'MaterialInventory.view.BinPromptList')
            },
            {
                name: 'aisle_id',
                title: LocaleManager.getLocalizedString('Aisle Code', 'MaterialInventory.view.BinPromptList')
            },
            {
                name: 'cabinet_id',
                title: LocaleManager.getLocalizedString('Cabinet Code', 'MaterialInventory.view.BinPromptList')
            },
            {
                name: 'shelf_id',
                title: LocaleManager.getLocalizedString('Shelf Code', 'MaterialInventory.view.BinPromptList')
            },
            {
                name: 'bin_id',
                title: LocaleManager.getLocalizedString('Shelf Code', 'MaterialInventory.view.BinPromptList')
            }
        ],
        displayTemplate: '<div class="x-phone-prompt"><span class="prompt-label">' +
        LocaleManager.getLocalizedString('Building:', 'MaterialInventory.view.BinPromptList') +
        '</span><span>{bl_id}</span></div>' +
        '<div class="x-phone-prompt"><span class="prompt-label">' +
        LocaleManager.getLocalizedString('Floor:', 'MaterialInventory.view.BinPromptList') +
        '</span><span>{fl_id}</span></div>' +
        '<div class="x-phone-prompt"><span class="prompt-label">' +
        LocaleManager.getLocalizedString('Room:', 'MaterialInventory.view.BinPromptList') +
        '</span><span>{rm_id}</span></div>' +
        '<div class="x-phone-prompt"><span class="prompt-label">' +
        LocaleManager.getLocalizedString('Aisle:', 'MaterialInventory.view.BinPromptList') +
        '</span><span>{aisle_id}</span></div>' +
        '<div class="x-phone-prompt"><span class="prompt-label">' +
        LocaleManager.getLocalizedString('Cabinet:', 'MaterialInventory.view.BinPromptList') +
        '</span><span>{cabinet_id}</span></div>' +
        '<div class="x-phone-prompt"><span class="prompt-label">' +
        LocaleManager.getLocalizedString('Shelf:', 'MaterialInventory.view.BinPromptList') +
        '</span><span>{shelf_id}</span></div>' +
        '<div class="x-phone-prompt"><span class="prompt-label">' +
        LocaleManager.getLocalizedString('Bin:', 'MaterialInventory.view.BinPromptList') +
        '</span><span>{bin_id}</span></div>',

        headerTemplate: '<div></div>'
    },

    // Overwrite parent function to not clear filters set by the app when creating a new prompt panel.
    resetFilter: function () {
        // do nothing
    }
});