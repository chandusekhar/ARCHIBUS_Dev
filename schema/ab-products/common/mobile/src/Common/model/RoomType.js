Ext.define('Common.model.RoomType', {
	extend : 'Ext.data.Model',

	config : {
		fields : [ {
			name : 'id',
			type : 'int'
		}, {
			name : 'rm_cat',
			type : 'string'
		}, {
			name : 'rm_type',
			type : 'string'
		}, {
			name : 'description',
			type : 'string'
		} ]
	}
});