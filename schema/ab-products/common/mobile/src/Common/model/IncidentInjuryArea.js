Ext.define('Common.model.IncidentInjuryArea', {
    extend : 'Ext.data.Model',
    config : {
        fields : [ {
            name : 'id',
            type : 'int'
        }, {
            name : 'injury_area_id',
            type : 'string'
        }, {
            name : 'description',
            type : 'string'
        }
        ]
    }
});