/**
 * Convenience class that defines a standard Floor prompt field
 * @author Jeff Martin
 * @since 21.2
 */

Ext.define('Common.control.prompt.Floor', {
    extend: 'Common.control.field.Prompt',

    xtype: 'floorPrompt',

    config: {
        name: 'fl_id',
        label: LocaleManager.getLocalizedString('Floor Code','Common.control.prompt.Floor'),
        title: LocaleManager.getLocalizedString('Floor', 'Common.control.prompt.Floor'),
        store: 'floorsStore',
        displayFields: [
            {
                name: 'fl_id',
                title: LocaleManager.getLocalizedString('Floor Code', 'Common.control.prompt.Floor')
            },
            {
                name: 'bl_id',
                title: LocaleManager.getLocalizedString('Building Code', 'Common.control.prompt.Floor')
            }
        ],
        parentFields: ['site_id', 'bl_id'],
        childFields: ['rm_id', 'eq_id'],

        displayTemplate: {
            phone: '<div class="x-phone-prompt"><span class="prompt-label">' +
                    LocaleManager.getLocalizedString('Floor Code:', 'Common.control.prompt.Floor') +
                    '</span><span class="prompt-code-value">{fl_id}</span></div>' +
                    '<div class="x-phone-prompt"><span class="prompt-label">' +
                    LocaleManager.getLocalizedString('Building Code:', 'Common.control.prompt.Floor') +
                    '</span><span>{bl_id}</span></div>'
        },

        headerTemplate: {
            phone: '<div></div>'
        }
    }
});