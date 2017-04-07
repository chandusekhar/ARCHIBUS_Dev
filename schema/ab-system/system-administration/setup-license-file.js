/********************************************
setup-license-file.js
Ying Qin
2007-02-02
*********************************************/

function validateIntegerField(value)
{
	var objForm = document.forms["afmHiddenForm"];
	var tempObj = objForm.elements["afm_scmpref.cluster_num_servers"];
        var bReturned = true;

        var value	= tempObj.value;
	value = trim(value);
	var  warning_message_invalid_input = "";
	if(value != "")
	{
		var warning_message_invalid_input_obj = document.getElementById("general_invalid_input_warning_message_integer");
		if(warning_message_invalid_input_obj!=null)
			warning_message_invalid_input = warning_message_invalid_input_obj.innerHTML;;

		var objRegExp  = /^-?\d+$/;
		if(!objRegExp.test(value))
		{
			bReturned = false;
                        objForm.elements["afm_scmpref.cluster_num_servers"].value = value;
		}
	}

	if(!bReturned)
	{
          alert(warning_message_invalid_input);
	  if(!moziallFireFoxBrowser)
	  tempObj.focus();
        }

      return bReturned;
}


function checkinLicense( value, sSerialized)
{
  if(!validateIntegerField(value))
    return false;

  var objForm = document.forms["afmHiddenForm"];
  if(objForm!=null)
  {
    var numOfClusters = convert2validXMLValue(trim(objForm.elements["afm_scmpref.cluster_num_servers"].value));

    if((numOfClusters != ""))
    {
      var axvwFile="setup-license-file.axvw";
      var objFrame = "_self";

      // ****************************************
      // CALLING RULE TO MODIFY PROG_BUDGET_ITEMS
      // ****************************************
      var strXMLSQLTransaction = "";
      strXMLSQLTransaction = strXMLSQLTransaction + '<userInputRecordsFlag><record ';
      strXMLSQLTransaction = strXMLSQLTransaction + 'numberOfServersInCluster="' + numOfClusters + '"/></userInputRecordsFlag>';

      setSerializedInsertingDataVariables(sSerialized);
      strXMLSQLTransaction = strSerializedInsertingDataFirstPart + strXMLSQLTransaction + strSerializedInsertingDataRestPart;

      //alert(strXMLSQLTransaction);
      sendingDataFromHiddenForm('',strXMLSQLTransaction, objFrame, '',false,'');
    }
  }

  return false;
}
