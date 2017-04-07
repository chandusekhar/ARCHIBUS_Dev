/**
 * Convenience class that defines a standard Contact prompt field
 * @author Ana Paduraru
 * @since 21.2
 */
Ext.define('Common.control.prompt.Contact', {
    extend: 'Common.control.field.Prompt',
    xtype: 'contactPrompt',

    config: {
        name: 'contact_id',
        label: LocaleManager.getLocalizedString('Contact Code', 'Common.control.prompt.Site'),
        title: LocaleManager.getLocalizedString('Contact', 'Common.control.prompt.Site'),
        store: 'contactsStore',
        displayFields: [
            {
                name: 'contact_id',
                title: LocaleManager.getLocalizedString('Contact Code',
                        'Common.control.prompt.Contact')

            },
            {
                name: 'name_first',
                title: LocaleManager.getLocalizedString('First Name',
                        'Common.control.prompt.Contact')
            },
            {
                name: 'name_last',
                title: LocaleManager.getLocalizedString('Last Name',
                        'Common.control.prompt.Contact')
            }
        ],

        displayTemplate: {
            phone: '<div class="x-phone-prompt"><span class="prompt-label">' +
                    LocaleManager.getLocalizedString('Code:', 'Common.control.prompt.Contact') +
                    '</span><span class="prompt-code-value">{contact_id}</span></div>' +
                    '<div class="x-phone-prompt"><span class="prompt-label">' +
                    LocaleManager.getLocalizedString('Name:', 'Common.control.prompt.Contact') +
                    '</span><span>{name_last} {name_first}</span></div>'
        },

        headerTemplate: {
            phone: '<div></div>'
        }
    }
});