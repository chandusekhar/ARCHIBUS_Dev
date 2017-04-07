Ext.define('Solutions.model.Marker', {
	extend: 'Common.data.Model',

    config: {
        fields: [
            {name: 'auto_number',     type: 'int'},
            {name: 'origin',          type: 'string'},
            {name: 'redline_type',    type: 'string'},
            {name: 'redlines',        type: 'string'},
            {name: 'dwg_name',        type: 'string'},
            {name: 'position_lux',    type: 'float'},
            {name: 'position_luy',    type: 'float'},
            {name: 'position_rlx',    type: 'float'},
            {name: 'position_rly',    type: 'float'},
            {name: 'rotation',        type: 'float'},
            {name: 'layer_name',      type: 'string'},
            {name: 'mob_is_changed',  type: 'IntegerClass', defaultValue: 0}
        ]
    }
});



