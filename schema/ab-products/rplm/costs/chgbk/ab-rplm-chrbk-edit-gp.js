var defineGroupsController = View.createController('defineGroupsCtrl', {
    gridEditGroups_onRefresh: function(){
        this.gridEditGroups.refresh();
    },
    formEditGroup_onSaveGroup: function(){
        if (this.formEditGroup.save()) {
            this.gridEditGroups.refresh();
            this.formEditGroup.show(false);
        }
    },
    formEditGroup_onCancelGroup: function(){
        this.formEditGroup.show(false);
    },
    formEditGroup_onDeleteGroup: function(){
        var controller = this;
        View.confirm(getMessage('confirm_delete_group'), function(button){
            if (button == 'yes') {
                controller.formEditGroup.deleteRecord();
                controller.formEditGroup.show(false);
                controller.gridEditGroups.refresh();
            }
            else 
                this.close();
        })
    }
});

function editGroup(row){
    var gp_id = row['gp.gp_id'];
    defineGroupsController.formEditGroup.refresh(' gp.gp_id = \'' + gp_id + '\'');
}

function enableFormGroupButton(enableSave, enableDelete, enableCancel){
    defineGroupsController.formEditGroup.enableButton('saveGroup', enableSave);
    defineGroupsController.formEditGroup.enableButton('deleteGroup', enableDelete);
    defineGroupsController.formEditGroup.enableButton('cancelGroup', enableCancel);
}
