/**
 * Convenience class that defines a standard Bin prompt field
 * @author Ana Paduraru
 * @since 22.1
 */

Ext.define('MaterialInventory.control.prompt.Bin', {
    extend: 'MaterialInventory.control.BarcodePromptField',

    xtype: 'binPrompt',

    config: {
        name: 'bin_id',
        label: LocaleManager.getLocalizedString('Bin Code', 'MaterialInventory.control.prompt.Bin'),
        title: LocaleManager.getLocalizedString('Bins', 'MaterialInventory.control.prompt.Bin'),
        store: 'materialBins',
        displayFields: [
            {
                name: 'bin_id',
                title: LocaleManager.getLocalizedString('Bin Code', 'MaterialInventory.control.prompt.Bin')
            },
            {
                name: 'shelf_id',
                title: LocaleManager.getLocalizedString('Shelf Code', 'MaterialInventory.control.prompt.Bin')
            },
            {
                name: 'cabinet_id',
                title: LocaleManager.getLocalizedString('Cabinet Code', 'MaterialInventory.control.prompt.Bin')
            },
            {
                name: 'aisle_id',
                title: LocaleManager.getLocalizedString('Aisle Code', 'MaterialInventory.control.prompt.Bin')
            }
        ],
        parentFields: ['site_id', 'bl_id', 'fl_id', 'rm_id', 'aisle_id', 'cabinet_id', 'shelf_id'],

        displayTemplate: {
            phone: '<div class="x-phone-prompt"><span class="prompt-label">' +
            LocaleManager.getLocalizedString('Bin Code:', 'MaterialInventory.control.prompt.Bin') +
            '</span><span class="prompt-code-value">{rm_id}</span></div>' +
            '<div class="x-phone-prompt"><span class="prompt-label">' +
            LocaleManager.getLocalizedString('Aisle/Cabinet/Shelf:', 'MaterialInventory.control.prompt.Bin') +
            '</span><span>{aisle_id}/{cabinet_id}/{shelf_id}</span></div>'
        },

        headerTemplate: {
            phone: '<div></div>'
        }
    }
});
