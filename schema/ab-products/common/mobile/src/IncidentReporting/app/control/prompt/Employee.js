Ext.define('IncidentReporting.control.prompt.Employee', {

    extend: 'Common.control.prompt.Employee',

    xtype: 'incidentEmployeePrompt',

    config: {
        displayTemplate: {
            phone: '<div class="prompt-list-hbox"><div style="width:100%"><h1>{em_id}</h1></div></div>' +
                '<div class="prompt-list-hbox"><div style="width:40%"><h3>{name_first}</h3></div><div style="width:60%"><h3>{name_last}</h3></div></div>' +
                '<div class="prompt-list-hbox"><div style="width:40%"><h3>{bl_id}</h3></div><div style="width:30%"><h3>{fl_id}</h3></div><div style="width:30%"><h3>{rm_id}</h3></div></div>',
            tablet: '<div class="prompt-list-hbox"><div style="width:40%"><h1>{em_id}</h1></div><div style="width:30%"><h1>{name_first}</h1></div><div style="width:30%"><h1>{name_last}</h1></div></div>' +
                '<div class="prompt-list-hbox"><div style="width:40%"><h3>{bl_id}</h3></div><div style="width:30%"><h3>{fl_id}</h3></div><div style="width:30%"><h3>{rm_id}</h3></div></div>' +
                '<div class="prompt-list-hbox"><div style="width:40%"><h3>{dv_id}</h3></div><div style="width:60%"><h3>{dp_id}</h3></div></div>'
        },
        headerTemplate: {
            phone: '<div></div>',
            tablet: '<div></div>'
        }
    }
});
