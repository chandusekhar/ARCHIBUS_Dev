/**
 * Domain object for Status.
 * <p>
 * 
 * @author Valery Tydykov
 * @since 21.1
 */
Ext.define('Common.model.Status', {
	extend : 'Ext.data.Model',
	config : {
		fields : [ {
			name : 'id'
		}, {
			name : 'description'
		} ]
	}
});