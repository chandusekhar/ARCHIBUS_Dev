Ext.define('Maintenance.model.manager.WorkRequestBuildingForMap', {
    extend: 'Common.data.Model',

    config: {
        fields: [
            {name: 'wr_id',type: 'int'},
            {name: 'bl_id', type: 'string'},
            {name: 'lon', type: 'float'},
            {name: 'lat', type: 'float'}
        ]
    }
});
