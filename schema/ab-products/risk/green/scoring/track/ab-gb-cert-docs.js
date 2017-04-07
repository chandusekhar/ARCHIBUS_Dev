/**
 * @author vike
 */
var abGbUpDocController = View.createController('abGbUpDocController', {
	
	// ----------------------- properties -----------------------------
	bl_id : '',
	project_name : '',
	cert_std : '',
	
	/**
	 * retrieve corresponding field values from select row and set them to controller¡¯s variables bl_id , project_name and cert_std;
	 */
	getForein : function() {
		var grid = View.panels.get('abGbCertUpDocProjGrid');
		var num = grid.selectedRowIndex;
		var rows = grid.rows;
		var res = '1=1';
		var log = rows[num];
		var bl_id = log['gb_cert_proj.bl_id'];
		var proj = log['gb_cert_proj.project_name'];
		var cert_std = log['gb_cert_proj.cert_std'];
		this.bl_id = bl_id;
		this.project_name = proj;
		this.cert_std = cert_std;
		res = res + "and gb_cert_docs.bl_id='" + bl_id
				+ "' and gb_cert_docs.project_name='" + proj
				+ "' and gb_cert_docs.cert_std='" + cert_std + "'";
		return res;
	},

	//Process delete action
	abGbCertUpDocForm_onDelete : function() {
		
		//If new record, do nothing
		if (this.abGbCertUpDocForm.newRecord) {
			return;
		}
		
		//Else retrieve pk value and pop confirm window 
		var docDS = this.abGbCertUpDocGridDs;
		var record = this.abGbCertUpDocForm.getRecord();
		var confirmMessage = getMessage("messageConfirmDelete");
		View.confirm(confirmMessage, function(button) {
			if (button == 'yes') {
				try {
					
					//confirm to delete: delete record and refresh panels
					docDS.deleteRecord(record);
					abGbUpDocController.abGbCertUpDocForm.show(false);
					abGbUpDocController.abGbCertUpDocGrid.refresh();
				} catch (e) {
					var errMessage = getMessage("errorDelete");
					View.showMessage('error', errMessage, e.message, e.data);
					return;
				}
			}
		})
	},

	/**
	 * This event handler is called by ¡°Add New¡± button in Document grid panel. 
	 */
	abGbCertUpDocGrid_onAddNew : function() {
		// create and show a new record in Project Document edit form
		var docForm = this.abGbCertUpDocForm;
		docForm.show(true);
		docForm.newRecord = true;
		docForm.refresh();
		// fill values to proper fields of edit form with bl_id, project_name and cert_std and submitted_by
		docForm.setFieldValue("gb_cert_docs.bl_id", abGbUpDocController.bl_id);
		docForm.setFieldValue("gb_cert_docs.project_name",
				abGbUpDocController.project_name);
		docForm.setFieldValue("gb_cert_docs.cert_std",
				abGbUpDocController.cert_std);
		docForm.setFieldValue("gb_cert_docs.submitted_by", View.user.name);
	},
	abGbCertUpDocForm_onSave : function() {
		this.abGbCertUpDocForm.save();
		//call getForein function return res
		var res = abGbUpDocController.getForein();
		this.abGbCertUpDocGrid.addParameter('res', res);
		//refresh abGbCertUpDocGrid according to res and hide abGbCertUpDocForm 
		this.abGbCertUpDocGrid.refresh();
	}
});
/**
 * This event handler is called when user click any row in Rating project grid 
 */

function onSelectRatingProject() {
	//call getForein function return res
	var res = abGbUpDocController.getForein();
	//refresh abGbCertUpDocGrid according to res and hide abGbCertUpDocForm 
	abGbUpDocController.abGbCertUpDocGrid.addParameter('res', res);
	abGbUpDocController.abGbCertUpDocGrid.refresh();
	abGbUpDocController.abGbCertUpDocForm.show(false);

};

