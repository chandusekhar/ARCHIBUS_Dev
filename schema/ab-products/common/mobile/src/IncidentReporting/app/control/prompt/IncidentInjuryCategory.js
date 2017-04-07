Ext.define('IncidentReporting.control.prompt.IncidentInjuryCategory', {

    extend: 'Common.control.field.Prompt',

    xtype: 'incidentInjuryCategoryPrompt',

    config: {
        name: 'injury_category_id',
        label: LocaleManager.getLocalizedString('Injury Category',
            'IncidentReporting.control.prompt.IncidentInjuryCategory'),
        title: LocaleManager.getLocalizedString('Injury Categories',
            'IncidentReporting.control.prompt.IncidentInjuryCategory'),
        store: 'incidentInjuryCategoriesStore',
        displayFields: [
            {
                name: 'injury_category_id',
                title: LocaleManager.getLocalizedString('Injury Category',
                    'IncidentReporting.control.prompt.IncidentInjuryCategory')

            },
            {
                name: 'description',
                title: LocaleManager.getLocalizedString('Description',
                    'IncidentReporting.control.prompt.IncidentInjuryCategory')
            }
        ],
        displayTemplate: {
            phone: '<div class="x-phone-prompt"><span class="prompt-label">' +
                LocaleManager.getLocalizedString('Injury Category:', 'IncidentReporting.control.prompt.IncidentInjuryCategory') +
                '</span><span class="prompt-code-value">{injury_category_id}</span></div>' +
                '<div class="x-phone-prompt"><span class="prompt-label">' +
                LocaleManager.getLocalizedString('Description:', 'IncidentReporting.control.prompt.IncidentInjuryCategory') +
                '</span><span>{description}</span></div>',
            tablet: '<div class="prompt-list-hbox"><div style="width:30%">{injury_category_id}</div>' +
                '<div style="width:70%">{description}</div></div>'
        },
        headerTemplate: {
            phone: '<div></div>',
            tablet: '<div class="prompt-list-label"><h3 style="width:30%">' +
                LocaleManager.getLocalizedString('Injury Category', 'IncidentReporting.control.prompt.IncidentInjuryCategory') +
                '</h3><h3 style="width:70%">' +
                LocaleManager.getLocalizedString('Description', 'IncidentReporting.control.prompt.IncidentInjuryCategory') +
                '</h3></div>'
        }
    }
});