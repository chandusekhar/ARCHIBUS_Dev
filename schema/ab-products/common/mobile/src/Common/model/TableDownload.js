Ext.define('Common.model.TableDownload', {
    extend: 'Ext.data.Model',

    config: {
        fields: [
            {name: 'id', type: 'int'},
            {name: 'storeId', type: 'string'},
            {name: 'downloadTime', type: 'date'},
            {name: 'reset', type: 'int', defaultValue: 0}
        ]
    }
});