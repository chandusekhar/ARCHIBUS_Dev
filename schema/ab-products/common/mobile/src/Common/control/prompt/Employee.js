Ext.define('Common.control.prompt.Employee', {
    extend: 'Common.control.field.Prompt',

    xtype: 'employeePrompt',

    config: {
        name: 'em_id',
        title: LocaleManager.getLocalizedString('Employee', 'Common.control.prompt.Employee'),
        label: LocaleManager.getLocalizedString('Employee Code', 'Common.control.prompt.Employee'),
        store: 'employeesStore',
        displayFields: [
            {
                name: 'em_id',
                title: LocaleManager.getLocalizedString('Employee Code', 'Common.control.prompt.Employee')
            },
            {
                name: 'email',
                title: LocaleManager.getLocalizedString('Email', 'Common.control.prompt.Employee')
            }
        ],

        displayTemplate: {
            phone: '<div class="x-phone-prompt"><span class="prompt-label">' +
                    LocaleManager.getLocalizedString('Code:', 'Common.control.prompt.Employee') +
                    '</span><span class="prompt-code-value">{em_id}</span></div>' +
                    '<div class="x-phone-prompt"><span class="prompt-label">' +
                    LocaleManager.getLocalizedString('Email:', 'Common.control.prompt.Employee') +
                    '</span><span>{email}</span></div>'
        },

        headerTemplate: {
            phone: '<div></div>'
        }

    }
});
