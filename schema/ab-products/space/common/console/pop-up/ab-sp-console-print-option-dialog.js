/**
 * Dialog for pdf printing options.
 */
var printOptionDialogController = View.createController('printOptionDialogController', {
	
	
	/**
	 * The callback for invoking when the the dialog is closed.
	 */
	callback: null,
	
	/**
	 * The current selected plan type.
	 */
	selectedPlanType: null,
	
	/**
	 * The previously selected option values.
	 */
	selectionValues: null,

	/**
	 * The max label line to display the PDF
	 */
	maxLabelLines: 0,
	
	/** The legend datasource for this plantype.*/
	legendDataSource: null,
	
	/**
	 * The legend panel for this plantype.
	 */
	legendPanel: null,
	
	/**
	 * The regex to decide if the label height value is a valid integer.
	 */
	integerRegex : /^\+?[1-9][0-9]*$/,
	
	events :{
		"click #usePublishedLHOption": function() {
			jQuery('#labelHeight').attr('disabled', 'disabled');
		},
		"click #notUsePublishedLHOption": function() {
			jQuery('#labelHeight').removeAttr('disabled');
		},
	},
	
	/**
	 * Get value from active_plantypes to fill in the form.
	 */
	afterInitialDataFetch: function() {
		this.setPrintPropertyFromPlantype();
        $('id_set_color').value = getMessage('setColor');

		this.decodeSelectionValues();
	},
	
	/**
	 * The label height from plantype.
	 */
	setPrintPropertyFromPlantype: function() {
		var labelHeight = 3;
		if (this.selectedPlanType && 'none'!=this.selectedPlanType) {
			var restriction = new Ab.view.Restriction();
			restriction.addClause('active_plantypes.plan_type', this.selectedPlanType, '=');
			var record = this.activePlanTypesDs.getRecords(restriction)[0];
			var pdfHeight = record.getValue('active_plantypes.label_ht_pdf');
			if(pdfHeight) {
				labelHeight = pdfHeight;
			}
			this.maxLabelLines = record.getValue('active_plantypes.max_label_lines');
		}
		jQuery('#labelHeight').attr('value',Number(labelHeight).toFixed(0));
	},
	
	pdfPrintOptionPanel_onExportDrawingToPdf: function() {
		//Organize the parameters to pass to the WFR to generate pdf
		var parameters = {};
		
		parameters['scale'] = "null";
		var scaleOption = jQuery('input[name="scaleOption"]').filter(':checked').val();
		if (scaleOption == 'yes'){
			parameters['scale'] = "consistent";
		}
		
		var notUsePublishedLHOption = jQuery('input[name="labelHeightOptions"]').filter(':checked').val();
		if(notUsePublishedLHOption == 'notUsePublishedLHOption') {
			parameters['usePublishedLabelHeight'] = false;
			var labelHeightValue = jQuery('#labelHeight').val();
			if (this.integerRegex.test(labelHeightValue)) {
				parameters['labelHeight'] = labelHeightValue;
			} else {
				View.alert(getMessage('notPositiveNumber'));
				return;
			}
		} else {
			parameters['usePublishedLabelHeight'] = true; 
		}
		
		if ( !jQuery('#legendShadingColor').val() ) {
			View.alert(getMessage('chooseColor')+" '"+getMessage('setColor')+"'");
			return;
		}
		parameters['tableLedgerShadingColor'] = "0x"+jQuery('#legendShadingColor').val();
		
		var printZoomedIn = jQuery('input[name="zoomedInOption"]').filter(':checked').val();
		if (printZoomedIn == 'yes') {
			var drawingController = View.getOpenerView().controllers.get('spaceExpressConsoleDrawing');
			if (drawingController.selectedFloors.length>0){
				var drawingZoomInfo = drawingController.drawingPanel.getDrawingZoomInfo();
				if (drawingZoomInfo !== null){
					drawingZoomInfo.image =  drawingController.drawingPanel.getImageBytes();
					parameters['drawingZoomInfo'] = drawingZoomInfo;
				}
			}
		}
		
		var hatchBlockSize = "medium";
		var hatchBlockSizeOption = jQuery('input[name="legendHatchBlockSizeOption"]').filter(':checked').val();
		if(hatchBlockSizeOption == 'smallSize') {
			hatchBlockSize = "small";
		} else if(hatchBlockSizeOption == 'largeSize') {
			hatchBlockSize = "large";
		}
		parameters['hatchSize'] = hatchBlockSize;
		
		parameters['labelLines'] = this.maxLabelLines;
		
		parameters['legendDataSource'] = this.legendDataSource;
		
		parameters['selectionValues'] = this.encodeSelectionValues();

		if(this.callback) {
			this.callback(parameters);
		}		
	},

	/**
	 * Encode and store current user's selections so that later user can reuse those options again.
	 */
	encodeSelectionValues: function() {
		var selectionValues = {};
	
		var scaleOption = jQuery('input[name="scaleOption"]').filter(':checked').val();
		selectionValues['scaleOption'] = scaleOption;

		var labelHeightOption = jQuery('input[name="labelHeightOptions"]').filter(':checked').val();
		selectionValues['labelHeightOption'] = labelHeightOption;
		var labelHeightValue = jQuery('#labelHeight').val();
		selectionValues['labelHeightValue'] = labelHeightValue;

		selectionValues['legendShadingColor'] = jQuery('#legendShadingColor').val();

		var zoomedInOption = jQuery('input[name="zoomedInOption"]').filter(':checked').val();
		selectionValues['zoomedInOption'] = zoomedInOption;

		var legendHatchBlockSizeOption = jQuery('input[name="legendHatchBlockSizeOption"]').filter(':checked').val();
		selectionValues['legendHatchBlockSizeOption'] = legendHatchBlockSizeOption;
		
		return selectionValues;
	},

	/**
	 * Initial the dialog with previously selected options by user..
	 */
	decodeSelectionValues: function() {
		if (!this.selectionValues){
			return;
		}

		if (this.selectionValues['scaleOption'] == 'yes'){
			$('yesScale').checked = true; 
		} 
		else {
			$('noScale').checked = true; 
		}
		
		if (this.selectionValues['labelHeightOption'] == 'usePublishedLHOption'){
			$('usePublishedLHOption').checked = true; 
		} 
		else {
			$('notUsePublishedLHOption').checked = true; 
		}
		$('labelHeight').value = this.selectionValues['labelHeightValue'];
				
		$('legendShadingColor').value = this.selectionValues['legendShadingColor'];
		document.getElementById("colorDiv").style.backgroundColor = '#'+this.selectionValues['legendShadingColor'];
		
		if (this.selectionValues['zoomedInOption'] == 'yes'){
			$('zoomedIn').checked = true; 
		} 
		else {
			$('noZoomedIn').checked = true; 
		}

		if (this.selectionValues['legendHatchBlockSizeOption'] == 'smallSize'){
			$('smallSize').checked = true; 
		} 
		else if (this.selectionValues['legendHatchBlockSizeOption'] == 'mediumSize') {
			$('mediumSize').checked = true; 
		}	
		else if (this.selectionValues['legendHatchBlockSizeOption'] == 'largeSize') {
			$('largeSize').checked = true; 
		}
	}
});

/**
 * set true color.
 */
var intervalId;
function setTrueColor(){
    oColorPicker = $("colorDiv");
	intervalId = window.setInterval("checkColorChange()", 100);
    showColorPicker();
}

/**
 * set true color.
 */
function checkColorChange(){
    if ( oColorPicker.colorValue && oColorPicker.colorValue!=$("legendShadingColor").value)  {
		if ( oColorPicker.colorValue.substring(0, 1) === '#' ){
			$("legendShadingColor").value=oColorPicker.colorValue.substring(1,oColorPicker.colorValue.length);
		} 
		else {
			$("legendShadingColor").value=oColorPicker.colorValue;
		}
		window.clearInterval(intervalId);
    }
}