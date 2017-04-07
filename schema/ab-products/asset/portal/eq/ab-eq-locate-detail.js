/*********************************************************************
 JavaScript File: ab-eq-locate-detail.js

 John Till
 3/9/05
 *********************************************************************/


var bl_id, fl_id, rm_id, assetTable;


function addTCAsset(assetType)
{
  assetTable = assetType;

  bl_id = getCookie("ab_eq_locate_bl_id_cookie");
  fl_id = getCookie("ab_eq_locate_fl_id_cookie");
  rm_id = getCookie("ab_eq_locate_rm_id_cookie");

//	var strURLLink = "ab-eq-locate-add-"+assetType+".axvw";
//	var newWindow = openNewContent(strURLLink, "");
//	if (newWindow) newWindow.focus();
  	var strURLLink = null;
  	if(assetType === "em"){
  		strURLLink = "ab-eq-locate-add-em.axvw?handler=com.archibus.config.ActionHandlerDrawing&em_id=NEWASSET";
  	} else if (assetType === "eq") {
  		strURLLink = "ab-eq-locate-add-eq.axvw?handler=com.archibus.config.ActionHandlerDrawing&eq_id=NEWASSET";
  	} else if (assetType === "fp") {
  		strURLLink = "ab-eq-locate-add-fp.axvw?handler=com.archibus.config.ActionHandlerDrawing&fp_id=NEWASSET";
  	} else if (assetType === "jk") {
  		strURLLink = "ab-eq-locate-add-jk.axvw?handler=com.archibus.config.ActionHandlerDrawing&jk_id=NEWASSET";
  	} else if (assetType === "pb") {
  		strURLLink = "ab-eq-locate-add-pb.axvw?handler=com.archibus.config.ActionHandlerDrawing&pb_id=NEWASSET";
  	} else if (assetType === "pn") {
  		strURLLink = "ab-eq-locate-add-pn.axvw?handler=com.archibus.config.ActionHandlerDrawing&pn_id=NEWASSET";
  	}

  	var newWindow = openNewContent(strURLLink, "");
	if (newWindow) newWindow.focus();
}


function editTCAsset(fieldName, fieldValue)
{
	var assetType  = fieldName.split(".")[0];
	if(assetType != "rm")
	{
		var strURLLink = null;
	  	if(assetType === "em"){
	  		strURLLink = "ab-eq-locate-edit-em.axvw?handler=com.archibus.config.ActionHandlerDrawing&"+fieldName+"="+fieldValue;
	  	} else if (assetType === "eq") {
	  		strURLLink = "ab-eq-locate-edit-eq.axvw?handler=com.archibus.config.ActionHandlerDrawing&"+fieldName+"="+fieldValue;
	  	} else if (assetType === "fp") {
	  		strURLLink = "ab-eq-locate-edit-fp.axvw?handler=com.archibus.config.ActionHandlerDrawing&"+fieldName+"="+fieldValue;
	  	} else if (assetType === "jk") {
	  		strURLLink = "ab-eq-locate-edit-jk.axvw?handler=com.archibus.config.ActionHandlerDrawing&"+fieldName+"="+fieldValue;
	  	} else if (assetType === "pb") {
	  		strURLLink = "ab-eq-locate-edit-pb.axvw?handler=com.archibus.config.ActionHandlerDrawing&"+fieldName+"="+fieldValue;
	  	} else if (assetType === "pn") {
	  		strURLLink = "ab-eq-locate-edit-pn.axvw?handler=com.archibus.config.ActionHandlerDrawing&"+fieldName+"="+fieldValue;
	  	}
		
		var newWindow = openNewContent(strURLLink, "");
		if (newWindow) newWindow.focus();
	}
}
