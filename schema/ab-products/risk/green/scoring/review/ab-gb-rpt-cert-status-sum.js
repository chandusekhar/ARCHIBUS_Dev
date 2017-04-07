var abGbRptCertStatusSumController = View.createController('abGbRptCertStatusSumController',{
	/**
	 * on_click event handler for 'Show' action
	 */
	fieldsArraysForRestriction: new Array(['gb_cert_proj.cert_std',,'gb_cert_proj.cert_std'], ['gb_cert_proj.cert_status',,'gb_cert_proj.cert_status'], ['bl.site_id',,'bl.site_id'], ['gb_cert_proj.bl_id',,'gb_cert_proj.bl_id'] ),
	/**
	 * Object: consoleRes is a string format sql restriction that generated from top consoles field values
	 */
	consoleRes:'1=1',
	
	/**
	 * Object: stdRes is a string format sql restriction that generated from the selected row.
	 */
	statusRes:'1=1',
	
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
	abGbRptCertStatusSumConsole_onDoc: function() {
		this.consoleRes=this.getConsoleRestriction();
		var printableRestrictions=this.getResParameters();
		var parameters = {
				'consoleRes':this.consoleRes,
				'printRestriction':true, 
				'printableRestriction':printableRestrictions
				};
		
		//passing parameters
		View.openPaginatedReportDialog('ab-gb-rpt-cert-status-sum-paginate.axvw', null, parameters);
	},
	getResParameters:function(){
		var printableRestrictions = [];
		if(this.abGbRptCertStatusSumConsole.getFieldValue('gb_cert_proj.bl_id')){
			printableRestrictions.push({'title': getMessage('blId'), 'value': this.abGbRptCertStatusSumConsole.getFieldValue('gb_cert_proj.bl_id')});
		}
		if(this.abGbRptCertStatusSumConsole.getFieldValue('gb_cert_proj.cert_std')){
			printableRestrictions.push({'title': getMessage('certStd'), 'value': this.abGbRptCertStatusSumConsole.getFieldValue('gb_cert_proj.cert_std')});
		}
		if(this.abGbRptCertStatusSumConsole.getFieldValue('gb_cert_proj.cert_status')){
			printableRestrictions.push({'title': getMessage('certStatus'), 'value': this.abGbRptCertStatusSumConsole.getFieldValue('gb_cert_proj.cert_status')});
		}
		if(this.abGbRptCertStatusSumConsole.getFieldValue('bl.site_id')){
			printableRestrictions.push({'title': getMessage('siteId'), 'value': this.abGbRptCertStatusSumConsole.getFieldValue('bl.site_id')});
		}
		return printableRestrictions;
	},
	
	/**
	 * This event handler is called when user click Show button in title bar of Top console
	 * Construct a string format sql restriction from consoles fields, store it to property consoleRes;
	 * Select first tab, Set consoleRes to sql parameter 'consoleRes' of panel Left Bottom Certification Standard grid and show this grid.
	 * Hide grid panels in second tab and third tab.
	 */
	abGbRptCertStatusSumConsole_onShow: function() {
		this.consoleRes=this.getConsoleRestriction();
		this.abGbRptCertStatusSumGrid.addParameter('consoleRes', this.consoleRes);
		var tabs = View.getControl('', 'Select_By');
		tabs.selectTab("tab1");
		this.abGbRptCertStatusSumGrid.refresh();
	},
	
	/**
	 * Get restriction from console
	 */
	getConsoleRestriction: function() {
		var console = View.panels.get('abGbRptCertStatusSumConsole');
		var restriction = getRestrictionStrFromConsole(console, this.fieldsArraysForRestriction);		
		return restriction;
	},
	
	abGbRptCertStatusSumGrid_afterRefresh:function(){
		var tabs = View.panels.get("Select_By");
		tabs.findTab("tab2").enable(false);
		tabs.findTab("tab3").enable(false);
	},
	
	abGbRptCertStatusSumStdGrid_afterRefresh:function(){
		var tabs = View.panels.get("Select_By");
		tabs.findTab("tab3").enable(false);
	}
	
})

/**
 * This event handler is called when user click any row in grid of first tab.
 * Retrieve certification status value from current selected row
 * Construct a parsed restriction object from certification status value, property selectedStd, and other field values of console; pay attention this restriction object is against tables gb_cert_proj and bl
 * Select second tab, show and refresh Right Bottom Certification Projects grid by applying above constructed restriction object.
 */
function onSelectStatus() {
	var certStatus = View.panels.get('abGbRptCertStatusSumGrid');
    var selectedRowIndex = certStatus.selectedRowIndex;
    var rows = certStatus.rows;
    var  cert_status= rows[selectedRowIndex]['gb_cert_proj.cert_status.raw'];
    var statusRes;
    if(valueExistsNotEmpty(cert_status)){
    	statusRes="gb_cert_proj.cert_status='"+cert_status+"'";
    }else {
    	statusRes='1=1';
    }
    var tabs = View.getControl('', 'Select_By');
	tabs.selectTab("tab2");
	abGbRptCertStatusSumController.statusRes=statusRes;
	
	abGbRptCertStatusSumController.abGbRptCertStatusSumStdGrid.addParameter('consoleRes', abGbRptCertStatusSumController.consoleRes);
	abGbRptCertStatusSumController.abGbRptCertStatusSumStdGrid.addParameter('statusRes', statusRes);
	abGbRptCertStatusSumController.abGbRptCertStatusSumStdGrid.refresh();
}

/**
 * Retrieve certification standard value from current selected row, store it to property selectedStd.
 * generate a string format sql restriction by selectedStd
 */
function onSelectStd() {
	 	var certStdPanel = View.panels.get('abGbRptCertStatusSumStdGrid');
	    var selectedRowIndex = certStdPanel.selectedRowIndex;
	    var rows = certStdPanel.rows;
	    var cert_std = rows[selectedRowIndex]['gb_cert_proj.cert_std'];
	    var stdRes;
	    if(valueExistsNotEmpty(cert_std)){
	    	stdRes="gb_cert_proj.cert_std='"+cert_std+"'";
	    }else {
	    	stdRes='1=1';
	    }
	    var tabs = View.getControl('', 'Select_By');
		tabs.selectTab("tab3");
		
		var res=abGbRptCertStatusSumController.consoleRes +"and "+stdRes+" and "+abGbRptCertStatusSumController.statusRes;
		abGbRptCertStatusSumController.abGbRptCertStatusSumProjGrid.refresh(res);
}