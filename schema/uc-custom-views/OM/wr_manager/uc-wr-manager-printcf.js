// 2010/05/06 - EWONG - ISSUE 100: Changed the enum_list values to display the Display Value
// 2010/05/10 - EWONG - ISSUE 163: Added replace of linefeeds to html break tags for description/cf_notes fields
// 2010/05/17 - JJYCHAN - Now shows craftspersons list - refreshes on user_form_onload.
// 2010/07/07 - EWONG - ISSUE 232: Hide EQ information if eq_id is blank.
// 2010/09/02 - EWONG - ISSUE 267: Removed unnecessary fields.  Added questions.

function user_form_onload() {
	var form = AFM.view.View.getControl('', 'detailsPanel');
	var priority = form.getFieldValue('wr.priority');
	var status = form.getFieldValue('wr.status');
	var requestor = form.getFieldValue('wr.requestor');

	document.getElementById("Showwr.priority").innerHTML = getEnumDisplay('wr', 'priority', priority);
	document.getElementById("Showwr.status").innerHTML = getEnumDisplay('wr', 'status', status);
	document.getElementById("Showwr.requestor").innerHTML = getFullName(requestor);

	var eqBarCode = form.getFieldValue('wr.eq_id');
	var eqCond = form.getFieldValue('eq.condition');

	if (eqBarCode != "") {
		document.getElementById("eqBarCodeText").innerHTML = eqBarCode;
		document.getElementById("eqBarCodeText2").innerHTML = eqBarCode;
		document.getElementById("eqCondText").innerHTML = eqCond;
		document.getElementById('questionsTable').style.display = 'block';
	}

	var wr_id = form.getFieldValue('wr.wr_id');
	var restriction = "wr_id = " + wr_id;

	var cfGrid = AFM.view.View.getControl('', 'laborPanel');
	cfGrid.refresh(restriction);

	// Hide the Equipment Details if no eq_id
	if (form.getFieldValue('wr.eq_id') == "") {
		var eqElement = document.getElementById("Showeq.eq_std");
		// hide the entire row
		eqElement.parentNode.parentNode.style.display = "none";

		// Note: use eqElement.parentNode.parentNode.nextSibling for the next row.
		// eqElement.parentNode.parentNode.nextSibling.style.display = "none";
	}

	// replace the linefeeds with html breaks (for description and comments)
	// restyle/overwide the 350px width of the readonly span.
	var descriptionSpan =	document.getElementById("Showwr.description");
	descriptionSpan.innerHTML = form.getFieldValue('wr.description').replace(/\n/g, "<br/>");
	descriptionSpan.style.width = "90%";
	var cfnotesSpan = document.getElementById("Showwr.cf_notes");
	cfnotesSpan.innerHTML = form.getFieldValue('wr.cf_notes').replace(/\n/g, "<br/>");
	cfnotesSpan.style.width = "90%";
}


function getEnumDisplay(table_name, field_name, value) {

		var retVal = null;
		var enumDisplay = "";

		var restriction = "table_name = '"+table_name+"' AND field_name = '"+field_name+"'";

		var parameters =
		{
					tableName: 'afm_flds',
					fieldNames: toJSON(['enum_list']),
					restriction: toJSON(restriction)
		};
		var wfrResult = AFM.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecord',parameters);

		if (wfrResult.code == 'executed') {
			var record = wfrResult.data.records[0];
			if (typeof(record) != 'undefined') {
				var fullFieldName = "afm_flds.enum_list";
				retVal = (record[fullFieldName] == null ? null : record[fullFieldName]);
			}
		}

		if (retVal != null) {
			var enumArray;
			enumArray = retVal.split(";");

			var counter = 0;

			while (counter < (enumArray.length-1)) {
				// check if it's equal to the value
				if (enumArray[counter] == value) {
					enumDisplay = enumArray[counter+1];
					break;
				}
				counter = counter + 2;  // need to skip by 2 because it's value/display pair.
			}
		}

		return enumDisplay;
}

function getFullName(emId) {
	var retVal = null;
	var fullName = "";
	var restriction = "em_id='"+emId.replace(/'/g,"''")+"'";

	var parameters =
	{
		tableName: 'em',
		fieldNames: toJSON(['em_id', 'name_first', 'name_last']),
		restriction: toJSON(restriction)
	};
	var wfrResult = AFM.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecord',parameters);

	if (wfrResult.code == 'executed') {
		var record = wfrResult.data.records[0];
		if (typeof(record) != 'undefined') {
			var fullFieldName = "em.name_first";
			var fullFieldName2 = "em.name_last";
			fullName = (record[fullFieldName] == null ? "" : record[fullFieldName]+" ");
			fullName += (record[fullFieldName2] == null ? "" : record[fullFieldName2]);
		}
	}

	// if fullName is empty, just return the original ID
	if (fullName.replace(/\s+$/,"") == "") {
		fullName = emId;
	}

	return fullName;
}