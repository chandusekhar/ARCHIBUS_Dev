/*********************************************************************
 Javascript file: ab-quest-panels.js
 Modified from: ab-quest.js
 Contains the javascript functions to manage questionnaires.

 07/13/2007 KE modified for use with Yalta forms
 08/07/2007 KE created js component
*********************************************************************/

AFM.namespace('questionnaire');

AFM.questionnaire.Quest = AFM.form.Form.extend({
	
	// questions.questionnaire_id
	q_id: '',
	
	// set readOnly to false for edit forms and true for reports
	readOnly: false,
	
	// optional two dimensional array containing additional fieldnames and values 
	// to specify in the activity_log table when generating an action item 
	// should not include action_title nor activity_type
	action_response_fields: null,

	// tbody to which question fields will be appended
	panel_tbody: null,
	
	// array object containing stored question answers from the xml answers field
	questAnswers: null,
	
	// stores the form colspan
	form_colspan: 2,
	
	// overwritten during runtime
	abSchemaSystemGraphicsFolder: '/archibus/schema/ab-system/graphics',
		
	constructor: function(q_id, readOnly, action_response_fields) {
		this.q_id = q_id;
		this.readOnly = readOnly;
		if (valueExists(action_response_fields)) 
			this.action_response_fields = action_response_fields;
        var tbodyList = document.getElementsByTagName('tbody');		
  		this.panel_tbody = tbodyList[tbodyList.length-1];
        this.questAnswers = new Array();          
	},
	
	showQuestions: function(panel) {
		//*************Determine the panel where the questionnaire should be shown
		if (panel != undefined){
			var bodyname = panel + "_body";
			this.panel_tbody = document.getElementById(bodyname).firstChild;
		}
		
		if (this.panel_tbody == null) return;
		
		// Remove footer row and retrieve form colspan
		var footerTD = YAHOO.util.Dom.getElementsByClassName("formBottomSpace", "td", this.panel_tbody)[0];
		if (footerTD) {
			this.form_colspan = parseInt(footerTD.getAttribute('colspan'));	
			this.panel_tbody.removeChild(footerTD.parentNode);
		}
		
		// Remove existing question fields, if any (this is necessary so that 
		// form refresh does not create duplicate fields)
		var iQuestionNo = 1;
		var question = $('question1.quest_name');
   		while(question != null)
   		{
   			var questionRow = question.parentNode.parentNode;
   			this.panel_tbody.removeChild(questionRow);
   			iQuestionNo++;
   			question = $('question'+iQuestionNo+'.quest_name');
   		}		
		
		// Call workflow rule to retrieve questions	
		var parameters = {'questionnaire_id':this.q_id};
	    //**********WFR returns jsonObject with boolean quest (false if no questionnaire for current record) and array data
	    var result = AFM.workflow.Workflow.runRuleAndReturnResult('AbProjectManagement-getQuestions', parameters);	    
	    if (result.code == 'executed') 
	    {
	    	var data = eval('('+result.jsonExpression+')');
	    	if (data.quest) 
	    	{
	    		var records = data.data;
		 		// Assign current answer values to an array
				var table_name = records[0]['questionnaire.table_name'];
				var field_name = records[0]['questionnaire.field_name']; 
				if ($(table_name+"."+field_name))
				{
					this.getAnswers(table_name+"."+field_name);
				}    			
		        for (var r = 0; r < records.length; r++) {
		            var record = records[r];
		            // Append question field
					this.appendQuestionField(r+1, record);
				}
	    	}
	    } else   
	    {
	    	alert(result.code + " :: " + result.message);
	  	}
	},
	
	appendQuestionField: function(questionIndex, dataRow) {
		var table_name = dataRow['questionnaire.table_name'];
		var field_name = dataRow['questionnaire.field_name'];
		var recordType = dataRow['questions.format_type'];
		var recordName = dataRow['questions.quest_name'];
		var questionnaireID = dataRow['questions.questionnaire_id'];
		var activityType = dataRow['questions.activity_type'];
		var actionResponse = dataRow['questions.action_response'];
						
		var trElement = document.createElement('tr');
		var labelTdElement = document.createElement('td');
		labelTdElement.className = 'label';
		var labelTextElement =document.createTextNode(dataRow['questions.quest_text']);
		labelTdElement.appendChild(labelTextElement);
		trElement.appendChild(labelTdElement);
	
		var inputTdElement = document.createElement('td'); 
		if (this.readOnly) inputTdElement.className = 'inputFieldLabel';
		inputTdElement.colspan = "'"+this.form_colspan-1+"'";
		inputTdElement.setAttribute('colspan',this.form_colspan-1);
		
		inputTdElement.appendChild(this.getHiddenElement('quest_name',questionIndex,recordName));
		inputTdElement.appendChild(this.getHiddenElement('format_type',questionIndex,recordType));
		inputTdElement.appendChild(this.getHiddenElement('questionnaire_id',questionIndex,questionnaireID));
		inputTdElement.appendChild(this.getHiddenElement('activity_type',questionIndex,activityType));
		inputTdElement.appendChild(this.getHiddenElement('action_response',questionIndex,actionResponse));
		inputTdElement.appendChild(this.getHiddenElement('xml_field',questionIndex,table_name+'.'+field_name));
		inputTdElement.appendChild(this.getHiddenElement('readonly',questionIndex,this.readOnly));
		
		var inputElement = this.getInputElement({'type':'text'});
		inputElement.className = 'inputField';
		
		var splitList, optionData, iLoop, iLoopItems;
	
		if (this.readOnly)
		{
			var spanElement = document.createElement('span');
			spanElement.setAttribute('id','question'+questionIndex+'.answer_readonly');
			
			if (recordType == 'Enum')
			{
				var enumList = dataRow['questions.enum_list'];
				inputTdElement.appendChild(this.getHiddenElement('enum_list',questionIndex,enumList));						
				
	            splitList = new Array();
	            splitList = enumList.split(";");
	            iLoopItems = splitList.length/2 - splitList.length%2;
	            for(iLoop=0; iLoop < iLoopItems; iLoop++) {
	            	if((this.questAnswers[recordName]) && splitList[iLoop*2] == this.questAnswers[recordName])
	                     spanElement.innerHTML = splitList[iLoop*2+1];
	            }
			}
			else if (this.questAnswers[recordName]) spanElement.innerHTML = this.questAnswers[recordName];
			
			var answerElement = this.getInputElement({'type':'hidden','id':'question'+questionIndex+'.answer_field','name':'question'+questionIndex+'.answer_field'});
			if (this.questAnswers[recordName]) answerElement.value = this.questAnswers[recordName];
				
			inputTdElement.appendChild(answerElement);
			inputTdElement.appendChild(spanElement);
		} else
		{
			if (recordType == 'Free')
			{					
				var freeWidth = dataRow['questions.freeform_width'];
				inputElement.setAttribute('id','question'+questionIndex+'.answer_field');
				inputElement.setAttribute('name','question'+questionIndex+'.answer_field');
				inputElement.maxLength = freeWidth;
				if (this.questAnswers[recordName]) inputElement.value = this.questAnswers[recordName];
				inputTdElement.appendChild(inputElement);
			}
	
			if (recordType == 'Enum')
			{
				var enumList = dataRow['questions.enum_list'];
				inputTdElement.appendChild(this.getHiddenElement('enum_list',questionIndex,enumList));	
										
				var selectElement = document.createElement('select');
				selectElement.setAttribute('id','question'+questionIndex+'.answer_field');
				selectElement.setAttribute('name','question'+questionIndex+'.answer_field');		
				selectElement.className = 'inputField_box';
				
	   			splitList  = new Array();
	         	splitList  = enumList.split(";");
	         	iLoopItems = splitList.length/2 - splitList.length%2;
	         	for (iLoop=0; iLoop < iLoopItems; iLoop++) {
	            	optionData = new Option(splitList[iLoop*2+1], splitList[iLoop*2]);
	            	selectElement.options[selectElement.options.length] = optionData;           
	         	}
	         	if (this.questAnswers[recordName]) selectElement.value = this.questAnswers[recordName];

				inputTdElement.appendChild(selectElement);
			}		
	
			if (recordType == 'Look')
			{
				var lookupTable = dataRow['questions.lookup_table'];
				var lookupField = dataRow['questions.lookup_field'];
				var field_name = lookupTable + '.' + lookupField;
				inputElement.setAttribute('id','question'+questionIndex+'.answer_field');
				inputElement.setAttribute('name','question'+questionIndex+'.answer_field');
				if (this.questAnswers[recordName]) inputElement.value = this.questAnswers[recordName];	
				var selectVElement = document.createElement('img');
				selectVElement.onclick = function() {
					AFM.view.View.selectValue('', dataRow['questions.quest_text'], ['question'+questionIndex+'.answer_field'], 
					lookupTable, [field_name], [field_name], '', '', false, true, '');
					return false;
				};
				selectVElement.setAttribute('src', this.abSchemaSystemGraphicsFolder + '/ab-icons-ellipses.gif');
				selectVElement.className = 'selectValue_Button';
				inputTdElement.appendChild(inputElement);
				inputTdElement.appendChild(selectVElement);
			}
		}
	
		trElement.appendChild(inputTdElement);
		this.panel_tbody.appendChild(trElement);
	},

	saveQuestions: function() {
		this.setAnswers();
		//************only perform actions if action response fields are given
		if (this.action_response_fields != undefined) this.performActions();	
	},

	// setAnswers creates the XML data field based on 
	// the current answers in the HTML form.
	setAnswers: function() {
		   var xmlField = "";
		   var xmlData = "";
		   var currentQuestionnaireID = "";
		   var currentXmlField = "";
		
		   var questionnaireID, questionName, answerField;
		   var iQuestionNo = 1;
		   var question = $('question1.xml_field');
		   while(question != null)
		   {
		      xmlField = question.value;
		      if(xmlField != currentXmlField)
		      {
		         if(xmlData != "")
		         {
		            xmlData = xmlData + "</questionnaire>";
		            $(currentXmlField).value = xmlData;
		            xmlData = "";
		         }
		         currentXmlField = xmlField;
		      }
		      questionnaireID = convert2validXMLValueCustom(trim($("question"+iQuestionNo+".questionnaire_id").value));
		      questionName    = convert2validXMLValueCustom(trim($("question"+iQuestionNo+".quest_name").value));
		      answerField     = convert2validXMLValueCustom(trim($("question"+iQuestionNo+".answer_field").value));

		      if(questionnaireID != currentQuestionnaireID)
		      {
		         if(xmlData != "")
		            xmlData = xmlData + "</questionnaire>";
		         xmlData = xmlData + '<questionnaire questionnaire_id="' + questionnaireID + '">';
		         currentQuestionnaireID = questionnaireID;
		      }
		
		      xmlData = xmlData + '<question quest_name="' + questionName + '"';
		      xmlData = xmlData + ' value="' + answerField + '"/>';
		      iQuestionNo += 1;
		      question = $("question"+iQuestionNo+".xml_field");
		   }
		
		   if(xmlData != "")
		      xmlData = xmlData + "</questionnaire>";
		
		   if(currentXmlField != "" && $(currentXmlField) != null)
		   {
		      var maxsize = arrFieldsInformation[currentXmlField]["size"];
		      maxsize = parseInt(maxsize);
		      var actualsize = xmlData.length;
		      if(actualsize > maxsize)
		      {
		      	var alertMessage = "";
		      	if(getMessage('exceedsMaxFieldSize')) alertMessage = getMessage('exceedsMaxFieldSize');
			   	alert(alertMessage);
			   	return;
		      }
		   }
		
		   if(currentXmlField != "" && $(currentXmlField) != null)
		   {
		      $(currentXmlField).value = xmlData;
		   }			
		},

	// performAction() checks the values of the action_response against the 
	// value of the question field.  If they match, an action record is created
	// with action_title matching the question name and other field values 
	// set by the action_response_fields array.	
	performActions: function() {
	   var question = null;
	   var activityType = "";
	   var actionResponse = "";
	   var answerField = "";
	   var actionTitle = "";
	   var sqlQuery = "";
	   var sqlQueryFirstPart = "";
	   var sqlQuerySecondPart = "";
	   var iQuestionNo = 1;

	   question = $('question1.quest_name');
	   while(question != null)
	   {
	      activityType = $("question"+iQuestionNo+".activity_type").value;
	      actionResponse = $("question"+iQuestionNo+".action_response").value;
	      answerField = $("question"+iQuestionNo+".answer_field").value;
	      actionTitle = question.value;
	         	
	      // check if the current answer field matches the action response
	      if((answerField == actionResponse) && (actionResponse != "") && (activityType != ""))
	      {
		      	// verify that the action has not already been generated by testing if
		      	// 1. there was no previous answer for this question in the xml field, or
		      	// 2. the previous answer from the xml field does not match the current response
		      	if (!this.questAnswers[question.value] || this.questAnswers[question.value] != answerField) 
		      	{
			        // Generate the Action Record        	         
			        var record = {};
		    		record['activity_log.activity_type'] = activityType;
		    		record['activity_log.action_title'] = actionTitle;
		    		if (this.action_response_fields)
			        {
				         for (var i = 0; i < this.action_response_fields.length; i++) {
				         	record[this.action_response_fields[i][0]] = this.action_response_fields[i][1];
				         }
			        }
			        var parameters = {
		        		tableName: 'activity_log',
		        		fields: toJSON(record)
		    		};
		    		var result = AFM.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-saveRecord', parameters);
			        if (result.code == 'executed') {
			         	var auto_generated_response = "";
			         	if (getMessage('auto_generated_response')) auto_generated_response = getMessage('auto_generated_response');
			         	alert(auto_generated_response +" - '"+actionTitle+"'");
			    	} else   
			    	{
			    		alert(result.code + " :: " + result.message);
			  		}
	      		}
	      }	        
	      iQuestionNo += 1;
	      question = $("question"+iQuestionNo+".quest_name");
	   }
	},	

	// getAnswers runs through the XML data and stores question answers in questAnswers.		
	getAnswers: function(fieldId) {
	   //***********Use function from common.js to parse xml string
	   	tmp = selectNodes(null, fieldId, "//question");
		if(tmp == null || tmp.length == 0) return;
	   	for (i = 0; i < tmp.length; i++){
			sname = tmp[i].getAttribute("quest_name");
			svalue = tmp[i].getAttribute("value");
			sname = convertFromXMLValueCustom(sname);
			svalue = convertFromXMLValueCustom(svalue);
			this.questAnswers[sname] = svalue;
   		}
	},
			
	getHiddenElement: function(fieldName, questIndex, fieldValue) {
		var elementId = 'question'+questIndex+'.'+fieldName;
		var hiddenInputElement = this.getInputElement({'type':'hidden','id':elementId,'name':elementId,'value':fieldValue});
		return hiddenInputElement;	
	},
	
	getInputElement: function(parameters) {
		var inputElement = document.createElement('input');
		if (parameters['type']) inputElement.setAttribute('type',parameters['type']);
		if (parameters['id']) inputElement.setAttribute('id',parameters['id']);
		if (parameters['name']) inputElement.setAttribute('name',parameters['name']);
		if (parameters['value']) inputElement.setAttribute('value',parameters['value']);
		return inputElement;
	}
});

function convert2validXMLValueCustom(fieldValue)
{
	// use custom encoder for all special characters since 
	// the hidden question XML field is automatically decoded 
	// upon view load.  Special characters (like '&' and '>') 
	// must be encoded for evaluation of the XML statement.
	fieldValue = fieldValue.replace(/&amp;/g, '&')
	fieldValue = fieldValue.replace(/&/g, '%26')
	fieldValue = fieldValue.replace(/&lt;/g, '<')
	fieldValue = fieldValue.replace(/</g, "%3C");
	fieldValue = fieldValue.replace(/&gt;/g, '>')
	fieldValue = fieldValue.replace(/>/g, "%3E");
	fieldValue = fieldValue.replace(/&apos;/g, '\'')
	fieldValue = fieldValue.replace(/\'/g, "%27");
	fieldValue = fieldValue.replace(/&quot;/g, '\"')
	fieldValue = fieldValue.replace(/\"/g, "%22");
	return fieldValue;
}

function convertFromXMLValueCustom(fieldValue)
{
	fieldValue = fieldValue.replace(/%26/g, '&');
	fieldValue = fieldValue.replace(/%3C/g, '<');
	fieldValue = fieldValue.replace(/%3E/g, '>');
	fieldValue = fieldValue.replace(/%27/g, '\'');
	fieldValue = fieldValue.replace(/%22/g, '\"');
	return fieldValue;
}
