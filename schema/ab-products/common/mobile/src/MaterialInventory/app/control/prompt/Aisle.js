/**
 * Convenience class that defines a standard Aisle prompt field
 * @author Ana Paduraru
 * @since 22.1
 */

Ext.define('MaterialInventory.control.prompt.Aisle', {
    extend: 'MaterialInventory.control.BarcodePromptField',

    xtype: 'aislePrompt',

    config: {
        name: 'aisle_id',
        label: LocaleManager.getLocalizedString('Aisle Code', 'MaterialInventory.control.prompt.Aisle'),
        title: LocaleManager.getLocalizedString('Aisles', 'MaterialInventory.control.prompt.Aisle'),
        store: 'materialAisles',
        displayFields: [
            {
                name: 'aisle_id',
                title: LocaleManager.getLocalizedString('Aisle Code', 'MaterialInventory.control.prompt.Aisle')
            },
            {
                name: 'name',
                title: LocaleManager.getLocalizedString('Name', 'MaterialInventory.control.prompt.Aisle')
            }
        ],
        parentFields: ['site_id', 'bl_id', 'fl_id', 'rm_id'],
        childFields: ['cabinet_id', 'shelf_id', 'bin_id'],

        displayTemplate: {
            phone: '<div class="x-phone-prompt"><span class="prompt-label">' +
            LocaleManager.getLocalizedString('Aisle Code:', 'MaterialInventory.control.prompt.Aisle') +
            '</span><span class="prompt-code-value">{aisle_id}</span></div>' +
            '<div class="x-phone-prompt"><span class="prompt-label">' +
            LocaleManager.getLocalizedString('Aisle', 'MaterialInventory.control.prompt.Aisle') +
            '</span><span>{name}</span></div>'
        },

        headerTemplate: {
            phone: '<div></div>'
        }
    }
});
