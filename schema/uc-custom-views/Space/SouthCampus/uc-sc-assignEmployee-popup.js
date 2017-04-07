var assignEmployeePopup =  View.createController("assignEmployeePopup",{
    assign_form_afterRefresh: function() {
        //alert(this.assign_form.getFieldValue('uc_rm_em_assign.rm_id'));
        if (this.assign_form.getFieldValue('uc_rm_em_assign.primary_rm') == 'YES') {
            if (document.getElementById('chkBoxPrimaryRoom')) {
                document.getElementById('chkBoxPrimaryRoom').checked = true;
            }
        }

        if (this.assign_form.getFieldValue('uc_rm_em_assign.is_occupant') == 1) {
            if (document.getElementById('chkBoxIsOccupant')) {
                document.getElementById('chkBoxIsOccupant').checked = true;
            }
        }

        if (this.assign_form.getFieldValue('uc_rm_em_assign.is_owner') == 1) {
            if (document.getElementById('chkBoxIsOwner')) {
                document.getElementById('chkBoxIsOwner').checked = true;
            }
        }

        if (this.assign_form.getFieldValue('uc_rm_em_assign.is_emergency_contact') == 1) {
            if (document.getElementById('chkBoxIsEmerContact')) {
                document.getElementById('chkBoxIsEmerContact').checked = true;
            }
        }
    }
});

// *****************************************************************************
// on save, refresh the assignment list
// *****************************************************************************
function saveAssignEmployee()
{
	// refresh Grid (done here so we can pass in the restriction)
	View.getControl('', 'assign_grid').refresh();
}

function selectValueEm()
{
	var restriction = "len(uc_d_person_ps.person_eid) > 0";
    //var restriction = null;

	View.selectValue(
        'assign_form',
		'Select Employee',
		['uc_rm_em_assign.em_id'],
		'uc_d_person_ps',
		['uc_d_person_ps.person_eid'],
		['uc_d_person_ps.person_eid','uc_d_person_ps.person_last_name','uc_d_person_ps.person_first_name','uc_d_person_ps.person_campus_phone','uc_d_person_ps.person_campus_email','uc_d_person_ps.emplid'],
		restriction,
		'afterSelectEm',
		true,
		false,
		'',
		1000,
		500);
}

function afterSelectEm(fieldName, selectedValue, previousValue) {
	// Obtain full uc_d_person_ps record
	var psEmRecord = UC.Data.getDataRecord('uc_d_person_ps', ['person_eid','person_last_name','person_first_name','person_campus_phone','person_campus_email','emplid'], "person_eid='"+selectedValue.replace(/'/g,"''")+"'");

	var emId = psEmRecord['uc_d_person_ps.person_eid']['n'].toUpperCase();

	// Check if it already exists in the em table.
	var emRecord = UC.Data.getDataRecord('em', ['em_id'], "em_id='"+emId.replace(/'/g, "''")+"'");
	if (emRecord == null) {
		// em record not exist, insert into em
        var newRec = new Ab.data.Record();
        newRec.isNew = true;
        newRec.setValue('em.em_id', psEmRecord['uc_d_person_ps.person_eid']['n'].toUpperCase());
        newRec.setValue('em.email', psEmRecord['uc_d_person_ps.person_campus_email']['n']);
        newRec.setValue('em.name_last', psEmRecord['uc_d_person_ps.person_last_name']['n']);
        newRec.setValue('em.name_first', psEmRecord['uc_d_person_ps.person_first_name']['n']);
        newRec.setValue('em.phone', psEmRecord['uc_d_person_ps.person_campus_phone']['n']);
        newRec.setValue('em.em_number', psEmRecord['uc_d_person_ps.emplid']['n']);
        View.dataSources.get('emSaveDs').saveRecord(newRec);
	}

    View.panels.get('assign_form').setFieldValue(fieldName, emId);
	return false;	// already updated the input box with corrected eid.
}

function checkBoxUpdated(chkBoxId) {
    var form = View.panels.get('assign_form');

    var checked = document.getElementById(chkBoxId).checked;

    var newValue = '0';
    if (checked) {
        newValue = '1';
    }

    var field_name;
    switch (chkBoxId) {
    case 'chkBoxPrimaryRoom':
        field_name = 'uc_rm_em_assign.primary_rm';
        if (newValue == '0') {
            newValue = 'NO';
        }
        else {
            newValue = 'YES';
        }

        break;
    case 'chkBoxIsOccupant':
        field_name = 'uc_rm_em_assign.is_occupant';
        break;
    case 'chkBoxIsOwner':
        field_name = 'uc_rm_em_assign.is_owner';
        break;
    case 'chkBoxIsEmerContact':
        field_name = 'uc_rm_em_assign.is_emergency_contact';
        break;
    };

    form.setFieldValue(field_name, newValue);
}