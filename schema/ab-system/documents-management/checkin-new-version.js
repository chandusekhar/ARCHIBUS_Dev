/********************************************
checkin-new-version.js
Yong Shao
2005-02-02
*********************************************/
//initialized by checkin-new-version.xsl
var docmanager_tableName='';
var docmanager_fieldName='';
var docmanager_autoNamedFile='';
var docmanager_locked='false';
var docmanager_pkeys_values=new Array();
var docmanager_allowedDocTypes=new Array();

//////
var docFileExtension  = "";
var docmanager_description ="";
var finalUploadFileName = "";

function setUpForm()
{
	var lockedObj = document.getElementById("locked");
	var unlockedObj = document.getElementById("unlocked");

	if(docmanager_locked=="true")
	{
		lockedObj.checked=1;
		unlockedObj.checked=0;
	}else{
		lockedObj.checked=0;
		unlockedObj.checked=1;
	}



}

function processingFileNameMessage(obj)
{
	var fileName = obj.value;
	fileName = convert2validXMLValue(fileName);
	if(fileName!="")
	{
		var pos = fileName.lastIndexOf('.');
		if(pos > 0)
		{
			docFileExtension = fileName.substring(pos+1);
		}

		

                 // check if the file extension allowed
              	var isValidDoc = false;
                for(var name in docmanager_allowedDocTypes)
		{
                      // loop throught the allowed filetype list
                      // !!! file type comparison is case-insensitive
                      var docLower = docmanager_allowedDocTypes[name].toLowerCase();
                      var docExtLower = docFileExtension.toLowerCase();
                      if(docLower == docExtLower)
	                    isValidDoc = true;
		}

               // set the OK button
               var okButtonObj = document.getElementById("okButton");
               if(isValidDoc){
		       if(docmanager_autoNamedFile!="")
		       {
			       finalUploadFileName = docmanager_autoNamedFile + "." + docFileExtension;;
			       var autoFileNameObj = document.getElementById("autoFileName");
			       autoFileNameObj.innerHTML = autoFileNameObj.innerHTML + " " + finalUploadFileName;
			       autoFileNameObj.style.display="";

		       }else{
			       var posIndex = fileName.lastIndexOf('\/');
			       if(posIndex<=0){
				       posIndex = fileName.lastIndexOf('\\');
			       }
			       if(posIndex>0){
				       finalUploadFileName = fileName.substring(posIndex+1);
			       }
		       }
		       okButtonObj.disabled=0;
	       }else{
                  //if the doc type is not valid, then prompt a message then disable OK button
                  var warning_message_invalid_filetype = "";
                  var warning_message_invalid_filetype_obj = document.getElementById("invalid_file_type_message");
                  if(warning_message_invalid_filetype_obj!=null)
                  {
                  	warning_message_invalid_filetype = warning_message_invalid_filetype_obj.innerHTML;

			 //replace the [{0}] with the actual file type for the message
			warning_message_invalid_filetype = warning_message_invalid_filetype.replace("[{0}]", docFileExtension);     
                  }

                  alert(warning_message_invalid_filetype);
                  okButtonObj.disabled=1;
		}
	}
}

function onOK(strSerialized)
{
	var okButtonObj = document.getElementById("okButton");
	if(!okButtonObj.disabled)
	{
		var objHiddenForm = document.forms["afmDocManagerInputsForm"];
		var strData = "";
		var strXMLValue = "";
		//if bData is true, insert client data into xml string

		setSerializedInsertingDataVariables(strSerialized);
		//gettingRecordsData() is defined in corresponding JS file
		//which XSL is calling sendingDataFromHiddenForm
		strData = gettingRecordsData();
		if(strData != "")
			strXMLValue = strSerializedInsertingDataFirstPart + strData +  strSerializedInsertingDataRestPart;
		else
			strXMLValue = strSerialized;

		//alert(strXMLValue);

		objHiddenForm.elements["xml"].value = strXMLValue;
		objHiddenForm.target = "";
		objHiddenForm.action = "login.axvw";

		//sending the hidden form to server
		objHiddenForm.submit();
	}

}

function gettingRecordsData()
{
	var objForm = document.forms["afmDocManagerInputsForm"];
	var str_pkeys = "";
	docmanager_description = objForm.elements["description"].value;
	docmanager_description = convertMemo2validateXMLValue(docmanager_description);

	var strReturned = '';

	var docmanager_lock_status = "0";
	var lockedObj = document.getElementById("locked");
	if(lockedObj.checked)
		docmanager_lock_status = "1";

	strReturned = "<record";

	strReturned = strReturned + ' documentName="'+finalUploadFileName+'" ';
	strReturned = strReturned + ' tableName="'+docmanager_tableName+'" ';
	strReturned = strReturned + ' fieldName="'+docmanager_fieldName+'" ';
	strReturned = strReturned + ' newLockStatus="'+docmanager_lock_status+'" ';
	strReturned = strReturned + ' comments="'+docmanager_description+'" ';

	for(var name in docmanager_pkeys_values)
	{
		str_pkeys = str_pkeys + ' ' + name + '="' +docmanager_pkeys_values[name] + '" ';
	}
	strReturned = strReturned + '/><pkeys '+str_pkeys+'/>';
	strReturned  = "<userInputRecordsFlag>"+strReturned +"</userInputRecordsFlag>";
	return strReturned;
}
