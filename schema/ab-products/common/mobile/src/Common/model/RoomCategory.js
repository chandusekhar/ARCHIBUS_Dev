Ext.define('Common.model.RoomCategory', {
	extend : 'Ext.data.Model',

	config : {
		fields : [ {
			name : 'id',
			type : 'int'
		}, {
			name : 'rm_cat',
			type : 'string'
		}, {
			name : 'description',
			type : 'string'
		} ]
	}
});
