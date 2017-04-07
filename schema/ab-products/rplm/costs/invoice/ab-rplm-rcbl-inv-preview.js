var invoicePreview = View.createController('invoicePreview', {
	// selected invoice id
	invoice_id: null,
	
	// if VAT and MC is enabled
	isVATAndMCEnabled: false,
	
	// form to be displayed
	formId: null,
	
	afterViewLoad: function(){
		// check if multi currency is enabled
		this.isVATAndMCEnabled =  View.activityParameters['AbCommonResources-EnableVatAndMultiCurrency'] == 1;
		if(valueExists(this.view.parameters['invoiceId'])){
			this.invoice_id = this.view.parameters['invoiceId'];
		}
		if(this.isVATAndMCEnabled){
			this.formId = "formInvoicePreviewMcVat";
			View.panels.get("formInvoicePreviewMcVat").show(true, true);
			View.panels.get("formInvoicePreview").show(false, true);
		}else{
			this.formId = "formInvoicePreview";
			View.panels.get("formInvoicePreviewMcVat").show(false, true);
			View.panels.get("formInvoicePreview").show(true, true);
		}
		
		this.gridCostsInvoicePreview.addEventListener("afterGetData", formatTotalsForCurrency);
	},
	
	afterInitialDataFetch: function(){
		// refresh form
		var objForm = View.panels.get(this.formId);
		objForm.addParameter("invoiceId",this.invoice_id);
		objForm.refresh();
		
		// refresh cost grid
		var restriction = new Ab.view.Restriction();
		restriction.addClause("cost_tran.invoice_id", this.invoice_id, "=");
	    this.gridCostsInvoicePreview.refresh(restriction);

	},
	
	gridCostsInvoicePreview_afterRefresh: function(){
		var totalRow = document.getElementById('gridCostsInvoicePreview_totals');
		totalRow.cells[2].innerHTML = getMessage("total_costs_for_invoice");
	}
});

/**
 * Format total for currency
 * @param reportGrid
 * @param data
 */
function formatTotalsForCurrency(reportGrid, data){
	// if there no records - exit
	if(data.records.length == 0){
		return;
	}
	
	var dataSource = reportGrid.getDataSource();
	var mainTableName = dataSource.mainTableName;
	var record = data.records[0];
	var totals = data.totals;
	dataSource.fieldDefs.each(function(fieldDef){
		if(fieldDef.showTotals){
			var id = valueExists(fieldDef.fullName) ? fieldDef.fullName : fieldDef.id;
			if(valueExists(fieldDef.currencyField)){
				fieldDef.currency = record[fieldDef.currencyField];
			}
			var name = id;
			if (name.indexOf('.') != -1) {
				name = name.substring(name.indexOf('.') + 1);
			}
			var totalsName = mainTableName + '.sum_' + name;
			if(valueExists( data.totals[totalsName])){
				var neutralValue =  data.totals[totalsName].n;
				var localizedValue = dataSource.formatValue(id, neutralValue, true);
				 data.totals[totalsName].l = localizedValue;
			}
		}
	});
	
}

/**
 * Format form field to show currency symbol when are read only.
 * @param form
 */
function formatCurrency(form){
	var dataSource = form.getDataSource();
	var fieldValues = form.record.values;
	var record = form.record;
	dataSource.fieldDefs.each(function(fieldDef){
		var fieldName = fieldDef.fullName;
		if(valueExistsNotEmpty(fieldDef.currencyField) 
				&& valueExists(form.fields.get(fieldName)) 
					&& form.fields.get(fieldName).fieldDef.readOnly){
			
			var neutralValue = record.getValue(fieldName);
			var localizedValue = record.getLocalizedValue(fieldName);
			if(valueExistsNotEmpty(localizedValue)){
				var formattedValue = dataSource.formatCurrencyValue(fieldName, localizedValue, fieldValues);
				form.setFieldValue(fieldName, formattedValue, neutralValue, false);
			}
		}else if(valueExistsNotEmpty(fieldDef.currency)
				&& valueExists(form.fields.get(fieldName)) 
					&& form.fields.get(fieldName).fieldDef.readOnly ){
			var neutralValue = record.getValue(fieldName);
			var localizedValue = record.getLocalizedValue(fieldName);
			if(valueExistsNotEmpty(localizedValue)){
				var formattedValue = dataSource.formatCurrencyValue(fieldName, localizedValue, fieldValues);
				form.setFieldValue(fieldName, formattedValue, neutralValue, false);
			}
		}
	});
}
