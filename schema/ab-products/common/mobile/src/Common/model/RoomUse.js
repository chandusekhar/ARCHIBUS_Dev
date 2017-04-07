Ext.define('Common.model.RoomUse', {
	extend : 'Ext.data.Model',

	config : {
		fields : [ {
			name : 'id',
			type : 'int'
		}, {
			name : 'rm_use',
			type : 'string'
		}, {
			name : 'description',
			type : 'string'
		} ]
	}

});