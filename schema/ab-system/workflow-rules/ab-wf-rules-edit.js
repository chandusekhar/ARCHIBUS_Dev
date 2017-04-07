/*********************************************************************
 JavaScript File: ab-wf-rules-edit.js

 John Till
 03/28/05
 04/22/05 - YQ - make unused tabs invisible; fix the tab lines
 *********************************************************************/


var bNewForm = false;
var strDataMissing = "Some required fields have not been entered, please enter or select values for them!";


// Extract the value of an XML element
// (Located between <element> and </element> tags)
// If the element resembles <element />, "" is returned.
// Currently, this will only return the first one it finds, and more than one could result in invalid values.
// Example: <element /><element>the data</element> -- That would result in "<element>the data" being returned.
function xmlValue(sXmlText, sElementName)
{
   var iStart, iEnd;
   var sResult = "";

   iStart = sXmlText.indexOf("<" + sElementName);
   if(iStart != -1)
   {
      iEnd = sXmlText.indexOf("</" + sElementName);
      if(iEnd != -1)
      {
         iStart = sXmlText.indexOf(">", iStart)+1;
         sResult = trim(sXmlText.substring(iStart, iEnd));
      }
   }
   return sResult;
}


// Extract the value of an XML property
// (Located in the <element property="value"> string)
function xmlProperty(sXmlText, sElementName, sPropertyName)
{
   var iStart, iEnd, iProperty;
   var iQuote, iApos;
   var sResult = "";

   iStart  = sXmlText.indexOf("<" + sElementName);
   if(iStart != -1)
   {
      iEnd = sXmlText.indexOf(">", iStart);

      if(iEnd != -1)
      {
         iProperty = sXmlText.indexOf(sPropertyName, iStart);
         if((iProperty != -1) && (iProperty < iEnd))
         {
            iApos = sXmlText.indexOf("\'", iProperty);
            iQuote = sXmlText.indexOf("\"", iProperty);

            if(((iApos < iQuote) && (iApos != -1)) || (iQuote == -1))
            {
              iStart = iApos+1;
              iEnd = sXmlText.indexOf("\'", iStart);
            }
            else if(iQuote != -1)
            {
               iStart = iQuote+1;
               iEnd = sXmlText.indexOf("\"", iStart);
            }
            sResult = trim(sXmlText.substring(iStart, iEnd));
         }
      }
   }
   return sResult;
}


function repeatToggle(sFormName)
{
	var objForm = document.forms[sFormName];
	if(objForm!=null)
	{
		var bDisable = ! objForm.elements["repeatUntilEnd"].checked;
		objForm.elements["endDate"].disabled = bDisable;
		objForm.elements["endDateSValue"].disabled = bDisable;
		objForm.elements["endTime"].disabled = bDisable;

                if(bDisable)
                {
                	objForm.elements["endDate"].value = "";
			objForm.elements["endTime"].value = "";
                }
	}
}

function arbIntToggle(sFormName)
{
	var objForm = document.forms[sFormName];
	if(objForm!=null)
	{
		var bDisable = 1;
		var iCount = objForm.elements["repeatInterval"].length;
		for(i=0; i<iCount; ++i)
		{
			objRadio = objForm.elements["repeatInterval"][i];
			if (objRadio.checked && objRadio.value == "0")
				bDisable = 0;
		}
		objForm.elements["cron"].disabled = bDisable;
	}
}


// Parse through the XML values to create the tab page values.
// The rule_type and is_active values are also set by this function.
// (since they're radio buttons, they don't have a .value property
//  that can be set to the database value directly)
function setupTabPages(sFormName, bNewForm)
{
   var objForm = document.forms[sFormName];
   if(objForm!=null)
   {
      var xml_rule_props  = objForm.elements["afm_wf_rules.xml_rule_props"].value;
      var xml_sched_props = objForm.elements["afm_wf_rules.xml_sched_props"].value;

      var runOnStartup = xmlProperty(xml_sched_props, "schedule", "runOnStartup");
      if(runOnStartup == "true")
         objForm.elements["runOnStartup"].checked = 1;
      else
         objForm.elements["runOnStartup"].checked = 0;

      var startDateTime = xmlProperty(xml_sched_props, "schedule", "startTime");
      if(startDateTime != "")
      {
         objForm.elements["startDate"].value = startDateTime.split(" ")[0];
         objForm.elements["startTime"].value = startDateTime.split(" ")[1];
         validationAndConvertionDateAndTime(sFormName, "startDate", false, "JAVA.SQL.DATE");
         validationAndConvertionDateAndTime(sFormName, "startTime", true,  "JAVA.SQL.TIME");
      }
      else
      {
         objForm.elements["startDate"].value = "MM-DD-YYYY";
         objForm.elements["startTime"].value = "00:00:00";
      }

      var endDateTime = xmlProperty(xml_sched_props, "schedule", "endTime");
      if(endDateTime != "")
      {
         objForm.elements["endDate"].value = endDateTime.split(" ")[0];
         objForm.elements["endTime"].value = endDateTime.split(" ")[1];
         validationAndConvertionDateAndTime(sFormName, "endDate", false, "JAVA.SQL.DATE");
         validationAndConvertionDateAndTime(sFormName, "endTime", true,  "JAVA.SQL.TIME");
         objForm.elements["repeatUntilEnd"].checked = 1;
      }
      else
      {
         objForm.elements["endDate"].value = "MM-DD-YYYY";
         objForm.elements["endTime"].value = "00:00:00";
         objForm.elements["repeatUntilEnd"].checked = 0;
      }

      var sched_data = xmlValue(xml_sched_props, "schedule");
      var repeatCount = xmlProperty(sched_data, "simple", "repeatCount");
      var cronExpression = xmlProperty(sched_data, "cron", "expression");
      if(cronExpression != "")
      {
         objForm.elements["cron"].value = cronExpression;
         for(var i=0; i<objForm.elements["repeatInterval"].length; i++)
           if("0" == objForm.elements["repeatInterval"][i].value)
             objForm.elements["repeatInterval"][i].click();
         objForm.elements["repeatCount"].value = "-1";
      }
      else
      {
         var repeatInterval = xmlProperty(sched_data, "simple", "repeatInterval");
         if(repeatInterval == "")
            repeatInterval = "86400"; // Default to One Day
         for(var i=0; i<objForm.elements["repeatInterval"].length; i++)
           if(repeatInterval == objForm.elements["repeatInterval"][i].value)
             objForm.elements["repeatInterval"][i].click();
         var repeatCount = xmlProperty(sched_data, "simple", "repeatCount");
         if(repeatCount == "")
            repeatCount = "-1"; // Default to "Repeat Indefinitely"
         objForm.elements["repeatCount"].value = repeatCount;
         objForm.elements["cron"].value = "";
      }

      var eventHandlers = xmlValue(xml_rule_props, "eventHandlers");
      var eventHandlerClass = xmlProperty(eventHandlers, "eventHandler", "class");
      objForm.elements["eventHandlerClass"].value = eventHandlerClass;

      var eventHandlerMethod = xmlProperty(eventHandlers, "eventHandler", "method");
      objForm.elements["eventHandlerMethod"].value = eventHandlerMethod;

     var ruleDescription = xmlProperty(xml_rule_props, "xml_rule_properties", "description");
     objForm.elements["afm_wf_rules.description"].value = ruleDescription;

     var inputs = xmlValue(xml_rule_props, "inputs");
     objForm.elements["inputs"].value = inputs;


      if(rule_type == "Notification")
      {
        var notificationView = xmlProperty(inputs, "input", "value");
      	objForm.elements["notificationView"].value = notificationView;
      }

// 8/15/05 - JT
//      if(rule_type == "Message")
//        is_active = 2;

      var is_active_length = objForm.elements["afm_wf_rules.is_active"].length;
      for(var i=0; i<is_active_length; i++)
      {
        if(is_active == objForm.elements["afm_wf_rules.is_active"][i].value)
        {
          objForm.elements["afm_wf_rules.is_active"][i].disabled =  false;
	  objForm.elements["afm_wf_rules.is_active"][i].click();
        }
//        else
//          objForm.elements["afm_wf_rules.is_active"][i].disabled =  true;
      }

      if(rule_type == "Notification" || rule_type == "Scheduled")
      	objForm.elements["afm_wf_rules.is_active"][is_active_length-1].disabled =  true;

      for(var i=0; i<objForm.elements["afm_wf_rules.rule_type"].length; i++)
      {
         if(bNewForm)
         	objForm.elements["afm_wf_rules.rule_type"][i].disabled = false;

        if(rule_type == objForm.elements["afm_wf_rules.rule_type"][i].value)
         {
            objForm.elements["afm_wf_rules.rule_type"][i].click();
            tabClick(i+1); // Adding one because the first tab is Event
         }
	 else if(!bNewForm)
           objForm.elements["afm_wf_rules.rule_type"][i].disabled = true;
      }

      arbIntToggle(sFormName);
      repeatToggle(sFormName);
   }
}


// When a tab is clicked, make sure it's applicable to the selected rule type
// before switching to it.
function tabClick(iTabNumber)
{
   var objTab      = new Array(4);
   var objTabLine  = new Array(4);

   if((rule_type == "Notification") &&  (iTabNumber != 1)) return;
   if((rule_type == "Scheduled")    && ((iTabNumber == 1) || (iTabNumber == 3))) return;
   if((rule_type == "Message")      && ((iTabNumber == 1) || (iTabNumber == 2))) return;


   for(var i=0; i<4; i++)
   {
      objTab[i]     = document.getElementById("tab"+i);
      objTabLine[i] = document.getElementById("tabLine"+i);
      objTab[i].style.backgroundColor="#c0c0c0";
      objTabLine[i].style.backgroundColor="#000000";
   }

   objTab[iTabNumber].style.backgroundColor     = document.bgColor;
   objTabLine[iTabNumber].style.backgroundColor = document.bgColor;

   var objEventData        = document.getElementById("eventData");
   var objInputsData       = document.getElementById("inputsData");
   var objNotificationData = document.getElementById("notificationData");
   var objScheduleData     = document.getElementById("scheduleData");

   objEventData.style.display        = "none";
   objInputsData.style.display       = "none";
   objNotificationData.style.display = "none";
   objScheduleData.style.display     = "none";

   if(iTabNumber == 0) // Event Tab
   {
      objEventData.style.display        = "";
   }
   else if(iTabNumber == 1) // Notification Tab
   {
      objNotificationData.style.display = "";
      objScheduleData.style.display     = "";
      document.getElementById("tab0").style.display = 'none';
      document.getElementById("tab0Horizon").style.display = '';
      document.getElementById("tab0Vertical").style.display = '';
      document.getElementById("tab1").style.display = '';
      document.getElementById("tab1Horizon").style.display = 'none';
      document.getElementById("tab1Vertical").style.display = 'none';
      document.getElementById("tab2").style.display = 'none';
      document.getElementById("tab2Horizon").style.display = 'none';
      document.getElementById("tab2Vertical").style.display = 'none';
      document.getElementById("tab3").style.display = 'none';
      document.getElementById("tab3Horizon").style.display = 'none';
      document.getElementById("tab3Vertical").style.display = 'none';
      objTabLine[0].style.backgroundColor = document.bgColor;
      objTabLine[1].style.backgroundColor="#000000";
      objTabLine[2].style.backgroundColor="#000000";
      objTabLine[3].style.backgroundColor="#000000";
   }
   else if(iTabNumber == 2) // Scheduled Tab
   {
      objInputsData.style.display       = "";
      objScheduleData.style.display     = "";
      document.getElementById("tab0").style.display = '';
      document.getElementById("tab0Horizon").style.display = '';
      document.getElementById("tab0Vertical").style.display = '';
      document.getElementById("tab1").style.display = 'none';
      document.getElementById("tab1Horizon").style.display = '';
      document.getElementById("tab1Vertical").style.display = '';
      document.getElementById("tab2").style.display = '';
      document.getElementById("tab2Horizon").style.display = 'none';
      document.getElementById("tab2Vertical").style.display = 'none';
      document.getElementById("tab3").style.display = 'none';
      document.getElementById("tab3Horizon").style.display = 'none';
      document.getElementById("tab3Vertical").style.display = 'none';
      objTabLine[1].style.backgroundColor = document.bgColor;
      objTabLine[2].style.backgroundColor="#000000";
      objTabLine[3].style.backgroundColor="#000000";
   }
   else if(iTabNumber == 3) // Message Tab
   {
      objInputsData.style.display       = "";
      document.getElementById("tab0").style.display = '';
      document.getElementById("tab0Horizon").style.display = '';
      document.getElementById("tab0Vertical").style.display = '';
      document.getElementById("tab1").style.display = 'none';
      document.getElementById("tab1Horizon").style.display = '';
      document.getElementById("tab1Vertical").style.display = '';
      document.getElementById("tab2").style.display = 'none';
      document.getElementById("tab2Horizon").style.display = 'none';
      document.getElementById("tab2Vertical").style.display = 'none';
      document.getElementById("tab3").style.display = '';
      document.getElementById("tab3Horizon").style.display = 'none';
      document.getElementById("tab3Vertical").style.display = 'none';
      objTabLine[1].style.backgroundColor = document.bgColor;
      objTabLine[2].style.backgroundColor="#000000";
      objTabLine[3].style.backgroundColor="#000000";
   }

}


// When a different rule type is selected, change the selected and
// available tabs.
function ruleClick(iRule, sFormName)
{
   var objForm = document.forms[sFormName];
   var is_active_length = objForm.elements["afm_wf_rules.is_active"].length;
   if(iRule == 0) // Notification
   {
      rule_type = "Notification";
      if(is_active == 2)
        is_active = 1;
      if(objForm!=null)
      {
      	for(var i=0; i<is_active_length-1; i++)
          document.forms[sFormName].elements["afm_wf_rules.is_active"][i].disabled = false;
        document.forms[sFormName].elements["afm_wf_rules.is_active"][is_active_length-1].disabled = true;
        document.forms[sFormName].elements["afm_wf_rules.is_active"][1-is_active].click();
      }
      tabClick(1);
   }
   else if(iRule == 1) // Scheduled
   {
      rule_type = "Scheduled";
      if(is_active == 2)
        is_active = 1;
      if(objForm!=null)
      {
      	for(var i=0; i<is_active_length-1; i++)
          document.forms[sFormName].elements["afm_wf_rules.is_active"][i].disabled = false;
        document.forms[sFormName].elements["afm_wf_rules.is_active"][is_active_length-1].disabled = true;
        document.forms[sFormName].elements["afm_wf_rules.is_active"][1-is_active].click();

      }
      tabClick(2);
   }
   else if(iRule == 2) // Message
   {
      rule_type = "Message";
      tabClick(3);
// 8/15/05 - JT
//      if(is_active == "0" || is_active == "1")
//      {
//         is_active = 2;
         if(objForm!=null)
         {
            for(var i=0; i<is_active_length; i++)
//               if(is_active == objForm.elements["afm_wf_rules.is_active"][i].value)
               {
                   objForm.elements["afm_wf_rules.is_active"][i].disabled =  false;
//                   objForm.elements["afm_wf_rules.is_active"][i].click();
               }
//               else
//                  objForm.elements["afm_wf_rules.is_active"][i].disabled = true;
         }
//      }
   }
}


// When the is_active value is clicked, make sure it's valid.
// Message rules can't be inactive.
function isActiveClick(iActive, sFormName)
{
//   if((rule_type == "Message") && (iActive == "0" || iActive == "1"))
//   {
//      is_active = "2";
//      var objForm = document.forms[sFormName];
//      if(objForm!=null)
//      {
//         for(var i=0; i<objForm.elements["afm_wf_rules.is_active"].length; i++)
//            if(is_active == objForm.elements["afm_wf_rules.is_active"][i].value)
//               objForm.elements["afm_wf_rules.is_active"][i].click();
//      }
//   }
//   else if(iActive != is_active)
//   {
      is_active = iActive;
//   }
}


// Create the xml_rule_props and xml_sched_props values.
function setXmlProps(sFormName)
{
   var objForm = document.forms[sFormName];

   if(objForm == null) return;

   var xml_rule_props     = "";
   var xml_sched_props    = "";
   var repeatInterval     = "0";
   var cron               = objForm.elements["cron"].value;
   var startDate          = objForm.elements["startDate"].value;
   var startTime          = objForm.elements["startTime"].value;
   var repeatCount        = objForm.elements["repeatCount"].value;
   var endDate            = objForm.elements["endDate"].value;
   var endTime            = objForm.elements["endTime"].value;
   var runOnStartup       = "false";
   var eventHandlerClass  = objForm.elements["eventHandlerClass"].value;
   var eventHandlerMethod = objForm.elements["eventHandlerMethod"].value;
   var notificationView   = objForm.elements["notificationView"].value;
   var inputs             = objForm.elements["inputs"].value;
   var description	   = objForm.elements["afm_wf_rules.description"].value;

   var repeatUntilEnd = false;
   if(objForm.elements["repeatUntilEnd"].checked == 1)
   	repeatUntilEnd = true;


   for(var i=0; i<objForm.elements["repeatInterval"].length; i++)
      if(objForm.elements["repeatInterval"][i].checked)
         repeatInterval = objForm.elements["repeatInterval"][i].value;

   if(objForm.elements["runOnStartup"].checked == 1)
      runOnStartup = "true";

   if(startDate == "MM-DD-YYYY")
   {
      startDate = "";
      startTime = "";
   }

   if(endDate == "MM-DD-YYYY")
   {
      endDate = "";
      endTime = "";
   }

   xml_rule_props = "<xml_rule_properties description=\"" + description + "\">\r\n<eventHandlers>\r\n";
   if(rule_type == "Notification")
   {
      xml_rule_props = xml_rule_props + "<eventHandler class=\"com.archibus.eventhandler.Notify\" method=\"\">\r\n";
      xml_rule_props = xml_rule_props + "<inputs>\r\n";
      xml_rule_props = xml_rule_props + "<input name=\"view\" value=\"" + notificationView + "\"/>\r\n";
      xml_rule_props = xml_rule_props + "</inputs>\r\n";
      xml_rule_props = xml_rule_props + "</eventHandler>";
   }
   else //if((rule_type == "Scheduled") || (rule_type == "Message"))
   {
      xml_rule_props = xml_rule_props + "<eventHandler class=\"" + eventHandlerClass + "\" ";
      xml_rule_props = xml_rule_props + "method=\"" + eventHandlerMethod + "\">\r\n";
      xml_rule_props = xml_rule_props + "<inputs>\r\n";
      xml_rule_props = xml_rule_props + inputs;
      xml_rule_props = xml_rule_props + "</inputs>\r\n";
      xml_rule_props = xml_rule_props + "</eventHandler>";
   }
   xml_rule_props = xml_rule_props + "\r\n</eventHandlers>\r\n</xml_rule_properties>";

   if((rule_type == "Notification") || (rule_type == "Scheduled"))
   {
      if(startDate == "" && startTime == "")
      {
        alert("Start Date and Time can not be empty!");
        return;
      }

      if(startDate == "" && startTime == "" && repeatUntilEnd == true)
      {
        alert("End Date and Time can not be empty when you checked 'Repeat until end date and time?'!");
        return;
      }

      xml_sched_props = "<xml_schedule_properties>\r\n";
      xml_sched_props = xml_sched_props + "<schedule runOnStartup=\"" + runOnStartup + "\" ";
      xml_sched_props = xml_sched_props + "startTime=\"" + startDate + " " + startTime + "\" ";

      if(!repeatUntilEnd)
      {
        endDate = "";
        endTime = "";
      }
      else if (endDate != "")
      	endTime = "00:00:00";

      if(endDate == "" && endTime == "")
      	xml_sched_props = xml_sched_props + "endTime=\"\">\r\n";
      else
      	xml_sched_props = xml_sched_props + "endTime=\"" + endDate + " " + endTime + "\">\r\n";

      if(repeatInterval == "0")
      {
         xml_sched_props = xml_sched_props + "<cron expression=\"" + cron + "\">\r\n";
         xml_sched_props = xml_sched_props + "</cron>\r\n";
      }
      else
      {
         xml_sched_props = xml_sched_props + "<simple repeatCount=\"" + repeatCount + "\" ";
         xml_sched_props = xml_sched_props + "repeatInterval=\"" + repeatInterval + "\">\r\n";
         xml_sched_props = xml_sched_props + "</simple>\r\n";
      }
      xml_sched_props = xml_sched_props + "</schedule>\r\n";
      xml_sched_props = xml_sched_props + "</xml_schedule_properties>";
   }

   objForm.elements["afm_wf_rules.xml_rule_props"].value  = xml_rule_props;
   objForm.elements["afm_wf_rules.xml_sched_props"].value = xml_sched_props;
}


// Called when the SAVE button is clicked.
function saveData(sFormName, sSerialized, sFrame, bData)
{
   var objForm = document.forms[sFormName];

   if(objForm == null) return false;

   setXmlProps(sFormName);

   var activity_id     = convert2validXMLValue(trim(objForm.elements["afm_wf_rules.activity_id"].value));
   var rule_id         = convert2validXMLValue(trim(objForm.elements["afm_wf_rules.rule_id"].value));
   var group_name      = convert2validXMLValue(trim(objForm.elements["afm_wf_rules.group_name"].value));
   var xml_rule_props  = convertMemo2validateXMLValue(trim(objForm.elements["afm_wf_rules.xml_rule_props"].value));
   var xml_sched_props = convertMemo2validateXMLValue(trim(objForm.elements["afm_wf_rules.xml_sched_props"].value));

   if(activity_id == "")
   {
      alert("Primary Activity field can not be empty!");
      return false;
   }

   if(rule_id == "")
   {
      alert("Rule Name field can not be empty!");
      return false;
   }

    if(group_name == "")
   {
      alert("Security Group field can not be empty!");
      return false;
   }

   var strXMLSQLTransaction = '<afmAction type="render" state="ab-wf-rules-edit.axvw" response="true">';
   strXMLSQLTransaction = strXMLSQLTransaction + '<restrictions><restriction type="sql"';
   strXMLSQLTransaction = strXMLSQLTransaction + ' sql="activity_id=\''+activity_id+'\'';
   strXMLSQLTransaction = strXMLSQLTransaction + ' AND rule_id=\''+rule_id+'\'"/>';
   strXMLSQLTransaction = strXMLSQLTransaction + '</restrictions></afmAction>';

   if(bNewForm == false)
   {
      if((activity_id != orig_activity_id) || (rule_id != orig_rule_id))
      {
         strXMLSQLTransaction = strXMLSQLTransaction + '<transaction><command type="delete">';
         strXMLSQLTransaction = strXMLSQLTransaction + '<record afm_wf_rules.activity_id="'+orig_activity_id+'" ';
         strXMLSQLTransaction = strXMLSQLTransaction + 'afm_wf_rules.rule_id="'+orig_rule_id+'"/>';
         strXMLSQLTransaction = strXMLSQLTransaction + '</command>';
         strXMLSQLTransaction = strXMLSQLTransaction + '<command type="insert">';
      }
      else
      {
         strXMLSQLTransaction = strXMLSQLTransaction + '<transaction><command type="update">';
      }
   }
   else
   {
      strXMLSQLTransaction = strXMLSQLTransaction + '<transaction><command type="insert">';
   }

   strXMLSQLTransaction = strXMLSQLTransaction + '<record ';
   strXMLSQLTransaction = strXMLSQLTransaction + 'afm_wf_rules.activity_id="'+activity_id+'" ';
   strXMLSQLTransaction = strXMLSQLTransaction + 'afm_wf_rules.rule_id="'+rule_id+'" ';
   strXMLSQLTransaction = strXMLSQLTransaction + 'afm_wf_rules.group_name="'+group_name+'" ';
   strXMLSQLTransaction = strXMLSQLTransaction + 'afm_wf_rules.is_active="'+is_active+'" ';
   strXMLSQLTransaction = strXMLSQLTransaction + 'afm_wf_rules.rule_type="'+rule_type+'" ';
   strXMLSQLTransaction = strXMLSQLTransaction + 'afm_wf_rules.xml_rule_props="'+xml_rule_props+'" ';
   strXMLSQLTransaction = strXMLSQLTransaction + 'afm_wf_rules.xml_sched_props="'+xml_sched_props+'" ';
   strXMLSQLTransaction = strXMLSQLTransaction + '/></command></transaction>';
   strXMLSQLTransaction = '<userInputRecordsFlag>'+strXMLSQLTransaction+'</userInputRecordsFlag>';

//   sendingDataFromHiddenForm('',strXMLSQLTransaction, sFrame, '',false,'');
   sendingAfmActionRequestWithClientDataXMLString2Server(sFrame, sSerialized, strXMLSQLTransaction);

   return bData;
}


// Called when the Add New button is clicked
function clearForm(sFormName)
{
   var objForm = document.forms[sFormName];
   if(objForm!=null)
   {
      is_active="1";
      rule_type="Notification";

      objForm.elements["afm_wf_rules.activity_id"].value     = "";
      objForm.elements["afm_wf_rules.rule_id"].value         = "";
      objForm.elements["afm_wf_rules.description"].value     = "";
      objForm.elements["afm_wf_rules.group_name"].value      = "";
      objForm.elements["afm_wf_rules.xml_rule_props"].value  = "";
      objForm.elements["afm_wf_rules.xml_sched_props"].value = "";

      setupTabPages(sFormName, true);
      bNewForm = true;
   }
}


// Called when the Cancel button is clicked
function cancelForm(sFrame)
{
   var strXMLSQLTransaction = '<afmAction type="render" state="ab-wf-rules-edit.axvw" response="true">';
   strXMLSQLTransaction = strXMLSQLTransaction + '<userInputRecordsFlag><restrictions><restriction type="sql"';
   strXMLSQLTransaction = strXMLSQLTransaction + ' sql="activity_id=\''+orig_activity_id+'\'';
   strXMLSQLTransaction = strXMLSQLTransaction + ' AND rule_id=\''+orig_rule_id+'\'"/>';
   strXMLSQLTransaction = strXMLSQLTransaction + '</restrictions></userInputRecordsFlag></afmAction>';
   sendingDataFromHiddenForm('',strXMLSQLTransaction, sFrame, '',false,'');
}


//delete action
function onDelete(sFormName,sSerialized,sFrame,bData)
{
   var objForm = document.forms[sFormName];

   if(objForm == null) return false;

   setXmlProps(sFormName);

   var strXMLSQLTransaction = '<afmAction type="render" state="ab-wf-rules-edit.axvw" response="true">';
   strXMLSQLTransaction = strXMLSQLTransaction + '<restrictions><restriction type="sql"';
   strXMLSQLTransaction = strXMLSQLTransaction + ' sql="activity_id=\''+orig_activity_id+'\'';
   strXMLSQLTransaction = strXMLSQLTransaction + ' AND rule_id=\''+orig_rule_id+'\'"/>';
   strXMLSQLTransaction = strXMLSQLTransaction + '</restrictions></afmAction>';

   strXMLSQLTransaction = strXMLSQLTransaction + '<transaction><command type="delete">';
   strXMLSQLTransaction = strXMLSQLTransaction + '<record afm_wf_rules.activity_id="'+orig_activity_id+'" ';
   strXMLSQLTransaction = strXMLSQLTransaction + 'afm_wf_rules.rule_id="'+orig_rule_id+'"/>';
   strXMLSQLTransaction = strXMLSQLTransaction + '</command></transaction>';
   strXMLSQLTransaction = '<userInputRecordsFlag>'+strXMLSQLTransaction+'</userInputRecordsFlag>';

   sendingAfmActionRequestWithClientDataXMLString2Server(sFrame, sSerialized, strXMLSQLTransaction);

   return bData;
}


// Called when the Run This Rule button is clicked
function runThisRule(sFormName, sSerialized, sFrame, bData)
{
   var objForm = document.forms[sFormName];
   if(objForm == null) return false;
   var activity_id = objForm.elements["afm_wf_rules.activity_id"].value;
   var rule_id = objForm.elements["afm_wf_rules.rule_id"].value;
   if(rule_id == "")
   {
     alert("Rule Name field can not be empty!");
     return false;
   }
   rule_id = activity_id+"-"+rule_id;
   
   var client_side_data = '<userInputRecordsFlag><record ruleKey="'+convert2validXMLValue(rule_id)+'"/></userInputRecordsFlag>'
   sendingAfmActionRequestWithClientDataXMLString2Server(sFrame, sSerialized, client_side_data);
}


 
// Called when the Reload Scheduler button is clicked
function reloadScheduler(sFormName, sSerialized, sFrame, bData)
{
   sendingAfmActionRequestWithClientDataXMLString2Server(sFrame, sSerialized, '');
}


var selectedValueInputFormName   = afmInputsFormName;
var selectValueInputFieldID      = "";
var bSelectValueLookup = true;


// Called for the ellipses in the top part of the form (above the tabs)
// Those are the only values that come directly from database fields.
function onSelectV(strSerialized, strField, formName)
{
   var strXMLData = "";
   var objForm  = document.forms[formName];
   var selectedFieldObj = objForm.elements[strField];
   if(selectedFieldObj != null)
   {
      //setSerializedInsertingDataVariables() in common.js
      setSerializedInsertingDataVariables(strSerialized);
      var typeUpperCase = arrFieldsInformation[strField]["type"];
      typeUpperCase = typeUpperCase.toUpperCase();
      var formatUpperCase = arrFieldsInformation[strField]["format"];
      formatUpperCase = formatUpperCase.toUpperCase();
      var strValue = selectedFieldObj.value;
      //removing money sign and grouping separator and changing date into ISO format
      strValue = convertFieldValueIntoValidFormat(typeUpperCase, formatUpperCase, strValue);
      //trim strValue
      strValue = trim(strValue);
      //changing some special characters into valid characters in xml
      //convert2validXMLValue() in common.js
      strValue = convert2validXMLValue(strValue);
      var strData = "";
      var strXMLValue = "";
      if(strSerialized != "")
      {
         var temp_table = "";
         var temp_field = "";
         var temp_array = new Array();
         temp_array = strField.split(".");
         if(temp_array[0] != null)
            temp_table = temp_array[0];
         if(temp_array[1] != null)
            temp_field = temp_array[1];
         strData = '<fields><field ';
         strData = strData + 'table="'+temp_table+'" name="'+temp_field+'"/></fields>';
         strData = strData + '<userInputRecordsFlag>' + gettingRecordsData(objForm) + '</userInputRecordsFlag>';
         strXMLValue = strSerializedInsertingDataFirstPart + strData +  strSerializedInsertingDataRestPart;
         //calling OpenSelectVWindow() to open a new window for server
         //to show available values for specified field
         OpenSelectVWindow(strXMLValue);
      }
      else
      {
         if(Debug)
         {
            alert("The attribute serialized of afmAction is empty.");
         }
      }
   }
}


function gettingRecordsData(objForm)
{
   var strReturned = "";
   return strReturned;
}




// Used to select a calendar date.  Normally this wouldn't be necessary, but the values aren't
// coming directly from a database field.  They're being extracted from the XML values.
function selectNonDBValue(sFormName, sFieldName)
{
   var selectValueWindowName     = "selectValueWindow";
   var selectValueWindowSettings = "toolbar=no,menubar=no,resizable=yes,scrollbars=yes,status=yes,width=500,height=600";
   var selectValueWindow         = window.open("", selectValueWindowName,selectValueWindowSettings);

   selectValueInputFieldID = sFieldName;

   var strXMLSQLTransaction = '<afmAction type="render" state="ab-wf-rules-edit-dates.axvw" response="true"/>';
   sendingDataFromHiddenForm('',strXMLSQLTransaction, selectValueWindowName, '',false,'');
}


// Validate and convert the date and time values.
// Since the times we want include seconds, the standard converter won't do.
function validationAndConvertionDateAndTime(sFormName, fieldName, bPagedLoaded, type)
{
   var objForm = document.forms[sFormName];
   //var strField = objForm.elements[fieldName].value;
   var objValue = objForm.elements[fieldName];
   if(objValue.value != "")
   {
      var typeUpperCase = type.toUpperCase();
      var bRequired  = false;//arrFieldsInformation[fieldName]["required"];
      var field_value = objValue.value;
      if(typeUpperCase == "JAVA.SQL.DATE")
      {
         //since initially sever sends date in ISO format
         //"YYY-MM-DD"
         var dateArrayObj = new Array();
         if(bPagedLoaded && field_value != null && field_value != "")
            dateArrayObj = field_value.split("-");
         else
            dateArrayObj = null;
         validationAndConvertionDateInput(objValue, fieldName, dateArrayObj,bRequired, false, true);
         {
            field_value = objValue.value;
            var year  = field_value.split("/")[2];
            var month = field_value.split("/")[0];
            var day   = field_value.split("/")[1];
            if(month.length == 1) month = "0" + month;
            if(day.length   == 1) day   = "0" + day;
            var newValue =  month + "-" + day + "-" + year;
            objValue.value = newValue;
         }
      }
      else if(typeUpperCase == "JAVA.SQL.TIME")
      {
         //since initially sever sends time in the format "HH:MM"
         var TimeArrayObj = new Array();
         if(bPagedLoaded && field_value != null && field_value != "")
            TimeArrayObj = field_value.split(":");
         else
            TimeArrayObj = null;
//         validationAndConvertionTimeInput(objValue, fieldName, TimeArrayObj,bRequired, false, true);
//         None of the cases are designed for "HH:MM:SS"

         var hr,min,sec;
         if(TimeArrayObj != null)
         {
            if(TimeArrayObj.length == 3)      { hr =TimeArrayObj[0]; min=TimeArrayObj[1]; sec=TimeArrayObj[2]; }
            else if(TimeArrayObj.length == 2) { hr =TimeArrayObj[0]; min=TimeArrayObj[1]; sec="00";            }
            else if(TimeArrayObj.length > 3)  { hr =TimeArrayObj[0]; min=TimeArrayObj[1]; sec=TimeArrayObj[2]; }
            else                              { hr ="00";            min="00";            sec="00";            }
         }
         else                                 { hr ="00";            min="00";            sec="00";            }

         // Format the Hours
         if(hr.length != 2)
         {
            if(hr.length == 1)
            {
               if((hr < "0") || (hr > "9"))   hr = "00";
               else                           hr = "0"+hr;
            }
            else if(hr.length > 2)            hr = "00";
         }
         else if((hr < "00") || (hr > "23"))  hr = "00";

         // Format the Minutes
         if(min.length != 2)
         {
            if(min.length == 1)
            {
               if((min < "0") || (min > "9"))  min = "00";
               else                            min = "0"+min;
            }
            else if(min.length > 2)            min = "00";
         }
         else if((min < "00") || (min > "59")) min = "00";

         // Format the Seconds
         if(sec.length != 2)
         {
            if(sec.length == 1)
            {
               if((sec < "0") || (sec > "9"))  sec = "00";
               else                            sec = "0"+sec;
            }
            else if(sec.length > 2)            sec = "00";
         }
         else if((sec < "00") || (sec > "59")) sec = "00";

         var newTime = hr+":"+min+":"+sec;
         if(newTime != field_value)
            objValue.value = newTime;
      }
   }
}
