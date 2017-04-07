Ext.define('Common.model.Property', {
	extend : 'Ext.data.Model',
	config : {
		fields : [ {
			name : 'id',
			type : 'int'
		}, {
			name : 'pr_id',
			type : 'string'
		}, {
			name : 'name',
			type : 'string'
		},
		{
			name : 'site_id',
			type : 'string'
		}]
	}
});