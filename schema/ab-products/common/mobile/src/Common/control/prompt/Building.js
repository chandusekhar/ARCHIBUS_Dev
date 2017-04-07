/**
 * Convenience class that defines a standard Building prompt field
 * @author Jeff Martin
 * @since 21.2
 */
Ext.define('Common.control.prompt.Building', {

    extend: 'Common.control.field.Prompt',

    xtype: 'buildingPrompt',

    config: {
        name: 'bl_id',
        label: LocaleManager.getLocalizedString('Building Code','Common.control.prompt.BuildingPrompt'),
        title: LocaleManager.getLocalizedString('Buildings', 'Common.control.prompt.BuildingPrompt'),
        store: 'buildingsStore',
        displayFields: [
            {
                name: 'bl_id',
                title: LocaleManager.getLocalizedString('Building Code', 'Common.control.prompt.BuildingPrompt')

            },
            {
                name: 'name',
                title: LocaleManager.getLocalizedString('Building', 'Common.control.prompt.BuildingPrompt')
            }
        ],
        parentFields: ['site_id'],
        childFields: ['fl_id', 'rm_id', 'eq_id'],

        displayTemplate: {
            phone: '<div class="x-phone-prompt"><span class="prompt-label">' +
                    LocaleManager.getLocalizedString('Code:', 'Common.control.prompt.Building') +
                    '</span><span class="prompt-code-value">{bl_id}</span></div>' +
                    '<div class="x-phone-prompt"><span class="prompt-label">' +
                    LocaleManager.getLocalizedString('Building:', 'Common.control.prompt.Building') +
                    '</span><span>{name}</span></div>'
        },

        headerTemplate: {
            phone: '<div></div>'
        }
    }
});