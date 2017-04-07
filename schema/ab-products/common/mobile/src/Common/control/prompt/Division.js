Ext.define('Common.control.prompt.Division', {
    extend: 'Common.control.field.Prompt',

    xtype: 'divisionPrompt',

    config: {
        name: 'dv_id',
        label: LocaleManager.getLocalizedString('Division Code', 'Common.control.prompt.Division'),
        title: LocaleManager.getLocalizedString('Divisions', 'Common.control.prompt.Division'),
        store: 'divisionsStore',
        displayFields: [
            {
                name: 'dv_id',
                title: LocaleManager.getLocalizedString('Division Code', 'Common.control.prompt.Division')
            },
            {
                name: 'name',
                title: LocaleManager.getLocalizedString('Division', 'Common.control.prompt.Division')
            }
        ],
        childFields: ['dp_id'],

        displayTemplate: {
            phone: '<div class="x-phone-prompt"><span class="prompt-label">' +
                    LocaleManager.getLocalizedString('Code:', 'Common.control.prompt.Division') +
                    '</span><span class="prompt-code-value">{dv_id}</span></div>' +
                    '<div class="x-phone-prompt"><span class="prompt-label">' +
                    LocaleManager.getLocalizedString('Division:', 'Common.control.prompt.Division') +
                    '</span><span>{name}</span></div>'
        },

        headerTemplate: {
            phone: '<div></div>'
        }
    }
});