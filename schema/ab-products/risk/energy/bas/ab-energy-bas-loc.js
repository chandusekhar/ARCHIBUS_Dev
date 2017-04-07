var energyBasLocController = View.createController('energyBasLoc', {
	consoleBlRestriction: ' 1=1 ',
	consoleMeterRestriction: '1=1',
	nullValueCode: 'WW99',
	treeRefreshRequired: false,
	
	afterViewLoad: function() {
		this.initializeTreePanel();		
		this.energyBasLoc_ctryTree.setMultipleSelectionEnabled(0);
		this.energyBasLoc_ctryTree.setMultipleSelectionEnabled(1);
		this.energyBasLoc_ctryTree.setMultipleSelectionEnabled(2);
		this.energyBasLoc_ctryTree.setMultipleSelectionEnabled(3);
		this.energyBasLoc_ctryTree.setMultipleSelectionEnabled(4);
		this.energyBasLoc_ctryTree.addEventListener('onChangeMultipleSelection', this.onChangeNodesSelection.createDelegate(this));
		
		this.energyBasLoc_chart.addParameter('noCity', getMessage('msg_no_city_id'));
		this.energyBasLoc_chart.addParameter('noSite', getMessage('msg_no_site_id'));
		this.energyBasLoc_chart.addParameter('noBuilding', getMessage('msg_no_bl_id'));
	},
	
	afterInitialDataFetch: function() {
		this.isDemoMode = getDemoMode();
		
		getSelectBillTypeOptions('energyBasLoc_billTypeSelect');
		setBillUnitsSelect('energyBasLoc_billTypeSelect', 'energyBasLoc_billUnitsSelect');
		this.energyBasLoc_console_onClear();
		
		this.refreshTreeWithConsoleBlRestriction();
		onTreeExpandAll('energyBasLoc_ctryTree', false);
		onTreeSelectAll('energyBasLoc_ctryTree', false);
		
		if (this.isDemoMode) {
			$('energyBasLoc_dateRangeSelect').value = 'none';
			this.energyBasLoc_console.setFieldValue('bl.date_start', '2009-05-16');
			this.energyBasLoc_console.setFieldValue('bl.date_end', '2014-07-15');
			onTreeExpandAll('energyBasLoc_ctryTree', true);
			onTreeSelectValues('energyBasLoc_ctryTree', 4, [3, 5, 6, 9]);
		}		
		
		$('energyBasLoc_console_bl.date_start').onchange = function() {
			$('energyBasLoc_dateRangeSelect').value = 'none';
			validationAndConvertionDateInput(this, 'energyBasLoc_console_bl.date_start', null, 'false', true, true); if (window.temp!=this.value) afm_form_values_changed=true;
		}; 
		$('energyBasLoc_console_bl.date_end').onchange = function() {
			$('energyBasLoc_dateRangeSelect').value = 'none';
			validationAndConvertionDateInput(this, 'energyBasLoc_console_bl.date_start', null, 'false', true, true); if (window.temp!=this.value) afm_form_values_changed=true;			
		};
				
		var chartTitle = getChartTitle('energyBasLoc_locDtlSelect', 'energyBasLoc_normAreaCheck',$('energyBasLoc_billUnitsSelect').value, $('energyBasLoc_billTypeSelect').value);
		this.energyBasLoc_chart.setTitle(chartTitle);
		this.energyBasLoc_console_onShow();
	},
	
	onChangeNodesSelection: function(node){
		if(node.selected){
			onTreeExpandAll('energyBasLoc_ctryTree', true, node);
		} else if (!node.selected) {
			onTreeExpandAll('energyBasLoc_ctryTree', false, node)
		}
	},
	
	initializeTreePanel: function(){
    	this.energyBasLoc_ctryTree.createRestrictionForLevel = createRestrictionForLevel;
    },
	
	energyBasLoc_chart_afterRefresh: function() {
		var chartTitle = getChartTitle('energyBasLoc_locDtlSelect', 'energyBasLoc_normAreaCheck',$('energyBasLoc_billUnitsSelect').value, $('energyBasLoc_billTypeSelect').value);
		this.energyBasLoc_chart.setTitle(chartTitle);
		View.closeProgressBar();
	},
	
	energyBasLoc_console_onClear: function() {
		this.energyBasLoc_console.clear();
		$('energyBasLoc_dateRangeSelect').value = 'year';
		setDates('energyBasLoc_console', 'year');
		$('energyBasLoc_locDtlSelect_bl').selected = true;
		$('energyBasLoc_normAreaCheck').checked = true;
	},
	
	energyBasLoc_console_onShow: function() {
		var date_start = this.energyBasLoc_console.getFieldValue('bl.date_start');
		var date_end = this.energyBasLoc_console.getFieldValue('bl.date_end');
		if (date_start == '' || date_end == '') {
			View.showMessage(getMessage('enterDateStart'));
			return;
		}
		
		if (this.treeRefreshRequired) {
			this.refreshTreeWithConsoleBlRestriction();
			onTreeExpandAll('energyBasLoc_ctryTree', true);
			onTreeSelectAll('energyBasLoc_ctryTree', true);
			this.treeRefreshRequired = false;
		}		
		
		this.energyBasLoc_ctryTree_onShowSelected();
	},
	
	refreshTreeWithConsoleBlRestriction: function() {
		var consoleBlRestriction = getConsoleBlRestriction('energyBasLoc_console');
		var consoleMeterRestriction = getConsoleMeterRestriction('energyBasLoc_console','loc');
		if ((consoleBlRestriction != this.consoleBlRestriction) ||(consoleMeterRestriction !=this.consoleMeterRestriction)) {
			this.energyBasLoc_ctryTree.addParameter('consoleBlRestriction', consoleBlRestriction);
			this.energyBasLoc_ctryTree.addParameter('consoleMeterRestriction', consoleMeterRestriction);
			this.consoleBlRestriction = consoleBlRestriction;
			this.consoleMeterRestriction = consoleMeterRestriction;
			this.energyBasLoc_ctryTree.refresh();
		}
	},
	
	energyBasLoc_ctryTree_onShowSelected: function() {
		var date_start = this.energyBasLoc_console.getFieldValue('bl.date_start');
		var date_end = this.energyBasLoc_console.getFieldValue('bl.date_end');
		if (date_start == '' || date_end == '') {
			View.showMessage(getMessage('enterDateStart'));
			return;
		}
		
		var consoleRestriction = getCommonConsoleRestriction('energyBasLoc_console');
		consoleRestriction += " AND " + getTimeSpanRestriction();
		consoleRestriction += " AND " + getTreeRestriction('energyBasLoc_ctryTree');
		consoleRestriction +=  " AND " + getConsoleMeterRestriction('energyBasLoc_console','loc');
		this.energyBasLoc_chart.addParameter('consoleRestriction', consoleRestriction);
		
		if(isElectricDemand('energyBasLoc_console','loc')){
			this.energyBasLoc_chart.addParameter('sum.max', "MAX");
		}else{
			this.energyBasLoc_chart.addParameter('sum.max', "SUM");
		}
		
		this.energyBasLoc_chart.addParameter('conversion.factor', getConversionFactor($('energyBasLoc_billTypeSelect').value, $('energyBasLoc_billUnitsSelect').value));
		
		if ($('energyBasLoc_normAreaCheck').checked) {
			this.energyBasLoc_chart.addParameter('selectedNormByArea', '1');
		} else this.energyBasLoc_chart.addParameter('selectedNormByArea', '0');
		
		var value = $('energyBasLoc_locDtlSelect').value;
		var locDtl = getLocDtl(value);
		this.energyBasLoc_chart.addParameter('locDtl', locDtl);

		View.openProgressBar(getMessage('refreshChart'));
		this.energyBasLoc_chart.refresh();
		
		checkVirtualMeterOverlap('energyBasLoc_ctryTree', 'energyBasLoc_locDtlSelect');
	}
});

function getTimeSpanRestriction() {
	var restriction = " 1=1 ";
	var console = View.panels.get('energyBasLoc_console');
	
	var	date_start = console.getFieldValue('bl.date_start');
	var	date_end = console.getFieldValue('bl.date_end');

	restriction += " AND bas_data_time_norm_num.date_measured >= ${sql.date('" + date_start + "')} ";
	restriction += " AND bas_data_time_norm_num.date_measured <= ${sql.date('" + date_end + "')} ";
	
	return restriction;
}

function changeUnits(){
	setBillUnitsSelect('energyBasLoc_billTypeSelect', 'energyBasLoc_billUnitsSelect');	
	setTreeRefresh();
}

function setTreeRefresh(){
	var controller = View.controllers.get('energyBasLoc');
	controller.treeRefreshRequired = true;
}
