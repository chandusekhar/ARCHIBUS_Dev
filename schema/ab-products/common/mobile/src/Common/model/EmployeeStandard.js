Ext.define('Common.model.EmployeeStandard', {
    extend : 'Ext.data.Model',
    config : {
        fields : [ {
            name : 'id',
            type : 'int'
        }, {
            name : 'em_std',
            type : 'string'
        }, {
            name : 'description',
            type : 'string'
        }
        ]
    }
});