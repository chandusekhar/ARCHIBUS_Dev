var spaceExpressConsoleUtilCtrl = View.createController('spaceExpressConsoleUtilCtrl', {
    
    afterCreate: function() {
		this.on('app:space:express:console:refreshUtilization', this.refreshUtilGrid);	
    },

	afterViewLoad: function() {
		//this.addFloorPlan();

       //this.legendGrid.afterCreateCellContent = setLegendLabel;

		//this.drawingPanel.addEventListener('ondwgload', this.onAssetPanel.createDelegate(this));
    },
   
    afterInitialDataFetch: function() {
		//this.addFloorPlan();

       //this.legendGrid.afterCreateCellContent = setLegendLabel;

		//this.drawingPanel.addEventListener('ondwgload', this.onAssetPanel.createDelegate(this));
		//this.setInitialAsOfDateTime();
    },
   
	addFloorPlan: function() {
		var row = new Ab.drawing.DwgCtrlLoc('MARRIOTT', '03');
		this.drawingPanel.addDrawing(row);

        if (this.drawingPanel.dwgLoaded) {
        	this.drawingPanel.clearPersistFills();
        	this.drawingPanel.refresh();
        }
    },           	
            
    onAssetPanel: function(filter) {
		this.drawingPanel.changeDataSourceSelector('highlight', 'highlightUtilizationDs');
		this.drawingPanel.currentHighlightDS = 'highlightUtilizationDs';
		this.drawingPanel.clearPersistFills();
		this.drawingPanel.refresh();
		document.getElementById('selector_hilite').disabled = true;
	},
		
    refreshUtilGrid: function(parameters) {
		var fromDate = parameters['fromDate'];
		this.utilGrid.addParameter('fromDate', fromDate ? fromDate: '1900-01-01');

		var toDate = parameters['toDate'];
		this.utilGrid.addParameter('toDate', toDate ? toDate: '2900-01-01');

		var fromTime = parameters['fromTime'];
		this.utilGrid.addParameter('fromTime', fromTime ? fromTime: '9:00.00.000');

		var toTime = parameters['toTime'];
		this.utilGrid.addParameter('toTime', toTime ? toTime: '9:00.00.000');

		this.utilGrid.refresh();
	}
});

/**
 * Set legend text according the legend level value.
 * @param {Object} row
 * @param {Object} column
 * @param {Object} cellElement
 */
function setLegendLabel(row, column, cellElement) {
    var value = row[column.id];
    if (column.id == 'legend.value' && value != '') {
        var text = value;
        switch (value) {
        	case '0':
        		text = getMessage('legendLevel0');
        		break;
            case '1':
                text = getMessage('legendLevel1');
                break;
            case '2':
                text = getMessage('legendLevel2');
                break;
            case '3':
                text = getMessage('legendLevel3');
                break;
            case '4':
                text = getMessage('legendLevel4');
                break;
        }
        var contentElement = cellElement.childNodes[0];
        if (contentElement)
         contentElement.nodeValue = text;
    }
}