Ext.define('Maintenance.model.manager.WorkRequestAction', {
    extend: 'Common.data.Model',

    config: {
        fields: [
            {
                name: 'id',
                type: 'int'
            },
            {
                name: 'action',
                type: 'string'
            },
            {
                name: 'step_action',
                type: 'boolean',
                defaultValue: false
            },
            {
                name: 'step',
                type: 'string',
                defaultValue: ''
            },
            {
                name: 'text',
                type: 'string'
            },
            {
                name: 'badge_value',
                type: 'int',
                defaultValue: '0'
            }
        ]
    }
});