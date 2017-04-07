/**
 * Convenience class that defines a standard Room prompt field
 * @author Jeff Martin
 * @since 21.2
 */

Ext.define('Common.control.prompt.Room', {
    extend: 'Common.control.field.Prompt',

    xtype: 'roomPrompt',

    config: {
        name: 'rm_id',
        label: LocaleManager.getLocalizedString('Room Code', 'Common.control.prompt.Room'),
        title: LocaleManager.getLocalizedString('Rooms', 'Common.control.prompt.Room'),
        store: 'roomsStore',
        displayFields: [
            {
                name: 'rm_id',
                title: LocaleManager.getLocalizedString('Room Code', 'Common.control.prompt.Room')
            },
            {
                name: 'fl_id',
                title: LocaleManager.getLocalizedString('Floor Code', 'Common.control.prompt.Room')
            },
            {
                name: 'bl_id',
                title: LocaleManager.getLocalizedString('Building Code', 'Common.control.prompt.Room')
            }
        ],
        parentFields: ['site_id', 'bl_id', 'fl_id'],
        childFields: ['eq_id'],

        displayTemplate: {
            phone: '<div class="x-phone-prompt"><span class="prompt-label">' +
                    LocaleManager.getLocalizedString('Room Code:', 'Common.control.prompt.Room') +
                    '</span><span class="prompt-code-value">{rm_id}</span></div>' +
                    '<div class="x-phone-prompt"><span class="prompt-label">' +
                    LocaleManager.getLocalizedString('Building/Floor:', 'Common.control.prompt.Room') +
                    '</span><span>{bl_id}/{fl_id}</span></div>'
        },

        headerTemplate: {
            phone: '<div></div>'
        }
    }
});
