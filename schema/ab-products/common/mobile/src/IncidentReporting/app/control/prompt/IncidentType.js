Ext.define('IncidentReporting.control.prompt.IncidentType', {

    extend: 'Common.control.field.Prompt',

    xtype: 'incidentTypePrompt',

    config: {
        name: 'incident_type',
        label: LocaleManager.getLocalizedString('Incident Type',
            'IncidentReporting.control.prompt.IncidentType'),
        title: LocaleManager.getLocalizedString('Incident Types',
            'IncidentReporting.control.prompt.IncidentType'),
        store: 'incidentTypesStore',
        displayFields: [
            {
                name: 'incident_type',
                title: LocaleManager.getLocalizedString('Incident Type',
                    'IncidentReporting.control.prompt.IncidentType')

            },
            {
                name: 'description',
                title: LocaleManager.getLocalizedString('Description',
                    'IncidentReporting.control.prompt.IncidentType')
            }
        ],
        displayTemplate: {
            phone: '<div class="x-phone-prompt"><span class="prompt-label">' +
                LocaleManager.getLocalizedString('Injury Type:', 'IncidentReporting.control.prompt.IncidentType') +
                '</span><span class="prompt-code-value">{incident_type}</span></div>' +
                '<div class="x-phone-prompt"><span class="prompt-label">' +
                LocaleManager.getLocalizedString('Description:', 'IncidentReporting.control.prompt.IncidentType') +
                '</span><span>{description}</span></div>',
            tablet: '<div class="prompt-list-hbox"><div style="width:40%">{incident_type}</div><div style="width:60%">{description}</div></div>'
        },
        headerTemplate: {
            phone: '<div></div>',
            tablet: '<div class="prompt-list-label"><h3 style="width:40%">'
                + LocaleManager.getLocalizedString('Incident Type', 'IncidentReporting.view.General')
                + '</h3><h3 style="width:60%">'
                + LocaleManager.getLocalizedString('Description', 'IncidentReporting.view.General')
                + '</h3></div>'
        }
    }
});