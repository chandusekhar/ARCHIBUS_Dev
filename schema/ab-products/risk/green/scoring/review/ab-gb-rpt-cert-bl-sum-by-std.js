var abGbRptCertBlSumByStdController = View.createController('abGbRptCertBlSumByStdController',{
	/**
	 * on_click event handler for 'Show' action
	 */
	fieldsArraysForRestriction: new Array(['gb_cert_proj.cert_std',,'gb_cert_proj.cert_std'], ['gb_cert_proj.certified_level',,'gb_cert_proj.certified_level'], ['bl.site_id',,'bl.site_id'], ['gb_cert_proj.bl_id',,'gb_cert_proj.bl_id'] , ['gb_cert_proj.project_name',,'gb_cert_proj.project_name']),
	/**
	 * Object: consoleRes is a string format sql restriction that generated from top consoles field values
	 */
	consoleRes:'1=1',
	
	/**
	 * Object: stdRes is a string format sql restriction that generated from the selected row.
	 */
	stdRes:'1=1',
	
    afterInitialDataFetch: function(){
		
		var tabs = View.panels.get("Select_By");
		tabs.findTab("tab2").enable(false);
		tabs.findTab("tab3").enable(false);
    },
	/**
	 * This event handler is called when user click DOC button in title bar of Top console
	 * Construct a restriction from consoles fields
	 * Open the paginated report view ab-gb-rpt-cert-bl-sum-by-std -paginate.axvw by passing restriction to datasource of paginated panel. 
	 */
	abGbRptCertBlSumByStdConsole_onDoc: function() {
		this.consoleRes=this.getConsoleRestriction();
		var printableRestrictions=this.getResParameters();
		var parameters = {
				'consoleRes':this.consoleRes,
				'printRestriction':true, 
				'printableRestriction':printableRestrictions
		};
		//passing parameters
		View.openPaginatedReportDialog('ab-gb-rpt-cert-bl-sum-by-std-paginate.axvw', null, parameters);
	},
	getResParameters:function(){
		var printableRestrictions = [];
		if(this.abGbRptCertBlSumByStdConsole.getFieldValue('bl.site_id')){
			printableRestrictions.push({'title': getMessage('siteId'), 'value': this.abGbRptCertBlSumByStdConsole.getFieldValue('bl.site_id')});
		}
		if(this.abGbRptCertBlSumByStdConsole.getFieldValue('gb_cert_proj.project_name')){
			printableRestrictions.push({'title': getMessage('proName'), 'value': this.abGbRptCertBlSumByStdConsole.getFieldValue('gb_cert_proj.project_name')});
		}
		if(this.abGbRptCertBlSumByStdConsole.getFieldValue('gb_cert_proj.certified_level')){
			printableRestrictions.push({'title': getMessage('certLevel'), 'value': this.abGbRptCertBlSumByStdConsole.getFieldValue('gb_cert_proj.certified_level')});
		}
		if(this.abGbRptCertBlSumByStdConsole.getFieldValue('gb_cert_proj.bl_id')){
			printableRestrictions.push({'title': getMessage('blId'), 'value': this.abGbRptCertBlSumByStdConsole.getFieldValue('gb_cert_proj.bl_id')});
		}
		if(this.abGbRptCertBlSumByStdConsole.getFieldValue('gb_cert_proj.cert_std')){
			printableRestrictions.push({'title': getMessage('certStd'), 'value': this.abGbRptCertBlSumByStdConsole.getFieldValue('gb_cert_proj.cert_std')});
		}
		return printableRestrictions;
	},
	/**
	 * This event handler is called when user click Show button in title bar of Top console
	 * Construct a string format sql restriction from consoles fields, store it to property consoleRes;
	 * Select first tab, Set consoleRes to sql parameter 'consoleRes' of panel Left Bottom Certification Standard grid and show this grid.
	 * Hide grid panels in second tab and third tab.
	 */
	abGbRptCertBlSumByStdConsole_onShow: function() {
		this.consoleRes=this.getConsoleRestriction();
		this.abGbRptCertBlSumStdGrid.addParameter('consoleRes', this.consoleRes);
		
		var tabs = View.getControl('', 'Select_By');
		tabs.selectTab("tab1");
		this.abGbRptCertBlSumStdGrid.refresh();
		
	},
	
	/**
	 * Get restriction from console
	 */
	getConsoleRestriction: function() {
		var console = View.panels.get('abGbRptCertBlSumByStdConsole');
		var restriction = getRestrictionStrFromConsole(console, this.fieldsArraysForRestriction);		
		return restriction;
	},
	
	abGbRptCertBlSumStdGrid_afterRefresh:function(){
		var tabs = View.panels.get("Select_By");
		tabs.findTab("tab2").enable(false);
		tabs.findTab("tab3").enable(false);
	},
	
	abGbRptCertBlSumLevelGrid_afterRefresh:function(){
		var tabs = View.panels.get("Select_By");
		tabs.findTab("tab3").enable(false);
	}
})

/**
 * Retrieve certification standard value from current selected row, store it to property selectedStd.
 * generate a string format sql restriction by selectedStd
 * Select second tab, set property consoleRes to sql parameter 'consoleRes', meanwhile set above generated string restriction to sql parameter ��stdRes�� of Middle Bottom Certified Level  grid and show that grid.
 */
function onSelectStd() {
	 	var certStdPanel = View.panels.get('abGbRptCertBlSumStdGrid');
	    var selectedRowIndex = certStdPanel.selectedRowIndex;
	    var rows = certStdPanel.rows;
	    var cert_std = rows[selectedRowIndex]['gb_cert_std.cert_std1'];
	    var stdRes;
	    if(valueExistsNotEmpty(cert_std)){
	    	stdRes="gb_cert_proj.cert_std='"+cert_std+"'";
	    }else {
	    	stdRes='1=1';
	    }
	    var tabs = View.getControl('', 'Select_By');
		tabs.selectTab("tab2");
		abGbRptCertBlSumByStdController.stdRes=stdRes;
	    abGbRptCertBlSumByStdController.abGbRptCertBlSumLevelGrid.addParameter('consoleRes', abGbRptCertBlSumByStdController.consoleRes);
	    abGbRptCertBlSumByStdController.abGbRptCertBlSumLevelGrid.addParameter('stdRes', stdRes);
	    abGbRptCertBlSumByStdController.abGbRptCertBlSumLevelGrid.refresh();
}


/**
 * This event handler is called when user click any row in grid of second tab.
 * Retrieve certification level value from current selected row
 * Construct a parsed restriction object from certification level value, property selectedStd, and other field values of console; pay attention this restriction object is against tables gb_cert_proj and bl
 * Select third tab, show and refresh Right Bottom Certification Projects grid by applying above constructed restriction object.
 */
function onSelectLevel() {
	var certLevel = View.panels.get('abGbRptCertBlSumLevelGrid');
    var selectedRowIndex = certLevel.selectedRowIndex;
    var rows = certLevel.rows;
    var  certified_level= rows[selectedRowIndex]['gb_cert_proj.certified_level'];
    var levelRes;
    if(valueExistsNotEmpty(certified_level)){
    	levelRes="gb_cert_proj.certified_level='"+certified_level+"'";
    }else {
    	levelRes='1=1';
    }
    var tabs = View.getControl('', 'Select_By');
	tabs.selectTab("tab3");
	var res=abGbRptCertBlSumByStdController.consoleRes+" and "+abGbRptCertBlSumByStdController.stdRes+" and "+levelRes;
    abGbRptCertBlSumByStdController.abGbRptCertBlSumProjGrid.refresh(res);
   
}

