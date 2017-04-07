/**
 * Keven.xi
 * 02/07/2010
 */
var controller = View.createController('abEmEpUpdateStatus', {
	
	/**
	 * called when view onload,initial the employee list panel
	 */
	afterInitialDataFetch:function(){
		this.onStart();
	},
	
	/**
	 * 
	 */
	onStart:function(){
		var restriction = new Ab.view.Restriction();
        if (this.abEqStatusUpdate_gr_fl.rows.length > 0) {
            var firstFlRow = this.abEqStatusUpdate_gr_fl.rows[0];
            restriction.addClause("eq.bl_id", firstFlRow["fl.bl_id"], "=");
			restriction.addClause("eq.fl_id", firstFlRow["fl.fl_id"], "=");
            this.abEqStatusUpdate_gr_eq.refresh(restriction);
        }
        else {
        	restriction.addClause("eq.bl_id", "", "=");
			restriction.addClause("eq.fl_id", "", "=");
            this.abEqStatusUpdate_gr_eq.refresh(restriction);
        }
	},
	/**
	 * called when user the refresh button in floor panel
	 */
	abEqStatusUpdate_gr_fl_onRefresh:function(){
		var restriction = new Ab.view.Restriction();
		this.abEqStatusUpdate_gr_fl.refresh(restriction);
		this.onStart();
	},
	
	//Add title after delete
	updateEqStatusForm_onDelete:function(){
		this.showInformationInForm(controller,this.updateEqStatusForm,getMessage("deleteRecord"));
	},
	
	/**
     * show message in the top row of this form
     * @param {string} message
     */
    showInformationInForm: function(controller, panel, message){
        var messageCell = panel.getMessageCell();
        messageCell.dom.innerHTML = "";
        
        var messageElement = Ext.DomHelper.append(messageCell, '<p>' + message + '</p>', true);
        messageElement.addClass('formMessage');
        messageElement.setVisible(true, {
            duration: 1
        });
        messageElement.setHeight(20, {
            duration: 1
        });
        if (message) {
            panel.dismissMessage.defer(3000, controller, [messageElement]);
        }
    },
	
	/**
	 * refresh the editing form
	 */
	abEqStatusUpdate_gr_eq_afterRefresh:function(){
        var restriction = new Ab.view.Restriction();
        if (this.abEqStatusUpdate_gr_eq.rows.length > 0) {
			var firstRmRow = this.abEqStatusUpdate_gr_eq.rows[0];
			this.abEqStatusUpdate_gr_eq.selectedRowIndex = 0;
			restriction.addClause("eq.eq_id", firstRmRow["eq.eq_id"], "=");
			this.updateEqStatusForm.refresh(restriction,false);
		}
	},
	/**
	 * 
	 */
	updateEqStatusForm_afterRefresh:function(){
		if (this.updateEqStatusForm.newRecord){
			this.updateEqStatusForm.actions.get("delete").forceDisable(true);
			this.updateEqStatusForm.actions.get("addNew").forceDisable(true);
		}else{
			this.updateEqStatusForm.actions.get("delete").enable(true);
			this.updateEqStatusForm.actions.get("addNew").enable(true);
		}
		this.setEditPanelTitle(this.updateEqStatusForm.newRecord);
	},
	/**
	 * called when user click add new button
	 */
	updateEqStatusForm_onAddNew:function(){
		var restriction = new Ab.view.Restriction();
		var eqGrid = this.abEqStatusUpdate_gr_eq;
		var selectedRow = eqGrid.rows[eqGrid.selectedRowIndex];
		restriction.addClause("eq.bl_id", selectedRow["eq.bl_id"], "=");
		restriction.addClause("eq.fl_id", selectedRow["eq.fl_id"], "=");
		restriction.addClause("eq.rm_id", selectedRow["eq.rm_id"], "=");
		this.updateEqStatusForm.refresh(restriction,true,true);
	},
	/**
	 * called when user click cancel button
	 */
	updateEqStatusForm_onCancel:function(){
		if (this.updateEqStatusForm.newRecord){
			if (this.abEqStatusUpdate_gr_eq.selectedRowIndex >=0 ){
				onClickEquipment();
			}else{
				//do nothing
			}
		}else{
				onClickEquipment();
		}
	},
	/**
	 * set Edit form title
	 * @param {Object} newRecord
	 */
	setEditPanelTitle:function(newRecord){
		if (newRecord){
			this.updateEqStatusForm.setTitle(getMessage("addNewPanelTitle"));
		}else{
			this.updateEqStatusForm.setTitle(getMessage("editPanelTitle"));
		}
	}
    
});

/**
 * called when user select floor
 */
function onClickFloor(){
    var flGrid = View.panels.get("abEqStatusUpdate_gr_fl");
    var selectedRow = flGrid.rows[flGrid.selectedRowIndex];
	
    var restriction = new Ab.view.Restriction();
    restriction.addClause("eq.bl_id", selectedRow["fl.bl_id"], "=");
	restriction.addClause("eq.fl_id", selectedRow["fl.fl_id"], "=");
	
	var eqGrid = View.panels.get("abEqStatusUpdate_gr_eq");
    eqGrid.refresh(restriction);
	var eqForm = View.panels.get("updateEqStatusForm");
    eqForm.refresh(restriction);
}

function onClickEquipment(){
	var eqGrid = View.panels.get("abEqStatusUpdate_gr_eq");
    var selectedRow = eqGrid.rows[eqGrid.selectedRowIndex];
	
    var restriction = new Ab.view.Restriction();
    restriction.addClause("eq.eq_id", selectedRow["eq.eq_id"], "=");
	
	var updateEqStatusForm = View.panels.get("updateEqStatusForm");
    updateEqStatusForm.refresh(restriction,false);
}

