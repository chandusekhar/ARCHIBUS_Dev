/**
 * Question Model class
 * @since 21.3
 */
Ext.define('Questionnaire.model.Question', {
    extend: 'Common.data.Model',

    config: {
        fields: [
            {
                name: 'id',
                type: 'int'
            },
            {
                name: 'questionnaire_id',
                type: 'string'
            },
            {
                name: 'quest_name',
                type: 'string'
            },
            {
                name: 'quest_text',
                type: 'string'
            },
            {
                name: 'is_required',
                type: 'IntegerClass'
            },
            {
                name: 'freeform_width',
                type: 'IntegerClass'
            },
            {
                name: 'enum_list',
                type: 'string'
            },
            {
                name: 'format_type',
                type: 'string'
            },
            {
                name: 'sort_order',
                type: 'IntegerClass'
            },
            {
                name: 'lookup_table',
                type: 'string'
            },
            {
                name: 'lookup_field',
                type: 'string'
            }
        ]
    }

});