Ext.define('MaterialInventory.view.prompt.AislePromptList', {
    extend: 'Common.control.field.Prompt',

    config: {
        title: LocaleManager.getLocalizedString('Select Aisle Location', 'MaterialInventory.view.AislePromptList'),
        label: '',
        store: 'materialAisles',
        record: null,
        displayFields: [
            {
                name: 'bl_id',
                title: LocaleManager.getLocalizedString('Building Code', 'MaterialInventory.view.AislePromptList')
            },
            {
                name: 'fl_id',
                title: LocaleManager.getLocalizedString('Floor Code', 'MaterialInventory.view.AislePromptList')
            },
            {
                name: 'rm_id',
                title: LocaleManager.getLocalizedString('Room Code', 'MaterialInventory.view.AislePromptList')
            },
            {
                name: 'aisle_id',
                title: LocaleManager.getLocalizedString('Aisle Code', 'MaterialInventory.view.AislePromptList')
            }
        ],
        displayTemplate: '<div class="x-phone-prompt"><span class="prompt-label">' +
        LocaleManager.getLocalizedString('Building:', 'MaterialInventory.view.AislePromptList') +
        '</span><span>{bl_id}</span></div>' +
        '<div class="x-phone-prompt"><span class="prompt-label">' +
        LocaleManager.getLocalizedString('Floor:', 'MaterialInventory.view.AislePromptList') +
        '</span><span>{fl_id}</span></div>' +
        '<div class="x-phone-prompt"><span class="prompt-label">' +
        LocaleManager.getLocalizedString('Room:', 'MaterialInventory.view.AislePromptList') +
        '</span><span>{rm_id}</span></div>' +
        '<div class="x-phone-prompt"><span class="prompt-label">' +
        LocaleManager.getLocalizedString('Aisle:', 'MaterialInventory.view.AislePromptList') +
        '</span><span>{aisle_id}</span></div>',

        headerTemplate: '<div></div>'
    },

    // Overwrite parent function to not clear filters set by the app when creating a new prompt panel.
    resetFilter: function () {
        // do nothing
    }
});