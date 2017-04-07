/**
 * Convenience class that defines a standard Shelf prompt field
 * @author Ana Paduraru
 * @since 22.1
 */

Ext.define('MaterialInventory.control.prompt.Shelf', {
    extend: 'MaterialInventory.control.BarcodePromptField',

    xtype: 'shelfPrompt',

    config: {
        name: 'shelf_id',
        label: LocaleManager.getLocalizedString('Shelf Code', 'MaterialInventory.control.prompt.Shelf'),
        title: LocaleManager.getLocalizedString('Shelves', 'MaterialInventory.control.prompt.Shelf'),
        store: 'materialShelves',
        displayFields: [
            {
                name: 'shelf_id',
                title: LocaleManager.getLocalizedString('Shelf Code', 'MaterialInventory.control.prompt.Shelf')
            },
            {
                name: 'cabinet_id',
                title: LocaleManager.getLocalizedString('Cabinet Code', 'MaterialInventory.control.prompt.Shelf')
            },
            {
                name: 'aisle_id',
                title: LocaleManager.getLocalizedString('Aisle Code', 'MaterialInventory.control.prompt.Shelf')
            }
        ],
        parentFields: ['site_id', 'bl_id', 'fl_id', 'rm_id', 'aisle_id', 'cabinet_id'],
        childFields: ['bin_id'],

        displayTemplate: {
            phone: '<div class="x-phone-prompt"><span class="prompt-label">' +
            LocaleManager.getLocalizedString('Shelf Code:', 'MaterialInventory.control.prompt.Shelf') +
            '</span><span class="prompt-code-value">{rm_id}</span></div>' +
            '<div class="x-phone-prompt"><span class="prompt-label">' +
            LocaleManager.getLocalizedString('Aisle/Cabinet:', 'MaterialInventory.control.prompt.Shelf') +
            '</span><span>{aisle_id}/{cabinet_id}</span></div>'
        },

        headerTemplate: {
            phone: '<div></div>'
        }
    }
});
