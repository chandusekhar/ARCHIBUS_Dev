/*********************************************************************
 JavaScript File: ab-eq-locate-edit-asset.js

 John Till
 3/9/05
 10/6/06 CK Fixed setUpBLFLRM to refer to the selected_building,
 selected_floor and selected_room variables to correctly set the
 default room ID value when adding new assets.
 Added setUpSelectedBLFLRM to be used to preserve the current room ID
 in case the user assigns an asset to another room.  Having the
 current room allows us to refresh correctly the assets for that room.
 10/12/06 CK Added statements to the TCAssetDelete function to
 set the delete_warning_message variable that is used by the std
 OnDelete function.
*********************************************************************/


function setUpBLFLRM()
{
	var objForm = document.forms[0];
	if(objForm!=null)
	{
		if(opener!=null)
		{
			if(opener.assetTable!=null && opener.assetTable!="")
			{
				if(opener.selected_building!=null && opener.selected_building!="")
					objForm.elements[opener.assetTable+".bl_id"].value=opener.selected_building;
				if(opener.selected_floor!=null && opener.selected_floor!="")
					objForm.elements[opener.assetTable+".fl_id"].value=opener.selected_floor;
				if(opener.selected_room!=null && opener.selected_room!="")
					objForm.elements[opener.assetTable+".rm_id"].value=opener.selected_room;
			}
      		}
	}
	warning_message = document.getElementById("general_warning_message_empty_required_fields").innerHTML;
}


function setUpSelectedBLFLRM()
{
	var objForm = document.forms[0];
	if(objForm!=null)
	{
		if(opener!=null)
		{
			objForm.elements["Selectedbl_id"].value=opener.selected_building;
			objForm.elements["Selectedfl_id"].value=opener.selected_floor;
			objForm.elements["Selectedrm_id"].value=opener.selected_room;

		}
	}
	warning_message = document.getElementById("general_warning_message_empty_required_fields").innerHTML;
}


function TCAssetDelete(strTableGroup, strSerialized, strFrame, bBool)
{
	var delete_warning_message_object = document.getElementById("general_delete_warning_message_empty_required_fields");
	if(delete_warning_message_object!=null)
		delete_warning_message = delete_warning_message_object.innerHTML;
	var bResponse = onDelete(strTableGroup, strSerialized, strFrame, bBool);

	return bResponse;
}


function TCAssetSave(strTableGroup, strSerialized, strFrame, bBool)
{
	var bResponse = onSave(strTableGroup, strSerialized, strFrame, bBool);

	return bResponse;
}


function TCAssetAddNew(strTableGroup, strSerialized, strFrame, bBool)
{
	var bResponse = onAddNew(strTableGroup, strSerialized, strFrame, bBool);

	return bResponse;
}


