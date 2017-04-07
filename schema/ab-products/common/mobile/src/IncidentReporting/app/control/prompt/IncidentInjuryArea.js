Ext.define('IncidentReporting.control.prompt.IncidentInjuryArea', {

    extend: 'Common.control.field.Prompt',

    xtype: 'incidentInjuryAreaPrompt',

    config: {
        name: 'injury_area_id',
        label: LocaleManager.getLocalizedString('Injury Area',
            'IncidentReporting.control.prompt.IncidentInjuryArea'),
        title: LocaleManager.getLocalizedString('Injury Areas',
            'IncidentReporting.control.prompt.IncidentInjuryArea'),
        store: 'incidentInjuryAreasStore',
        displayFields: [
            {
                name: 'injury_area_id',
                title: LocaleManager.getLocalizedString('Injury Area',
                    'IncidentReporting.control.prompt.IncidentInjuryArea')

            },
            {
                name: 'description',
                title: LocaleManager.getLocalizedString('Description',
                    'IncidentReporting.control.prompt.IncidentInjuryArea')
            }
        ],
        displayTemplate: {
            phone: '<div class="x-phone-prompt"><span class="prompt-label">' +
                LocaleManager.getLocalizedString('Injury Area:', 'IncidentReporting.control.prompt.IncidentInjuryArea') +
                '</span><span class="prompt-code-value">{injury_area_id}</span></div>' +
                '<div class="x-phone-prompt"><span class="prompt-label">' +
                LocaleManager.getLocalizedString('Description:', 'IncidentReporting.control.prompt.IncidentInjuryArea') +
                '</span><span>{description}</span></div>',
            tablet: '<div class="prompt-list-hbox"><div style="width:30%">{injury_area_id}</div>' +
                '<div style="width:70%">{description}</div></div>'
        },
        headerTemplate: {
            phone: '<div></div>',
            tablet: '<div class="prompt-list-label"><h3 style="width:30%">' +
                LocaleManager.getLocalizedString('Injury Area', 'IncidentReporting.control.prompt.IncidentInjuryArea') +
                '</h3><h3 style="width:70%">' +
                LocaleManager.getLocalizedString('Description', 'IncidentReporting.control.prompt.IncidentInjuryArea') +
                '</h3></div>'
        }
    }
});