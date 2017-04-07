/**
 * Convenience class that defines a standard Site prompt field
 * @author Cristina Reghina
 * @since 21.2
 */
Ext.define('Common.control.prompt.Site', {

    extend: 'Common.control.field.Prompt',

    xtype: 'sitePrompt',

    config: {
        name: 'site_id',
        label: LocaleManager.getLocalizedString('Site Code', 'Common.control.prompt.Site'),
        title: LocaleManager.getLocalizedString('Sites', 'Common.control.prompt.Site'),
        store: 'sitesStore',
        displayFields: [
            {
                name: 'site_id',
                title: LocaleManager.getLocalizedString('Site Code',
                    'Common.control.prompt.Site')

            },
            {
                name: 'name',
                title: LocaleManager.getLocalizedString('Site',
                    'Common.control.prompt.Site')
            }
        ],
        childFields: ['bl_id', 'fl_id', 'rm_id', 'eq_id'],

        displayTemplate: {
            phone: '<div class="x-phone-prompt"><span class="prompt-label">' +
                LocaleManager.getLocalizedString('Code:', 'Common.control.prompt.Site') +
                '</span><span class="prompt-code-value">{site_id}</span></div>' +
                '<div class="x-phone-prompt"><span class="prompt-label">' +
                LocaleManager.getLocalizedString('Site:', 'Common.control.prompt.Site') +
                '</span><span>{name}</span></div>'
        },

        headerTemplate: {
            phone: '<div></div>'
        }
    }
});