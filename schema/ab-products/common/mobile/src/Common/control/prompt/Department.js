Ext.define('Common.control.prompt.Department', {
    extend: 'Common.control.field.Prompt',

    xtype: 'departmentPrompt',

    config: {
        label: LocaleManager.getLocalizedString('Department Code','Common.control.prompt.Department'),
        title: LocaleManager.getLocalizedString('Departments','Common.control.prompt.Department'),
        name: 'dp_id',
        store: 'departmentsStore',
        displayFields: [
            {
                name: 'dv_id',
                title: LocaleManager.getLocalizedString('Division Code', 'Common.control.prompt.Department')
            },
            {
                name: 'dp_id',
                title: LocaleManager.getLocalizedString('Department Code', 'Common.control.prompt.Department')
            }
        ],
        parentFields: ['dv_id'],

        displayTemplate: {
            phone: '<div class="x-phone-prompt"><span class="prompt-label">' +
                    LocaleManager.getLocalizedString('Division Code:', 'Common.control.prompt.Department') +
                    '</span><span class="prompt-code-value">{dv_id}</span></div>' +
                    '<div class="x-phone-prompt"><span class="prompt-label">' +
                    LocaleManager.getLocalizedString('Department Code:', 'Common.control.prompt.Department') +
                    '</span><span>{dp_id}</span></div>'
        },

        headerTemplate: {
            phone: '<div></div>'
        }
    }
});