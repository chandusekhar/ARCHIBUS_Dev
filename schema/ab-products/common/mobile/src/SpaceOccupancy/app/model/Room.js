Ext.define('SpaceOccupancy.model.Room', {
    extend: 'Common.model.Room',
    config: {
        fields: [
            {
                name: 'survey_redline_rm',
                type: 'string'
            },
            {
                name: 'survey_redline_rm_contents',
                type: 'string',
                isSyncField: false
            }
        ]
    }
});