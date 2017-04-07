
/**
 * Select Value control subclasses the MiniConsole control.

 */

var multi_gd
var multi_prevData = new Array();
var multi_prevSelected = new Array();
var multi_prevSelectedDesc = new Array();


Ab.grid.MultiSelectValues = Ab.grid.MiniConsole.extend({

    // custom event handler called when the user selects the row
    selectValueListener: null,

    /**
     * Constructor.
     * @param {dialog} Ext.BasicDialog
     */
	constructor: function(dialog) {
        var parameters = Ab.view.View.selectValueParameters;

        // set Select Value view title
        var defaultTitle = "Select Values";

        var dialogTitle = defaultTitle;
        if (parameters.title != null && parameters.title != "") {
            dialogTitle = parameters.title;
        }
        //dialog.setTitle(defaultTitle + ' - ' + parameters.title + ' ' + '<input id="' + this.id + '_Return" value="Return Selected" type="button" onClick="multi_afterSelectValue()"/>');
        dialog.setTitle(dialogTitle);

        var configObject = new Ab.view.ConfigObject();

       configObject.setConfigParameter('viewDef', new Ab.view.ViewDef(null, 0, parameters.selectTableName, toJSON(parameters.visibleFieldNames)));
        configObject.setConfigParameter('sortColumnID', parameters.visibleFieldNames[0]);
        configObject.setConfigParameter('indexColumnID', parameters.showIndex ? parameters.visibleFieldNames[0] : '');
        configObject.setConfigParameter('restriction', parameters.restriction);
        //configObject.setConfigParameter('filterValues', convertedFilterValues);
        configObject.setConfigParameter('refreshWorkflowRuleId', parameters.workflowRuleId);
        configObject.setConfigParameter('groupIndex', 0);
        configObject.setConfigParameter('cssClassName', null);
        configObject.setConfigParameter('showOnLoad', true);
        configObject.setConfigParameter('selectionEnabled', true);
         configObject.setConfigParameter('multipleSelectionEnabled', false);
        configObject.setConfigParameter('useParentRestriction', false);
        configObject.setConfigParameter('recordLimit', parameters.recordLimit);




        if(valueExists(parameters.sortValues)){
       	 	configObject.setConfigParameter('sortValues', parameters.sortValues);
        }

        // construct the grid
       // this.selectValueListener = multi_afterSelectValue;
      this.isDistinct = true;
        this.isCollapsed = false;

        this.inherit(dialog.body.id, configObject);

        // add the panel toolbar DIV element to the dialog
        Ext.DomHelper.insertBefore($(dialog.body.id),
        		'<div class="panelToolbar" id="' + dialog.body.id + '_head"></div>');

        var buttonTitle = this.getLocalizedString(Ab.grid.MultiSelectValues.z_TITLE_DEFAULT_TITLE);
        var headerEl = Ext.get(dialog.body.id + '_head');
        if (headerEl !== null) {
            this.toolbar = new Ext.Toolbar({
				autoHeight: true,
				cls: 'panelToolbar',
				renderTo: headerEl
			});

            this.toolbar.addFill();
            this.toolbar.addButton({text: Ab.view.Action.CHEVRON + this.getLocalizedString(buttonTitle), handler: multi_afterSelectValue});
        }


        // get data records

		this.initialDataFetch();


	//	configObject.setConfigParameter('multipleSelectionEnabled', true);
     //  this.inherit(dialog.body.id, configObject);
	//	this.refresh();

    },

	/**
	 * Overrides Grid.beforeBuild() to change column type to 'link'.
	 */
	beforeBuild: function() {
	    this.inherit();

		//this.addColumnFirst(new Ab.grid.Column(Ab.grid.ReportGrid.COLUMN_NAME_MULTIPLE_SELECTION,"","checkbox",this.onChangeMultipleSelection.createDelegate(this)));
		this.addColumnFirst(new Ab.grid.Column(Ab.grid.ReportGrid.COLUMN_NAME_MULTIPLE_SELECTION,"","checkbox",this.onbrgMutliSelectChange.createDelegate(this)));
	},

	onbrgMutliSelectChange: function(row){
//aler()
		this.onChangeMultipleSelection.createDelegate(row)
		var parameters = Ab.view.View.selectValueParameters;
		var startNum = 0

		var selectedFieldName = trim(parameters.selectFieldNames[0]);
		var selectedValue = row[selectedFieldName];
		if (typeof(selectedValue) == 'undefined') {
			selectedValue = row[selectedFieldName];
		}

		var Prev = 'false'
		//If not appending then see if the item was previously selected
		if (parameters.append != 'true' ) {
			startNum = multi_prevData.length
			//loop through the prev data to see if it matches
			for (var RL=0, numOfList = multi_prevData.length; RL < numOfList;RL++) {
				if (selectedValue == multi_prevData[RL]) {
					Prev = 'true'
					//if it does then either set the corresponding multi_prevSelected to '' - if unselected or back to the value if selected
					if(row.row.isSelected()){
						multi_prevSelected[RL] = selectedValue
					}
					else{
						multi_prevSelected[RL] = ''
					}
					RL = multi_prevData.length
				}
			}
		}
		//for ones to append to the current list
		if (Prev == 'false') {
			//if the item is selected - add it to the list
			if(row.row.isSelected()){

				multi_prevSelected[multi_prevSelected.length] = selectedValue
				multi_prevSelectedDesc[multi_prevSelected.length - 1] = ''
				for (var i = 1; i < parameters.selectFieldNames.length; i++) {

					selectedFieldName = trim(parameters.selectFieldNames[i]);
					selectedValue = row[selectedFieldName];
					if (typeof(selectedValue) == 'undefined') {
						selectedValue = selectedFieldName
					}


					/**
					 *if (selectedFieldName.indexOf(".")==-1) {
					 *	selectedValue = selectedFieldName
					 *}
					 *else {
					 *	selectedValue = row[selectedFieldName];
					 *	if (typeof(selectedValue) == 'undefined') {
					 *		selectedValue = row[selectedFieldName];
					 *	}
					 *}
					 */

					if (multi_prevSelectedDesc[multi_prevSelectedDesc.length - 1] != '') {
						multi_prevSelectedDesc[multi_prevSelectedDesc.length - 1] = multi_prevSelectedDesc[multi_prevSelectedDesc.length - 1] + '~'
					}
					multi_prevSelectedDesc[multi_prevSelectedDesc.length - 1] = multi_prevSelectedDesc[multi_prevSelectedDesc.length - 1]  + selectedValue

					if (parameters.ds == null) {i = parameters.selectFieldNames.length}


				}
			}
			else {
				//else if it's unselected - loop through the list and set it to ''
				for (var RL=startNum, numOfList = multi_prevSelected.length; RL < numOfList;RL++) {

					if (selectedValue == multi_prevSelected[RL]) {
						multi_prevSelected[RL] = ''
						RL = multi_prevSelected.length
					}
				}
			}
		}

	},

	/**
	 * Overrides Grid.afterBuild().
	 */
	afterBuild: function() {

		this.inherit();

		multi_gd = this

		var headerCells = this.headerRows[0].getElementsByTagName("th");
		var headerCell = headerCells[0];
		//headerCell.innerHTML = '<input id="' + this.id + '_Return" value="Return Selected" type="button" onClick="multi_afterSelectValue()"/>';
		headerCell.innerHTML = '<input id="' + this.id + '_checkAll" type="checkbox"/>';
		var checkAllEl = Ext.get(this.id + '_checkAll');
		if (valueExists(checkAllEl)) {
			var panel = this;
			checkAllEl.on('click', function(event, el) {
				panel.selectAll(el.checked);
				for (var r=0, rows = panel.rows.length; r < rows;r++) {
					panel.onbrgMutliSelectChange(panel.rows[r])
				}
			});
		}


		//if calling from a list box or text box loop through and check ones that are there
		var parameters = Ab.view.View.selectValueParameters;

		if (parameters.ds == null && parameters.append != 'true' ) {
			var form = Ab.view.View.getControl('', parameters.formId);
			var targetFieldName = trim(parameters.targetFieldNames[0]);




			if (form != null) {

				var input = form.getFieldElement(targetFieldName);

				if (input != null) {

					if (input.type == 'select-one') {
						if (input.options.length !=0) {

							//Loop through the listbox values

							for (var RL=0, numOfList = input.options.length; RL < numOfList;RL++) {
								multi_prevData[RL] = input.options[RL].value
								multi_prevSelected[RL] = input.options[RL].value
								multi_prevSelectedDesc[RL] = input.options[RL].text
							}
						}
					}
					else if (input.type == 'text-area' || input.type == 'text') {
						if (input.value !="") {
							multi_prevData = input.value.split(parameters.deliminator)
							multi_prevSelected = input.value.split(parameters.deliminator)
						}
					}
				}
			}
		}
	},

	afterRefresh: function() {
		this.inherit();
		var parameters = Ab.view.View.selectValueParameters;
		var selectedFieldName = trim(parameters.selectFieldNames[0])
		var rowCount = this.gridRows.getCount();
		var startNum = multi_prevData.length
		var numSel = 0
		if (parameters.append == 'true'){
			startNum
		}
		for (var rw=0, numOfRows = rowCount; rw < numOfRows; rw++) {
			var row = this.rows[rw];
			//Get the info for the first value field
			var rowValue = row[selectedFieldName];
			for (var RL=startNum, numOfList = multi_prevSelected.length; RL < numOfList;RL++) {
				if (rowValue == multi_prevSelected[RL]) {
					row.row.select()
					RL = numOfList
					numSel = numSel + 1
					if (numSel == multi_prevSelected.length - startNum) {
						rw = rowCount
					}
				}
			}
		}
	}
},



{
	// @begin_translatable
	z_TITLE_DEFAULT_TITLE: 'Return Selected'
	// @end_translatable

});

/**
 * Called when the user selects a value in the mini-console.
 */
function multi_afterSelectValue() {
//aler()
	var index = null
	//var selectedRows = multi_gd.getSelectedRows();
	//if (selectedRows.length ==0) {
	//	alert('Please select one or more records to return or click the close button')
	//}
	//else{
	var newRecord
	var firstRecord = 'true'
		// this adds the info to the supplied ds
		//can modify to return the info to a listbox
		//	or concantinate the info to a textbox
		var parameters = Ab.view.View.selectValueParameters;
		var deliminator = parameters.deliminator

		var form = Ab.view.View.getControl('', parameters.formId);

		//If there is a ds passed in use it to create records
		if (parameters.ds != null) {
			//if opened via a popup
			var DS = View.getOpenerView().dataSources.get(parameters.ds)
			//If opened in a panel
			if (typeof(DS) == "undefined") {DS = View.dataSources.get(parameters.ds)}
		}
		//else we will concatinate the info into the text or list control supplied


		//Loop through the multi_prevSelected array and add anything that is not = ''
		for (var RL=0, numOfList = multi_prevSelected.length; RL < numOfList;RL++) {
			newRecord = null
			if (multi_prevSelected[RL] != '') {
				if (parameters.ds != null) {
					newRecord = new Ab.data.Record();
					newRecord.isNew = true;
				}

				//bh if there is a dot then it's a field if not it's a hard coded value
				var selectedValue = multi_prevSelected[RL];

				//loop through the multi_prevSelectedDesc - seperated by a '~'

				descArray = multi_prevSelectedDesc[RL].split('~')

				// for all selected values
				for (var i = 0; i < parameters.selectFieldNames.length; i++) {
					var previousValue = ''
					var targetFieldName = trim(parameters.targetFieldNames[i]);
					var selectedFieldName = trim(parameters.selectFieldNames[i]);

					// get selected value
					if (i !=0) {
						selectedValue = descArray[i - 1]
					}

					//add each value to the ds values
					if (parameters.ds != null) {
						newRecord.values[targetFieldName] = selectedValue;
					}
					else {
						// save selected value into opener form field (if it exists)
						if (form != null) {
							var input = form.getFieldElement(targetFieldName);
							if (input != null) {
								if (input.type == 'select-one') {
									if (firstRecord == 'true') {
										input.options.length = 0;
									}
									//if delminator not null then use the deliminated number - else add it at the end
									if (deliminator != null) {
										if (index == null ) {
											if (parameters.append != 'true') {
												index = 0
											}
											else if (deliminator > input.options.length) {
												index = null
												deliminator = null

											}
											else {
												index = deliminator
											}
										}
										else {
											index = index + 1
										}
									}
									else {
										index = null;
									}
									i = i + 1
									previousValue = descArray[0];
									addSelectOption(input, selectedValue, previousValue,index)
								}
								else if (input.type == 'text-area' || input.type == 'text') {


									if (firstRecord == 'true') {
										input.value = '';
									}
									previousValue = input.value
									if (previousValue != '') {
										selectedValue = previousValue + parameters.deliminator + selectedValue ;
									}

									input.value = selectedValue;
									window.afm_form_values_changed = true;

								}
							}
						}
					}
				}
				firstRecord = 'false'
			}
			//Add new records to ds
			//Will need to add error handling if this fails to insert a set of records
			if (parameters.ds != null && newRecord ) {
				DS.saveRecord(newRecord);
			}
		}
		//Refresh the screen if you have updated the ds
		if (parameters.ds != null) {
			form.refresh()
		}
		multi_prevData = []
		multi_prevSelected = []
		multi_prevSelectedDesc = []
		Ab.view.View.closeDialog();
	//}
}

function addSelectOption(selectBox, value, text, index)
{
  var newOptionElement = document.createElement('option');
  newOptionElement.text = text;
  newOptionElement.value = value;

  if (index == null || typeof(index) == 'undefined') {
    try {
      selectBox.add(newOptionElement, null); // standards compliant, not IE.
    }
    catch (ex) {
      selectBox.add(newOptionElement);  // IE only.
    }
  }
  else {
    var insertBeforeElement = selectBox.options[index];
    try {
      selectBox.add(newOptionElement, insertBeforeElement); // standards compliant, not IE.
    }
    catch (ex) {
      selectBox.add(newOptionElement, index);  // IE only.
    }
  }
}

function multiselectValue(formId, ds, title, targetFieldNames, selectTableName, selectFieldNames, visibleFieldNames,
                          restriction, deliminator,append, actionListener, applyFilter, showIndex, workflowRuleId, width, height,
                          selectValueType, recordLimit, sortValues) {

        // prepare Select Value parameters
        View.selectValueParameters = {
		   formId: formId,
           ds: ds,
           title: title,
           targetFieldNames: targetFieldNames,
           selectTableName: selectTableName,
           selectFieldNames: selectFieldNames,
           visibleFieldNames: visibleFieldNames,
           restriction: restriction,
           deliminator: deliminator,
           append: append,
           actionListener: actionListener,
           applyFilter: applyFilter,
           workflowRuleId: workflowRuleId,
           recordLimit: recordLimit
        };
        if (valueExists(selectValueType)) {
            View.selectValueParameters.selectValueType = selectValueType;
        }

		View.selectValueParameters.showIndex = getValueIfExists(showIndex, true);

		View.selectValueParameters.append = getValueIfExists(append, false);


		if (valueExists(sortValues)) {
 			sortValues = eval('(' + sortValues + ')');
            View.selectValueParameters.sortValues = toJSON(sortValues);
        }
		var box = {
			width: width,
			height: height
		};
		View.ensureInViewport(box);

        // open Select Value window
		//var newTargetWindowSettings = "titlebar=no,toolbar=no,menubar=no,resizable=yes,scrollbars=yes,status=yes,width=1000,height=650";

        //View.openDialog('brg-multiselect-values.axvw', restriction, false, 100, 100, box.width, box.height);
        View.openDialog('', restriction, false, 100, 100, box.width, box.height);

        new Ab.grid.MultiSelectValues(View.dialog);

    }
