Ab.grid.ReportGrid.prototype.createHeaderRow = function(parentElement, columns, level) {
	//var tHead = this.tableHeadElement;
	var headerRow = document.createElement('tr');
	headerRow.id = 'headerRow_' + level;
	if (this.cssHeaderClassName != '') {
		headerRow.className = this.cssHeaderClassName;
	}

	for (var c = 0, column; column = columns[c]; c++) {
	    if (column.hidden === true) continue;
	    
		var headerCell = document.createElement('th');
		headerCell.colSpan = column.colSpan;
		headerCell.id = 'sortHeader_' + c;
		var title = inputPrimaryKeyCtrl.ml_heading;
		if (valueExistsNotEmpty(title)){
		    title = title.replace(/&amp;/g, '&')
            title = title.replace(/&gt;/g, '>');
		    title = title.replace(/&lt;/g, '<');
		    title = title.replace(/&apos;/g, '\'');
		    title = title.replace(/&quot;/g, '\"');
		}
		headerCell.innerHTML = Ext.util.Format.ellipsis(title, 80);
		
        if (c == 0 && this.multipleSelectionEnabled) {
            var handler = this.onChangeMultipleSelection.createDelegate(this);
            headerCell.innerHTML = '<input id="' + this.id + '_checkAll" type="checkbox"/>';
        }
		
		this.decorateHeaderCell(level, c, column, headerCell);
		
		// justify titles to match content (numbers right justified, text left justified)
		headerCell.className = column.type == 'number' ? 'headerTitleNumber' : 'headerTitleText';
		
		headerRow.appendChild(headerCell);

	}

	// somehow parentElement gets lost in IE, reset
	if (parentElement == null) {
		parentElement = this.tableHeadElement;
	}

	parentElement.appendChild(headerRow);
	this.headerRows[level] = headerRow;
    
	// add select all/unselect all event handler
    var checkAllEl = Ext.get(this.id + '_checkAll');
    if (valueExists(checkAllEl)) {
        var panel = this;
        checkAllEl.on('click', function(event, el) {
            panel.selectAll(el.checked);
        });
    }
}

var inputPrimaryKeyCtrl = View.createController('inputPrimaryKey', {
	tblName:null,
	pkName:null,
	fromTo: null,
	openerController:null,
	noOfPk:null,
	ml_heading:null,
	currentRow:null,
	pkValidationRestrictionFrom:"1=1",
	pkValidationRestrictionTo:"1=1",

	setInputParameters:function(tableName, fieldName, childController, setFromTo, noOfPks, ml_heading, index){
		this.tblName = tableName;
		this.pkName = fieldName;
		this.fromTo = setFromTo;
		this.openerController = childController;
		this.noOfPk = noOfPks;
		this.ml_heading = ml_heading;
		this.currentRow = index;

		//set the pkValidationRestriction
		setRestrictionForValidation();
		
		if (this.pkValidationRestrictionFrom.length > 0 && setFromTo == 'from'){
				this.inputValues.addParameter('perOtherPKrestriction',this.pkValidationRestrictionFrom);
		}
		
		if (this.pkValidationRestrictionTo.length > 0 && setFromTo == 'to'){
				this.inputValues.addParameter('perOtherPKrestriction',this.pkValidationRestrictionTo);
		}
		
		this.inputValues.addParameter('table_name', this.tblName);
		this.inputValues.addParameter('field_name', this.pkName);
		this.inputValues.refresh();
	}
});

function setRestrictionForValidation(){

	var fromGrid = inputPrimaryKeyCtrl.openerController.fromPKNamePanel;
	var toGrid = inputPrimaryKeyCtrl.openerController.toPKNamePanel;
	var noOfPks = inputPrimaryKeyCtrl.noOfPk;

		for (i=0; i<noOfPks; i++){
			if ( valueExistsNotEmpty(fromGrid.gridRows.items[i].getFieldValue('afm_flds.value')) ){
				var value = fromGrid.gridRows.items[i].getFieldValue('afm_flds.value');
				var fieldName = fromGrid.gridRows.items[i].getFieldValue('afm_flds.field_name');
				value = value.replace(/\'/g, "''");;
				if (inputPrimaryKeyCtrl.currentRow != i ){
					inputPrimaryKeyCtrl.pkValidationRestrictionFrom += " AND " + fieldName + "='" + value + "'";
				}
			}
			if ( valueExistsNotEmpty(toGrid.gridRows.items[i].getFieldValue('afm_flds.value')) ){
				var value = toGrid.gridRows.items[i].getFieldValue('afm_flds.value');
				var fieldName = toGrid.gridRows.items[i].getFieldValue('afm_flds.field_name');
				value = value.replace(/\'/g, "''");;
				if (inputPrimaryKeyCtrl.currentRow != i ){
					inputPrimaryKeyCtrl.pkValidationRestrictionTo += " AND " + fieldName + "='" + value + "'";
				}
			}
		}
}

function setPKValue(row){

		var fieldValue = row["afm_flds.fldname"];
		var fromGrid = inputPrimaryKeyCtrl.openerController.fromPKNamePanel;
		var toGrid = inputPrimaryKeyCtrl.openerController.toPKNamePanel;
		
		for (i = 0; i< fromGrid.gridRows.items.length; i++){
			var item = fromGrid.gridRows.items[i].getFieldValue('afm_flds.field_name');

			if(inputPrimaryKeyCtrl.pkName == item){
				
				if (inputPrimaryKeyCtrl.fromTo == 'from'){
					fromGrid.gridRows.items[i].setFieldValue('afm_flds.value', fieldValue);
				}else{
					toGrid.gridRows.items[i].setFieldValue('afm_flds.value', fieldValue);
				}
			}
		}
		View.closeThisDialog();
}
