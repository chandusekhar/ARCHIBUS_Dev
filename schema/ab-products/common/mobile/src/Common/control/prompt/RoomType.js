/**
 * Convenience class that defines a standard Room Type prompt field
 * @author Ana Paduraru
 * @since 21.3
 */
Ext.define('Common.control.prompt.RoomType', {

    extend: 'Common.control.field.Prompt',

    xtype: 'roomTypePrompt',

    config: {
        name: 'rm_type',
        label: LocaleManager.getLocalizedString('Room Type', 'Common.control.prompt.RoomType'),
        title: LocaleManager.getLocalizedString('Room Types', 'Common.control.prompt.RoomType'),
        store: 'roomTypesStore',
        displayFields: [
            {
                name: 'rm_cat',
                title: LocaleManager.getLocalizedString('Room Category','Common.control.prompt.RoomType')
            },
            {
                name: 'rm_type',
                title: LocaleManager.getLocalizedString('Room Type','Common.control.prompt.RoomType')
            },
            {
                name: 'description',
                title: LocaleManager.getLocalizedString('Description','Common.control.prompt.RoomType')
            }
        ],
        parentFields: ['rm_cat'],

        displayTemplate: {
            phone: '<div class="x-phone-prompt"><span class="prompt-label">' +
                LocaleManager.getLocalizedString('Category:', 'Common.control.prompt.RoomType') +
                '</span><span class="prompt-code-value">{rm_cat}</span></div>' +
                '<div class="x-phone-prompt"><span class="prompt-label">' +
                LocaleManager.getLocalizedString('Type:', 'Common.control.prompt.RoomType') +
                '</span><span>{rm_type}</span></div>' +
                '<div class="x-phone-prompt"><span class="prompt-label">' +
                LocaleManager.getLocalizedString('Description:', 'Common.control.prompt.RoomType') +
                '</span><span>{description}</span></div>'
        },

        headerTemplate: {
            phone: '<div></div>'
        }
    }
});