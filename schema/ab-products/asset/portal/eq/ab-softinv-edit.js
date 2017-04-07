/**
 * @author Cristina Moldovan
 * 10.29.2009
 */

/**
 * ab-softinv-edit.axvw's controller
 */
var abSoftinvEditCtrl = View.createController('abSoftinvEditCtrl',{
	panel_abSoftinvEdit_details_onDelete: function(){
		var controller = this;
		var dataSource = this.ds_abSoftinvEdit_details;
		var record = this.panel_abSoftinvEdit_details.getRecord();
        var confirmMessage = getMessage("confirmDelete").replace('{0}', record.getValue("softinv.soft_id"));
		
        View.confirm(confirmMessage, function(button){
            if (button == 'yes') {
                try {
                    dataSource.deleteRecord(record);
                } 
                catch (e) {
                    var errMessage = getMessage("errorDelete").replace('{0}', record.getValue("softinv.soft_id"));
                    View.showMessage('error', errMessage, e.message, e.data);
                    return;
                }
                controller.panel_abSoftinvEdit_details.show(false);
                controller.panel_abSoftinvEdit.refresh();
            }
        })
	}
});
