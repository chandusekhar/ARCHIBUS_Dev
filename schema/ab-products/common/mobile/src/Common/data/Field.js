/**
 * Add properties to the Ext.data.Field object.
 * 
 * @author Jeff Martin
 * @since 21.1
 */
Ext.define('Common.data.Field', {
	extend : 'Ext.data.Field',

	config : {

		/**
		 * @cfg {Boolean} isSyncField Indicates if the field should be included in the data sent to the Web Central server. When the
		 *      value is true the field is included in the data. This property is used in the
		 *      {@link Common.store.sync.SyncStore#convertRecordsForServer} function.
		 * 
		 * This field allows fields to be defined that exist only in the mobile database. Fields where the isSyncField property
         * is true are not synced to the server side database table.
		 * database.
         * @accessor
		 */
		isSyncField : true,

		/**
		 * @cfg {Boolean} isDocumentField Used to identify mobile database document fields. This property is analogous to the ARCHIBUS
		 *      Document type. Mobile database fields that correspond to ARCHIBUS Document fields should have this value
		 *      set to true.
		 * 
		 * When this value is true the synchronization service expects to see an associated '_contents' field. The
		 * document synchronization method relies on a naming convention for the fields involved in the document sync.
		 * 
		 * For transaction table syncs each mobile document field should have an associated '_contents' and '_isnew'
		 * field.
		 * 
		 * Example: The doc1 field in the wr_sync table also has a doc1_contents and doc1_isnew field associated with
		 * it.
         * @accessor
		 */
		isDocumentField : false,


		isFloorplanField: false
	}
});