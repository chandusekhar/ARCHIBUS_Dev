Ext.define('Common.model.IncidentInjuryCategory', {
    extend : 'Ext.data.Model',
    config : {
        fields : [ {
            name : 'id',
            type : 'int'
        }, {
            name : 'injury_category_id',
            type : 'string'
        }, {
            name : 'description',
            type : 'string'
        }
        ]
    }
});