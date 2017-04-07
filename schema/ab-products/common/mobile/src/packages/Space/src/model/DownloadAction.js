Ext.define('Space.model.DownloadAction', {
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
                name: 'text',
                type: 'string'
            }
        ]
    }
});