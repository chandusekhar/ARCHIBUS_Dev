//Modifications:
// 2010/08/11 - JJYCHAN - ISSUE 241: Changed all emails referring to workspace@ucalgary.ca to afm@ucalgary.ca
// 2010/12/22 - EWONG - ISSUE 369: Enabled "Add Assignment" button.

function user_form_onload()
{
	//alert (View.user.name + "/" + View.user.role);
	var grid = View.getControl('', 'assign_grid');
	if (View.user.role == "UC-SOUTHCAMPUS-RO") {
		grid.actions.get('addEmployee').enable(false);
	}

    grid.afterCreateCellContent = function(row, col, cellElement) {

        if (col.id == 'uc_rm_em_assign.is_occupant') {
            var value = row['uc_rm_em_assign.is_occupant.raw'];
            switch (value) {
            case '0':
                cellElement.innerHTML = "";
                break;
            default:
                break;
            }
        }
        else if(col.id == 'uc_rm_em_assign.is_owner') {
            var value = row['uc_rm_em_assign.is_owner.raw'];
            switch (value) {
            case '0':
                cellElement.innerHTML = "";
                break;
            default:
                break;
            }
        }
        else if (col.id == 'uc_rm_em_assign.is_emergency_contact') {
            var value = row['uc_rm_em_assign.is_emergency_contact.raw'];
            switch (value) {
            case '0':
                cellElement.innerHTML = "";
                break;
            default:
                break;
            }
        }
    };
}

function eMailError()
{
  var rm_id = getInputValue('rm.rm_id');
  var fl_id = getInputValue('rm.fl_id');
  var bl_id = getInputValue('rm.bl_id');

  var rmErrorDescription = "Room Error Reported: " + bl_id + "/" + fl_id + "/" + rm_id;
  var rmErrorSubject = "Room Error Reported: " + bl_id + "/" + fl_id + "/" + rm_id;



  var parameters = {
  	Subject: rmErrorSubject,
  	SendTo: "afm@ucalgary.ca ",
  	emailBody: rmErrorDescription
  };
  try {
    result = Workflow.call("AbCommonResources-uc_testEmail", parameters);
  }
  catch (e) {
    Workflow.handleError(e);
  }

  alert("Message Sent!");
  var editPanel = View.getView("rm_form");
	editPanel.closeDialog();
}


function openEmDetails(row) {
	//var navform = View.getControl('', 'nav_search');
	//var restriction = navform.getFieldRestriction();

	//var form = View.getControl('', 'nav_details_info');
	var emp_id = row['em.em_id'];

	restriction = {'em.em_id':row['em.em_id']};
	View.openDialog('uc-sc-editEmployee-popup.axvw', restriction, false, parameters={
        maximize:true,
        closeButton:false,

        afterViewLoad: function(dialogView) {
            dialogView.panels.get('assign_form').refresh(
                {'uc_rm_em_assign.em_id':row['em.em_id'], 'uc_rm_em_assign.bl_id':row['uc_rm_em_assign.bl_id']
                , 'uc_rm_em_assign.fl_id':row['uc_rm_em_assign.fl_id'], 'uc_rm_em_assign.rm_id':row['uc_rm_em_assign.rm_id']}
            );
        }
    });

}

function deleteAssignment(row) {
	var test = row['uc_rm_em_assign.em_id'];
	//alert(test);
	//msgbox(test);
	this.remove();
}

