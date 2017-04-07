/**
 * Convenience class that defines a standard Cabinet prompt field
 * @author Ana Paduraru
 * @since 22.1
 */

Ext.define('MaterialInventory.control.prompt.Cabinet', {
    extend: 'MaterialInventory.control.BarcodePromptField',

    xtype: 'cabinetPrompt',

    config: {
        name: 'cabinet_id',
        label: LocaleManager.getLocalizedString('Cabinet Code', 'MaterialInventory.control.prompt.Cabinet'),
        title: LocaleManager.getLocalizedString('Cabinets', 'MaterialInventory.control.prompt.Cabinet'),
        store: 'materialCabinets',
        displayFields: [
            {
                name: 'cabinet_id',
                title: LocaleManager.getLocalizedString('Cabinet Code', 'MaterialInventory.control.prompt.Cabinet')
            },
            {
                name: 'aisle_id',
                title: LocaleManager.getLocalizedString('Aisle Code', 'MaterialInventory.control.prompt.Cabinet')
            }
        ],
        parentFields: ['site_id', 'bl_id', 'fl_id', 'rm_id', 'aisle_id'],
        childFields: ['shelf_id', 'bin_id'],

        displayTemplate: {
            phone: '<div class="x-phone-prompt"><span class="prompt-label">' +
            LocaleManager.getLocalizedString('cabinet Code:', 'MaterialInventory.control.prompt.Cabinet') +
            '</span><span class="prompt-code-value">{cabinet_id}</span></div>' +
            '<div class="x-phone-prompt"><span class="prompt-label">' +
            LocaleManager.getLocalizedString('Aisle Code:', 'MaterialInventory.control.prompt.Cabinet') +
            '</span><span>{aisle_id}</span></div>'
        },

        headerTemplate: {
            phone: '<div></div>'
        }
    }
});