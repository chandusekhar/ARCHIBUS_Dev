var chart = null;
var name_value = null;
var old_bl_fl_value = null;
var new_bl_fl_value = null;
var bl_fl_id = null;
var name = null;

var click_index = 0;
var move_flag = "";

var allocWizStackController = View.createController('allocWizStack', {
	dateReview: '',
	scn_id: '',
	isExpanded: false,
	
	afterViewLoad: function(){
		this.allocWizStack_chartPanel.addParameter('available', getMessage('available'));
		this.allocWizStack_yearTree.addParameter('start', getMessage('start'));
		this.allocWizStack_yearTree.addParameter('end', getMessage('end'));
		var unitTitle = getMessage('unitTitleMetric');
		var units = View.project.units;
		if (units == "imperial") {
			unitTitle = getMessage('unitTitleImperial');
		}
		this.allocWizStack_yearTree.addParameter('unitTitle', unitTitle);
    	this.initializeTreePanel();
    	Ext.get('allocWizStack_console').dom.style.display = 'none';
    	this.isExpanded = false;
    },
    
    afterInitialDataFetch: function() {
    	this.allocWizStack_console_onFilter();
    },
    
    initializeTreePanel: function(){
    	this.allocWizStack_yearTree.createRestrictionForLevel = createRestrictionForLevel;
    },
    
    changeScenario: function() {
    	this.scn_id = View.getOpenerView().controllers.get('allocWiz').scn_id;
    	this.allocWizStack_console.clear();
    	Ext.get('allocWizStack_console').dom.style.display = 'none';
    	this.isExpanded = false;
    },
    
    allocWizStack_yearTree_beforeRefresh: function() {
    	View.openProgressBar(getMessage('refreshingChart'));
    	this.scn_id = View.getOpenerView().controllers.get('allocWiz').scn_id;
    	var consoleRestriction = this.getGpConsoleRestriction('bl.site_id');
		this.allocWizStack_yearTree.addParameter('consoleRestriction', consoleRestriction);
		this.allocWizStack_yearTree.addParameter('scn_id', this.scn_id);
    },
    
    allocWizStack_yearTree_afterRefresh: function() {
    	this.allocWizStack_yearTree.expand();
    	View.updateProgressBar(1/4);
    	
		var minEvtDate = this.getMinEvtDate();
		if (minEvtDate) {
			var secondEvtDate = this.getMinEvtDate(minEvtDate);
			this.refreshStackChart(minEvtDate, secondEvtDate);
		}
		else this.refreshStackChart(minEvtDate);
		View.closeProgressBar();
		if (this.scn_id_old != this.scn_id) {   		
    		setTimeout('openBlDialog()', 500);
    		this.scn_id_old = this.scn_id;
    	}
	},
	
	allocWizStack_console_onToggleFilter: function() {    	
		if (this.isExpanded) {
			Ext.get('allocWizStack_console').dom.style.display = 'none';
		} else Ext.get('allocWizStack_console').dom.style.display = '';
		this.isExpanded = !this.isExpanded;
	},
	
	allocWizStack_console_onFilter: function() {
		this.allocWizStack_yearTree.refresh();
	},
	
	getGpConsoleRestriction: function(siteFieldName) {
		var consoleRestriction = "1=1";
		var sites = this.allocWizStack_console.getFieldMultipleValues('bl.site_id');
		if (this.isExpanded && sites.length > 0 && sites[0] != '') {
			consoleRestriction += " AND " + siteFieldName + " IN (";
			var sitesList = this.getSitesList();
			consoleRestriction += sitesList + ")";
		}
		var bls = this.allocWizStack_console.getFieldMultipleValues('bl.bl_id');
		if (this.isExpanded && bls.length > 0 && bls[0] != '') {
			var blsList = '';
			consoleRestriction += " AND gp.bl_id IN (";
			for (var i = 0; i < bls.length; i++) {
				var bl = bls[i];
				if (blsList != '') blsList += ',';
				blsList += "'" + bl + "'";
			}
			consoleRestriction += blsList + ")";
		}
		return consoleRestriction;
	},
	
	allocWizStack_console_onAddBuilding: function() {
		var controller = this;
		View.openDialog('ab-alloc-wiz-bl-add-pf.axvw', null, true, {
	    	width: 800,
	    	height: 500,
	    	dateReview: controller.dateReview,
			closeButton : true,
			callback: function(dateStart) {
				controller.allocWizStack_console_onFilter();
				if (dateStart) {
					var secondEvtDate = controller.getMinEvtDate(dateStart);
					controller.refreshStackChart(dateStart, secondEvtDate);
				}
			}
		});
	},
	
	refreshStackChart: function(dateStart, secondEvtDate) {
		if (!dateStart) {
			this.allocWizStack_chartPanel.show(false);
			this.allocWizStack_console.setTitle(getMessage('stackChartTitle'));
			return;
		}
		this.dateReview = FormattingDate(dateStart.getDate(), dateStart.getMonth() + 1, dateStart.getFullYear(), "YYYY-MM-DD");
		var consoleRestriction = this.getGpConsoleRestriction('gp.site_id');
		var legendConsoleRestriction = this.getGpConsoleRestriction('bl.site_id');
		this.allocWizStack_chartPanel.addParameter('dateReview', FormattingDate(dateStart.getDate(), dateStart.getMonth() + 1, dateStart.getFullYear(), "YYYY-MM-DD"));
		this.allocWizStack_chartPanel.addParameter('portfolioScenario', this.scn_id);
		this.allocWizStack_chartPanel.addParameter('consoleRestriction', legendConsoleRestriction);
		this.allocWizStack_chartPanel.refresh(consoleRestriction);
		this.allocWizStack_chartPanel.show();
		
		var dateStartTitle = FormattingDate(dateStart.getDate(), dateStart.getMonth() + 1, dateStart.getFullYear(), strDateShortPattern);
		var dateEndTitle = "";
		if (secondEvtDate) {
			var dateEnd = new Date();
			var day = 24*60*60*1000; //1 day
			dateEnd.setTime(secondEvtDate.getTime() - day);
			dateEndTitle = FormattingDate(dateEnd.getDate(), dateEnd.getMonth() + 1, dateEnd.getFullYear(), strDateShortPattern);
			dateEndTitle = " - " + dateEndTitle;
		}
		this.allocWizStack_console.appendTitle(getMessage('allocFrom') + " " + dateStartTitle + dateEndTitle);
		clearSelection();
	},	
	
	allocWizStack_console_onAllocWizStack_selValSite: function() {
		var controller = View.controllers.get('allocWizStack');
		View.selectValue('allocWizStack_console',
				getMessage('sites'),
				['bl.site_id'],
				'site',
				['site.site_id'],
				['site.site_id', 'site.name'],
				"EXISTS (SELECT 1 FROM gp LEFT OUTER JOIN bl ON gp.bl_id=bl.bl_id WHERE bl.site_id = site.site_id AND gp.portfolio_scenario_id = '"+controller.scn_id +"')",
				null, false, false, null, 800, 600, 'multiple'
		);
	},
	
	allocWizStack_console_onAllocWizStack_selValBl: function() {
		var restriction = '1=1';
		var sitesList = this.getSitesList();
		if (sitesList != '') restriction += " AND bl.site_id IN ("	+ sitesList + ")";	
		
		var controller = View.controllers.get('allocWizStack');
		View.selectValue('allocWizStack_console',
				getMessage('buildings'),
				['bl.site_id','bl.bl_id'],
				'bl',
				['bl.site_id','bl.bl_id'],
				['bl.site_id','bl.bl_id','bl.name'],
				"EXISTS (SELECT 1 FROM gp WHERE gp.bl_id=bl.bl_id AND gp.portfolio_scenario_id = '"+controller.scn_id +"') AND " + restriction,
				null, false, false, null, 800, 600, 'multiple'
		);
	},
	
	getMinEvtDate: function(firstDate) {
		var restriction = new Ab.view.Restriction();
		restriction.addClause('gp.portfolio_scenario_id', this.scn_id);
		var bls = this.allocWizStack_console.getFieldMultipleValues('bl.bl_id');
		if (this.isExpanded && bls.length > 0 && bls[0] != '') restriction.addClause('gp.bl_id', bls, 'IN');
		if (firstDate) restriction.addClause('gp.date_start', FormattingDate(firstDate.getDate(), firstDate.getMonth() + 1, firstDate.getFullYear(), "YYYY-MM-DD"), '>');
		
		var siteRestriction = "1=1";
		var sitesList = this.getSitesList();
		if (sitesList != '') {
			siteRestriction += " AND bl.site_id IN (" + sitesList + ")";			
		}
		this.allocWizStack_ds3.addParameter('siteRestriction', siteRestriction);
		
		var date_start = null;
		var records = this.allocWizStack_ds3.getRecords(restriction);
		if (records.length > 0) {
			date_start = records[0].getValue('gp.date_start');
		}
		return date_start;
	},
	
	getSitesList: function() {
		var sitesList = '';
		var sites = this.allocWizStack_console.getFieldMultipleValues('bl.site_id'); 
		for (var i = 0; i < sites.length; i++) {
			var site = sites[i];
			if (site == '') continue;
			if (sitesList != '') sitesList += ',';
			sitesList += "'" + site + "'";
		}
		return sitesList;
	}
});

function openBlDialog() {
	var controller = View.controllers.get('allocWizStack');
	if (controller.allocWizStack_yearTree._nodes.length == 0) {
		View.openDialog('ab-alloc-wiz-bl-add-pf.axvw', null, true, {
	    	width: 800,
	    	height: 500,
			closeButton : true,
			callback: function() {
				controller.allocWizStack_console_onFilter();
			}
		});
	}
}

function onClickTreeNode(){
	var controller = View.controllers.get('allocWizStack');
	var objTree = View.panels.get('allocWizStack_yearTree');
	var crtNode = objTree.lastNodeClicked;
	var levelIndex = crtNode.level.levelIndex;
	var restriction = new Ab.view.Restriction();
	if(levelIndex == 1){
		var date_start = crtNode.data['gp.date_start'];
		var dateISO = getDateWithISOFormat(date_start);
		var minEvtDate = getDateObject(dateISO);
		var secondEvtDate = controller.getMinEvtDate(minEvtDate);
		controller.refreshStackChart(minEvtDate, secondEvtDate);
	}
	if(levelIndex == 3){
		var gp_id = crtNode.data['gp.gp_id'];
		restriction.addClause('gp.gp_id', Number(gp_id));
		var viewName = 'ab-alloc-wiz-evts-edit-pf.axvw';
    	var record = controller.allocWizStack_ds1.getRecord(restriction);
    	var is_available = record.getValue('gp.is_available');
    	if (is_available == 0) viewName = 'ab-alloc-wiz-evts-edit-unavail-pf.axvw';
    	var ls_id = record.getValue('gp.ls_id');
    	if (ls_id != '') viewName = 'ab-alloc-wiz-evts-edit-ls-pf.axvw';
    	
		View.openDialog(viewName, restriction, false, {
	    	width: 900,
	    	height: 570,
			closeButton : true,
			isNewGroup: false,
			callback: function(dateStart) {
				controller.allocWizStack_console_onFilter();
				var secondEvtDate = controller.getMinEvtDate(dateStart);
				controller.refreshStackChart(dateStart, secondEvtDate);
			}
		});
	}
}

function createRestrictionForLevel(parentNode, level){
    var restriction = new Ab.view.Restriction();
    if (parentNode.data) {
        var prob = parentNode.data['gp.dv_id'];
        if (!prob && level == 1) {
            restriction.addClause('gp.dv_id', '', 'IS NULL', 'AND', true);
        }
		
		if (prob && level == 1) {
            restriction.addClause('gp.dv_id', prob, '=', 'AND', true);
        }
        
        if (prob && level == 2){
        	var date_start = parentNode.data['gp.date_start'];
        	date_start = getDateWithISOFormat(date_start);
            restriction = new Ab.view.Restriction();
            restriction.addClause('gp.date_start', date_start, '=', 'AND', true);
        }  
        
        if (prob && level == 3){
        	var date_start = parentNode.data['gp.date_start'];
        	date_start = getDateWithISOFormat(date_start);
        	var name = parentNode.data['gp.name'];
            restriction = new Ab.view.Restriction();
            restriction.addClause('gp.date_start', date_start, '=', 'AND', true);
            restriction.addClause('gp.name', name, '=', 'AND', true);
        } 
    }
    return restriction;
}

function getClickedItemData(obj) {
	chart = obj.chart;
	var panel = View.panels.get('allocWizStack_chartPanel');
	
	click_index += 1;
	if (click_index > 2){
		click_index = 1;
	}

	bl_fl_id = chart.groupingAxis[0].table + "." + chart.groupingAxis[0].field;
	name = chart.secondaryGroupingAxis[0].table + "." + chart.secondaryGroupingAxis[0].field;

	if (click_index == 1){
		name_value = trim(obj.selectedChartData[name]);
		if (name_value == getMessage('available')) {
			clearSelection();
			return;
		}
		old_bl_fl_value = trim(obj.selectedChartData[bl_fl_id]);
		panel.setInstructions(String.format(getMessage("selectFloor"), name_value));
	}

	if (click_index == 2){
		new_bl_fl_value = trim(obj.selectedChartData[bl_fl_id]);
		
		if (new_bl_fl_value == old_bl_fl_value) {
			clearSelection();
			return;
		}
		
		var controller = View.controllers.get('allocWizStack');
		var restriction = new Ab.view.Restriction();
    	restriction.addClause('gp.name', name_value);
    	restriction.addClause('gp.bl_fl', old_bl_fl_value);
    	restriction.addClause('gp.portfolio_scenario_id', controller.scn_id);
    	restriction.addClause('gp.date_start', controller.dateReview, '<=');
    	restriction.addClause('gp.date_end', controller.dateReview, '>=', ')AND(');
    	restriction.addClause('gp.date_end', '', 'IS NULL', 'OR');
    	
		View.openDialog('ab-alloc-wiz-stack-move-pf.axvw', restriction, false, {
	    	width: 700,
	    	height: 500,
			closeButton : true,
			old_bl_fl_value: old_bl_fl_value,
			new_bl_fl_value: new_bl_fl_value,
			dateReview: controller.dateReview,
			callback: function(dateStart) {
				clearSelection();
				controller.allocWizStack_console_onFilter();
				var secondEvtDate = controller.getMinEvtDate(dateStart);
				controller.refreshStackChart(dateStart, secondEvtDate);
			}
		});
	}
}

function clearSelection() {
	var panel = View.panels.get('allocWizStack_chartPanel');
	move_flag="";
	click_index=0;
	bl_fl_id = null;
	name = null;
	name_value=null;
	new_bl_fl_value=null;
	old_bl_fl_value=null;
	panel.setInstructions(getMessage('moveInstructions'));
}

function onAddNewEvent() {
	var controller = View.controllers.get('allocWizStack');
    var restriction = new Ab.view.Restriction();
    restriction.addClause('gp.portfolio_scenario_id', controller.scn_id);
    View.openDialog('ab-alloc-wiz-evts-edit-pf.axvw', restriction, true, {
    	width: 900,
    	height: 570,
		closeButton : true,
		dateReview: controller.dateReview,
		callback: function(dateStart) {
			controller.allocWizStack_console_onFilter();
			var secondEvtDate = controller.getMinEvtDate(dateStart);
			controller.refreshStackChart(dateStart, secondEvtDate);
		}
	});
}

function onAddUnavail() {
	var controller = View.controllers.get('allocWizStack');
    var restriction = new Ab.view.Restriction();
    restriction.addClause('gp.portfolio_scenario_id', controller.scn_id);
    View.openDialog('ab-alloc-wiz-evts-edit-unavail-pf.axvw', restriction, true, {
    	width: 800,
    	height: 500,
		closeButton : true,
		dateReview: controller.dateReview,
		callback: function(dateStart) {
			controller.allocWizStack_console_onFilter();
			var secondEvtDate = controller.getMinEvtDate(dateStart);
			controller.refreshStackChart(dateStart, secondEvtDate);
		}
	});
}

function onAddLease() {
	var controller = View.controllers.get('allocWizStack');
    var restriction = new Ab.view.Restriction();
    restriction.addClause('gp.portfolio_scenario_id', controller.scn_id);
    View.openDialog('ab-alloc-wiz-evts-edit-ls-pf.axvw', restriction, true, {
    	width: 800,
    	height: 500,
		closeButton : true,
		dateReview: controller.dateReview,
		callback: function(dateStart) {
			controller.allocWizStack_console_onFilter();
			var secondEvtDate = controller.getMinEvtDate(dateStart);
			controller.refreshStackChart(dateStart, secondEvtDate);
		}
	});
}

function getDateObject(ISODate) {
	var tempArray = ISODate.split('-');
	return new Date(tempArray[0],tempArray[1]-1,tempArray[2]);
}
