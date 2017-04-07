Ext.define('Questionnaire.model.Questionnaire', {
    extend: 'Common.data.Model',

    config: {
        fields: [
            {name: 'id', type: 'int'},
            {name: 'table_name', type: 'string'},
            {name: 'field_name', type: 'string'},
            {name: 'title', type: 'string'},
            {name: 'description', type: 'string'},
            {name: 'questionnaire_id', type: 'string'}
        ]
    }

});