Ext.define('Common.control.prompt.EmployeeStandard', {
    extend: 'Common.control.field.Prompt',

    xtype: 'employeeStandardPrompt',

    config: {
        name: 'em_std',
        title: LocaleManager.getLocalizedString('Employee Standard', 'Common.control.prompt.EmployeeStandard'),
        label: LocaleManager.getLocalizedString('Employee Standard', 'Common.control.prompt.EmployeeStandard'),
        store: 'employeeStandardsStore',
        displayFields: [
            {
                name: 'em_std',
                title: LocaleManager.getLocalizedString('Employee Standard',
                        'Common.control.prompt.EmployeeStandard')
            },
            {
                name: 'description',
                title: LocaleManager.getLocalizedString('Description',
                        'Common.control.prompt.EmployeeStandard')
            }
        ],
        displayTemplate: {
            phone: '<div class="x-phone-prompt"><span class="prompt-label">' +
                    LocaleManager.getLocalizedString('Standard:', 'Common.control.prompt.EmployeeStandard') +
                    '</span><span class="prompt-code-value">{em_std}</span></div>' +
                    '<div class="x-phone-prompt"><span class="prompt-label">' +
                    LocaleManager.getLocalizedString('Description:', 'Common.control.prompt.EmployeeStandard') +
                    '</span><span>{description}</span></div>'
        },

        headerTemplate: {
            phone: '<div></div>'
        }
    }
});
