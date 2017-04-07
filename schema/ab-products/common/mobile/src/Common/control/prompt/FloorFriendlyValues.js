/**
 * Convenience class that defines a Floor prompt field with friendly values displayed instead of code values.
 * @author Ana Albu
 * @since 21.3
 */

Ext.define('Common.control.prompt.FloorFriendlyValues', {
    extend: 'Common.control.field.Prompt',

    xtype: 'floorFriendlyValuesPrompt',

    config: {
        name: 'fl_id',
        label: LocaleManager.getLocalizedString('Floor', 'Common.control.prompt.FloorFriendlyValues'),
        title: LocaleManager.getLocalizedString('Floors', 'Common.control.prompt.FloorFriendlyValues'),
        store: 'floorPromptStore',
        displayFields: [
            {
                name: 'name',
                title: LocaleManager.getLocalizedString('Floor', 'Common.control.prompt.FloorFriendlyValues')
            },
            {
                name: 'fl_id',
                title: LocaleManager.getLocalizedString('Floor Code', 'Common.control.prompt.FloorFriendlyValues')
            },
            {
                name: 'bl_name',
                title: LocaleManager.getLocalizedString('Building', 'Common.control.prompt.FloorFriendlyValues')
            },
            {
                name: 'bl_id',
                title: LocaleManager.getLocalizedString('Building Code', 'Common.control.prompt.FloorFriendlyValues')
            }
        ],
        parentFields: ['bl_id'],
        childFields: ['rm_id'],

        displayTemplate: {
            phone: '<div class="x-phone-prompt"><span class="prompt-label">' +
                LocaleManager.getLocalizedString('Floor:', 'Common.control.prompt.FloorFriendlyValues') +
                '</span><span class="prompt-code-value">{name}</span></div>' +
                '<div class="x-phone-prompt"><span class="prompt-label">' +
                LocaleManager.getLocalizedString('Floor Code:', 'Common.control.prompt.FloorFriendlyValues') +
                '</span><span>{fl_id}</span></div>'+
                '<div class="x-phone-prompt"><span class="prompt-label">'+
                LocaleManager.getLocalizedString('Building:', 'Common.control.prompt.FloorFriendlyValues') +
                '</span><span class="prompt-code-value">{bl_name}</span></div>' +
                '<div class="x-phone-prompt"><span class="prompt-label">' +
                LocaleManager.getLocalizedString('Building Code:', 'Common.control.prompt.FloorFriendlyValues') +
                '</span><span>{bl_id}</span></div>',

            tablet: '<div class="prompt-list-hbox"><div style="width:50%"><h1>{name}</h1>' +
                '<div>{fl_id}</div></div>'+
                '<div style="width:50%"><h1>{bl_name}</h1>' +
                '<div>{bl_id}</div></div></div>'
        },

        headerTemplate: {
            phone: '<div></div>',

            tablet: '<div class="prompt-list-label"><h3 style="width:50%">'+
                LocaleManager.getLocalizedString('Floor', 'Common.control.prompt.FloorFriendlyValues') +
                '</h3><h3 style="width:50%">'+
                LocaleManager.getLocalizedString('Building', 'Common.control.prompt.FloorFriendlyValues') +
                '</h3></div>'
        }
    }
});