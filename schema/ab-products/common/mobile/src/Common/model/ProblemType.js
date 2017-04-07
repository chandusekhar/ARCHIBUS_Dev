Ext.define('Common.model.ProblemType', {
    extend: 'Ext.data.Model',

    config: {
        fields: [
            {
                name: 'id',
                type: 'int'
            },
            {
                name: 'prob_type',
                type: 'string'
            },
            {
                name: 'hierarchy_ids',
                type: 'string'
            },
            {
                name: 'description',
                type: 'string'
            }
        ]
    }

});