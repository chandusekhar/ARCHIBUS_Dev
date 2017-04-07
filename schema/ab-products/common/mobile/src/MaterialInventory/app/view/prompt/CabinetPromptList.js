Ext.define('MaterialInventory.view.prompt.CabinetPromptList', {
    extend: 'Common.control.field.Prompt',

    config: {
        title: LocaleManager.getLocalizedString('Select Cabinet Location', 'MaterialInventory.view.CabinetPromptList'),
        label: '',
        store: 'materialCabinets',
        record: null,
        displayFields: [
            {
                name: 'bl_id',
                title: LocaleManager.getLocalizedString('Building Code', 'MaterialInventory.view.CabinetPromptList')
            },
            {
                name: 'fl_id',
                title: LocaleManager.getLocalizedString('Floor Code', 'MaterialInventory.view.CabinetPromptList')
            },
            {
                name: 'rm_id',
                title: LocaleManager.getLocalizedString('Room Code', 'MaterialInventory.view.CabinetPromptList')
            },
            {
                name: 'aisle_id',
                title: LocaleManager.getLocalizedString('Aisle Code', 'MaterialInventory.view.CabinetPromptList')
            },
            {
                name: 'cabinet_id',
                title: LocaleManager.getLocalizedString('Cabinet Code', 'MaterialInventory.view.CabinetPromptList')
            }
        ],
        displayTemplate: '<div class="x-phone-prompt"><span class="prompt-label">' +
        LocaleManager.getLocalizedString('Building:', 'MaterialInventory.view.CabinetPromptList') +
        '</span><span>{bl_id}</span></div>' +
        '<div class="x-phone-prompt"><span class="prompt-label">' +
        LocaleManager.getLocalizedString('Floor:', 'MaterialInventory.view.CabinetPromptList') +
        '</span><span>{fl_id}</span></div>' +
        '<div class="x-phone-prompt"><span class="prompt-label">' +
        LocaleManager.getLocalizedString('Room:', 'MaterialInventory.view.CabinetPromptList') +
        '</span><span>{rm_id}</span></div>' +
        '<div class="x-phone-prompt"><span class="prompt-label">' +
        LocaleManager.getLocalizedString('Aisle:', 'MaterialInventory.view.CabinetPromptList') +
        '</span><span>{aisle_id}</span></div>' +
        '<div class="x-phone-prompt"><span class="prompt-label">' +
        LocaleManager.getLocalizedString('Cabinet:', 'MaterialInventory.view.CabinetPromptList') +
        '</span><span>{cabinet_id}</span></div>',

        headerTemplate: '<div></div>'
    },

    // Overwrite parent function to not clear filters set by the app when creating a new prompt panel.
    resetFilter: function () {
        // do nothing
    }
});