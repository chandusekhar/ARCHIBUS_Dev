/**
 * Convenience class that defines a Building prompt field with friendly values displayed instead of code values.
 * @author Ana Albu
 * @since 23.1
 */
Ext.define('Common.control.prompt.BuildingFriendlyValues', {

    extend: 'Common.control.field.Prompt',

    xtype: 'buildingFriendlyValuesPrompt',

    config: {
        name: 'bl_id',
        label: LocaleManager.getLocalizedString('Building','Common.control.prompt.BuildingFriendlyValues'),
        title: LocaleManager.getLocalizedString('Buildings', 'Common.control.prompt.BuildingFriendlyValues'),
        store: 'buildingsStore',
        displayFields: [
            {
                name: 'name',
                title: LocaleManager.getLocalizedString('Building', 'Common.control.prompt.BuildingFriendlyValues')
            },
            {
                name: 'bl_id',
                title: LocaleManager.getLocalizedString('Building Code', 'Common.control.prompt.BuildingFriendlyValues')

            }
        ],
        childFields: ['fl_id', 'rm_id'],

        displayTemplate: {
            phone: '<div class="x-phone-prompt"><span class="prompt-label">' +
                    LocaleManager.getLocalizedString('Building:', 'Common.control.prompt.BuildingFriendlyValues') +
                    '</span><span class="prompt-code-value">{name}</span></div>' +
                    '<div class="x-phone-prompt"><span class="prompt-label">' +
                    LocaleManager.getLocalizedString('Code:', 'Common.control.prompt.BuildingFriendlyValues') +
                    '</span><span>{bl_id}</span></div>',
            tablet: '<div class="prompt-list-hbox"><h1>{name}</h1></div>' +
                    '<div>{bl_id}</div>'
        },

        headerTemplate: {
            phone: '<div></div>',
            tablet: '<div class="prompt-list-label">'+
                LocaleManager.getLocalizedString('Building', 'Common.control.prompt.BuildingFriendlyValues') +
                '</div>'
        }
    }
});