function setPanelProperty(property, value){
	var view = tabsFrame.newView;
	var numberOfTgrps = view.tableGroups.length;
	var index = numberOfTgrps - tabsFrame.selectedTableGroup - 1;
	if((index == numberOfTblgrps - 1) && ((viewType == 'reports') || (viewType == 'summaryReports')) ){	
		if(isMiniWizard() && property == 'txfr') {
			default_value = 'false';
		} else {
			default_value = 'true';
		}	
	} else {
		default_value = 'false';
	}

	setPanelLevelProperty('panelProperties', index, default_value, property, value);  
}


/**
 * Sets and store panel-level properties into view object in tab frame
 *
 * @param	name			String 	Name of view-level property
 * @param	tgrpndx			Number 	Index of the tablegroup
 * @param	default_value	String	Default value of property	
 * @param	property		String 	Name of chart property
 * @param	value			String	Input value (this might be further processed to match view validation)
 * @return	None
 *
 */
function setPanelLevelProperty(name, tgrpndx, default_value, property, value){
	var view = tabsFrame.newView;
	var propertiesArr = view[name];
	var properties = propertiesArr[tgrpndx];
	
	if ((default_value == value) && (properties.hasOwnProperty(property) )){
		delete properties[property];
	} else {
		var temp = new Object();
		for(i in properties){
			temp[i] = properties[i];
		}
		temp[property] = value;
		propertiesArr[tgrpndx] = temp;			
	}

	view[name] = propertiesArr;
	tabsFrame.newView = view;   
}


function showSelectedActionOptions(panelProperties, index, bIsDataTgrp){
	
	// reset to default
	if(viewType == 'reports'){
		$('showIndexAndFilterOnLoad').value =	'true';
	}else{
		$('showIndexAndFilterOnLoad').value =	'false';
	}
	if(bIsDataTgrp && ((viewType == 'reports') || (viewType == 'summaryReports')) ){			
		$('xls').value = 'true';
		$('docx').value =	'true';	
		
		if (isAlterWizard()) {
			// 3050721
			$('xls').value = 'false';
			$('docx').value = 'false';
			$('txfr').value = 'false';
			$('showIndexAndFilterOnLoad').value = 'false';
		} else if(isMiniWizard()) {
			// 3042418
			$('txfr').disabled = true;
			$('txfr').value = 'false';
			panelProperties['txfr'] = 'false';
		} else {
			// 3042418
			$('txfr').disabled = false;
			$('txfr').value = 'true';
		}
	}	else {
		$('docx').value = 'false';
		$('xls').value = 'false';
		$('txfr').value =	'false';	
	}
	var view=tabsFrame.newView;

	// now redisplay according to previous selections
	if(panelProperties.hasOwnProperty('docx')){
		$('docx').value = panelProperties['docx'];
	}
	if(panelProperties.hasOwnProperty('xls')){
		$('xls').value = panelProperties['xls'];
	}
	if(panelProperties.hasOwnProperty('txfr')){
		$('txfr').value = panelProperties['txfr'];
	}
	if(panelProperties.hasOwnProperty('showIndexAndFilterOnLoad')){
		$('showIndexAndFilterOnLoad').value = panelProperties['showIndexAndFilterOnLoad'];
	}
}


/**
 * Used in "Set Options" tab.  Gets list of fields in view object and allows
 * user to specify column span, row span, and custom field titles
 *
 * @param 	view	Object of view properties
 * @param	index	Integer holding the index of the selected tablegroup
 * @return	None
 *
 */
function createColumnReportSummaryTable(view, index){
    // get fields
    var fields = view.tableGroups[index].fields;
    
    // get HTML table
    var summaryTable = $('columnReportSummary');
    tBody = summaryTable.tBodies[0];
    
    // if fields were defined
    if (fields != undefined) {
    
        // for each field in selected tablegroup of view object
        for (var i = 0; i < fields.length; i++) {
     			
        			// get the number of rows in the HTML table.  this number changes as fields are added
        			var numOfRows = tBody.rows.length;
        			var data_type = fields[i].data_type;
        			
        			// create row and add id (although this id can become obsolete as we can remove rows
        			var new_tr = document.createElement('tr');
        			new_tr.id = "row" + i;
        			new_tr.ml_heading_english = fields[i].ml_heading_english;
        			        			
        			// add cell with ml heading
        			var new_td = document.createElement('td');
        			new_td.innerHTML = fields[i].ml_heading;
        			//new_td.innerHTML = '<input type="text" id="' + fields[i].table_name + '.' +  fields[i].field_name + '" name="colspan" value="' + fields[i].ml_heading + '" onBlur="setColumnReportOpts(this)"/>';
        			new_tr.appendChild(new_td);
        			
        			// add cell with field name
        			var new_td = document.createElement('td');
        			new_td.innerHTML = fields[i].table_name;
        			new_tr.appendChild(new_td);
        			
        			// add cell with field name
        			var new_td = document.createElement('td');
        			new_td.innerHTML = fields[i].field_name;
        			new_tr.appendChild(new_td);

        			// add cell with ml heading (english)
        			var new_td = document.createElement('td');
        			new_td.innerHTML = '<input type="text" name="ml_heading_english" value="' + fields[i].ml_heading_english.replace('\r\n', ' ') + '" onBlur="setFieldValueByAttribute(this, ' +  index + ", '" + fields[i].table_name + "', '" + fields[i].field_name + "'" + ')"/>';
        			new_tr.appendChild(new_td);
        			        			        			
        			// add cell with checkbox for count
        			var new_td = document.createElement('td');
        			var rowspan = valueExists(fields[i]['rowspan']) ? fields[i]['rowspan'] : 1;
        			new_td.innerHTML = '<input type="text" name="rowspan" maxlength="4" size="4" value="' + rowspan + '" onBlur="setColumnReportOptsSpan(this, ' + index + ", '" + fields[i].table_name + "', '" + fields[i].field_name + "'" + ')"/>';
        			new_tr.appendChild(new_td);
        			

        			// add cell for sum, but only create checkbox if "Numeric" data_type
        			var new_td = document.createElement('td');
        			var colspan = valueExists(fields[i]['colspan']) ? fields[i]['colspan'] : 1;
        			new_td.innerHTML = '<input type="text" name="colspan" maxlength="4" size="4" value="' + colspan + '" onBlur="setColumnReportOptsSpan(this, ' + index + ", '" + fields[i].table_name + "', '" + fields[i].field_name + "'" + ')"/>';
        			new_tr.appendChild(new_td);
        			        			      			       			
        			// add row to table body
        			tBody.appendChild(new_tr);
        }
        
        // add table body to table
        summaryTable.appendChild(tBody);
    }
}

function setColumnReportOptsSpan(obj, index, tablename, fieldname){	 
	if(isNumeric(obj)){
		setFieldValueByAttribute(obj, index, tablename, fieldname);
	}
}

function setFieldValueByAttribute(obj, index, tablename, fieldname){
	var value = obj.value;
	var view = tabsFrame.newView;
	var fields = view.tableGroups[index].fields;
	var attribute = obj.name;

	for(var i=0; i<fields.length; i++){
		if((tablename == fields[i].table_name) && (fieldname == fields[i].field_name)){
			var field = fields[i];
			field[attribute] = obj.value;	
			view.tableGroups[index].fields[i] = field;
			tabsFrame.newView = view;
			return;				
		}
	}
}

function resetColumnReportOptions(curTgrp){
	var fields = curTgrp.fields;
	for(var i=0; i<fields.length; i++){
		fields[i]['ml_heading_english'] = fields[i].ml_heading_english_original;
		if(valueExists(fields[i]['colspan'])){
			delete fields[i].colspan;
		}
		if(valueExists(fields[i]['rowspan'])){
			delete fields[i].rowspan;
		}
	}	
}