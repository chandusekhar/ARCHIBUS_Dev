Ext.define('Maintenance.model.ProblemResolution', {
    extend: 'Ext.data.Model',

    config: {
        fields: [
            {
                name: 'id',
                type: 'int'
            },
            {
                name: 'pr_id',
                type: 'string'
            },
            {
                name: 'pr_description',
                type: 'string'
            }
        ]
    }
});