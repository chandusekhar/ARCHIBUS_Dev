Ext.define('Floorplan.model.Drawing', {
    extend:'Common.data.Model',

    config: {
        fields: [
            { name: 'id', type: 'int' },
            { name: 'blId', type: 'string' },
            { name: 'flId', type: 'string'},
            { name: 'planType', type: 'string'},
            { name: 'data', type: 'string'},
            { name: 'fileName', type: 'string'},
            { name: 'publishDate', type: 'DateClass'}
        ]
    }
});