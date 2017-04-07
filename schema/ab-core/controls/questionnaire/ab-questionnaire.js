/**
 * Declare the namespace for the questionnaire JS classes.
 */
Ab.namespace('questionnaire');

Ab.questionnaire.Quest = Ab.view.Component.extend({
		
	// questions.questionnaire_id
	q_id: '',
	
	// panel to contain questions, optional if questionnaire is not displayed
	panel_id: '',
	
	// questionnaire question records
	questionRecords: null,
	
	// field where the xml data is stored (e.g. 'project.project_quest')
	xmlFieldName: '',
	
	columns: 1,
	
	// optional readOnly property to apply to read-only forms (not column reports)
	// by default, readOnly fields are created for columnReports
	// and editable fields are created for forms
	readOnly: false,
	
	// optional table_name for questionnaire answers added to support SQL views
	table_name: '',
	
	// optional boolean to display questions for which is_active has been set to false
	showInactive: '',
	
	// overwritten during runtime
	abSchemaSystemGraphicsFolder: '/archibus/schema/ab-system/graphics',
	
	constructor: function(qId, panelId, readOnly, table_name, showInactive) {	
		this.q_id = qId;
		if (valueExists(panelId)) {
			this.panel_id = panelId;
			if (View.panels.get(this.panel_id).columns) this.columns = View.panels.get(this.panel_id).columns;
		}
		this.questionRecords = {};
		if (valueExists(readOnly)) this.readOnly = readOnly;
		if (valueExists(table_name)) this.table_name = table_name;
		if (valueExists(showInactive)) this.showInactive = showInactive;
		else this.showInactive = false;

        this.getQuestions();
        if (this.panel_id) {
        	this.getAnswers();
        	this.showQuestions();
        }
	},

	getQuestions: function() {
		var restriction = new Ab.view.Restriction();
		restriction.addClause('questionnaire.questionnaire_id', this.q_id);
		if (!this.showInactive) restriction.addClause('questions.is_active', 1);
		var ds = View.dataSources.get('exPrgQuestionnaire_questionsDs');
		this.questionRecords = ds.getRecords(restriction);
        if (this.questionRecords.length > 0) {
        	if (this.table_name == '') this.table_name = this.questionRecords[0].getValue('questionnaire.table_name');
			this.xmlFieldName = this.table_name + "." + this.questionRecords[0].getValue('questionnaire.field_name');
        }
        for (var r = 0; r < this.questionRecords.length; r++) {
        	this.questionRecords[r].setValue('questions.quest_value', '');
        }
	},
		
	getAnswers: function() {
		var xml = '';
        if (this.questionRecords.length > 0) {
			xml = View.panels.get(this.panel_id).getFieldValue(this.xmlFieldName);
        }
        if (xml == '') return;      

		var xmlDocument = parseXml(xml, null, true);
	   	var nodes = selectNodes(xmlDocument, null, '//question');
		if (nodes.length == 0) nodes = selectNodes(xmlDocument, null, '//QUESTION');
	   	if (nodes.length == 0) return;
	   	
	   	outer: for (var r = 0; r < this.questionRecords.length; r++) {
            var quest_name = this.questionRecords[r].getValue('questions.quest_name');
            
            inner: for (var n = 0; n < nodes.length; n++) {
            	var node_quest_name = convertFromXMLValueCustom(nodes[n].getAttribute('quest_name'));
            	
            	if (node_quest_name == quest_name) {
            		var node_value = convertFromXMLValueCustom(nodes[n].getAttribute('value'));
            		this.questionRecords[r].setValue('questions.quest_value', node_value);
					continue outer;
            	}
            }
	   	}
	},
	
	showQuestions: function() {	
		this.removeExistingQuestionRows();
		
        for (var r = 0; r < this.questionRecords.length; r++) {
        	if (View.panels.get(this.panel_id).config.type == 'form') {
        		if (this.readOnly) this.appendQuestionRowToReadOnlyForm(r);
        		else this.appendQuestionRowToForm(r);
        	}
        	else this.appendQuestionRowToReport(r);
		}
	},
	
	removeExistingQuestionRows: function() {
		var questionIndex = 0;
		var question = $(this.panel_id + '_' + 'question' + questionIndex + '.' + 'quest_field');
		
		while (question != null) {
			var questionRow = question.parentNode;
			if ($(this.panel_id + '_body')) this.getBodyElement().removeChild(questionRow);
			else if ($(this.panel_id + '_table')) $(this.panel_id + '_table').firstChild.removeChild(questionRow);
			questionIndex++;
			question = $(this.panel_id + '_' + 'question' + questionIndex + '.' + 'quest_field');
		}
	},
	
	appendQuestionRowToReport: function(questionIndex) {
		var questionRecord = this.questionRecords[questionIndex];
		var colspan = this.columns*4-3;
		
		var html = '';
		html = html + '<tr>'
					+ '<td class="columnReportSpacer"> </td>'
					+ '<td class="columnReportLabel">' + questionRecord.getValue('questions.quest_text') + '</td>';
		
		var fieldId = this.panel_id + '_' + 'question' + questionIndex + '.' + 'quest_field';
		var fieldValue = '';
		
		if (questionRecord.getValue('questions.format_type') == 'Enum')
			fieldValue = this.getEnumVisibleValue(questionRecord);
		else if (questionRecord.getValue('questions.format_type') == 'Date')
			fieldValue = this.getLocalizedDateValue(questionRecord);
		else fieldValue = questionRecord.getValue('questions.quest_value');
		
		html = html + '<td id="' + fieldId + '"' + 'class="columnReportValue" style="" colspan="' + colspan + '">'
					+ fieldValue + '</td>'
					+ '<td class="columnReportSpacer"> </td>'
					+ '</tr>';
		
		if ($(this.panel_id + '_table'))
			Ext.DomHelper.insertHtml('beforeEnd', $(this.panel_id + '_table').firstChild, html);
	},
	
	appendQuestionRowToReadOnlyForm : function(questionIndex) {
		var questionRecord = this.questionRecords[questionIndex];
		
		var html = '';
		html = html + '<tr>'
					+ '<td class="label">' + questionRecord.getValue('questions.quest_text') + '</td>';
		
		var prefix = this.panel_id + '_' + 'question' + questionIndex + '.';
		var colspan = this.getBodyElement().firstChild.firstChild.colSpan-1;
		
		var fieldValue = '';		
		if (questionRecord.getValue('questions.format_type') == 'Enum')
			fieldValue = this.getEnumVisibleValue(questionRecord);
		else if (questionRecord.getValue('questions.format_type') == 'Date')
			fieldValue = this.getLocalizedDateValue(questionRecord);
		else fieldValue = questionRecord.getValue('questions.quest_value');
		
		html = html + '<td id="' + prefix + 'quest_field' + '" colspan="' + colspan + '">'
					+ '<input type="hidden" id="' + prefix + 'answer_field' + '" name="' + prefix + 'answer_field' + '" value="' + fieldValue + '"/>'
					+ '<span id="' + prefix + 'answer_readOnly">' + fieldValue + '</span>'
					+ '</td>'
					+ '</tr>';

		Ext.DomHelper.insertBefore(this.getBodyElement().lastChild, html);
	},
	
	appendQuestionRowToForm: function(questionIndex) {
		
		var questionRecord = this.questionRecords[questionIndex];
		
		var html = '';
		html = html + '<tr>'
					+ '<td class="label">' + questionRecord.getValue('questions.quest_text');
		if(questionRecord.getValue('questions.is_required') == 1){
			html = html + '<span style="color: red;">*</span>';
		}
		html = html + '</td>';
		
		var prefix = this.panel_id + '_' + 'question' + questionIndex + '.';
		var colspan = this.getBodyElement().firstChild.firstChild.colSpan-1;
		
		html = html + '<td id="' + prefix + 'quest_field' + '" colspan="' + colspan + '">';

		var recordType = questionRecord.getValue('questions.format_type');
		
		if (recordType == 'Free') {
			var freeform_width = questionRecord.getValue('questions.freeform_width');
			var style = '';
			if (freeform_width < 47) {
				if (freeform_width < 10) style = ' style="width:' + freeform_width + 'em" ';
				else style = ' style="width: 30em" ';
				html = html + '<input type="text" id="' + prefix + 'answer_field' + '" name="' + prefix + 'answer_field' + '" class="inputField" ' + style + ' maxLength="' + freeform_width + '" value="' + questionRecord.getValue('questions.quest_value') + '"/>';
			}
			else {
				html = html + '<textarea id="' + prefix + 'answer_field' + '" name="' + prefix + 'answer_field';
				html = html + '" onkeyup="checkMemoMaxSize(this, \'' + freeform_width + '\')" onkeydown="checkMemoMaxSize(this, \'' + freeform_width + '\')"';
				html = html + ' class="defaultEditForm_textareaABData" wrap="PHYSICAL" style="width: 30em; height: 116px;"';
				html = html + ' value="' + questionRecord.getValue('questions.quest_value') + '">' + questionRecord.getValue('questions.quest_value')+ '</textarea>';
			}
		}
		
		if (recordType == 'Date') {
			html = html + '<input type="text" id="' + prefix + 'answer_field' + '" name="' + prefix + 'answer_field' + '" class="inputField"';
			html = html + ' onchange="validationAndConvertionDateInput(this, \'' + prefix + 'answer_field\', null, \'false\', true, true); if (window.temp!=this.value) afm_form_values_changed=true;"';
			html = html + ' onblur="validationAndConvertionDateInput(this, \'' + prefix + 'answer_field\', null, \'false\', true, true); if (window.temp!=this.value) afm_form_values_changed=true;"';
			html = html + ' onfocus="window.temp=this.value;" class="inputField" size="20"';
			html = html + ' value="' + this.getLocalizedDateValue(questionRecord) + '"';
			html = html + ' autocomplete="off"/>';
		}
		
		if (recordType == 'Enum') {       	
			html = html + '<select id="' + prefix + 'answer_field' + '" name="' + prefix + 'answer_field' + '" class="inputField_box">';
			html = html + this.getListOptions(questionRecord);
			html = html + '</select>';
		}
	
		if (recordType == 'Look') {
			html = html + '<input type="text" id="' + prefix + 'answer_field' + '" name="' + prefix + 'answer_field' + '" class="inputField" value="' + questionRecord.getValue('questions.quest_value') + '"/>';	
		}
		
		if (recordType == 'Num') {
			html = html + '<input type="text" id="' + prefix + 'answer_field' + '" name="' + prefix + 'answer_field' + '" class="inputField" value="' + questionRecord.getValue('questions.quest_value') + '"/>';	
		}
		
		if (recordType == 'Int') {
			html = html + '<input type="text" id="' + prefix + 'answer_field' + '" name="' + prefix + 'answer_field' + '" class="inputField" value="' + questionRecord.getValue('questions.quest_value') + '"/>';	
		}

		html = html + '</td>';		
		html = html + '</tr>';

		Ext.DomHelper.insertBefore(this.getBodyElement().lastChild, html);
        
		if (recordType == 'Date') {
			this.appendCalendarElement(questionIndex);
            // KB 3044298: do not show date format text
			// this.appendDateSpanElement(questionIndex);
		}
		if (recordType == 'Look')
			this.appendSelectVElement(questionIndex);	
	},

    /**
     * Returns the form's table body element.
     */
    getBodyElement: function() {
        var bodyElement = null;

        var childNodes = $(this.panel_id + '_body').childNodes;
        for (var i = 0; i < childNodes.length; i++) {
            if (childNodes[i].tagName && childNodes[i].tagName.toLowerCase() === 'tbody') {
                bodyElement = childNodes[i];
                break;
            }
        }

        return bodyElement;
    },
	
	appendCalendarElement: function(questionIndex) {
		var controller = this;
		var questionRecord = controller.questionRecords[questionIndex];
		
		var calendarElement = document.createElement('img');
		calendarElement.onclick = function(event) {
			Calendar.getControllerForEvent(event, 
					controller.panel_id + '_' + 'question' + questionIndex + '.' + 'answer_field',
					controller.abSchemaSystemGraphicsFolder); 
			return false;
		};	
		calendarElement.setAttribute('src', this.abSchemaSystemGraphicsFolder + '/calendar.gif');
		calendarElement.setAttribute('name', 'AFMCALENDAR_' + this.panel_id + '_' + 'question' + questionIndex + '.' + 'answer_field');
		calendarElement.setAttribute('id', 'AFMCALENDAR_' + this.panel_id + '_' + 'question' + questionIndex + '.' + 'answer_field');
		calendarElement.className = 'selectValue_Button';
		$(this.panel_id + '_' + 'question' + questionIndex + '.' + 'quest_field').appendChild(calendarElement);
	},
	
	appendDateSpanElement: function(questionIndex) {
		var html = '<br/><span style=""';
		html += ' id="Show' + this.panel_id + '_' + 'question' + questionIndex + '.' + 'answer_field' + '_long"';
		html += ' name="Show' + this.panel_id + '_' + 'question' + questionIndex + '.' + 'answer_field' + '_long"';
		html += ' class="showingDateAndTimeLongFormat">' + strDateShortPattern + '</span>';
		Ext.DomHelper.insertAfter($('AFMCALENDAR_' + this.panel_id + '_' + 'question' + questionIndex + '.' + 'answer_field'), html);
	},
	
	appendSelectVElement: function(questionIndex) {
		var controller = this;
		var questionRecord = controller.questionRecords[questionIndex];			
		var lookupTable = questionRecord.getValue('questions.lookup_table');
		var lookupField = questionRecord.getValue('questions.lookup_field');
		var field_name = lookupTable + '.' + lookupField;
		var field_title = questionRecord.getValue('questions.quest_text');
		
		var selectVElement = document.createElement('img');
		selectVElement.onclick = function() {
			View.selectValue({
		    	formId: '',
		    	title: field_title,
		    	fieldNames: ['question'+questionIndex+'.answer_field'],
		    	selectTableName: lookupTable,
		    	selectFieldNames: [field_name],
		    	visibleFields: [{fieldName: field_name, title: field_title}],
		    	sortFields: [{fieldName: field_name, sortAscending: true}],
		    	restriction: null,
		    	showIndex: true,
		    	selectValueType: 'grid',
		    	actionListener: function(fieldName, newValue, oldValue) {
					$(controller.panel_id + '_' + 'question' + questionIndex + '.' + 'answer_field').value = newValue;
	                return false;
            	}
			});
			return false;
		};
		selectVElement.setAttribute('src', this.abSchemaSystemGraphicsFolder + '/ab-icons-ellipses.gif');
		selectVElement.className = 'selectValue_Button';
		$(this.panel_id + '_' + 'question' + questionIndex + '.' + 'quest_field').appendChild(selectVElement);
	},
	
	getEnumVisibleValue: function(questionRecord) {
		var enumVisibleValue = '';
		var enumList = questionRecord.getValue('questions.enum_list');	
		var questAnswer = questionRecord.getValue('questions.quest_value');
		
		if (questAnswer) {
			var splitList, optionData, iLoop, iLoopItems;
	        splitList = new Array();
	        splitList = enumList.split(";");
	        iLoopItems = splitList.length/2 - splitList.length%2;
	        for(iLoop=0; iLoop < iLoopItems; iLoop++) {
	        	if(splitList[iLoop*2] == questAnswer)
	                 enumVisibleValue = splitList[iLoop*2+1];
	        }
		}
		return enumVisibleValue;
	},
	
	getListOptions: function(questionRecord) {
		var selectedValue = questionRecord.getValue('questions.quest_value');
		
		var html = '';
		var enumList = questionRecord.getValue('questions.enum_list');
		var splitList  = new Array();
     	splitList  = enumList.split(";");
     	var iLoopItems = splitList.length/2 - splitList.length%2;
     	for (var iLoop = 0; iLoop < iLoopItems; iLoop++) {
     		html += '<option value="' + splitList[iLoop*2] + '" ';
     		if (selectedValue == splitList[iLoop*2]) html += 'selected="selected" ';
     		html += '>' + splitList[iLoop*2+1] + '</option>';          
     	}
     	return html;
	},
	
	getLocalizedDateValue: function(questionRecord) {
		var value = questionRecord.getValue('questions.quest_value');
		if (isBeingISODateFormat(value))
			return FormattingDate(value.split("-")[2], value.split("-")[1], value.split("-")[0], strDateShortPattern);
		else return value;
	},
	
	getDefaultListOption: function(questionRecord) {
		var default_value = '';
		var enumList = questionRecord.getValue('questions.enum_list');
		var splitList  = new Array();
     	splitList  = enumList.split(";");
     	if (splitList.length > 0) default_value = splitList[0]; 
     	return default_value;
	},

	/* beforeSaveQuestionnaire creates the XML data field value based upon 
	   the current answers in the HTML form.
	   */
	beforeSaveQuestionnaire: function() {
		if (this.questionRecords.length == 0) return true;
		var xml = '<questionnaire questionnaire_id="' + convert2validXMLValueCustom(this.q_id) + '">';

		if (!this.checkEmptyRequiredFields()) return false;
		
		for (var r = 0; r < this.questionRecords.length; r++) {
		    var new_value = trim($(this.panel_id + '_' + 'question' + r + '.' + 'answer_field').value);
		    var recordType = this.questionRecords[r].getValue('questions.format_type');
		    if (recordType == 'Date')
				new_value = getDateWithISOFormat(new_value);
		    else if (recordType == 'Num' || recordType == 'Int') {
		    	if (!this.checkNumericField(r, recordType, new_value)) return false;
		    } else if (recordType == 'Look' && new_value != '')
		    	if (!this.checkValidatedField(r, new_value)) return false;
		    var quest_name = this.questionRecords[r].getValue('questions.quest_name');
			xml = xml + '<question quest_name="' + convert2validXMLValueCustom(quest_name) + '" value="' + convert2validXMLValueCustom(new_value) + '"/>';
			this.questionRecords[r].setValue('questions.quest_value', new_value);
		}
		xml = xml + '</questionnaire>';
		
		if (this.exceedsMaxFieldSize(xml)) return false;
		   
		View.panels.get(this.panel_id).setFieldValue(this.xmlFieldName, xml);
		return true;
	},
	
	checkEmptyRequiredFields: function() {
		View.panels.get(this.panel_id).clearValidationResult();
		var existsEmptyRequiredField = false;
		for (var r = 0; r < this.questionRecords.length; r++) {
			var fieldInput = View.panels.get(this.panel_id).getFieldElement('question' + r + '.' + 'answer_field'); 
            var fieldInputTd = fieldInput.parentNode;
            var fieldInputTr = fieldInputTd.parentNode;
            Ext.fly(fieldInputTd).removeClass('formErrorInput');
            Ext.fly(fieldInputTr).removeClass(' formError');
            var errorTextElements = Ext.query('.formErrorText', fieldInputTd);
            for (var e = 0; e < errorTextElements.length; e++) {
                fieldInputTd.removeChild(errorTextElements[e]);
            }
            
		    var new_value = trim($(this.panel_id + '_' + 'question' + r + '.' + 'answer_field').value);
		    var is_required = this.questionRecords[r].getValue('questions.is_required');
		    if (is_required == 1 && !new_value) {
		    	this.addInvalidHtmlField(r, getMessage('emptyRequiredField'));		        
		    	existsEmptyRequiredField = true;
		    }
		}
		if (existsEmptyRequiredField) return false;
		else return true;
	},	
	
	checkNumericField: function(r, recordType, new_value) {
		var pattern = strGroupingSeparator;
	    var re = new RegExp(pattern, "g");
		new_value = new_value.replace(re, '');
		var newValue = new_value + "";
		var size = newValue.length;
		var valid = true;
		if (size > 15) {
			this.addInvalidHtmlField(r, getMessage('maxSize'));
			valid = false;
		}
		else if (recordType == 'Num') {
	    	if (isNaN(new_value)) {
	    		this.addInvalidHtmlField(r, getMessage('numberRequired'));
	    		valid = false;
	    	}
	    	var indexDecimalSeparator = new_value.lastIndexOf(strDecimalSeparator);
	    	if (indexDecimalSeparator >= 0) {
	    		if (new_value.substring(indexDecimalSeparator+1).length > 2) this.addInvalidHtmlField(r, getMessage('tooManyDecimals'));
	    	}
	    }
	    else if (recordType == 'Int') {
	    	if (isNaN(new_value) || new_value % 1 !== 0) {
	    		this.addInvalidHtmlField(r, getMessage('integerRequired'));
	    		valid = false;
	    	}
	    }
		return valid;
	},
	
	checkValidatedField: function(r, new_value) {
		var valid = true;
		var table_name = this.questionRecords[r].getValue('questions.lookup_table');
		var field_name = this.questionRecords[r].getValue('questions.lookup_field');
		if (valueExists(table_name) && valueExists(field_name)) {
	        var restriction = new Ab.view.Restriction();
	        restriction.addClause(table_name + '.' + field_name, new_value);
			var parameters = {
				tableName:table_name,
				fieldNames: toJSON([field_name]),
				restriction: toJSON(restriction)
			};
			var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
			if (result.code == 'executed') {
				if (valueExists(result.dataSet)) {
					if (result.dataSet.records.length < 1) valid = false;
				} 
				else valid = false;
			}else{
				valid = false;
				Workflow.handleError(result);
			}
		}
		if (!valid) this.addInvalidHtmlField(r, getMessage('notValid'));
		return valid;
	},
	
	addInvalidHtmlField: function(r, message) {
		var fieldInput = View.panels.get(this.panel_id).getFieldElement('question' + r + '.' + 'answer_field'); 
        var fieldInputTd = fieldInput.parentNode;
		View.panels.get(this.panel_id).addInvalidField('question' + r + '.' + 'answer_field', '');
		Ext.fly(fieldInputTd).addClass('formErrorInput');
        var errorBreakElement = document.createElement('br');
        errorBreakElement.className = 'formErrorText';
        fieldInputTd.appendChild(errorBreakElement);
        var errorTextElement = document.createElement('span');
        errorTextElement.className = 'formErrorText';
        errorTextElement.appendChild(document.createTextNode(message));
        fieldInputTd.appendChild(errorTextElement);
	},
	
	setDefaultQuestionnaireValues: function(record) {
		if (record.getValue(this.xmlFieldName) != '') return record;
		if (this.questionRecords.length == 0) return record;
		var xml = '<questionnaire questionnaire_id="' + convert2validXMLValueCustom(this.q_id) + '">';

		for (var r = 0; r < this.questionRecords.length; r++) {
		    var new_value = '';
		    if (this.questionRecords[r].getValue('questions.format_type') == 'Enum') {
		    	new_value = this.getDefaultListOption(this.questionRecords[r]);
		    }
		    var quest_name = this.questionRecords[r].getValue('questions.quest_name');
			xml = xml + '<question quest_name="' + convert2validXMLValueCustom(quest_name) + '" value="' + convert2validXMLValueCustom(new_value) + '"/>';
			this.questionRecords[r].setValue('questions.quest_value', new_value);
		}
		xml = xml + '</questionnaire>';

		record.setValue(this.xmlFieldName, xml);
		return record;
	},
	
	exceedsMaxFieldSize: function(xml) {
		var fieldDefs = View.panels.get(this.panel_id).config.fieldDefs;
		var maxsize = '';
		for (var i = 0; i < fieldDefs.length; i++) {
			if (fieldDefs[i].id == this.xmlFieldName) {
			   maxsize = fieldDefs[i].size;
			}
		}
		if(xml.length > parseInt(maxsize))
		{
		   	alert(getMessage('exceedsMaxFieldSize'));
		   	return true;
		}		
		return false;	
	},
	
	/* generateActions() checks the values of the action_response against the 
	   value of the question field.  If they match, an action record is created
	   with action_title matching the question name and other field values 
	   set by the action_fields array.
	   */	
	generateActions: function(action_fields) {		
		for (var r = 0; r < this.questionRecords.length; r++) {
			var questionRecord = this.questionRecords[r];
			var quest_name = questionRecord.getValue('questions.quest_name');
			var activity_type = questionRecord.getValue('questions.activity_type');
			var action_response = questionRecord.getValue('questions.action_response');
			var quest_value = '';
			if (View.panels.get(this.panel_id).config.type == 'form')
				quest_value = $(this.panel_id + '_' + 'question' + r + '.' + 'answer_field').value;
			else quest_value = questionRecord.getValue('questions.quest_value');
			
			if (action_response && quest_value == action_response && activity_type) {
				
			        var record = {};
		    		record['activity_log.activity_type'] = activity_type;
		    		record['activity_log.action_title'] = quest_name;

		    		if (action_fields) {
			    		for (var i = 0; i < action_fields.length; i++) {
			    			record[action_fields[i][0]] = action_fields[i][1];
					    }
		    		}
			        var parameters = {
		        		tableName: 'activity_log',
		        		fields: toJSON(record)
		    		};			        
		    		var result = AFM.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-saveRecord', parameters);
		    		
			        if (result.code == 'executed') {
			         	alert(getMessage('auto_generated_response')+" - '"+quest_name+"'");
			    	} else {
			    		alert(result.code + " :: " + result.message);
			  		}
			}
		}
	}
});

function convert2validXMLValueCustom(fieldValue)
{
	/* use custom encoder for all special characters since 
	   the hidden question XML field is automatically decoded 
	   upon view load.  Special characters (like '&' and '>') 
	   must be encoded for evaluation of the XML statement.
	   */
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
