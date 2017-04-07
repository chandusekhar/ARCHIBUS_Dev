/* UC-PAGE-SECURITY.JS
 * 
 * Contains the functions for restricting the fields of a panel based on
 * settings in the database uc_wc_security table.
 *
 * The applyFieldSecurityCustom handler is called for each field after the
 * main processing.  Override this function for any view specific field handling.
 *
 */

// Set up a UC javascript namespace
var UC = UC ? UC : new Object();

UC.FieldSecurity = {

	/* Retrieves an array with all the dis-allowed fields for the specified role
	 * and database table.
	 */
	applyFieldSecurity: function(form, table_name, role_name)
	{
		var userRole;
		
		// get the user's role if not supplied
		if (role_name == undefined || role_name == null) {
			userRole = View.user.role;
		}
		else {
			userRole = role_name;
		}
		
		var disallowedFields = this.getDisallowedFields(userRole, table_name);

		// Loop through all the fields in the panel and get the disallowed fields
		// to readonly.
		var dfLength = disallowedFields.length;

		for (i = 0; i < dfLength; i++) {
			var field_name = table_name + "." + disallowedFields[i]['uc_wc_security.field_name'];
			form.enableField(field_name, false);
			
			// run any custom handlers
			this.applyFieldSecurityCustom(form, field_name, false);
		}
	},


	/* Retrieves an array with all the dis-allowed fields for the specified role
	 * and database table.
	 */
	getDisallowedFields: function(role_name, table_name)
	{
		var records = null;
		var restriction = "allow = 'N' AND role_name = '"+this.replaceSingleQuote(role_name)+
			"' AND table_name = '"+this.replaceSingleQuote(table_name)+"'";

		var parameters = {
			tableName: 'uc_wc_security',
			fieldNames: toJSON(['table_name','field_name']),
			restriction: toJSON(restriction)
		};
				
		try {
			var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
			if (result != null) {
				records = result.data.records;
			}
		}
		catch (e) {
				Workflow.handleError(e);
		}

		return records;
	},

	/* Replaces single quotes with double single quotes for sql text strings.
	 */
	replaceSingleQuote: function(val) {		
		if(val != null)
			return val.replace(/'/g, "''");
		else
			return null;
	},
	
	/* Override this function to provide custom field security handling.
	 */
	applyFieldSecurityCustom: function(form, field_name, allow) {
	}
}