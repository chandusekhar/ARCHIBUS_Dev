/**
 * Convenience class that defines a standard Property prompt field
 * @author Ana Paduraru
 * @since 21.2
 */

Ext.define('Common.control.prompt.Property', {
    extend: 'Common.control.field.Prompt',

    xtype: 'propertyPrompt',

    config: {
        name: 'pr_id',
        label: LocaleManager.getLocalizedString('Property Code','Common.control.prompt.Property'),
        title: LocaleManager.getLocalizedString('Property', 'Common.control.prompt.Property'),
        store: 'propertiesStore',
        displayFields: [
            {
                name: 'pr_id',
                title: LocaleManager.getLocalizedString('Property Code', 'Common.control.prompt.Property')
            },
            {
                name: 'name',
                title: LocaleManager.getLocalizedString('Property', 'Common.control.prompt.Property')
            }
        ],
        parentFields: ['site_id'],
        childFields: ['bl_id', 'fl_id', 'rm_id', 'eq_id'],

        displayTemplate: {
            phone: '<div class="x-phone-prompt"><span class="prompt-label">' +
                    LocaleManager.getLocalizedString('Code:', 'Common.control.prompt.Property') +
                    '</span><span class="prompt-code-value">{pr_id}</span></div>' +
                    '<div class="x-phone-prompt"><span class="prompt-label">' +
                    LocaleManager.getLocalizedString('Property:', 'Common.control.prompt.Property') +
                    '</span><span>{name}</span></div>'
        },

        headerTemplate: {
            phone: '<div></div>'
        }
    }
});