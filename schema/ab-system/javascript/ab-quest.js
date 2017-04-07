/*********************************************************************
 JavaScript File: ab-quest.js
 Contains the javascript functions to manage questionnaires.

 John Till
 4/21/05
 11/13/06 CK Added a check for the size of the questionnaire results
 to the SetAnswers function
 02/20/07 CK Updated the if statement that checks the size of 
 the questionnaire field.
*********************************************************************/


var questAnswers = {};
var arrPKList    = new Array();
var arrPKValue   = new Array();
var bEditForm, bReadOnlyQuestions;
var bLoadedSelectLists = false;


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


// setAnswers creates the XML data field based on the current answers in
// the HTML form.  It works for multiple data fields, but it should be
// noted that the same data fields must be grouped together, or they'll
// lose data (by having it be overwritten when the data field is created
// the next time.)
// For example, if you're using 2 questionnaire data fields, mo.mo_quest
// and mo.mo_quest2, all of the mo.mo_quest questions need to be grouped
// together, and all of the mo.mo_quest2 questions as well.  This
// grouping can be handled by the AXVW.
function setAnswers(sFormName)
{
   var objForm = document.forms[sFormName];
   if(objForm == null) return;

   var xmlField = "";
   var xmlData = "";
   var currentQuestionnaireID = "";
   var currentXmlField = "";

   var questionnaireID, questionName, answerField;

   iQuestionNo = 1;
   question = objForm.elements["question1.xml_field"];
   while(question != null)
   {
      xmlField = question.value;
      if(xmlField != currentXmlField)
      {
         if(xmlData != "")
         {
            xmlData = xmlData + "</questionnaire>\r\n";
            objForm.elements[currentXmlField].value = xmlData;
            xmlData = "";
         }
         currentXmlField = xmlField;
      }
      questionnaireID = convert2validXMLValue(trim(objForm.elements["question"+iQuestionNo+".questionnaire_id"].value));
      questionName    = convert2validXMLValue(trim(objForm.elements["question"+iQuestionNo+".quest_name"].value));
      answerField     = convert2validXMLValue(trim(objForm.elements["question"+iQuestionNo+".answer_field"].value));

      if(questionnaireID != currentQuestionnaireID)
      {
         if(xmlData != "")
            xmlData = xmlData + "</questionnaire>\r\n";
         xmlData = xmlData + "<questionnaire questionnaire_id=\"" + questionnaireID + "\">\r\n";
         currentQuestionnaireID = questionnaireID;
      }

      xmlData = xmlData + "  <question quest_name=\"" + questionName + "\"";
      xmlData = xmlData + " value=\"" + answerField + "\"/>\r\n";

      iQuestionNo += 1;
      question = objForm.elements["question"+iQuestionNo+".xml_field"];
   }

   if(xmlData != "")
      xmlData = xmlData + "</questionnaire>\r\n";

   if(currentXmlField != "" && objForm.elements[currentXmlField] != null)
   {
      var maxsize = arrFieldsInformation[currentXmlField]["size"];
      maxsize = parseInt(maxsize);
      var actualsize = xmlData.length;
      if(actualsize > maxsize)
      {
	   alert("The questionnaire data exceeds the questionnaire results field size.  The data cannot be saved unless the field size is expanded.");
	   return;
      }
   }

   if(currentXmlField != "" && objForm.elements[currentXmlField] != null)
      objForm.elements[currentXmlField].value = xmlData;
}


// getAnswers runs through the XML data and stores the answers to the
// questions in a JavaScript array named questAnswers.
function getAnswers(sXmlData)
{
   sXmlData = sXmlData.replace(/\'\'/g, '"');
   
   var iStart, iEnd;
   var sProperties, sName, sValue;

   iStart = sXmlData.indexOf("<question ");
   while(iStart != -1)
   {
      iEnd                = sXmlData.indexOf(">", iStart);
      sProperties         = sXmlData.substring(iStart, iEnd+1);
      sName               = xmlProperty(sProperties, "question", "quest_name");
      sValue              = xmlProperty(sProperties, "question", "value");
      questAnswers[sName] = sValue;
      sXmlData            = sXmlData.substring(iEnd+1);
      iStart              = sXmlData.indexOf("<question ");
   }
}


// setupQuestions is called from onload.  This function hides the XML question data
// field, sets up the enumerated lists in the dropdown selection fields, and then
// populates the current answers from the the XML question data, which was stored
// in a JavaScript array by the getAnswers function.
function setupQuestions(sFormName)
{
   var objForm = document.forms[sFormName];
   if(objForm == null) return;

   if(bEditForm != null)
      if(bEditForm == false)
      {
         setupAnswers(sFormName);
         return;
      }

   if(bReadOnlyQuestions != null)
      if(bReadOnlyQuestions == true)
      {
         setupAnswers(sFormName);
         return;
      }

   var formatType, answerField, enumList, splitList, optionData, objSelect, question;
   var currentXmlField, objXmlTitle, objXmlData, readOnly;
   var iQuestionNo, iLoop, iLoopItems;

   currentXmlField = "";
   iQuestionNo = 1;
   question = objForm.elements["question1.xml_field"];
   while(question != null)
   {
      xmlField = question.value;
      if(xmlField != currentXmlField)
      {
         // Hide the XML Data Field
         objXmlTitle = document.getElementById("span_"+xmlField+"_title");
         objXmlData  = document.getElementById("span_"+xmlField+"_data");
         if(objXmlTitle != null) objXmlTitle.style.display = "none";
         if(objXmlData  != null) objXmlData.style.display  = "none";
         getAnswers(objForm.elements[xmlField].value);
         currentXmlField = xmlField;
      }

      readOnly    = objForm.elements["question"+iQuestionNo+".readonly"].value;
      formatType  = objForm.elements["question"+iQuestionNo+".format_type"].value;
      if((formatType == "Enum") && (readOnly != "true") && (bLoadedSelectLists == false))
      {
         // Set up the enumerated field lists
         enumList   = objForm.elements["question"+iQuestionNo+".enum_list"].value;
         splitList  = new Array();
         splitList  = enumList.split(";");
         iLoopItems = splitList.length/2 - splitList.length%2;
         for(iLoop=0; iLoop < iLoopItems; iLoop++)
         {
            optionData = new Option(splitList[iLoop*2+1], splitList[iLoop*2]);
            objSelect  = objForm.elements["question"+iQuestionNo+".answer_field"];
            objSelect.options[objSelect.options.length] = optionData;
            //alert("adding option - display="+splitList[iLoop*2+1]+" value="+splitList[iLoop*2]);
         }
      }

      questionName = objForm.elements["question"+iQuestionNo+".quest_name"].value;
      if(questAnswers[questionName] != null)
      {
         objForm.elements["question"+iQuestionNo+".answer_field"].value = questAnswers[questionName];
         if(readOnly == "true")
         {
            if(formatType != "Enum")
               document.getElementById("question"+iQuestionNo+".answer_readonly").innerHTML = questAnswers[questionName];
            else
            {
               enumList   = objForm.elements["question"+iQuestionNo+".enum_list"].value;
               splitList  = new Array();
               splitList  = enumList.split(";");
               iLoopItems = splitList.length/2 - splitList.length%2;
               for(iLoop=0; iLoop < iLoopItems; iLoop++)
                  if(splitList[iLoop*2] == questAnswers[questionName])
                     document.getElementById("question"+iQuestionNo+".answer_readonly").innerHTML = splitList[iLoop*2+1];
            }
         }
      }

      iQuestionNo += 1;
      question = objForm.elements["question"+iQuestionNo+".xml_field"];
   }
   bLoadedSelectLists = true;
}


// onQuestAddNew is a customized version of onAddNew, found in edit-forms.js
// The main purpose behind this customization is to ensure that the same
// AXVW file is reloaded.  By default, only the first afmTableGroup is
// returned, dropping the questionnaire data.
function onQuestAddNew(sFormName, sSerialized, sFrame, bData)
{
   if(axvwFile != "")
   {
      var sFile = axvwFile + "?handler=com.archibus.config.ActionHandlerDrawing";
      for(var iLoop=0; iLoop<arrPKList.length; iLoop++)
         sFile = sFile + "&" + arrPKList[iLoop] + "=-1";
      document.location = sFile;
   }
   else
      return onAddNew(sFormName, sSerialized, sFrame, bData);
}


// onQuestSave is a customized version of onSave, found in edit-forms.js
// The main purpose behind this customization is to ensure that the same
// AXVW file is reloaded.  By default, only the first afmTableGroup is
// returned, dropping the questionnaire data.
function onQuestSave(sFormName, sSerialized, sFrame, bData)
{
   setAnswers(sFormName);
   checkPKs(sFormName);

   var bResult = onSave(sFormName, sSerialized, sFrame, bData);

   if(bResult == true) // Save Successful
   {
      performActions(sFormName);

      if(axvwFile != "")
      {
         var sFile = axvwFile + "?handler=com.archibus.config.ActionHandlerDrawing";
         for(var iLoop=0; iLoop<arrPKList.length; iLoop++)
            sFile = sFile + "&" + arrPKList[iLoop] + "=" + escape(arrPKValue[iLoop]);
         wait(500);
         document.location = sFile;
      }
      else
         return bResult;
   }
   else
      return bResult;
}


// onQuestCancel is a customized version of onCancel, found in edit-forms.js
// The main purpose behind this customization is to ensure that the same
// AXVW file is reloaded.  By default, only the first afmTableGroup is
// returned, dropping the questionnaire data.
function onQuestCancel(sFormName, sSerialized, sFrame, bData)
{
   if(axvwFile != "")
   {
      var sFile = axvwFile + "?handler=com.archibus.config.ActionHandlerDrawing";
      for(var iLoop=0; iLoop<arrPKList.length; iLoop++)
         sFile = sFile + "&" + arrPKList[iLoop] + "=" + escape(arrPKValue[iLoop]);
      document.location = sFile;
   }
   else
      return onCancel(sFormName, sSerialized, sFrame, bData);
}


// onQuestDelete is a customized version of onDelete, found in edit-forms.js
// The main purpose behind this customization is to ensure that the same
// AXVW file is reloaded.  By default, only the first afmTableGroup is
// returned, dropping the questionnaire data.
function onQuestDelete(sFormName, sSerialized, sFrame, bData)
{
   var bResult = onDelete(sFormName, sSerialized, sFrame, bData);

   if(bResult == true)
   {
      if(axvwFile != "")
      {
         var sFile = axvwFile + "?handler=com.archibus.config.ActionHandlerDrawing";
         for(var iLoop=0; iLoop<arrPKList.length; iLoop++)
            sFile = sFile + "&" + arrPKList[iLoop] + "=" + escape(arrPKValue[iLoop]);
         wait(500);
         document.location = sFile;
      }
      else
         return onDelete(sFormName, sSerialized, sFrame, bData);
   }
   else
      return bResult;
}


// Standard JavaScript wait routine
function wait(iMSec)
{
   var dNow = new Date();
   while(1)
   {
      mill = new Date();
      diff = mill - dNow;
      if(diff > iMSec)
         break;
   }
}


// lookupSelectV() is a dynamic onSelectV function that uses the normal select
// value window, even though the data fields referred to by lookupSelectV aren't
// in any afmTableGroup's record set.
function lookupSelectV(strSerialized, strField, formName)
{
   var strXMLValue = '<afmAction type="selectValue" response="true" frame="">';
   strXMLValue = strXMLValue + '<fields><field table="' + strField.split(".")[0] + '" name="';
   strXMLValue = strXMLValue + strField.split(".")[1] + '"/></fields></afmAction>';
   OpenSelectVWindow(strXMLValue);
}


// performActions() is launched from onQuestSave when the save is successful.
// It checks the values of the action_response against the value of the question
// field.  If they match, it creates an action record.
function performActions(sFormName)
{
   var objForm = document.forms[sFormName];
   if(objForm == null) return;

   var question, actionResponse;
   var iQuestionNo, iLoop, iLoopItems;

   iQuestionNo = 1;
   question = objForm.elements["question1.quest_name"];
   while(question != null)
   {
      activityType    = objForm.elements["question"+iQuestionNo+".activity_type"].value;
      actionResponse  = objForm.elements["question"+iQuestionNo+".action_response"].value;
      answerField     = objForm.elements["question"+iQuestionNo+".answer_field"].value;

      if((answerField == actionResponse) && (actionResponse != ""))
      {
         // Generate the Action Record
         alert("Generating Action Record - " + question.value + " - Unfinished");
      }

      iQuestionNo += 1;
      question = objForm.elements["question"+iQuestionNo+".quest_name"];
   }
}


// checkPKs() checks the primary key list against the current data to see
// if any of the values have changed.  If they have, it changes the values
// in the array to match those on the form.  This function is called by
// onQuestSave()
function checkPKs(sFormName)
{

   var objForm = document.forms[sFormName];
   if(objForm == null) return;

   for(var iLoop=0; iLoop<arrPKList.length; iLoop++)
   {
      if(objForm.elements[arrPKList[iLoop]].value != arrPKValue[iLoop])
         arrPKValue[iLoop] = objForm.elements[arrPKList[iLoop]].value;
   }
}


// setupAnswers is used instead of setupQuestions for reports.
// Since the first afmTableGroup is not limited to just one record,
// this script scans through all form elements, from top to bottom,
// finding question data (in the first table group), and then filling
// in the answers in the second table group.  Both table and column
// reports are supported, but it must be noted that this only works
// with two afmTableGroups.  Also, the question data field must be
// the last field of the first table group.
function setupAnswers(sFormName)
{
   var objForm = document.forms[sFormName];
   if(objForm == null) return;

   var lastQuestID, lastQuestType, lastEnumList, questName, sAnswer, elementID;
   var splitList = new Array();

   for(var iLoop=0; iLoop < objForm.elements.length; iLoop++)
   {
      if(objForm.elements[iLoop].name.split(".")[1] == "questions_data")
      {
         questAnswers = new Array();
         getAnswers(objForm.elements[iLoop].value);
      }

      else if(objForm.elements[iLoop].name.split(".")[1] == "questions_id")
      {
         lastQuestID = objForm.elements[iLoop].value;
      }

      else if(objForm.elements[iLoop].name.split(".")[0] == lastQuestID)
      {
         elementID = objForm.elements[iLoop].name.split(".")[1];
         if(elementID == "format_type")
            lastQuestType = objForm.elements[iLoop].value;
         if(elementID == "enum_list")
            lastEnumList = objForm.elements[iLoop].value;
         if(elementID == "quest_name")
         {
            questName = objForm.elements[iLoop].value;
            sAnswer   = "";
            if(questAnswers[questName] != null)
            {
               if(lastQuestType == "Enumerated")
               {
                  splitList = lastEnumList.split(";");
                  for(var iLoop2=0; iLoop2 < splitList.length; iLoop2+=2)
                     if(questAnswers[questName] == splitList[iLoop2])
                     {
                       sAnswer = splitList[iLoop2+1];
                       iLoop2 = splitList.length;
                     }
               }
               else
                  sAnswer = questAnswers[questName];
            }
            document.getElementById(lastQuestID+"."+questName).innerHTML = sAnswer;
         }
      }
   }
}
