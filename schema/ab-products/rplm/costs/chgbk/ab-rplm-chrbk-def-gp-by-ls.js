var defineGroupsController = View.createController('defineGroupsCtrl', {
    ls_id: null,
    afterInitialDataFetch: function(){
        enableFormGroupButton(false , false, false);
    },
    gridLeases_onRefresh: function(){
        this.gridLeases.refresh();
    },
    gridGroups_onAddNew: function(){
        if (this.ls_id == null) {
            View.showMessage(getMessage('err_no_lease_selected'));
        }
        else {
            this.formGroup.refresh('', true);
            this.formGroup.setFieldValue('gp.ls_id', this.ls_id);
            enableFormGroupButton(true, false, true);
        }
    },
    gridGroups_onRefresh: function(){
        this.gridGroups.refresh();
    },
    formGroup_onSaveGroup: function(){
        if (this.ls_id == null) {
            View.showMessage(getMessage('err_save'));
        }
        else{ 
            if (this.formGroup.save()) {
            	this.gridGroups.refresh();
                this.formGroup.addParameter('customRestriction', ' and gp.gp_id = null');
            	this.formGroup.restriction = null; 
                this.formGroup.show(false);
            }
        }
    },
    formGroup_onCancelGroup: function(){
    	this.formGroup.show(false);
    },
    formGroup_onDeleteGroup: function(){
        var controller = this;
        View.confirm(getMessage('confirm_delete_group'), function(button){
            if (button == 'yes') {
                controller.formGroup.deleteRecord();
                controller.formGroup.show(false);
                controller.gridGroups.refresh();
            }
            else 
                this.close();
        })
    }
});

function loadGroupsByLeases(row){
    var ls_id = row['ls.ls_id'];
    defineGroupsController.ls_id = ls_id;
    defineGroupsController.gridGroups.addParameter('customRestriction', ' and gp.ls_id = \'' + ls_id + '\'');
    defineGroupsController.gridGroups.refresh();
    defineGroupsController.formGroup.show(false);
}

function editGroup(row){
    var gp_id = row['gp.gp_id'];
    defineGroupsController.formGroup.addParameter('customRestriction', ' and gp.gp_id = \'' + gp_id + '\'');
    defineGroupsController.formGroup.newRecord = false;
	defineGroupsController.formGroup.refresh();
}

function enableFormGroupButton(enableSave, enableDelete, enableCancel){
    defineGroupsController.formGroup.enableButton('saveGroup', enableSave);
    defineGroupsController.formGroup.enableButton('deleteGroup', enableDelete);
    defineGroupsController.formGroup.enableButton('cancelGroup', enableCancel);
}
