Ext.define('Common.control.prompt.EquipmentStandard', {
    extend: 'Common.control.field.Prompt',

    xtype: 'equipmentStandardPrompt',

    config: {
        name: 'eq_std',
        title: LocaleManager.getLocalizedString('Equipment Standards', 'Common.control.prompt.EquipmentStandard'),
        label: LocaleManager.getLocalizedString('Equipment Standard', 'Common.control.prompt.EquipmentStandard'),
        store: 'equipmentStandardsStore',
        displayFields: [
            {
                name: 'eq_std',
                title: LocaleManager.getLocalizedString('Equipment Standard',
                        'Common.control.prompt.EquipmentStandard')
            },
            {
                name: 'description',
                title: LocaleManager.getLocalizedString('Description',
                        'Common.control.prompt.EquipmentStandard')
            }
        ],
        displayTemplate: {
            phone: '<div class="x-phone-prompt"><span class="prompt-label">' +
                    LocaleManager.getLocalizedString('Standard:', 'Common.control.prompt.EquipmentStandard') +
                    '</span><span class="prompt-code-value">{eq_std}</span></div>' +
                    '<div class="x-phone-prompt"><span class="prompt-label">' +
                    LocaleManager.getLocalizedString('Description:', 'Common.control.prompt.EquipmentStandard') +
                    '</span><span>{description}</span></div>'
        },

        headerTemplate: {
            phone: '<div></div>'
        }
    }
});
