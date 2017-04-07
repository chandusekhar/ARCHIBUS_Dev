Ext.define('Common.model.ProblemDescription', {
	extend : 'Ext.data.Model',

	config : {
		fields : [ {
			name : 'id',
			type : 'int'
		}, {
			name : 'pd_id',
			type : 'string'
		}, {
			name : 'pd_description',
			type : 'string'
		} ]
	}
});
