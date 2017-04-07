/**
 * Domain object for Cause.
 * <p>
 * 
 * @author Valery Tydykov
 * @since 21.1
 */
Ext.define('Common.model.Cause', {
	extend : 'Ext.data.Model',
	config : {
		fields : [ {
			name : 'id',
			type : 'int'
		}, {
			name : 'cause_type',
			type : 'string'
		}, {
			name : 'description',
			type : 'string'
		} ]
	}
});