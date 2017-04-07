
// ************************************************************************
// Checks the Account Code (through PHP) and call the saveFormCallback function
// if successful.  Valid Account codes are automatically inserted into the
// ac table.
// ************************************************************************
function checkAcctAndSave()
{
	//check to see if the ac_id entered is null
	var parsed_ac_id = $('ac_id_part1').value +
				$('ac_id_part2').value +
				$('ac_id_part3').value +
				$('ac_id_part4').value +
				$('ac_id_part5').value +
				$('ac_id_part6').value +
				$('ac_id_part7').value +
				$('ac_id_part8').value;
	parsed_ac_id.replace(" ", "");

	//if parsed is null then save form directly
	if (parsed_ac_id=="") {
		saveFormCallback("");
	}
	else {
		// check account code through php
		uc_psAccountCode(
			$('ac_id_part1').value,
			$('ac_id_part2').value,
			$('ac_id_part3').value,
			$('ac_id_part4').value,
			$('ac_id_part5').value,
			$('ac_id_part6').value,
			$('ac_id_part7').value,
			$('ac_id_part8').value,
			'saveFormCallback');
	}
}

function saveFormCallback(acct)
{
	var success = false;
	var ac_id=acct.replace("\r\n\r\n", "");

	//check to see if the ac_id entered is null
	var parsed_ac_id = $('ac_id_part1').value +
				$('ac_id_part2').value +
				$('ac_id_part3').value +
				$('ac_id_part4').value +
				$('ac_id_part5').value +
				$('ac_id_part6').value +
				$('ac_id_part7').value +
				$('ac_id_part8').value;
	parsed_ac_id.replace(" ", "");

	//if parsed is not null, ensure that the returned ac_id isn't blank.
	if (parsed_ac_id != "" && ac_id == "") {
		ac_id = "0";
	}

	switch(ac_id)
	{
	case "1":
		View.showMessage(getMessage('error_Account1'));
		success = false;
		break;
	case "2":
		View.showMessage(getMessage('error_Account2'));
		success = false;
		break;
	case "3":
		View.showMessage(getMessage('error_Account3'));
		success = false;
		break;
	case "4":
		View.showMessage(getMessage('error_Account4'));
		success = false;
		break;
	case "5":
		View.showMessage(getMessage('error_Account5'));
		success = false;
		break;
	case "6":
		View.showMessage(getMessage('error_Account6'));
		success = false;
		break;
	case "7":
		View.showMessage(getMessage('error_Account7'));
		success = false;
		break;
	case "8":
		View.showMessage(getMessage('error_Account8'));
		success = false;
		break;
	case "99":
		View.showMessage(getMessage('error_Account99'));
		success = false;
		break;
	case "0":
		View.showMessage(getMessage('error_invalidAccount'));
		success = false;
		break;
	default:
		success = true;
	};

	// Set the valid account code
	if (success) {
        // Set ac_id
        window.opener.AFM.view.View.getControl(window.opener, 'detailsPanel').setFieldValue('project.ac_id', ac_id);
	}
}

function loadAcctCode(acct) {
	var position = 0;
	var mark = acct.indexOf('-', position);
	var bu = acct.substring(position, mark);
	//fund
	position=mark+1;
	mark=acct.indexOf('-',mark+1);
	var fund= acct.substring(position, mark);
	//dept
	position=mark+1;
	mark=acct.indexOf('-',mark+1);
	var dept= acct.substring(position, mark);
	//account
	position=mark+1;
	mark=acct.indexOf('-',mark+1);
	var account= acct.substring(position, mark);
	//program
	position=mark+1;
	mark=acct.indexOf('-',mark+1);
	var program= acct.substring(position, mark);
	//internal
	position=mark+1;
	mark=acct.indexOf('-',mark+1);
	var internal= acct.substring(position, mark);
	//project
	position=mark+1;
	mark=acct.indexOf('-',mark+1);
	var project= acct.substring(position, mark);
	//affiliate
	position=mark+1;
	//mark=acct.indexOf('-',mark+1);
	var affiliate= acct.substring(position);

	$('ac_id_part1').value = bu;
	$('ac_id_part2').value = fund;
	$('ac_id_part3').value = dept;
	$('ac_id_part4').value = account;
	$('ac_id_part5').value = program;
	$('ac_id_part6').value = internal;
	$('ac_id_part7').value = project;
	$('ac_id_part8').value = affiliate;
}