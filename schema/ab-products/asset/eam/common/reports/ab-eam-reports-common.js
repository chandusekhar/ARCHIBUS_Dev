/**
 * Menu item object.
 */
MenuItem = Base.extend({
	// menu id
	id: null,
	
	// parent menu
	parent: null,
	
	// menu type
	type: null, 
	
	// view name
	viewName: null, 
	
	// is view is restricted
	isRestricted: false, 
	
	// parameters to be passed to view
	parameters: null,
	
	// submenu
	submenu: null,
	
	// menu definition
	menuDef: null,
	
	// menu item config
	config: null, 
	
	// menu items
	menuItems: [],
	
	// menu label
	label: null,
	
	// label prefix - used to get translatable text
	labelPrefix: 'menuLabel_',
	
	// on click menu handler
	onClickMenuHandler: null,
	
	// on click menu handler with restriction
	onClickMenuHandlerRestricted: null,
	
	// contructor
	constructor: function(configObject) {
		this.config = configObject;
		Ext.apply(this, configObject);
		Ext.apply(this, configObject.menuDef);
		
		var parent = configObject['parent'];
		if(valueExists(parent)){
			this.parent = parent;
		}
		
		var onClickMenuHandler = configObject['onClickMenuHandler'];
		if(valueExists(onClickMenuHandler)){
			this.onClickMenuHandler = onClickMenuHandler;
		}
		
		var onClickMenuHandlerRestricted = configObject['onClickMenuHandlerRestricted'];
		if(valueExists(onClickMenuHandlerRestricted)){
			this.onClickMenuHandlerRestricted = onClickMenuHandlerRestricted;
		}
		
	},
	

	/**
	 * Build menu item
	 */
	build: function(){
		this.menuItems = [];
		var menuItem = null;
		this.label = getMessage(this.labelPrefix + this.id);
		if(this.type == 'menu'){
			// is submenu type
			var parent = this;
			this.submenu.each(function(subMenuConfig){
				subMenuConfig['parent'] = parent;
				subMenuConfig['onClickMenuHandler'] = parent.onClickMenuHandler;
				subMenuConfig['onClickMenuHandlerRestricted'] = parent.onClickMenuHandlerRestricted;
				var subMenu = new MenuItem(subMenuConfig);
				
				subMenu.build();
			});
			
			if(valueExists(this.parent)){
				menuItem = new Ext.menu.Item({
					text: this.label,
					menu: {items: this.menuItems}
				});			
				
				this.parent.addMenu(menuItem);
			}
		}else {
			// is menu item type
			var onClickHandler = this.getOnClickHandler();
			var menuDef = this.menuDef;
			menuItem = new Ext.menu.Item({
				text: this.label,
				handler: onClickHandler.createDelegate(this, [menuDef])});

			if(valueExists(this.parent)){
				this.parent.addMenu(menuItem);
			}
		}
	},
	
	// construct menu items 
	buildMenuItems: function(){

	},
	
	getOnClickHandler: function(){
		var onClickHandler = this.onClickMenuHandler;
		if(this.isRestricted){
			onClickHandler = this.onClickMenuHandlerRestricted;
		}
		return onClickHandler;
	},
	
	setOnClickMenuHandler: function(handler){
		this.onClickMenuHandler = handler;
	},
	
	setOnClickMenuHandlerRestricted: function(handler){
		this.onClickMenuHandlerRestricted = handler;
	},
	
	addMenu: function(menu){
		if(valueExists(menu)){
			this.menuItems.push(menu);
		}
	}

}, {
	ON_CLICK_MENU_HANDLER: null,
	ON_CLICK_MENU_HANDLER_RESTRICTED: null
});



/**
 * Config settings
 */
var abEamCommonReportsDef = new Ext.util.MixedCollection();
abEamCommonReportsDef.addAll(
		 {id: 'properties',  type: 'menu', viewName: null, isRestricted: false, parameters: null},
		 {id: 'buildings',  type: 'menu', viewName: null, isRestricted: false, parameters: null},
		 {id: 'equipment',  type: 'menu', viewName: null, isRestricted: false, parameters: null},
		 {id: 'furniture',  type: 'menu', viewName: null, isRestricted: false, parameters: null},
		 {id: 'project',  type: 'menu', viewName: null, isRestricted: false, parameters: null},
		 {id: 'information',  type: 'menu', viewName: null, isRestricted: false, parameters: null},
		 {id: 'analysis',  type: 'menu', viewName: null, isRestricted: false, parameters: null},
		 {id: 'taInvCountBy',  type: 'menu', viewName: null, isRestricted: false, parameters: null},
		 {id: 'blByLocation',  type: '', viewName: 'ab-repm-pfadmin-item-by-location.axvw', isRestricted: false, parameters: {viewLocation: 'building', itemType: 'building'}},
		 {id: 'structureByLocation',  type: '', viewName: 'ab-repm-pfadmin-item-by-location.axvw', isRestricted: false,  parameters: {viewLocation: 'structure', itemType: 'structure'}},
		 {id: 'landByLocation',  type: '', viewName: 'ab-repm-pfadmin-item-by-location.axvw', isRestricted: false,  parameters: {viewLocation: 'land', itemType: 'land'}},
		 {id: 'blDashboard',  type: '', viewName: 'ab-rplm-pfadmin-bldgs-dashboard.axvw', isRestricted: false, parameters: null},
		 {id: 'structureDashboard',  type: '', viewName: 'ab-rplm-pfadmin-struc-dashboard.axvw', isRestricted: false, parameters: null},
		 {id: 'landDashboard',  type: '', viewName: 'ab-rplm-pfadmin-land-dashboard.axvw', isRestricted: false, parameters: null},
		 {id: 'propSummary',  type: '', viewName: 'ab-repm-lsadmin-prop-summary.axvw', isRestricted: false, parameters: null},
		 {id: 'blPerformance',  type: '', viewName: 'ab-sp-vw-bl-perf.axvw', isRestricted: false, parameters: null},
		 {id: 'blAllocBenchmark',  type: '', viewName: 'ab-sp-alloc-trend-metric.axvw', isRestricted: false, parameters: null},
		 {id: 'comViolationMap',  type: '', viewName: 'ab-comp-rpt-violation-map.axvw', isRestricted: false, parameters: null},
		 {id: 'comProgramMap',  type: '', viewName: 'ab-comp-rpt-program-map.axvw', isRestricted: false, parameters: null},
		 {id: 'blHazWaste',  type: '', viewName: 'ab-es-hl-bl-rm-w-haz-wast.axvw', isRestricted: false, parameters: null},
		 {id: 'blSustSummary',  type: '', viewName: 'ab-es-bl-ca-sum.axvw', isRestricted: false, parameters: null},
		 {id: 'blHazAssess',  type: '', viewName: 'ab-cb-rpt-haz-bl-map.axvw', isRestricted: false, parameters: null},
		 {id: 'blGreenScoringDash',  type: '', viewName: 'ab-gb-rpt-cert-score-overview.axvw', isRestricted: false, parameters: {title: ''}},
		 {id: 'energConsByLocation',  type: '', viewName: 'ab-energy-bas-loc.axvw', isRestricted: false, parameters: null},
		 {id: 'eqStdBook',  type: '', viewName: 'ab-eqstd-book.axvw', isRestricted: false, parameters: null},
		 {id: 'eqAssetConsole',  type: '', viewName: 'ab-eq-locate.axvw', isRestricted: false, parameters: null},
		 {id: 'eqPlan',  type: '', viewName: 'ab-ap-eq-plans.axvw', isRestricted: true, parameters: null},
		 {id: 'eqInformEdit',  type: '', viewName: 'ab-eq-edit.axvw', isRestricted: false, parameters: null},
		 {id: 'eqByDp',  type: '', viewName: 'ab-eqxdp.axvw', isRestricted: false, parameters: null},
		 {id: 'eqByFl',  type: '', viewName: 'ab-eqxfl.axvw', isRestricted: false, parameters: null},
		 {id: 'slaEdit',  type: '', viewName: 'ab-sla-edit.axvw', isRestricted: false, parameters: null},
		 {id: 'warrantyEdit',  type: '', viewName: 'ab-warranty-edit.axvw', isRestricted: false, parameters: null},
		 {id: 'eqByWarranty',  type: '', viewName: 'ab-eqxwarranty.axvw', isRestricted: false, parameters: {updateTitle: false}},
		 {id: 'eqWarrServContr',  type: '', viewName: 'ab-bldgops-report-eq-warr-servcont.axvw', isRestricted: false, parameters: null},
		 {id: 'insurerEdit',  type: '', viewName: 'ab-insurer-edit.axvw', isRestricted: false, parameters: null},
		 {id: 'policyEdit',  type: '', viewName: 'ab-policy-edit.axvw', isRestricted: false, parameters: null},
		 {id: 'eqByPolicy',  type: '', viewName: 'ab-eqxpolicy.axvw', isRestricted: false, parameters:  {updateTitle: false}},
		 {id: 'lessorEdit',  type: '', viewName: 'ab-eq-lessor-edit.axvw', isRestricted: false, parameters: null},
		 {id: 'eqLeaseEdit',  type: '', viewName: 'ab-eq-lease-edit.axvw', isRestricted: false, parameters: null},
		 {id: 'eqByLease',  type: '', viewName: 'ab-eq-eq-by-lease.axvw', isRestricted: false, parameters: null},
		 {id: 'eqLeaseByLessor',  type: '', viewName: 'ab-eq-lease-by-lessor.axvw', isRestricted: false, parameters: null},
		 {id: 'wrForEqAndLoc',  type: '', viewName: 'ab-bldgops-report-wr-same-eq-loc.axvw', isRestricted: false, parameters: null},
		 {id: 'eqFailAnls',  type: '', viewName: 'ab-pm-rpt-eq-fail-anls.axvw', isRestricted: true, parameters: null},
		 {id: 'eqReplAnls',  type: '', viewName: 'ab-pm-rpt-eq-repl-anls.axvw', isRestricted: true, parameters: null},
		 {id: 'eqMtrcsCsi',  type: '', viewName: 'ab-eq-eq-by-csi.axvw', isRestricted: false, parameters: null},
		 {id: 'fnStdBook',  type: '', viewName: 'ab-fnstd-book.axvw', isRestricted: false, parameters: null},
		 {id: 'taPlans',  type: '', viewName: 'ab-ft-plans.axvw', isRestricted: false, parameters: null},
		 {id: 'taEdit',  type: '', viewName: 'ab-ta-edit.axvw', isRestricted: false, parameters: null},
		 {id: 'fnPlans',  type: '', viewName: 'ab-ap-fn-plans.axvw', isRestricted: false, parameters: null},
		 {id: 'taByDp',  type: '', viewName: 'ab-ap-ft-by-dp.axvw', isRestricted: false, parameters: null},
		 {id: 'taByRm',  type: '', viewName: 'ab-ap-ta-by-fl.axvw', isRestricted: false, parameters: null},
		 {id: 'taInvCountByStd',  type: '', viewName: 'ab-ap-ta-by-std-cnt.axvw', isRestricted: false, parameters: null},
		 {id: 'taInvCountByBl',  type: '', viewName: 'ab-ap-ta-by-bl-cnt.axvw', isRestricted: false, parameters: null},
		 {id: 'taInvCountByFl',  type: '', viewName: 'ab-ap-ta-by-fl-cnt.axvw', isRestricted: false, parameters: null},
		 {id: 'taInvCountByRm',  type: '', viewName: 'ab-ap-ta-by-rm-cnt.axvw', isRestricted: false, parameters: null},
		 {id: 'taInvCountByDp',  type: '', viewName: 'ab-ap-ta-by-dp-cnt.axvw', isRestricted: false, parameters: null},
		 {id: 'taInvCountByDpByBl',  type: '', viewName: 'ab-ap-ta-by-dpxbl-cnt.axvw', isRestricted: false, parameters: null},
		 {id: 'projProfiles',  type: '', viewName: 'ab-proj-project-profiles.axvw', isRestricted: true, parameters: null},
		 {id: 'milestoneStatusByProject',  type: '', viewName: 'ab-proj-milestone-statuses-by-project.axvw', isRestricted: true, parameters: null},
		 {id: 'projCalendar',  type: '', viewName: 'ab-proj-projects-calendar.axvw', isRestricted: true, parameters: null},
		 {id: 'projMap',  type: '', viewName: 'ab-proj-projects-map.axvw', isRestricted: true, parameters: null},
		 {id: 'projOrgImpByBl',  type: '', viewName: 'ab-proj-projects-org-impact-by-building.axvw', isRestricted: false, parameters: null},
		 {id: 'budgetByProgram',  type: '', viewName: 'ab-budget-by-program.axvw', isRestricted: false, parameters: null},
		 {id: 'budgetByProgType',  type: '', viewName: 'ab-budget-by-programtype.axvw', isRestricted: false, parameters: null},
		 {id: 'projFundByYear',  type: '', viewName: 'ab-projects-approved-by-year-report.axvw', isRestricted: true, parameters: null},
		 {id: 'projCompToBudget',  type: '', viewName: 'ab-proj-projects-compare-to-budget-2d.axvw', isRestricted: true, parameters: null},
		 {id: 'lsExpiring90',  type: '', viewName: 'ab-eq-lease-expire-90-days.axvw', isRestricted: true, parameters: null},
		 {id: 'eqMaintenanceHistory', type: '', viewName: 'ab-pm-rpt-eq-maint-hist.axvw', isRestricted: false, parameters: null},

		 {id: 'eqSysDependent', type: '', viewName: 'ab-eq-system-dependent-report.axvw', isRestricted: true, parameters: {selectedEquipmentId: null, selectedSystemName: null, filterRestriction: null}},
		 {id: 'eqSysDependency', type: '', viewName: 'ab-eq-system-dependencies-report.axvw', isRestricted: true, parameters: {selectedEquipmentId: null, selectedSystemName: null, filterRestriction: null}},
		 {id: 'eqSysRmServedAsset', type: '', viewName: 'ab-eq-system-rooms-served-report.axvw', isRestricted: true, parameters: {selectedEquipmentId: null, selectedSystemName: null, filterRestriction: null}},
		 {id: 'eqSysAssetServedRm', type: '', viewName: 'ab-eq-system-asset-serving-room-report.axvw', isRestricted: false, parameters: null},
		 {id: 'eqSysTeamSupport1', type: '', viewName: 'ab-eq-system-asset-support-report.axvw', isRestricted: true, parameters: {selectedEquipmentId: null, selectedSystemName: null, filterRestriction: null}},
		 {id: 'eqSysTeamSupport2', type: '', viewName: 'ab-eq-system-asset-supported-report.axvw', isRestricted: false, parameters: null},
		 {id: 'eqSysInventory', type: '', viewName: 'ab-eq-system-inventory-report.axvw', isRestricted: false, parameters: null}
);


/**
 * Common report menu definition.
 */
// properties
var propInformSubMenu = new Ext.util.MixedCollection();
propInformSubMenu.add('blByLocation', {menuDef: abEamCommonReportsDef.get('blByLocation'), submenu: null});
propInformSubMenu.add('structureByLocation', {menuDef: abEamCommonReportsDef.get('structureByLocation'), submenu: null});
propInformSubMenu.add('landByLocation', {menuDef: abEamCommonReportsDef.get('landByLocation'), submenu: null});

var propAnalysisSubMenu = new Ext.util.MixedCollection();
propAnalysisSubMenu.add('blDashboard', {menuDef: abEamCommonReportsDef.get('blDashboard'), submenu: null});
propAnalysisSubMenu.add('structureDashboard', {menuDef: abEamCommonReportsDef.get('structureDashboard'), submenu: null});
propAnalysisSubMenu.add('landDashboard', {menuDef: abEamCommonReportsDef.get('landDashboard'), submenu: null});
propAnalysisSubMenu.add('propSummary', {menuDef: abEamCommonReportsDef.get('propSummary'), submenu: null});

var propSubmenu = new Ext.util.MixedCollection();
propSubmenu.add('information', {menuDef: abEamCommonReportsDef.get('information'), submenu: propInformSubMenu});
propSubmenu.add('analysis', {menuDef: abEamCommonReportsDef.get('analysis'), submenu: propAnalysisSubMenu});

// buildings
var blInformSubMenu = new Ext.util.MixedCollection();
blInformSubMenu.add('blByLocation', {menuDef: abEamCommonReportsDef.get('blByLocation'), submenu: null});

var blAnalysisSubMenu = new Ext.util.MixedCollection();
blAnalysisSubMenu.add('blPerformance', {menuDef: abEamCommonReportsDef.get('blPerformance'), submenu: null});
blAnalysisSubMenu.add('blAllocBenchmark', {menuDef: abEamCommonReportsDef.get('blAllocBenchmark'), submenu: null});
blAnalysisSubMenu.add('comViolationMap', {menuDef: abEamCommonReportsDef.get('comViolationMap'), submenu: null});
blAnalysisSubMenu.add('comProgramMap', {menuDef: abEamCommonReportsDef.get('comProgramMap'), submenu: null});
blAnalysisSubMenu.add('blHazWaste', {menuDef: abEamCommonReportsDef.get('blHazWaste'), submenu: null});
blAnalysisSubMenu.add('blSustSummary', {menuDef: abEamCommonReportsDef.get('blSustSummary'), submenu: null});
blAnalysisSubMenu.add('blHazAssess', {menuDef: abEamCommonReportsDef.get('blHazAssess'), submenu: null});
blAnalysisSubMenu.add('blGreenScoringDash', {menuDef: abEamCommonReportsDef.get('blGreenScoringDash'), submenu: null});
blAnalysisSubMenu.add('energConsByLocation', {menuDef: abEamCommonReportsDef.get('energConsByLocation'), submenu: null});

var blSubmenu = new Ext.util.MixedCollection();
blSubmenu.add('information', {menuDef: abEamCommonReportsDef.get('information'), submenu: blInformSubMenu});
blSubmenu.add('analysis', {menuDef: abEamCommonReportsDef.get('analysis'), submenu: blAnalysisSubMenu});

// equipment
var eqInformSubMenu = new Ext.util.MixedCollection();
eqInformSubMenu.add('eqStdBook', {menuDef: abEamCommonReportsDef.get('eqStdBook'), submenu: null});
eqInformSubMenu.add('eqAssetConsole', {menuDef: abEamCommonReportsDef.get('eqAssetConsole'), submenu: null});
eqInformSubMenu.add('eqPlan', {menuDef: abEamCommonReportsDef.get('eqPlan'), submenu: null});
eqInformSubMenu.add('eqInformEdit', {menuDef: abEamCommonReportsDef.get('eqInformEdit'), submenu: null});
eqInformSubMenu.add('eqByDp', {menuDef: abEamCommonReportsDef.get('eqByDp'), submenu: null});
eqInformSubMenu.add('eqByFl', {menuDef: abEamCommonReportsDef.get('eqByFl'), submenu: null});
eqInformSubMenu.add('slaEdit', {menuDef: abEamCommonReportsDef.get('slaEdit'), submenu: null});
eqInformSubMenu.add('warrantyEdit', {menuDef: abEamCommonReportsDef.get('warrantyEdit'), submenu: null});
eqInformSubMenu.add('eqByWarranty', {menuDef: abEamCommonReportsDef.get('eqByWarranty'), submenu: null});
eqInformSubMenu.add('eqWarrServContr', {menuDef: abEamCommonReportsDef.get('eqWarrServContr'), submenu: null});
eqInformSubMenu.add('insurerEdit', {menuDef: abEamCommonReportsDef.get('insurerEdit'), submenu: null});
eqInformSubMenu.add('policyEdit', {menuDef: abEamCommonReportsDef.get('policyEdit'), submenu: null});
eqInformSubMenu.add('eqByPolicy', {menuDef: abEamCommonReportsDef.get('eqByPolicy'), submenu: null});
eqInformSubMenu.add('lessorEdit', {menuDef: abEamCommonReportsDef.get('lessorEdit'), submenu: null});
eqInformSubMenu.add('eqLeaseEdit', {menuDef: abEamCommonReportsDef.get('eqLeaseEdit'), submenu: null});
eqInformSubMenu.add('eqByLease', {menuDef: abEamCommonReportsDef.get('eqByLease'), submenu: null});
eqInformSubMenu.add('eqLeaseByLessor', {menuDef: abEamCommonReportsDef.get('eqLeaseByLessor'), submenu: null});
eqInformSubMenu.add('lsExpiring90', {menuDef: abEamCommonReportsDef.get('lsExpiring90'), submenu: null});

var eqAnalysisSubMenu = new Ext.util.MixedCollection();
eqAnalysisSubMenu.add('eqMaintenanceHistory', {menuDef: abEamCommonReportsDef.get('eqMaintenanceHistory'), submenu: null});
eqAnalysisSubMenu.add('wrForEqAndLoc', {menuDef: abEamCommonReportsDef.get('wrForEqAndLoc'), submenu: null});
eqAnalysisSubMenu.add('eqFailAnls', {menuDef: abEamCommonReportsDef.get('eqFailAnls'), submenu: null});
eqAnalysisSubMenu.add('eqReplAnls', {menuDef: abEamCommonReportsDef.get('eqReplAnls'), submenu: null});
eqAnalysisSubMenu.add('eqMtrcsCsi', {menuDef: abEamCommonReportsDef.get('eqMtrcsCsi'), submenu: null});

var eqSubmenu = new Ext.util.MixedCollection();
eqSubmenu.add('information', {menuDef: abEamCommonReportsDef.get('information'), submenu: eqInformSubMenu});
eqSubmenu.add('analysis', {menuDef: abEamCommonReportsDef.get('analysis'), submenu: eqAnalysisSubMenu});

// furniture
var fnInformSubMenu = new Ext.util.MixedCollection();
fnInformSubMenu.add('fnStdBook', {menuDef: abEamCommonReportsDef.get('fnStdBook'), submenu: null});
fnInformSubMenu.add('taPlans', {menuDef: abEamCommonReportsDef.get('taPlans'), submenu: null});
fnInformSubMenu.add('taEdit', {menuDef: abEamCommonReportsDef.get('taEdit'), submenu: null});
fnInformSubMenu.add('fnPlans', {menuDef: abEamCommonReportsDef.get('fnPlans'), submenu: null});
fnInformSubMenu.add('taByDp', {menuDef: abEamCommonReportsDef.get('taByDp'), submenu: null});
fnInformSubMenu.add('taByRm', {menuDef: abEamCommonReportsDef.get('taByRm'), submenu: null});


var fnTaInvCntSubMenu = new Ext.util.MixedCollection();
fnTaInvCntSubMenu.add('taInvCountByStd', {menuDef: abEamCommonReportsDef.get('taInvCountByStd'), submenu: null});
fnTaInvCntSubMenu.add('taInvCountByBl', {menuDef: abEamCommonReportsDef.get('taInvCountByBl'), submenu: null});
fnTaInvCntSubMenu.add('taInvCountByFl', {menuDef: abEamCommonReportsDef.get('taInvCountByFl'), submenu: null});
fnTaInvCntSubMenu.add('taInvCountByRm', {menuDef: abEamCommonReportsDef.get('taInvCountByRm'), submenu: null});
fnTaInvCntSubMenu.add('taInvCountByDp', {menuDef: abEamCommonReportsDef.get('taInvCountByDp'), submenu: null});
fnTaInvCntSubMenu.add('taInvCountByDpByBl', {menuDef: abEamCommonReportsDef.get('taInvCountByDpByBl'), submenu: null});

var fnAnalysisSubMenu = new Ext.util.MixedCollection();
fnAnalysisSubMenu.add('taInvCountBy', {menuDef: abEamCommonReportsDef.get('taInvCountBy'), submenu: fnTaInvCntSubMenu});

var fnSubmenu = new Ext.util.MixedCollection();
fnSubmenu.add('information', {menuDef: abEamCommonReportsDef.get('information'), submenu: fnInformSubMenu});
fnSubmenu.add('analysis', {menuDef: abEamCommonReportsDef.get('analysis'), submenu: fnAnalysisSubMenu});

// project
var projectInformSubMenu = new Ext.util.MixedCollection();
projectInformSubMenu.add('projProfiles', {menuDef: abEamCommonReportsDef.get('projProfiles'), submenu: null});
projectInformSubMenu.add('milestoneStatusByProject', {menuDef: abEamCommonReportsDef.get('milestoneStatusByProject'), submenu: null});
projectInformSubMenu.add('projCalendar', {menuDef: abEamCommonReportsDef.get('projCalendar'), submenu: null});
projectInformSubMenu.add('projMap', {menuDef: abEamCommonReportsDef.get('projMap'), submenu: null});
projectInformSubMenu.add('projOrgImpByBl', {menuDef: abEamCommonReportsDef.get('projOrgImpByBl'), submenu: null});
projectInformSubMenu.add('budgetByProgram', {menuDef: abEamCommonReportsDef.get('budgetByProgram'), submenu: null});
projectInformSubMenu.add('budgetByProgType', {menuDef: abEamCommonReportsDef.get('budgetByProgType'), submenu: null});
projectInformSubMenu.add('projFundByYear', {menuDef: abEamCommonReportsDef.get('projFundByYear'), submenu: null});


var projectAnalysisSubMenu = new Ext.util.MixedCollection();
projectAnalysisSubMenu.add('projCompToBudget', {menuDef: abEamCommonReportsDef.get('projCompToBudget'), submenu: null});

var projectSubmenu = new Ext.util.MixedCollection();
projectSubmenu.add('information', {menuDef: abEamCommonReportsDef.get('information'), submenu: projectInformSubMenu});
projectSubmenu.add('analysis', {menuDef: abEamCommonReportsDef.get('analysis'), submenu: projectAnalysisSubMenu});



var abEamReportsCommonMenu = new Ext.util.MixedCollection();
abEamReportsCommonMenu.add('properties', {menuDef: abEamCommonReportsDef.get('properties'), submenu: propSubmenu});
abEamReportsCommonMenu.add('buildings', {menuDef: abEamCommonReportsDef.get('buildings'), submenu: blSubmenu});
abEamReportsCommonMenu.add('equipment', {menuDef: abEamCommonReportsDef.get('equipment'), submenu: eqSubmenu});
abEamReportsCommonMenu.add('furniture', {menuDef: abEamCommonReportsDef.get('furniture'), submenu: fnSubmenu});
abEamReportsCommonMenu.add('project', {menuDef: abEamCommonReportsDef.get('project'), submenu: projectSubmenu});

var abEqSystemsReportsMenu = new Ext.util.MixedCollection();
abEqSystemsReportsMenu.add('eqSysDependent', {menuDef: abEamCommonReportsDef.get('eqSysDependent'), submenu: null});
abEqSystemsReportsMenu.add('eqSysDependency', {menuDef: abEamCommonReportsDef.get('eqSysDependency'), submenu: null});
abEqSystemsReportsMenu.add('eqSysRmServedAsset', {menuDef: abEamCommonReportsDef.get('eqSysRmServedAsset'), submenu: null});
abEqSystemsReportsMenu.add('eqSysAssetServedRm', {menuDef: abEamCommonReportsDef.get('eqSysAssetServedRm'), submenu: null});
abEqSystemsReportsMenu.add('eqSysTeamSupport1', {menuDef: abEamCommonReportsDef.get('eqSysTeamSupport1'), submenu: null});
abEqSystemsReportsMenu.add('eqSysTeamSupport2', {menuDef: abEamCommonReportsDef.get('eqSysTeamSupport2'), submenu: null});
abEqSystemsReportsMenu.add('eqSysInventory', {menuDef: abEamCommonReportsDef.get('eqSysInventory'), submenu: null});

