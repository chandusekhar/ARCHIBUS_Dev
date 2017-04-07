Ext.define('Common.model.Message', {
    extend: 'Common.data.Model',
    config: {
        fields: [
            { name: 'id', type: 'int'},
            { name: 'message_id', type: 'string'}, // guid
            { name: 'user_name', type: 'string'},
            { name: 'device_id', type: 'string'},
            { name: 'message_date', type: 'DateClass', defaultValue: new Date()},
            { name: 'message_time', type: 'TimeClass', defaultValue: new Date()},
            { name: 'message_timestamp', type: 'float'},
            { name: 'priority', type: 'IntegerClass'},
            { name: 'log_message', type: 'string'},
            { name: 'application', type: 'string'},
            { name: 'mob_is_changed', type: 'IntegerClass'},
            { name: 'mob_locked_by', type: 'string' }
        ]
    }
});