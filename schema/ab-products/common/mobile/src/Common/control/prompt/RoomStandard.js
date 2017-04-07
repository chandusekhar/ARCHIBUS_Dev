/**
 * Convenience class that defines a standard Room Standard prompt field
 * @author Ana Paduraru
 * @since 21.2
 */
Ext.define('Common.control.prompt.RoomStandard', {

    extend: 'Common.control.field.Prompt',

    xtype: 'roomStandardPrompt',

    config: {
        name: 'rm_std',
        label: LocaleManager.getLocalizedString('Room Standard',
                'Common.control.prompt.RoomStandard'),
        title: LocaleManager.getLocalizedString('Standards',
                'Common.control.prompt.RoomStandard'),
        store: 'roomStandardsStore',
        displayFields: [
            {
                name: 'rm_std',
                title: LocaleManager.getLocalizedString('Room Standard',
                        'Common.control.prompt.RoomStandard')

            },
            {
                name: 'description',
                title: LocaleManager.getLocalizedString('Description',
                        'Common.control.prompt.RoomStandard')
            }
        ],

        displayTemplate: {
            phone: '<div class="x-phone-prompt"><span class="prompt-label">' +
                    LocaleManager.getLocalizedString('Standard:', 'Common.control.prompt.RoomStandard') +
                    '</span><span class="prompt-code-value">{rm_std}</span></div>' +
                    '<div class="x-phone-prompt"><span class="prompt-label">' +
                    LocaleManager.getLocalizedString('Description:', 'Common.control.prompt.RoomStandard') +
                    '</span><span>{description}</span></div>'
        },

        headerTemplate: {
            phone: '<div></div>'
        }
    }
});