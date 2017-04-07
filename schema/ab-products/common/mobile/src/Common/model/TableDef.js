/**
 * Domain object for TableDef persistence. The TableDef is stored as a string/JSON.
 * <p>
 * 
 * @author Valery Tydykov
 * @since 21.1
 */
Ext.define('Common.model.TableDef', {
	extend : 'Ext.data.Model',
	config : {
		fields : [ {
			name : 'id',
			type : 'int'
		}, {
			name : 'tableName',
			type : 'string'
		}, {
			name : 'tableDef',
			type : 'string'
		} ]
	}
});