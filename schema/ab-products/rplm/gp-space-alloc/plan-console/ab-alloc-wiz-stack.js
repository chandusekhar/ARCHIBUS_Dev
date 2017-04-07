
/**
 * Controller for stack diagram tab.
 * @author Qiang for 22.1; ZY for 23.1
 */
var abAllocWizStackController = View.createController('abAllocWizStackController', {
	
	/**The scenario id for this.  */
	initialLoad: true,

	/**The scenario id for this.  */
	scn_id: null,
	
	/**The scenario name for this.  */
	scn_name: null,

	/**The scenario level of current scenatio.*/
	scnLevel: "",

	/**the filter from the filter console. */
	filter: null,

	/**the building tree controller*/
	allocBlTreeCtrl: null,
	
	/** Location map control. */
	mapControl: null,
	
	/**The stack control for displaying building. */
	stackControl: null,
	
	/**The building's statistics fields of stack control . */
	stackControlBlStatisFields: [
		{'name': 'gp.avail.raw', 'format': true, 'selected': true},
		{'name': 'gp.util.raw', 'format': true, 'suffix': '%', 'selected': true},
		{'name': 'gp.availableSeats.raw', 'format': true, 'selected': false},
		{'name': 'gp.occupiedSeats.raw', 'format': true, 'selected': false},
		{'name': 'gp.occupiedPct.raw', 'format': true, 'suffix': '%', 'selected': false}
	],
	/**The building's statistics fields title array of stack control . */
	stackControlBlStatisFieldsTitle: [
	],
	stackControlBlStatisFieldsLimit: 2,

	/**The floor's statistics fields of stack control . */
	stackControlFlStatisFields: [
		{'name': 'gp.util.raw', 'format': true, 'suffix': '%', 'selected': true},
		{'name': 'gp.avail.raw', 'format': true, 'selected': true},
		{'name': 'gp.seats.raw', 'format': true, 'selected': true},	
		{'name': 'gp.availableSeats.raw', 'format': true, 'selected': false},
		{'name': 'gp.occupiedSeats.raw', 'format': true, 'selected': false},
		{'name': 'gp.occupiedPct.raw', 'format': true, 'suffix': '%', 'selected': false}
	],
	/**The building's statistics fields title array of stack control . */
	stackControlFlStatisFieldsTitle: [
	],
	stackControlFlStatisFieldsLimit: 3,

	/** The asset locator for locating buildings.*/
	assetLocatorControl: null,
	
	/** The legend color of the map.*/
	thematicLegendColor:["#d73027","#fee08b","#1a9850","#ff9900","#990033"],
	
	/** The as of date parameter for map control.*/
	asOfDate: null,
	
	/** The current stack orientation, defaults to VERTICAL. */
	currentStackOrientation: "HORIZONTAL",
	
	/** If the stack chart will show all the buildings.*/
	isShowAll: false,
	
	/** The unit title of current user.*/
	unitTitle: '',
	
	/** the building id that will be shown on floor plan.*/
	showBuildingId: '',
	
	/** the floor id that will be shown on the floor plan.*/
	showFloorId: '',
	
	/** The group to edit.*/
	editGroupId: '',
	
	/** The last store event name for allocating space. */
	lastStoredEventNameForAllocating: '',
	
	areaUnitsConversionFactor: 1.0,
	
	isOracle: 0,

	buildingDisplayTitlesMap : {}, 

	/** Map html DOM elements events to the specific functions.*/
	events: {
		
		"click #addSpaceRequirement": function() {
			this.addSpaceRequirement();
		},
		
		"click #editSpaceRequirement": function() {
			this.editSpaceRequirement();
		},
		
		"click #syncSpaceRequirement": function() {
			this.syncSpaceRequirement();
		},
		
		"click #showFloorPlan": function() {
			this.showFloorPlan();
		},
		
		"click #addFloorTask": function() {
			this.addFloorTask();
		},
		
		"click #editGroup": function() {
			this.editAllocation();
		},
		
		"click #splitGroup": function() {
			this.splitGroup();
		},
		
		"click #selectStatistics": function() {
			this.selectStatistics();
		},
		
		"click #addNewTypeOfAllocation": function() {
			this.showAddNewAllocationSubMenuItems();
		}, 
		
		"click #increaseFloorHeight": function() {
			this.changeFloorHeightByFactor(5);
		},
		
		"click #decreaseFloorHeight": function() {
			this.changeFloorHeightByFactor(-5);
		},
		
		"click #increaseFloorLength": function() {
			this.changeFloorLength(0.1);
		},
		
		"click #decreaseFloorLength": function() {
			this.changeFloorLength(-0.1);
		},
		
		"click #switchOrientation": function() {
			this.stackChartOrientationChanged();
		},
		
		"click #increaseLabelHeight": function() {
			this.changeLabelHeightByFactor(2);
		},
		
		"click #decreaseLabelHeight": function() {
			this.changeLabelHeightByFactor(-2);
		},
		
		"click #toggleXAxis": function() {
			this.toggleXAxis();
		},
		
		"click #toggleUnavail": function() {
			this.toggleUnavail();
		},
		
		"click #buildingRestrictToFilter": function() {
			this.onFilterAllocatedBuildings();
		},

		"click #selectEventImg": function() {
			this.popUpEventsPanel();
		}
	},
	
	/** Indicate if current clicked stack element's group has the associated sb_items.*/
	currentGpHasSbItems: false,	
	
	slides: [],	

    // ---------------------------------------------------------------------------------------------
    // BEGIN PPT generation Section 
    // ---------------------------------------------------------------------------------------------
	/**
     * On Generate PPT .
     */
    onGeneratePPT: function() {
		this.stackControl.getImageBytes(this.afterGetImageBytes.createDelegate(this));    	
    },

    /**
     * Callback.  After the image bytes are retrieved, feed them to the PPT generating workflow rule, and restore the image contents on screen.
     */
    afterGetImageBytes: function(imageBytes, nodesToRemove, nodesToRecover) {  	
    	var title = getMessage('pptStackTitle')+" "+this.asOfDate;
    	this.slides=[];
		this.slides.push({'title': title,'images':[imageBytes]});
		
		// determine how many projects have the same name  as current scenario and do coresponding logics
		var records = this.projectDS.getRecords("project_name='"+this.scn_name+"'");
		if (records.length==0){
			this.callWfrGeneratePPT(null);
		} 
		else if (records.length==1){
			var projectId = records[0].getValue("project.project_id");
			this.callWfrGeneratePPT(projectId);
		}	
		else {
			// if more than one projects has same scenario name then show a pop up list to let user choose
			var itemSelect = $("projectId");
			itemSelect.innerHTML = '';
			for (var i = 0; i < records.length; i++) {
				var item = records[i];
				var option = document.createElement('option');
				option.value = item.getValue("project.project_id");
				option.appendChild(document.createTextNode(item.getValue("project.project_id")));
				itemSelect.appendChild(option);
			}
			//set default value to dropdown list
			itemSelect.options[0].setAttribute('selected', true);
			this.abSpAllocProjectSelectDialog.showInWindow({
				x: 500, 
				y: 200,
				modal: true,
				width: 600,
				height: 100
			});
		}
    },   

	/**
	 * Save the user selected project id.
	 */
	abSpAllocProjectSelectDialog_onSave: function(){
		var projectId =  $("projectId").value;
    	this.abSpAllocProjectSelectDialog.closeWindow();
		this.callWfrGeneratePPT(projectId);
	},

	/**
	 * Call workflow rule to generate the PPT for given project id.
	 */
	callWfrGeneratePPT: function(projectId){
		try{
			var result = Workflow.callMethod('AbRPLMGroupSpaceAllocation-PortfolioForecastingService-generatePresentation', this.slides, {}, projectId);
			var me = this;
			result.data = eval('(' + result.jsonExpression + ')');
			var jobId = result.data.jobId;
			View.openJobProgressBar(getMessage("z_MESSAGE_WAIT")+"...", jobId, null, function(status) {
				var url  = status.jobFile.url;
				window.location = url;		
				// restore image content on screen
			}); 			
		}
		catch (e)	{
			Workflow.handleError(e);
			return false;
		}
	},
    // ---------------------------------------------------------------------------------------------
    // END PPT generation Section 
    // ---------------------------------------------------------------------------------------------
    
    // ---------------------------------------------------------------------------------------------
    // BEGIN view initialize Section 
    // ---------------------------------------------------------------------------------------------
	/**
	 * Create restrictions for building-floor two level tree.
	 */
	afterViewLoad: function() {
		// customize the tree nodes 
		this.stackBuildingTreePanel.createRestrictionForLevel = this.createRestrictionForBuildingTreeLevel;
		this.eventsTreePanel.createRestrictionForLevel = this.createRestrictionForEventsTreeLevel;
		this.eventsTreePopPanel.createRestrictionForLevel = this.createRestrictionForEventsTreeLevel;
		
		//set the current unit title.
		this.setCurrentUnitTitle();
		
		//initialize the scenario map control.
		this.initializeScenarioMapControl();

		//initialize the asset locator when the user locates a building.
		this.assetLocatorControl = new Ab.arcgis.AssetLocator(this.mapControl);
		
		//register a startsWith function to string object.
		if (typeof String.prototype.startsWith != 'function') {
			String.prototype.startsWith = function(prefix) {
				return this.slice(0, prefix.length) === prefix;
			};
		}
		
		if(View.activityParameters["AbCommonResources-ConvertAreasLengthsToUserUnits"]=="1"){
			if(View.user.displayUnits != View.project.units){
				this.areaUnitsConversionFactor = 1.0 / parseFloat(View.user.areaUnits.conversionFactor);
			}
		}
	},
	
	/**
	 * Set the unit title of current user.
	 */
	setCurrentUnitTitle: function() {
		this.unitTitle = getMessage('unitTitleMetric');
		var units = View.project.units;
		if (units == "imperial") {
			this.unitTitle = getMessage('unitTitleImperial');
		}
	},

	/**
	 * Initialize the as of date map control.
	 */
	initializeScenarioMapControl: function() {
		var configObject = new Ab.view.ConfigObject();
		this.mapControl = new Ab.arcgis.Map('locationsInScenarioPanel', 'scenarioMapDiv', configObject, mapConfigObject);
		this.configureMapUI();
	},
	
	/**
	 * We configure the map control UI to add more layer options for the user.
	 */
	configureMapUI: function() {
		var basemapLayerMenu = this.locationsInScenarioPanel.actions.get('basemapLayerMenu');
		basemapLayerMenu.clear();
		var basemapLayers = this.mapControl.getBasemapLayerList();
		for (var i=0; i < basemapLayers.length; i++){
			basemapLayerMenu.addAction(i, basemapLayers[i], this.switchBasemapLayer);
		}
	},
	
	/**
	 * When the user selects a different layer, we switch it.
	 */
	switchBasemapLayer: function(item) {
		abAllocWizStackController.mapControl.switchBasemapLayer(item.text);
    },  
    
	/**
	 * Hide locate button if there are no lat and lon for buildings. 
	 */
	afterInitialDataFetch: function() {
    	this.isOracle = isOracleDataBase(this.checkOracleDataSource);

		this.addNewSpaceForm.enableFieldActions('gp.fl_id', false);
		this.refreshUponOpeningView();
		this.setAsOfDate();
		
		this.bindEventsForAsOfDateInput();
		
		//set the style of map control
		var mapControlPanel = document.getElementById("locationsInScenarioPanel");            
		mapControlPanel.className = 'claro';
		
		//decide which panel to show. Map or chart.
		this.decideShowMapOrChartPanel();
		
		//create building stack chart. 
		this.createBuildingStackChart();
		
		//create our own caledar select value button.
		this.setCalendarPicForInput();
		
		//Set the initial value and convert it.
		this.setInitialValueForDateInput();
		
		this.disableRequirementsNotAtFgLevel();

		this.setTooltipForTitleBarImgButtons();
	},
	
	/**
	 * Set proper tooltip for image buttons of stack panel and support localization.
	 */
	setTooltipForTitleBarImgButtons: function() {
		$('increaseFloorHeightImg').title = getMessage('inFlHeight');
		$('decreaseFloorHeightImg').title = getMessage('deFlHeight');
		$('increaseFloorLengthImg').title = getMessage('inFlLen');
		$('decreaseFloorLengthImg').title = getMessage('deFlLen');
		$('increaseLabelHeightImg').title = getMessage('inLabelHeight');
		$('decreaseLabelHeightImg').title = getMessage('deLabelHeight');
		$('switchOrientationImg').title = getMessage('swOri');
		$('toggleXAxisImg').title = getMessage('toggleXAxis');	
		$('toggleUnavailImg').title = getMessage('toggleUnavail');	
	},

	/**
	 * Bind Enter, text changed and lose-focus events for the as of date input text.
	 */
	bindEventsForAsOfDateInput: function() {
		//Bind text changed event.
		var thisController = this;
		jQuery('#asOfDateInput').on('blur', function() {  
			var newDate = jQuery("#asOfDateInput").val();
			if(newDate.length == 8 || newDate.length == 9 || newDate.length == 10) {
				thisController.addNewSpaceForm.setFieldValue('gp.date_start', newDate);
				var newIsoDate = thisController.addNewSpaceForm.getFieldValue('gp.date_start');
				if (newIsoDate != thisController.asOfDate) {
					thisController.asOfDateChanged();
				}
			}
		});
		
		jQuery("input[readOnly]").keydown(function(e) {
			e.preventDefault();
		});
	},
	
	/**
	 * Create the building stack chart.
	 */
	createBuildingStackChart: function() {
		var thisController = this;
		var config = new Ab.view.ConfigObject({
			stackOrientation: this.currentStackOrientation,
			displayFloorHeight: 20,
			buildings: [],
			groupDatasourceView: 'ab-alloc-wiz-stack-datasource.axvw',
			groupDatasource: 'abAllocWizStackDs_gp',
			buildingDatasourceView: 'ab-alloc-wiz-stack-datasource.axvw',
			buildingDatasource: 'abAllocWizStackStatsDs_bl',
			floorDatasourceView: 'ab-alloc-wiz-stack-datasource.axvw',
			floorDatasource: 'abAllocWizStackStatsDs_fl',
			showAllLabels:false,
			portfolioScenario: thisController.scn_id,
			asOfDate: thisController.asOfDate,
			dropHandler: thisController.onDrop,
			clickHandler: thisController.onClickStackChart,
			tooltipHandler: thisController.onTooltip,
			showXAxis: true,
			showHighlightFloor: false
		});
		this.stackControl = new Ab.stack.HtmlStack('scenarioStackContainer', config);
		this.addParameterForStackGroupDataSource();
		
		//reconfigure the labels
		this.configureStackChartGroupLabels();

		//initial titles of statistics fields
		this.stackControlBlStatisFieldsTitle[0] = getMessage('blAreaAvailStatics');
		this.stackControlBlStatisFieldsTitle[1] = getMessage('blAreaUtilStatics');
		this.stackControlBlStatisFieldsTitle[2] = getMessage('blSeatAvailStatics');
		this.stackControlBlStatisFieldsTitle[3] = getMessage('blSeatOccupStatics');
		this.stackControlBlStatisFieldsTitle[4] = getMessage('blSeatUtilStatics');

		this.stackControlFlStatisFieldsTitle[0] = getMessage('flAreaUtilStatics');
		this.stackControlFlStatisFieldsTitle[1] = getMessage('flAreaAvailStatics');
		this.stackControlFlStatisFieldsTitle[2] = getMessage('flHeadAvailStatics');
		this.stackControlFlStatisFieldsTitle[3] = getMessage('flSeatAvailStatics');
		this.stackControlFlStatisFieldsTitle[4] = getMessage('flSeatOccupStatics');
		this.stackControlFlStatisFieldsTitle[5] = getMessage('flSeatUtilStatics');

		//reconfigure the building's statistics
		this.configureStackChartBlProfileStatis();
		this.configureStackChartFlStatis();
	},
	
	/**
	 * Add parameters for the stack group datasource.
	 */
	addParameterForStackGroupDataSource: function() {
		this.stackControl.addParameter('portfolio_scenario_id', this.scn_id);
		this.stackControl.addParameter('asOfDate', this.asOfDate);
		this.stackControl.addParameter('portfolioScenarioId', getScenarioIdRestriction(this.scn_id));
		if(this.isOracle == 1) {
			var startDateAsOfDate = " (gp.date_start <= to_date('" + this.asOfDate + "', 'YYYY-MM-DD'))";
			var endDateAsOfDate = " (gp.date_end >= to_date('" + this.asOfDate + "', 'YYYY-MM-DD') OR gp.date_end IS NULL)";
			var innerDateStartAsOfDate = " (gp_inner.date_start <= to_date('" + this.asOfDate + "', 'YYYY-MM-DD'))";
			var innerDateEndAsOfDate = " (gp_inner.date_end >= to_date('" + this.asOfDate + "', 'YYYY-MM-DD') OR gp_inner.date_end IS NULL)";
			this.stackControl.addParameter('dateStartAsOfDate', startDateAsOfDate);
			this.stackControl.addParameter('dateEndAsOfDate', endDateAsOfDate);
			this.stackControl.addParameter('innerDateStartAsOfDate', innerDateStartAsOfDate);
			this.stackControl.addParameter('innerDateEndAsOfDate', innerDateEndAsOfDate);
		} else {
			var startDateAsOfDate = " (gp.date_start <= '" + this.asOfDate + "')";
			var endDateAsOfDate = " (gp.date_end >= '" + this.asOfDate + "' OR gp.date_end IS NULL)";
			var innerDateStartAsOfDate = " (gp_inner.date_start <= '" + this.asOfDate + "')";
			var innerDateEndAsOfDate = " (gp_inner.date_end >= '" + this.asOfDate + "' OR gp_inner.date_end IS NULL)";
			this.stackControl.addParameter('dateStartAsOfDate', startDateAsOfDate);
			this.stackControl.addParameter('dateEndAsOfDate', endDateAsOfDate);
			this.stackControl.addParameter('innerDateStartAsOfDate', innerDateStartAsOfDate);
			this.stackControl.addParameter('innerDateEndAsOfDate', innerDateEndAsOfDate);
		}
	},
	
	/**
	 * We need to show the different labels.
	 */
	configureStackChartGroupLabels: function() {
		var groupDataSourceConfig = {
			groupLabels: 'gp.name;gp.area_manual;gp.count_em',
			buildingField: 'gp.bl_id',
			floorField: 'gp.fl_id',
			floorNameField: 'gp.fl_name',
			groupField: 'gp.gp_id',
			allocationTypeField: 'gp.allocation_type',
			areaField:  'gp.area_manual',
			headcountField: 'gp.count_em',
			highlightField: 'gp.hpattern_acad',
			sortOrderField: 'gp.sort_order',
			dateStartField: 'gp.date_start',
			dateEndField: 'gp.date_end',
			portfolioScenarioField: 'gp.portfolio_scenario_id'
		};
		this.stackControl.stackControl.setGroupDataSourceConfig(groupDataSourceConfig);
	},

	configureStackChartBlProfileStatis: function(){
    	var statsFields = this.stackControl.stackControl.profileDataSourceConfig.statisticFields;
    	var statsTitles = this.stackControl.stackControl.profileDataSourceConfig.statisticTitles;
		var count=0;
		for (var i=0; i<this.stackControlBlStatisFields.length; i++){
			if ( this.stackControlBlStatisFields[i]['selected']==true){
				statsFields[count++] = this.stackControlBlStatisFields[i];
				statsTitles[count-1] = this.stackControlBlStatisFieldsTitle[i];
			}
		}
    },

	configureStackChartFlStatis: function(){
    	var statsFields = this.stackControl.stackControl.statisticsDataSourceConfig.statisticFields;
    	var statsTitles = this.stackControl.stackControl.statisticsDataSourceConfig.statisticTitles;
		var count=0;
		for (var i=0; i<this.stackControlFlStatisFields.length; i++){
			if ( this.stackControlFlStatisFields[i]['selected']==true){
				statsFields[count++] = this.stackControlFlStatisFields[i];
				statsTitles[count-1] = this.stackControlFlStatisFieldsTitle[i];
			}
		}
    },

	/**
	 * Configure the statistics of stack's building and floor.
	 */
	selectStatistics: function() {
		this.initialSelectionOfStackStatistics();
        this.abAllocStackStatsConfigureForm.showInWindow({
			x: 500, 
			y: 200,
			modal: true,
			newRecord: true,
            closeButton: false,
			buttonsPosition: "footer",
            width: 1000,
			height: 160
        });
	},
	
	initialSelectionOfStackStatistics: function(){
		for (var i=0; i<this.stackControlBlStatisFields.length; i++){
			if ( this.stackControlBlStatisFields[i]['selected']==true){
				$('blStats'+i).checked = true;
			} else {
				$('blStats'+i).checked = false;
			}
		}

		for (var i=0; i<this.stackControlFlStatisFields.length; i++){
			if ( this.stackControlFlStatisFields[i]['selected']==true){
				$('flStats'+i).checked = true;
			} else {
				$('flStats'+i).checked = false;
			}
		}
	},

	/**
	 * Configure the statistics of stack's building and floor.
	 */
	abAllocStackStatsConfigureForm_onSaveStats: function() {
		for (var i=0; i<this.stackControlBlStatisFields.length; i++){
			if ( $('blStats'+i).checked ){
				this.stackControlBlStatisFields[i]['selected']=true;
			} 
			else {
				this.stackControlBlStatisFields[i]['selected']=false;
			}
		}

		for (var i=0; i<this.stackControlFlStatisFields.length; i++){
			if ( $('flStats'+i).checked ){
				this.stackControlFlStatisFields[i]['selected']=true;
			}
			else {
				this.stackControlFlStatisFields[i]['selected']=false;
			}
		}
		
		this.configureStackChartBlProfileStatis();
		this.configureStackChartFlStatis();
		this.refreshStackChartWithNewDate();
	},
	
	onChangeBlStats: function(checkBox) {
    	var value = checkBox.value;
    	if (checkBox.checked) {
			
			var countSelected = 0;
			for (var i=0; i<this.stackControlBlStatisFields.length; i++){
				if ( $('blStats'+i).checked ){
					countSelected++;
				}
			}

			if (countSelected<=this.stackControlBlStatisFieldsLimit){
				this.stackControlBlStatisFields[parseInt(value)]['selected'] = true;    		
			} 
			else {
				View.alert( getMessage('outOfBlStatsLimit'));
				checkBox.checked = false;
			}

    	} else {
			this.stackControlBlStatisFields[parseInt(value)]['selected'] = false;    		
    	}    	
	},

	onChangeFlStats: function(checkBox) {
    	var value = checkBox.value;
    	if (checkBox.checked) {
			
			var countSelected = 0;
			for (var i=0; i<this.stackControlFlStatisFields.length; i++){
				if ( $('flStats'+i).checked ){
					countSelected++;
				}
			}

			if (countSelected<=this.stackControlFlStatisFieldsLimit){
				this.stackControlFlStatisFields[parseInt(value)]['selected'] = true;    		
			} 
			else {
				View.alert( getMessage('outOfFlStatsLimit'));
				checkBox.checked = false;
			}

    	} else {
			this.stackControlFlStatisFields[parseInt(value)]['selected'] = false;    		
    	}    	
	},

	/**
	 * Since the title bar is not a standard title bar.we need to define input in the title bar.
	 * Set the calendar for our own use.
	 */
	setCalendarPicForInput: function() {
		//to show the calendar icon correctly
		jQuery("#asOfDateInput").mouseenter(function(){
			jQuery("#asOfDateCalendarImg").css("visibility", "visible");
		});
		
		jQuery("#asOfDateInput").mouseleave(function(){
			jQuery("#asOfDateCalendarImg").css("visibility", "hidden");
		});
		
		//Convert the value of the date when user input
		jQuery("#asOfDateInput").change(function(){
			validationAndConvertionDateInput(this, 'asOfDateInput', null, 'false', true, true); 
			if (window.temp!=this.value) afm_form_values_changed=true;
		});
		
		jQuery("#asOfDateInput").blur(function(){
			validationAndConvertionDateInput(this, 'asOfDateInput', null, 'false', true, true); 
			if (window.temp!=this.value) afm_form_values_changed=true;
		});
		
		jQuery("#asOfDateInput").focus(function(){
			window.temp=this.value;
		});
		
		//Avoid the flicker of the img event
		jQuery("#asOfDateCalendarImg").mouseover(function(){
			jQuery("#asOfDateCalendarImg").css("visibility", "visible");
		});
		
		jQuery("#asOfDateCalendarImg").mouseleave(function(){
			jQuery("#asOfDateCalendarImg").css("visibility", "hidden");
		});
		
		jQuery("#asOfDateCalendarImg").click(function(event){
			Calendar.getControllerForEvent(event, 'asOfDateInput','/archibus/schema/ab-system/graphics'); 
			return false;
		});
	},

	setInitialValueForDateInput: function() {
		this.addNewSpaceForm.setFieldValue('gp.date_start', this.asOfDate);
		var localizedValue = this.addNewSpaceForm.getFieldValue('gp.date_start');
		var localizedValueArray = localizedValue.split("-");
		var dateString = FormattingDate(localizedValueArray[2], localizedValueArray[1], localizedValueArray[0], strDateShortPattern);
		jQuery("#asOfDateInput").val(dateString);
		this.addNewSpaceForm.setFieldValue("gp.date_start","");
	},

	disableRequirementsNotAtFgLevel: function() {
		if (this.scnLevel != 'fg') {
			jQuery("#syncSpaceRequirement").addClass("x-hide-display");
			jQuery("#editSpaceRequirement").addClass("x-hide-display");
			jQuery("#addSpaceRequirement").removeClass("x-hide-display");
		}  else {
			jQuery("#syncSpaceRequirement").removeClass("x-hide-display");
			jQuery("#editSpaceRequirement").removeClass("x-hide-display");
			jQuery("#addSpaceRequirement").addClass("x-hide-display");
		}
	},
    // ---------------------------------------------------------------------------------------------
    // END view initialize Section 
    // ---------------------------------------------------------------------------------------------
		
    // ---------------------------------------------------------------------------------------------
    // BEGIN handlers for mapped dom element's  events 
    // ---------------------------------------------------------------------------------------------
	/**
	 * Filter the building panel.
	 */
	onFilterAllocatedBuildings: function() {
		var checked = Ext.getDom('buildingRestrictToFilter').checked;
		if (!checked) {
			this.stackBuildingTreePanel.addParameter('scenarioIdRestriction', getScenarioIdRestriction(this.scn_id) );
			this.stackBuildingTreePanel.addParameter('dateRestriction', "1=1");
			this.stackBuildingTreePanel.addParameter('blIdRestriction', "1=1");
			this.stackBuildingTreePanel.addParameter('siteIdRestriction', "1=1");
			this.stackBuildingTreePanel.refresh();
		} else {
			this.setParametersForAllocatedBuildings();
			this.stackBuildingTreePanel.refresh();
		}
	},
	
	setParametersForAllocatedBuildings: function() {
		this.scn_id = this.filter['scn_id'];
		if(this.filter['scn_id']) {
			var scnIdRestriction = getScenarioIdRestriction(this.scn_id);
			this.stackBuildingTreePanel.addParameter('scenarioIdRestriction', scnIdRestriction);
		} 
    	
    	var fromDate = this.filter['from_date'];
    	var endDate = this.filter['end_date'];
		addDateRestrictionParameterToPanel(this.stackBuildingTreePanel, 'dateRestriction', 'gp.date_start', fromDate, endDate, this.isOracle)
		addLocationRestriction([this.stackBuildingTreePanel], this.filter);
		addOrganizationRestriction([this.stackBuildingTreePanel], this.filter);
	},
	
	changeFloorHeightByFactor: function(addFactor) {
		var newFloorHeight = this.stackControl.config.displayFloorHeight + addFactor;
		this.stackControl.config.displayFloorHeight = newFloorHeight;
		try {
			this.stackControl.build();
		}catch(e){
			//keep work when error happens.
		}
	},
	
	changeFloorLength: function(scale) {
		var current = this.stackControl.config.horizontalScale;
		if(!current) {
			current = 1;
		}
		var newCurrent = (1+scale)*current;
		this.stackControl.config.horizontalScale = newCurrent;
		try {
			this.stackControl.build();
		}catch(e){
			//keep work when error happens.
		}
	},
	
	changeLabelHeightByFactor: function(addFactor) {
		var originalHeight = 	 this.stackControl.stackControl.labelLargeTextHeight;
		if (!originalHeight)	{
			 originalHeight	 = 10;
		}
		var newHeight = originalHeight + addFactor;
		if (newHeight<=0) {
			View.alert(getMessage('negativeLabelHeight'));
			return;
		}

		this.stackControl.stackControl.labelLargeTextHeight = newHeight;
		try {
			this.stackControl.build();
		}catch(e){
			//keep work when error happens.
		}
	},
	
	toggleXAxis: function() {
		this.stackControl.config.showXAxis = !this.stackControl.config.showXAxis;
		try {
			this.stackControl.build();
		}catch(e){
			//keep work when error happens.
		}
	},

	toggleUnavailableAreas: true, 
	toggleUnavailableRestriction: null, 
	toggleUnavail: function() {
		this.toggleUnavailableRestriction = null; 
		if ( this.toggleUnavailableAreas ) {
			this.toggleUnavailableAreas = false;

        	this.toggleUnavailableRestriction = new Ab.view.Restriction();
        	this.toggleUnavailableRestriction.addClause('gp.allocation_type', 'Unavailable - Vertical Penetration Area', '!=', 'AND'); 
        	this.toggleUnavailableRestriction.addClause('gp.allocation_type', 'Unavailable - Service Area', '!=', 'AND');
        	this.toggleUnavailableRestriction.addClause('gp.allocation_type', 'Unavailable - Remaining Area', '!=', 'AND');
		}
		else {
			this.toggleUnavailableAreas = true;
		}
		this.stackControl.refresh(this.toggleUnavailableRestriction);
	},
	
	/**
	 * Change the stack orientation.
	 */
	stackChartOrientationChanged: function() {
		if (this.currentStackOrientation == "VERTICAL") {
			this.currentStackOrientation = "HORIZONTAL";
		} else {
			this.currentStackOrientation = "VERTICAL";
		}
		this.stackControl.config.stackOrientation = this.currentStackOrientation;
		try {
			this.stackControl.build();
		}catch(e){
			//keep work when error happens.
		}
	},
		
	addSpaceRequirement: function() {
		var me = this;
		View.openDialog('ab-alloc-sp-req-to-gp-move.axvw', null, true, {
			width: 1024,
			height: 800,
			scenarioId: me.scn_id, 
			scenarioName: me.scn_name, 
			sbLevel: me.scnLevel, 
			asOfDate: me.asOfDate, 
			unitTitle: me.unitTitle, 
			callback: function(dateStart){
				if (dateStart) {
					me.asOfDate = dateStart;
					me.setInitialValueForDateInput();
				}
				me.stackBuildingTreePanel.refresh();
				me.refreshStackChartWithNewDate();
				me.eventsTreePanel.refresh();
				me.eventsTreePopPanel.refresh();
			}
		});		
	},
	
	/**
	 * When the clicked stack element is a group associated by sb_items record, then swtich to the Space Requirement tab to show linked sb_items of clicked group.
	 */
	editSpaceRequirement: function() {
		if ( this.currentGpHasSbItems ) {
			var sbCtrl = this.getSpaceRquirementTabController();
			var tabs = View.parentTab.parentPanel;
			if (sbCtrl){
				sbCtrl.sbName = this.scn_name;
				sbCtrl.gpId = this.editGroupId;
				sbCtrl.refreshGrid();
				tabs.selectTab("allocWizSb");
				tabs.showTab("allocWizSb");
			} 
			else {
				tabs.scnName = this.scn_name;
				tabs.associatedGpId = this.editGroupId;
				tabs.selectTab("allocWizSb");
				tabs.showTab("allocWizSb");
			}
		}
	},
	
	getSpaceRquirementTabController: function() {
		var allocWizCtrl = View.getOpenerView().controllers.get('allocWiz');
		var tabs = allocWizCtrl.allocWizTabs;
		var tab = tabs.findTab("allocWizSb");
		var sbCtrl=null;
		if(tab.hasView() && tab.isContentLoaded) {
			if(!tab.isContentLoading) {
				var iframe = tab.getContentFrame();
				var childView = iframe.View;
				if (valueExists(childView)) {
					sbCtrl = childView.controllers.get("abAllocDefSpReqEditCtrl");
				}
			}
		}
		return sbCtrl;
	},

	syncSpaceRequirement: function() {
		if(this.scnLevel == 'fg') {
			var me = this;
			View.openDialog('ab-alloc-sync-req-to-gp.axvw', null, true, {
				scenarioId: me.scn_id, 
				scenarioName: me.scn_name, 
				unitTitle: me.unitTitle, 
				width: 1024,
				height: 800,
				callback: function(dateStart){
					if (dateStart) {
						me.stackBuildingTreePanel.refresh();
						me.eventsTreePanel.refresh();
						me.eventsTreePopPanel.refresh();
						me.asOfDate = dateStart;
						me.setInitialValueForDateInput();
						me.refreshStackChartWithNewDate();
					}
					else {
						var tabs = View.parentTab.parentPanel;
						tabs.selectTab("allocWizSb");
						tabs.showTab("allocWizSb",true);
					}
				}
			});	
		}
	},
	
	/**
	 * Markup action.
	 */
	addFloorTask: function() {
		var restriction = new Ab.view.Restriction();
		restriction.addClause('fl.bl_id', this.showBuildingId, '=');
		restriction.addClause('fl.fl_id', this.showFloorId, '=');
		var records = this.floorDataSource.getRecords(restriction);
		if ( !records || records.length==0 ) {
			View.alert(getMessage('noExistingFloor'));
			return;
		}

		var me = this;
		View.openDialog('ab-sp-pfolio-mark-act-item.axvw', null, true, {
			width: 1024,
			height: 800,
			scenarioId: me.scn_id, 
			scenarioName: me.scn_name, 
			blId: me.showBuildingId, 
			flId: me.showFloorId, 
			callback: function(){
			}
		});	
	},
	
	/**
	 * Open the pop-up window for showing floor plan.
	 */
	showFloorPlan: function() {
		var thisController = View.controllers.get('abAllocWizStackController');
		if(thisController.showBuildingId &&  thisController.showFloorId) {
			var restriction = new Ab.view.Restriction();
			restriction.addClause("rm.bl_id", thisController.showBuildingId, '=');
			restriction.addClause("rm.fl_id", thisController.showFloorId, '=');
			var dwgs = thisController.floorPlanRoomDataSource.getRecords(restriction);
			if (!dwgs || dwgs.length==0){
				View.alert(getMessage('noFloorDrawing'));
			} 
			else { 
				var floorPlanPopup = View.openDialog('ab-sp-pfolio-svg-floor-plan.axvw', null, true, {
					width: 900,
					height: 600,
					title: getMessage("showFloorPlan")+" - " + thisController.showBuildingId + "-" + thisController.showFloorId,
					buildingId: thisController.showBuildingId,
					floorId: thisController.showFloorId
				});
			}
		}
	},
	
	/**
	 * Edit allocations for allocated record or unavailable record.
	 */
	editAllocation: function() {
		//kb#3049867: alert user if select no group
		if (!this.editGroupId)	{
			View.alert(getMessage('noSelectGp'));
			return;
		}

		if (!this.checkIfCanEditAllocation(this.editGroupId)) {
			View.alert(getMessage('cannotEditThisAllocation'));
		} else {
			this.editGroup();
		}
	},
	
	/**
	 * If the allocation is a parent allocation, it can't be editted.
	 */
	checkIfCanEditAllocation: function(allocationId) {
		var restriction = new Ab.view.Restriction();
		restriction.addClause("gp.parent_group_id", allocationId, '=');
		var records = this.groupRecordsDataSource.getRecords(restriction);
		if (records.length > 0) {
			return false;
		}
		return true;
	},
	
	/**
	 * Edit allocation for the existed allocation record.
	 */
	editGroup: function() {
		//We need to compare the asOfDate and the start date of the selected group.
		var restriction = new Ab.view.Restriction();
		restriction.addClause('gp.gp_id', this.editGroupId, '=');
		var record = this.groupRecordsDataSource.getRecords(restriction)[0];
		if ( record ){
			var allocationType = record.getValue('gp.allocation_type');
			if (allocationType == 'Allocated Area') {
				this.openEditAllocatedPopupWindow(record);
			} else {
				this.openEditUnavailablePopupWindow(record);
			}
		}
	},
	
	openEditAllocatedPopupWindow: function(record) {
		var startDate = record.getValue('gp.date_start');
		if(startDate) {
			var isoStartDate = getIsoFormatDate(startDate);
			if (isoStartDate != this.asOfDate) {
				var editGroupParentMenu = Ext.get('editGroup');
				this.showSubMenuItems('GROUP-EDIT', editGroupParentMenu, isoStartDate);
			} else {
				this.openEditGroupPopupWindow(false, this.asOfDate, 'EDIT-GROUP-FROM-STARTDATE');
			}
		} else {
			this.openEditGroupPopupWindow(false, this.asOfDate, 'EDIT-GROUP-FROM-STARTDATE');
		}
	},
	
	openEditUnavailablePopupWindow: function(record) {
		var startDate = record.getValue('gp.date_start');
		if(startDate) {
			var isoStartDate = getIsoFormatDate(startDate);
			if (isoStartDate != this.asOfDate) {
				var editGroupParentMenu = Ext.get('editGroup');
				this.showSubMenuItems('GROUP-EDIT', editGroupParentMenu, isoStartDate);
			} else {
				this.openUnavailableSpaceForm(getMessage('editUnavailableAllocation'), 'EDIT-EXISTING');
			}
		} else {
			this.openUnavailableSpaceForm(getMessage('editUnavailableAllocation'), 'EDIT-EXISTING');
		}
	},
	
	/**
	 * Open the edit group pop up window. 
	 * @param newRecord if the pop up window is new record mode.
	 */
	openEditGroupPopupWindow: function(newRecord, newDate, subType) {
		var thisController = View.controllers.get('abAllocWizStackController');
		
		var spaceGroupDialog = View.openDialog('ab-alloc-wiz-stack-space-form.axvw', null, newRecord, {
			width: 900,
			height: 900,
			title: getMessage("editSpaceTitle"),
			closeButton: false,
			
			afterViewLoad : function(dialogView) {
				var dialogController = dialogView.controllers.get('abAllocWizStackSpaceFormController');
				dialogController.asOfDate = newDate;
				dialogController.scn_id = thisController.scn_id;
				dialogController.scnLevel = thisController.scnLevel;
				dialogController.type = 'EDIT';
				dialogController.subType = subType;
				dialogController.editGroupId = thisController.editGroupId;
				dialogController.callback = thisController.commonGroupCallback;
				dialogController.lastStoredEventNameForAllocating = thisController.lastStoredEventNameForAllocating;
			}
		});
	},
	
	/**
	 * The callback for the edit group pop up window.
	 */
	editGroupCallback: function(dateStart, eventName) {
		var thisController = View.controllers.get('abAllocWizStackController');
		thisController.lastStoredEventNameForAllocating = eventName;
		if (thisController.asOfDate != newAsOfDate) {
			thisController.asOfDate = newAsOfDate;
			thisController.setInitialValueForDateInput();
		}
		thisController.eventsTreePanel.refresh();
		thisController.eventsTreePopPanel.refresh();
		thisController.refreshStackChartWithNewDate();
	},
	
	/**
	 * As for the add new button of Allocations group.
	 */
	showAddNewAllocationSubMenuItems: function() {
		var addNewParentMenu = Ext.get('addNewTypeOfAllocation');
		this.showSubMenuItems('OPEN-GROUP-ADD-BUTTONS', addNewParentMenu, null);
	},
	
	/**
	 * Dynamically add sub items for the parentMenu.
	 */
	showSubMenuItems: function(funGroup, parentMenu, startDate) {
		var subMenuItems = [];
		if (funGroup == 'GROUP-EDIT') {
			var menuTexts = [];
			menuTexts.push(getMessage('createNewGroupFromAsOfDate'));
			menuTexts.push(getMessage('editThisGroupFromStartDate'));
			for (var i = 0; i < menuTexts.length; i++) {
				var subMenuItem = new Ext.menu.Item({text: menuTexts[i],
            		handler: this.editGroupSubItemsHandler.createDelegate(this, [i], startDate)});
				subMenuItems.push(subMenuItem);
			}
		} else if (funGroup == 'GROUP-SPLIT'){
			var menuTexts = [];
			menuTexts.push(getMessage('splitGroupFromAsOfDate'));
			menuTexts.push(getMessage('splitGroupFromStartDate'));
			for (var i = 0; i < menuTexts.length; i++) {
				var subMenuItem = new Ext.menu.Item({text: menuTexts[i],
            		handler: this.splitGroupSubItemsHandler.createDelegate(this, [i], startDate)});
				subMenuItems.push(subMenuItem);
			}
		} else if(funGroup == 'OPEN-GROUP-ADD-BUTTONS') {
			var menuTexts = [];
			menuTexts.push(getMessage('addNewAllocation'));
			menuTexts.push(getMessage('addNewUnavailableArea'));
			for (var i = 0; i < menuTexts.length; i++) {
				var subMenuItem = new Ext.menu.Item({text: menuTexts[i],
            		handler: this.addNewAllocationSubItemsHandler.createDelegate(this, [i])});
				subMenuItems.push(subMenuItem);
			}
		}
		var menu = new Ext.menu.Menu({items: subMenuItems});
		menu.show(parentMenu, 'tl-bl?');
	},
	
	addNewAllocationSubItemsHandler: function(index) {
		switch(index) {
			case 0: {
				//open the add new allocation form.
				this.allocateSpace(getMessage('addAllocTitle'), 'ADD-NEW');
				break;
			}
			case 1: {
				//open the mark space as unavailable space form.
				this.openUnavailableSpaceForm(getMessage('addUnavailableTitle'), 'ADD-NEW');
				break;
			}
		}
	},
	
	editGroupSubItemsHandler: function(index, startDate){
		var restriction = new Ab.view.Restriction();
		restriction.addClause('gp.gp_id', this.editGroupId, '=');
		var record = this.groupRecordsDataSource.getRecords(restriction)[0];
		var allocationType = record.getValue('gp.allocation_type');
		switch(index) {
			case 0:{
				//create new group from as of date
				if (allocationType == 'Allocated Area') {
					this.openEditGroupPopupWindow(false, this.asOfDate, 'EDIT-GROUP-FROM-ASOFDATE');
				} else {
					this.openUnavailableSpaceForm(getMessage('editUnavailableAllocation'), 'EDIT-GROUP-FROM-ASOFDATE');
				}
				break;
			}
			case 1: {
				if (allocationType == 'Allocated Area') {
					this.openEditGroupPopupWindow(false, startDate, 'EDIT-GROUP-FROM-STARTDATE');
				} else {
					this.openUnavailableSpaceForm(getMessage('editUnavailableAllocation'), 'EDIT-GROUP-FROM-STARTDATE');
				}
				break;
			}
		}
	},
	
	/**
	 * Split an existing group.
	 */
	splitGroup: function() {
		//kb#3049867: alert user if select no group
		if (!this.editGroupId)	{
			View.alert(getMessage('noSelectGp'));
			return;
		}
		
		if(!this.checkIfCanEditAllocation(this.editGroupId)) {
			View.alert(getMessage('cannotEditThisAllocation'));
		} else {
			var restriction = new Ab.view.Restriction();
			restriction.addClause('gp.gp_id', this.editGroupId, '=');
			var record = this.groupRecordsDataSource.getRecords(restriction)[0];
			var startDate = record.getValue('gp.date_start');
			if(startDate) {
				var isoStartDate = getIsoFormatDate(startDate);
				if (isoStartDate != this.asOfDate) {
					//give sub menu items
					var splitGroupParentMenu = Ext.get('splitGroup');
					this.showSubMenuItems('GROUP-SPLIT', splitGroupParentMenu, isoStartDate);
				} else {
					this.openSplitGroupPopupWindow(false, this.asOfDate, 'SPLIT-GROUP-FROM-STARTDATE');
				}
			} else {
				this.openSplitGroupPopupWindow(false, this.asOfDate, 'SPLIT-GROUP-FROM-STARTDATE');
			}
		}
	},
	
	/**
	 * Open the split group pop up window.
	 */
	openSplitGroupPopupWindow: function(newRecord, newDate, subType){
		var thisController = View.controllers.get('abAllocWizStackController');
		var spaceGroupDialog = View.openDialog('ab-alloc-wiz-stack-space-form.axvw', newRecord, true, {
			width: 900,
			height: 950,
			title: getMessage("splitTitle"),
			closeButton: false,
			
			afterViewLoad : function(dialogView) {
				var dialogController = dialogView.controllers.get('abAllocWizStackSpaceFormController');
				dialogController.asOfDate = newDate;
				dialogController.scn_id = thisController.scn_id;
				dialogController.scnLevel = thisController.scnLevel;
				dialogController.type = 'SPLIT';
				dialogController.subType = subType;
				dialogController.editGroupId = thisController.editGroupId;
				dialogController.callback = thisController.commonGroupCallback;
				dialogController.lastStoredEventNameForAllocating = thisController.groupMoveConfirmationForm.getSidecar().get('recentSelectedEventName');
			}
		});
	},
	
	/**
	 * Sub menu item for split group.
	 */
	splitGroupSubItemsHandler: function(index, startDate) {
		switch(index) {
			case 0:{
				//create new group from as of date
				this.openSplitGroupPopupWindow(false, this.asOfDate, 'SPLIT-GROUP-FROM-ASOFDATE');
				break;
			}
			case 1: {
				this.openSplitGroupPopupWindow(false, startDate, 'SPLIT-GROUP-FROM-STARTDATE');
				break;
			}
		}
	},
	
	/**
	 * Allocate space to generate a new group.
	 */
	allocateSpace: function(title, subtype) {
		var thisController = View.controllers.get('abAllocWizStackController');
		var newRecord = true;
		if (subtype == 'EDIT-EXISTING') {
			newRecord = false;
		}
		var spaceGroupDialog = View.openDialog('ab-alloc-wiz-stack-space-form.axvw', null, newRecord, {
			width: 800,
			height: 2000,
			title: title,
			closeButton: false, 
			
			afterViewLoad : function(dialogView) {
				var dialogController = dialogView.controllers.get('abAllocWizStackSpaceFormController');
				dialogController.asOfDate = thisController.asOfDate;
				dialogController.scn_id = thisController.scn_id;
				dialogController.scnLevel = thisController.scnLevel;
				dialogController.type = 'ALLOCATE';
				dialogController.subType = subtype;
				dialogController.editGroupId = thisController.editGroupId;
				dialogController.callback = thisController.commonGroupCallback;
				dialogController.lastStoredEventNameForAllocating = thisController.lastStoredEventNameForAllocating;
				dialogController.showBuildingId = thisController.showBuildingId;
				dialogController.showFloorId = thisController.showFloorId;
			}
		});
	},
	
	/**
	 * The common call back for all the group pop-up window.
	 */
	commonGroupCallback: function(newAsOfDate, eventName) {
		var thisController = View.controllers.get('abAllocWizStackController');
		if(eventName) {
			thisController.lastStoredEventNameForAllocating = eventName;
		}
		if(newAsOfDate) {
			if (thisController.asOfDate != newAsOfDate) {
				thisController.asOfDate = newAsOfDate;
				thisController.setInitialValueForDateInput();
			}
		}
		thisController.refreshStackChartWithNewDate();
		thisController.eventsTreePanel.refresh();
		thisController.eventsTreePopPanel.refresh();
	},
	
	/**
	 * Open the form for unavailable space.
	 */
	openUnavailableSpaceForm: function(title, subtype) {
		var thisController = View.controllers.get('abAllocWizStackController');
		var newRecord = false;
		if (this.subType == 'ADD-NEW') {
			newRecord = true;
		}
		var spaceGroupDialog = View.openDialog('ab-alloc-wiz-stack-space-form.axvw', null, newRecord, {
			width: 900,
			height: 950,
			title: title,
			closeButton: false,
			
			afterViewLoad : function(dialogView) {
				var dialogController = dialogView.controllers.get('abAllocWizStackSpaceFormController');
				dialogController.asOfDate = thisController.asOfDate;
				dialogController.scn_id = thisController.scn_id;
				dialogController.scnLevel = thisController.scnLevel;
				dialogController.editGroupId = thisController.editGroupId;
				dialogController.type = 'UNAVAILABLE';
				dialogController.subType = subtype;
				dialogController.callback = thisController.commonGroupCallback;
				dialogController.lastStoredEventNameForAllocating = thisController.lastStoredEventNameForAllocating;
				dialogController.showBuildingId = thisController.showBuildingId;
				dialogController.showFloorId = thisController.showFloorId;
			}
		});
	},
	
	popUpEventsPanel: function() {
		var layoutManager = View.getLayoutManager('mainLayout');
		if (layoutManager.isRegionCollapsed('north')) {
			this.eventsTreePopPanel.showInWindow({
				x: 100, 
				y: 100,
				width: 300,
				height: 300,
				closeButton: true,
				closable: false
			});
		}
		else {
			View.alert(getMessage("eventPopUp"));
		}
	},
    // ---------------------------------------------------------------------------------------------
    // END handlers for mapped dom element's  events  Section
    // ---------------------------------------------------------------------------------------------

    // ---------------------------------------------------------------------------------------------
    // BEGIN stack control - tooltip Section 
    // ---------------------------------------------------------------------------------------------
	/**
	 * The tool tip for the user when the mouse is over.
	 */
	onTooltip: function(item) {
		
		var allocationId = item['gp.gp_id'];
		var restriction = new Ab.view.Restriction();
		restriction.addClause('gp.gp_id', allocationId, '=');
		var record = abAllocWizStackController.groupRecordsDataSource.getRecords(restriction)[0];
		if (!record)	{
			return;
		}

		var allocationType = record.getValue('gp.allocation_type');
		var str;
		if (allocationType == 'Allocated Area') {
			str = abAllocWizStackController.showAllocatedAreaToolTip(item, record);
		} else if (allocationType.startsWith('Unavailable')) {
			str = abAllocWizStackController.showUnavailableAreaToolTip(item, record);
		} else {
			str = "<b>"+getMessage("availAreaTooltip")+"</b>";
			str += "<br/><strong>"+getMessage("areaTooltip")+": " + item['gp.area_manual'] + " " + View.user.areaUnits.title + "</strong>";
		}
		return str;
	},
	
	/**
	 * Show the tooltip for allocated area.
	 */
	showAllocatedAreaToolTip: function(item, record) {
		var str = "<b>"+getMessage("allocAreaTooltip")+"</b>";
		str += "<br/><strong>"+getMessage("buTooltip")+": " + record.getValue('gp.planning_bu_id') + "</strong>";
		if (this.scnLevel == 'dv' || this.scnLevel == 'dp' || this.scnLevel == 'fg') {
			str += "<br/><strong>"+getMessage("dvTooltip")+": " + item['gp.dv_id'] + "</strong>";
		}
		if(this.scnLevel == 'dp' || this.scnLevel == 'fg') {
			str += "<br/><strong>"+getMessage("dpTooltip")+": " + record.getValue('gp.dp_id') + "</strong>";
		}
		if(this.scnLevel == 'fg') {
			str += "<br/><strong>"+getMessage("fgTooltip")+": " + record.getValue('gp.gp_function') + "</strong>";
		}
		str += "<br/><strong>"+getMessage("areaTooltip")+": " + item['gp.area_manual'] + " " + View.user.areaUnits.title + "</strong>";
		str += "<br/><strong>"+getMessage("hcTooltip")+": " + record.getValue('gp.count_em') + "</strong>";
		str += "<br/><strong>"+getMessage("startDateTooltip")+": " + abAllocWizStackController.formatToolTipDate(record.getValue('gp.date_start')) + "</strong>";
		if (record.getValue('gp.date_end')) {
			str += "<br/><strong>"+getMessage("endDateTooltip")+": " + abAllocWizStackController.formatToolTipDate(record.getValue('gp.date_end')) + "</strong>";
		} else {
			str += "<br/><strong>"+getMessage("endDateTooltip")+":</strong>";
		}
		
		str += "<br/><strong>"+getMessage("eventTooltip")+": " + record.getValue('gp.event_name') + "</strong>";
		
		if(this.scnLevel == 'fg') {
			var gpId = item['gp.gp_id'];
			var restriction = new Ab.view.Restriction();
			restriction.addClause('sb_items.gp_id', gpId, '=');
			var records = this.sbItemsForToolTipDs.getRecords(restriction);
			if (records.length > 0) {
				str += "<br/><strong>"+getMessage("fgcTooltip")+":</strong>";
			}
			for(var i = 0; i < records.length; i++) {
				var record = records[i];
				var maxPxValue = record.getValue('sb_items.p01_value');
				for (var j = 1 ; j < 13; j++) {
					var field = '';
					if (j < 10) {
						field = 'sb_items.p0' + j + '_value';
					} else {
						field = 'sb_items.p' + j + '_value';
					}
					var maxValue = record.getValue(field);
					if(maxValue > maxPxValue) {
						maxPxValue = maxValue;
					}
				}
				str += "<br/><strong>" + record.getValue('sb_items.rm_std') + "(" + maxPxValue +")</strong>";
			}
		}
		return str;
	},
	
	/**
	 * Show the tooltip for unavailable area
	 */
	showUnavailableAreaToolTip: function(item, record) {
		var allocationType = record.getValue('gp.allocation_type');
		var str = "";
		if(allocationType == 'Unavailable - Vertical Penetration Area') {
			str = "<b>"+getMessage("vpAreaTooltip")+"</b>";
		} else if(allocationType == 'Unavailable - Service Area') {
			str = "<b>"+getMessage("servAreaTooltip")+"</b>";
		} else if(allocationType == 'Unavailable - Remaining Area') {
			str = "<b>"+getMessage("remAreaTooltip")+"</b>";
		} else {
			str = "<b>"+getMessage("unavailAreaTooltip")+"</b>";
		}
		str += "<br/><strong>"+getMessage("areaTooltip")+": " + item['gp.area_manual'] + " " + View.user.areaUnits.title + "</strong>";
		str += "<br/><strong>"+getMessage("startDateTooltip")+": " + abAllocWizStackController.formatToolTipDate(record.getValue('gp.date_start')) + "</strong>";
		if (record.getValue('gp.date_end')) {
			str += "<br/><strong>"+getMessage("endDateTooltip")+": " + abAllocWizStackController.formatToolTipDate(record.getValue('gp.date_end')) + "</strong>";
		} else {
			str += "<br/><strong>"+getMessage("endDateTooltip")+":</strong>";
		}
		str += "<br/><strong>"+getMessage("eventTooltip")+": " + record.getValue('gp.event_name') + "</strong>";
		return str;
	},
	
	formatToolTipDate: function(dateFromDs) {
		var year = dateFromDs.getFullYear();
		var month = dateFromDs.getMonth() + 1;
		if(month < 10) {
			month = "0" + month;
		}
		var day = dateFromDs.getDate();
		if(day < 10) {
			day = "0" + day;
		}
		var dateString = FormattingDate(day, month, year, strDateShortPattern);
		return dateString;
	},
    // ---------------------------------------------------------------------------------------------
    // END stack control - tooltip Section 
    // ---------------------------------------------------------------------------------------------
	
    // ---------------------------------------------------------------------------------------------
    // BEGIN stack control - onClick Section 
    // ---------------------------------------------------------------------------------------------
	/**
	 * When user click the stack chart, save the bl_id and fl_id for showing floor plan.
	 */
	onClickStackChart: function(item) {
		var stackController = View.controllers.get('abAllocWizStackController');
		stackController.showBuildingId = item['gp.bl_id'];
		stackController.showFloorId = item['gp.fl_id'];
		stackController.editGroupId = item['gp.gp_id'];
		stackController.enableButtonsOnTitleBar();
		// process logics related to button 'Space Requirements: Edit' and refreshing of Space Requirement tab.
		if ( stackController.abAllocWizStackDs_hasSbItemsGp.getRecords("gp.gp_id="+stackController.editGroupId).length>0) {
			stackController.currentGpHasSbItems = true;
			jQuery("#editSpaceRequirement").removeClass("x-item-disabled ui-state-disabled actionbar x-btn button:disabled");
		}	
		else {
			// if previously selected a group with associated sb_items but this time selected a group without associated_items then need to reset the Space Rquirement tab to show all sb_items of current scenario.
			if (stackController.currentGpHasSbItems){
				stackController.resetSpaceRquirementTab();
			}
			stackController.currentGpHasSbItems = false;
			jQuery("#editSpaceRequirement").addClass("x-item-disabled ui-state-disabled actionbar x-btn button:disabled");
		}
	},
	
	resetSpaceRquirementTab: function() {
		var sbCtrl = this.getSpaceRquirementTabController();
		if (sbCtrl){
			sbCtrl.sbName = this.scn_name;
			sbCtrl.gpId = null;
			sbCtrl.refreshGrid();
		} 
		else {
			var tabs = View.parentTab.parentPanel;
			tabs.scnName = this.scn_name;
			tabs.associatedGpId = null;
		}
	},
	
	enableButtonsOnTitleBar: function() {
		jQuery('#showFloorPlan').removeClass('x-item-disabled ui-state-disabled');
	},
    // ---------------------------------------------------------------------------------------------
    // END stack control - onClick Section 
    // ---------------------------------------------------------------------------------------------

    // ---------------------------------------------------------------------------------------------
    // BEGIN stack control - onDrop Section 
    // ---------------------------------------------------------------------------------------------
	/**
	 * 
	 */
	onDrop: function(obj) {
		var recordToUpdate = obj.sourceRecord,
		targetRecord = obj.targetRecord,
		previousRecord = obj.previousRecord;
		var thisController = abAllocWizStackController;
		
		if(!thisController.checkIfCanEditAllocation(recordToUpdate['gp.gp_id'])) {
			View.alert(getMessage('cannotEditThisAllocation'));
			return;
		}
		
		// get record by id
		var rest = new Ab.view.Restriction();
		rest.addClause('gp.gp_id', recordToUpdate['gp.gp_id']);
		var records = View.dataSources.get('abAllocWizStackDs_gp').getRecords(rest); 
	
		// update record with new values
		try {
			if (records.length > 0) {
				var fromBlId = recordToUpdate['gp.bl_id'];
				var fromFlId = recordToUpdate['gp.fl_id'];
				var toBlId = targetRecord['gp.bl_id'];
				var toFlId = targetRecord['gp.fl_id'];
				var targetOrder = targetRecord['gp.sort_order'];
				thisController.sourceObject = obj;

				if (records[0].getValue('gp.option1')=='1')	{
					//do negative logics
					thisController.performopenNegativeAllocation(records[0],toBlId,toFlId);
				} 
				 //if the source bl_id is different from target bl_id or is the source fl_id, then create group move dialog.
				else if (fromBlId != toBlId || fromFlId != toFlId) {
					var fromGroupName = recordToUpdate['gp.name'];
					thisController.groupMoveConfirmationForm.showInWindow({
						width: 800,
						height: 450,
						title: getMessage('groupMoveConfirm')
					});
					
					thisController.groupMoveConfirmationForm.setFieldValue('gp.name', fromGroupName);
					thisController.groupMoveConfirmationForm.setFieldValue('gp.date_start', thisController.asOfDate);

					thisController.groupMoveConfirmationForm.setFieldValue('from_bl_fl', fromBlId + "-" + fromFlId);
					thisController.groupMoveConfirmationForm.setFieldValue('from_bl', fromBlId );
					thisController.groupMoveConfirmationForm.setFieldValue('from_fl', fromFlId );
					thisController.groupMoveConfirmationForm.setFieldValue('to_bl_fl', toBlId + "-" + toFlId);
					thisController.groupMoveConfirmationForm.setFieldValue('to_bl', toBlId);
					thisController.groupMoveConfirmationForm.setFieldValue('to_fl', toFlId);
					
					var description = getMessage('moveFrom') + " " + fromBlId + " " + fromFlId + " " + getMessage('moveTo') + " " + toBlId + " " + toFlId;
					thisController.groupMoveConfirmationForm.setFieldValue('gp.description', description);
					//kb#3049288: When the FROM building is UNALLOC, copy the gp.event_name value of that group into the "Confirm Allocation Change" form.
					if ("UNALLOC"==fromBlId){
						thisController.groupMoveConfirmationForm.setFieldValue('gp.event_name', recordToUpdate['gp.event_name']);
					} else {
						var recentEventName = thisController.groupMoveConfirmationForm.getSidecar().get('recentSelectedEventName');
						if (recentEventName) {
							thisController.groupMoveConfirmationForm.setFieldValue('gp.event_name', recentEventName);
						}
					}

					thisController.groupMoveConfirmationForm.setFieldValue('gp.portfolio_scenario_id', thisController.scn_id);
					thisController.groupMoveConfirmationForm.setFieldValue('gp.gp_id', recordToUpdate['gp.gp_id']);
					thisController.groupMoveConfirmationForm.setFieldValue('gp.ls_id', records[0].getValue('gp.ls_id'));
					thisController.groupMoveConfirmationForm.setFieldValue('gp.allocation_type', recordToUpdate['gp.allocation_type']);
					thisController.groupMoveConfirmationForm.setFieldValue('gp.bl_id', recordToUpdate['gp.bl_id']);
					thisController.groupMoveConfirmationForm.setFieldValue('gp.hpattern_acad', recordToUpdate['gp.hpattern_acad']);
					var restriction = new Ab.view.Restriction();
					restriction.addClause('gp.gp_id', recordToUpdate['gp.gp_id'], '=');
					var currentAllocation = thisController.groupRecordsDataSource.getRecords(restriction)[0];
					if (currentAllocation.getValue('gp.parent_group_id')) {
						thisController.groupMoveConfirmationForm.enableField('gp.date_start', false);
					}
					
				} else {//only update the sort order.
					var record = records[0];
					record.isNew = false;
			    	var newSortOrder = thisController.calculateNewSortOrder(recordToUpdate['gp.gp_id']);
			    	record.setValue('gp.sort_order', newSortOrder);
			    	// save record
			    	View.dataSources.get('abAllocWizStackDs_gp').saveRecord(record);
			    	// refresh stack
			    	thisController.stackControl.refresh(thisController.toggleUnavailableRestriction);
				}
			}		
		} catch (e) {
			alert(e.message);		
		}
	},
    
	performopenNegativeAllocation: function(negativeGp, toBlId, toFlId){
		var destGp = this.searchDestinationGp(negativeGp, toBlId, toFlId);
		if (destGp){
			this.openNegativeForm(negativeGp, destGp);
		}
	},

	searchDestinationGp: function(negativeGp, toBlId, toFlId){
		var destGpDs = View.dataSources.get('abAllocWizStackDs_destGp'); 
		destGpDs.addParameter('scenarioId', this.scn_id);
		destGpDs.addParameter('asOfDate', this.asOfDate);
		destGpDs.addParameter('blId', toBlId);
		destGpDs.addParameter('flId', toFlId);
		destGpDs.addParameter("negativeGpId", negativeGp.getValue('gp.gp_id'));
		destGpDs.addParameter("sameOrgCondition", this.getSameOrgConditionByScnLevel());

		var records = destGpDs.getRecords();
		if (records && records.length>0){
			return records[0];
		}
		return null;
	},

	getSameOrgConditionByScnLevel: function(){
		var conditionSql = "1=0 ";
		if ("bu"==this.scnLevel){
			conditionSql = "( g1.planning_bu_id is null and gp.planning_bu_id is null or g1.planning_bu_id is not null and gp.planning_bu_id is not null  and g1.planning_bu_id= gp.planning_bu_id) "	
		}  
		else if ("dv"==this.scnLevel) {
			conditionSql = "( g1.dv_id is null and gp.dv_id is null or g1.dv_id is not null and gp.dv_id is not null  and g1.dv_id= gp.dv_id) "	
		} 
		else if ("dp"==this.scnLevel ){
			conditionSql = "( g1.dv_id is not null and gp.dv_id is not null  and g1.dv_id= gp.dv_id)  and ( g1.dp_id is null and gp.dp_id is null or g1.dp_id is not null and gp.dp_id is not null  and g1.dp_id= gp.dp_id) "	
		}
		return conditionSql;
	},

	openNegativeForm: function(negativeGp, destGp){
		var me = this;
		View.openDialog('ab-alloc-sp-negative-gp.axvw', null, true, {
			width: 1024,
			height: 800,
			scenarioId: me.scn_id, 
			negativeGpId: negativeGp.getValue('gp.gp_id'), 
			gpId: destGp.getValue('gp.gp_id'), 
			asOfDate: me.asOfDate, 
			callback: function(dateStart){
				View.closeDialog();
				me.refreshStackChartWithNewDate();
				me.eventsTreePanel.refresh();
				me.eventsTreePopPanel.refresh();
			}
		});		
	},
    // ---------------------------------------------------------------------------------------------
    // END stack control - onDrop Section 
    // ---------------------------------------------------------------------------------------------

    // ---------------------------------------------------------------------------------------------
    // BEGIN group move confirmation form Section 
    // ---------------------------------------------------------------------------------------------
    /**
     * Confirm the group move, we will update or create new gp record.
     */
    groupMoveConfirmationForm_onConfirmGpAllocationChange: function() {
    	//Check if the form can be saved.
    	if(this.groupMoveConfirmationForm.canSave()) {
    		var currentDateStart = this.groupMoveConfirmationForm.getFieldValue('gp.date_start');
    		var gpName = this.groupMoveConfirmationForm.getFieldValue('gp.name');
    		var eventName = this.groupMoveConfirmationForm.getFieldValue('gp.event_name');
    		var sourceGpId = this.groupMoveConfirmationForm.getFieldValue('gp.gp_id');
    		var description = this.groupMoveConfirmationForm.getFieldValue('gp.description');
    		var gpHpattern = this.groupMoveConfirmationForm.getFieldValue('gp.hpattern_acad');
    		
			var toBlId = this.groupMoveConfirmationForm.getFieldValue('to_bl');
			var toFlId = this.groupMoveConfirmationForm.getFieldValue('to_fl');
			
			//get the start date of the target record and compare it to the asOfDate.
			var restriction = new Ab.view.Restriction();
			restriction.addClause('gp.gp_id', sourceGpId, '=');
			var targetGroup = this.groupRecordsDataSource.getRecords(restriction)[0];
			var targetStartDate = getIsoFormatDate(targetGroup.getValue('gp.date_start'));
			
    		if (currentDateStart == targetStartDate) {
    			//only update the location to the target location;
    			var newSortOrder = this.calculateNewSortOrder(sourceGpId);
    			targetGroup.setValue('gp.sort_order', newSortOrder);
    			targetGroup.setValue('gp.bl_id', toBlId);
    			targetGroup.setValue('gp.fl_id', toFlId);
    			targetGroup.setValue('gp.event_name', eventName);
    			targetGroup.setValue('gp.description', description);
    			targetGroup.isNew = false;
    			this.groupRecordsDataSource.saveRecord(targetGroup);
    		} else if(currentDateStart > targetStartDate) {
    			//create a new record
    			var restriction = new Ab.view.Restriction();
    			restriction.addClause('gp.gp_id', sourceGpId, '=');
    			var record = this.groupRecordsDataSource.getRecords(restriction)[0];
				record.isNew = true;
				record.removeValue('gp.gp_id');
				record.setValue('gp.date_start', currentDateStart);
				record.setValue('gp.name', gpName);
				record.setValue('gp.description',  description);
				record.setValue('gp.portfolio_scenario_id', this.scn_id);
				record.setValue('gp.allocation_type', 'Allocated Area');
				record.setValue('gp.parent_group_id', sourceGpId);
				record.setValue('gp.sort_order', this.calculateNewSortOrder(sourceGpId));
				record.setValue('gp.bl_id', toBlId);
				record.setValue('gp.fl_id', toFlId);
				record.setValue('gp.event_name', eventName);
				record.setValue('gp.hpattern_acad', encodePattern(gpHpattern));
				
				//add end date if it is leased 
				var originalAllocationType = this.groupMoveConfirmationForm.getFieldValue('gp.allocation_type');
				if(originalAllocationType == 'Usable Area - Leased') {
					var lsId = this.groupMoveConfirmationForm.getFieldValue('gp.ls_id');
					var restriction = new Ab.view.Restriction();
					restriction.addClause('ls.ls_id', lsId, '=');
					var lsRecords = this.leaseDataSource.getRecords(restriction);
					if (lsRecords.length > 0) {
						var endDate = lsRecords[0].getValue('ls.date_end');
						record.setValue('gp.date_end', endDate);
					}
				}
				this.groupRecordsDataSource.saveRecord(record);
				
				//Update the original group's date end.
				var dateEndForOriginal = this.addDay(currentDateStart, -1);
				targetGroup.setValue('gp.date_end', Date.parseDate(dateEndForOriginal, 'Y-m-d'));
				//	kb#3049630: comment below code since original event_name of ended group should keep.
				// targetGroup.setValue('gp.event_name', eventName);
				targetGroup.isNew = false;
				this.groupRecordsDataSource.saveRecord(targetGroup);
    		} else {
    			alert("Date of Move is earlier than the group allocation Start Date. Please edit and save again");
    			return;
    		}
    		
    		this.groupMoveConfirmationForm.getSidecar().set('recentSelectedEventName',eventName);
    		
    		try {
    			this.groupMoveConfirmationForm.closeWindow();
    			this.eventsTreePanel.refresh();
    			this.eventsTreePopPanel.refresh();
    			this.stackControl.refresh(this.toggleUnavailableRestriction);
				this.decideShowMapOrChartPanel();
    		}catch (e){
    			//Keep working.
    		}
    	}
    },
    
    /**
     * Calculate the new sort order.
     */
    calculateNewSortOrder: function(sourceGpId) {
    	var thisController = abAllocWizStackController;
    	var updateRecord = thisController.sourceObject.sourceRecord;
    	var targetRecord = thisController.sourceObject.previousRecord;
    	var hasPrevious = true;
    	if(!targetRecord) {
    		targetRecord = thisController.sourceObject.targetRecord;
    		hasPrevious = false;
    	} else {
    		targetRecord = thisController.sourceObject.targetRecord;
    	}
    	
    	var targetSortOrder = targetRecord['gp.sort_order'];
    	var targetAllocationType = targetRecord['gp.allocation_type'];
    	if(!targetAllocationType) {
    		targetAllocationType = targetRecord['gp.allocation_type.raw'];
    	}
    	if (targetAllocationType.startsWith('Unavailable')) {
    		targetSortOrder = 0;
    	} else if(targetAllocationType.startsWith('Available') && !hasPrevious) {
    		targetSortOrder = 0;
    	}
    	var newSortOrder = Number(targetSortOrder) + 1;
    	var restriction = new Ab.view.Restriction();
    	restriction.addClause('gp.portfolio_scenario_id', this.scn_id, '=');
    	restriction.addClause('gp.bl_id', targetRecord['gp.bl_id'], '=', 'AND', true);
    	restriction.addClause('gp.fl_id', targetRecord['gp.fl_id'], '=', 'AND', true);
    	restriction.addClause('gp.sort_order', targetSortOrder, '>=', 'AND', true);
    	restriction.addClause('gp.gp_id', sourceGpId, '<>', 'AND', true);
    	
    	var records = this.groupRecordsDataSource.getRecords(restriction);
    	if(records.length > 0) {
    		var smallest = records[0].getValue('gp.sort_order');
        	if (smallest <= newSortOrder) {
        		//update the sort_order of the right records.
    			var currentBiggest = newSortOrder + 1;
    			for (var i = 0; i < records.length - 1; i++) {
    				records[i].setValue('gp.sort_order', currentBiggest);
    				var nextRecord = records[i+1];
    				var nextSortOrder = Number(nextRecord.getValue('gp.sort_order'));
    				if (nextSortOrder <= currentBiggest) {
    					currentBiggest = currentBiggest + 1;
    				} else {
    					currentBiggest = nextSortOrder;
    				}
    			}
    			//update the new sort value for the right records
    			for (var j = 0; j < records.length; j++) {
    				var updateRecord = records[j];
    				updateRecord.isNew = false;
    				this.groupRecordsDataSource.saveRecord(updateRecord);
    			}
        	}
    	}
    	return newSortOrder;
    },
    // ---------------------------------------------------------------------------------------------
    // END group move confirmation form Section 
    // ---------------------------------------------------------------------------------------------
 	
    // ---------------------------------------------------------------------------------------------
    // BEGIN refresh logics Section 
    // ---------------------------------------------------------------------------------------------
	/**
	 * When the scenario is changed, we need to refresh the map, building, stack and chart tab.
	 */
	applyChangedScenario: function(filter) {
		this.refreshTab(filter);
		this.setAsOfDate();
		this.setPortfolioScenarioLevel();
		this.setInitialValueForDateInput();
		this.decideShowMapOrChartPanel();
		this.rebuildStackPanelChart();
		this.eventsTreePanel.refresh();
		this.eventsTreePopPanel.refresh();
    	this.stackBuildingTreePanel.refresh();
		this.disableRequirementsNotAtFgLevel();
	},
	
	/**
	 * When use select a new portfolio scenario, update the copy of it.
	 */
	setPortfolioScenarioLevel: function() {
		var restriction = new Ab.view.Restriction();
		restriction.addClause('portfolio_scenario.portfolio_scenario_id', this.filter['scn_id'], '=');
		var portfolioScenario = this.portfolioScenarioDataSource.getRecords(restriction)[0];
		this.scnLevel = portfolioScenario.getValue('portfolio_scenario.scn_level');
		this.scn_name = portfolioScenario.getValue('portfolio_scenario.scn_name');
	},
	
	/**
	 * When the as of date is changed, we need to update the stack chart and map control.
	 */
	asOfDateChanged: function() {
		var newAsOfDate = jQuery("#asOfDateInput").val();
		if (newAsOfDate) {
			this.addNewSpaceForm.setFieldValue('gp.date_start', newAsOfDate);
			var localizedDate = this.addNewSpaceForm.getFieldValue('gp.date_start');
			this.asOfDate = localizedDate;
		}
		this.editGroupId = '';
		this.lastStoredEventNameForAllocating = '';
		try{
			this.buildScenarioThematic();
		}catch(e) {
			
		}
		this.refreshStackChartWithNewDate();
	},
	
	/**
	 * When the as of date is changed, we need to refresh the stack chart and display the original buildings if they exist.
	 */
	refreshStackChartWithNewDate: function() {
		var originalBuildings = jQuery.extend(true, [], this.stackControl.config.buildings);
		this.rebuildStackPanelChart();
		this.stackControl.config.buildings = originalBuildings;
		this.stackControl.addParameter('portfolio_scenario_id', this.scn_id);
		this.addParameterForStackGroupDataSource();
		try{
			this.stackControl.refresh(this.toggleUnavailableRestriction);
			//kb#3049590: also refresh the map/chart when stack is refreshed for asOfDate change or allocation change.
			this.decideShowMapOrChartPanel();
		}catch(e) {
			//keep work when error happens.
		}
	},

	/**
	 * When the tab is opened , we need to filter all the panels with the scenario_id from the select scenario tab.
	 */
	refreshUponOpeningView: function() {
		var allocWizController = View.getOpenerView().controllers.get('allocWiz');
		this.scn_id = allocWizController.scn_id;
		
		// also include the console's filtr when openning the view firstly
		if ( allocWizController.filter ) {
			this.filter = allocWizController.filter;
		} 
		else {
			this.filter = {};
		}

		var restriction = new Ab.view.Restriction();
		restriction.addClause('portfolio_scenario.portfolio_scenario_id', this.scn_id, '=');
		var currentSelectedScenario = this.portfolioScenarioDataSource.getRecords(restriction)[0];
		this.scnLevel = currentSelectedScenario.getValue('portfolio_scenario.scn_level');
		this.scn_name = currentSelectedScenario.getValue('portfolio_scenario.scn_name');

		this.filter['scn_id'] = this.scn_id;
		this.refreshTab(this.filter);
	},

    /**
     * Refresh tabs when there are values from the filter console.
     */
	refreshTab: function(filter) {
		if(filter != null) {
			this.filter = filter;
		}
		this.scn_id = this.filter['scn_id'];
		if(this.scn_id != null && this.scn_id != '') {
			var scnIdRestriction = getScenarioIdRestriction(this.scn_id);
			this.eventsTreePanel.addParameter('scenarioIdRestriction', scnIdRestriction);
			this.eventsTreePopPanel.addParameter('scenarioIdRestriction', scnIdRestriction);
			this.stackBuildingTreePanel.addParameter('scenarioIdRestriction', scnIdRestriction);
			//kb#3050891: Add the ability to filter by organization	
			addLocationRestriction([this.stackBuildingTreePanel], this.filter);
			addOrganizationRestriction([this.stackBuildingTreePanel], this.filter);
			this.setPortfolioScenarioLevel();
		} 

		var panels = [this.eventsTreePanel, this.eventsTreePopPanel];
		addDateRestriction(panels, this.filter, this.checkOracleDataSource);
		addLocationRestriction(panels, this.filter);
		//kb#3050891: Add the ability to filter by organization	
		addOrganizationRestriction(panels, this.filter);
    	
    	//Add areaConversionFactor for the eventsTreePanel and eventsTreePopPanel
    	this.eventsTreePanel.addParameter('areaUnitsConversionFactor', this.areaUnitsConversionFactor);
    	this.eventsTreePopPanel.addParameter('areaUnitsConversionFactor', this.areaUnitsConversionFactor);
    	
    	this.setAsOfDate();
    	this.eventsTreePanel.refresh();
    	this.eventsTreePopPanel.refresh();
    	this.stackBuildingTreePanel.refresh();
    	if(this.stackControl) {
    		this.setInitialValueForDateInput();
    		this.refreshStackChartWithNewDate();
    	}
    	
    	try{
    		this.buildScenarioThematic();
    	}catch(e){
    		Workflow.handleError(e);
    	}
	},
	
	/**
	 * When the portfolio scenario is changed, the as of date and buildings must be rebuild. We just clear the buildings and then refresh
	 * to force the stack control to fetch data again.
	 */
	rebuildStackPanelChart: function() {
		this.stackControl.config.portfolioScenario = this.scn_id;
		this.stackControl.config.asOfDate = this.asOfDate;
		this.stackControl.config.buildings = [];
		this.stackControl.addParameter('portfolio_scenario_id', this.scn_id);

		var startDateAsOfDate = " (gp.date_start <= '" + this.asOfDate + "')";
		var endDateAsOfDate = " (gp.date_end >= '" + this.asOfDate + "' OR gp.date_end IS NULL)";
		if(this.isOracle == 1) {
			startDateAsOfDate = " (gp.date_start <= to_date('" + this.asOfDate + "', 'YYYY-MM-DD'))";
			endDateAsOfDate = " (gp.date_end >= to_date('" + this.asOfDate + "', 'YYYY-MM-DD') OR gp.date_end IS NULL)";
		}
		
		this.stackControl.addParameter('dateStartAsOfDate', startDateAsOfDate);
		this.stackControl.addParameter('dateEndAsOfDate', endDateAsOfDate);
		this.stackControl.addParameter('asOfDate', this.asOfDate);
		try {
			this.stackControl.refresh(this.toggleUnavailableRestriction);
		} catch(e){
			//When the buildings is cleared, the core will throw unnecessary errors. 
		} 
	},
    // ---------------------------------------------------------------------------------------------
    // END refresh logics Section 
    // ---------------------------------------------------------------------------------------------
	
    // ---------------------------------------------------------------------------------------------
    // BEGIN 'Events' tree Section 
    // ---------------------------------------------------------------------------------------------
	/**
	 * Create restriction for the events tree.
	 */
	createRestrictionForEventsTreeLevel: function(parentNode, level) {
		if (parentNode.data) {
			var restriction = null;
			if (level == 1) {
				var dvId = parentNode.data['gp.dv_id'];
				restriction = new Ab.view.Restriction();
				restriction.addClause('gp.dv_id', dvId, '=');
			} else if (level == 2) {
				var eventName = parentNode.data['gp.event_name'];
				restriction = new Ab.view.Restriction();
				restriction.addClause('gp.event_name', eventName, '=');
			} else if (level == 3) {
				var gpName = parentNode.data['gp.name'];
				var eventName = parentNode.data['gp.event_name'];
				restriction = new Ab.view.Restriction();
				restriction.addClause('gp.name', gpName, '=');
				restriction.addClause('gp.event_name', eventName, '=', 'AND', true);
			}
			return restriction;
		}
	},
	
	/**
	 * update as of date of stack control and map control.
	 */
	updateAsOfDateFromEventName: function(panel) {
		var eventNode = panel.lastNodeClicked;
		var eventName = eventNode.data['gp.event_name'];
		var date = eventName.substring(0,10);
		this.asOfDate = date;
		this.buildScenarioThematic();
		this.setInitialValueForDateInput();
		this.refreshStackChartWithNewDate();
		if ( this.toggleEventsHighlight){
			this.highlightGpsOnStackByEventName(eventName);
		}
	},

	/**
	 * update as of date of stack control and map control.
	 */
	updateAsOfDateFromGroupName: function(panel) {
		var currentNode = panel.lastNodeClicked;
		var parentNode = currentNode.parent;
		var eventName = parentNode.data['gp.event_name'];
		var gpName = currentNode.data['gp.name'];
		var date = eventName.substring(0,10);
		this.asOfDate = date;
		this.buildScenarioThematic();
		this.setInitialValueForDateInput();
		this.refreshStackChartWithNewDate();
		if ( this.toggleEventsHighlight){
			this.highlightGpsOnStackByGpName(eventName, gpName);
		}
	},

	/**
	 * update as of date of stack control and map control.
	 */
	updateAsOfDateFromDescription: function(panel) {
		var currentNode = panel.lastNodeClicked;
		var gpName = currentNode.parent.data['gp.name'];
		var eventNode = currentNode.parent.parent;
		var eventName = eventNode.data['gp.event_name'];
		var date = eventName.substring(0,10);
		this.asOfDate = date;
		var description = currentNode.data['gp.description'];
		var blName = currentNode.data['gp.blName'];
		var blId = null;
		if(description) {
			var descArray = description.split(" ");
			blId = descArray[0];
		}
		this.buildScenarioThematic();
		
		var originalBuildings = this.stackControl.config.buildings;
		var needPush = true;
		for (var i = 0; i < originalBuildings.length; i++) {
			if (originalBuildings[i] == blId) {
				needPush = false;
			}
		}
		if (needPush && blId) {
			originalBuildings.push(blId);
			this.buildingDisplayTitlesMap[blId+" "+blName] = getMessage('hideScenarioOnStack'); 
			this.stackBuildingTreePanel_afterRefresh();
		}
		this.setInitialValueForDateInput();
		this.refreshStackChartWithNewDate();
		if ( this.toggleEventsHighlight){
			this.highlightGpsOnStackByGpName(eventName, gpName);
		}
	},

	highlightGpsOnStackByEventName: function(eventName) {
		var highlightRestriction = this.getHighlightRestrictionFromEventName(eventName);
		this.eventsHighlightGpDataSource.addParameter('highlightRestriction', highlightRestriction);
		
		this.addOtherRestrictionToEventHighlightDatasource();
		this.highlightGpsOnStack();
	},

	
	highlightGpsOnStackByGpName: function(eventName, gpName) {
		var highlightRestriction = this.getHighlightRestrictionFromEventName(eventName);
		highlightRestriction = highlightRestriction + " AND gp.name='"+ gpName +"'";
		this.eventsHighlightGpDataSource.addParameter('highlightRestriction', highlightRestriction);
		
		this.addOtherRestrictionToEventHighlightDatasource();
		this.highlightGpsOnStack();
	},

	highlightGpsOnStack: function(){
		var records = this.eventsHighlightGpDataSource.getRecords();
		if ( records && records.length>0) {
			var gpIds = [];
			for (var j=0; j<records.length; j++)	{
				var gpId = records[j].getValue('gp.gp_id');
				this.stackControl.highlightStackElement(gpId);
			}
		}
	},

	getHighlightRestrictionFromEventName: function( eventName){
		var endIndex = eventName.indexOf("-End");
		var actualEventName = ( endIndex==-1 ?  eventName.substring(11) : eventName.substring(11, endIndex) );
		// add restriction of gp's event name
		var highlightRestriction = ( actualEventName ?  " gp.event_name='"+ actualEventName +"'" : " ( gp.event_name is null or gp.event_name='')  " );

		// add restriction of gp's date_start or date_end
		if(this.isOracle == 1) {
			startDateAsOfDate = " (gp.date_start <= to_date('" + this.asOfDate + "', 'YYYY-MM-DD'))";
			endDateAsOfDate = " (gp.date_end >= to_date('" + this.asOfDate + "', 'YYYY-MM-DD') OR gp.date_end IS NULL)";
			highlightRestriction = highlightRestriction +  ( endIndex==-1 ?   " AND gp.date_start =  to_date('" + this.asOfDate + "', 'YYYY-MM-DD')"  :  " AND gp.date_end =  to_date('" + this.asOfDate + "', 'YYYY-MM-DD')"  );
		} 
		else {
			highlightRestriction = highlightRestriction +  ( endIndex==-1 ?   " AND gp.date_start = '" + this.asOfDate + "'"  : " AND gp.date_end = '" + this.asOfDate + "'" );
		}

		return highlightRestriction;
	},

	addOtherRestrictionToEventHighlightDatasource: function( ){
		var scnIdRestriction = getScenarioIdRestriction(this.scn_id);
 		this.eventsHighlightGpDataSource.addParameter('scenarioIdRestriction', scnIdRestriction);

		addLocationRestriction([this.eventsHighlightGpDataSource], this.filter);
		//kb#3050891: Add the ability to filter by organization	
		addOrganizationRestriction([this.eventsHighlightGpDataSource], this.filter);
	},	
    // ---------------------------------------------------------------------------------------------
    // END 'Events' tree Section 
    // ---------------------------------------------------------------------------------------------
    
    // ---------------------------------------------------------------------------------------------
    // BEGIN 'Allocated Buildings' tree Section 
    // ---------------------------------------------------------------------------------------------   
	/**
	 * Create restriction for the building tree.
	 */
	createRestrictionForBuildingTreeLevel: function(parentNode, level) {
		var restriction = null;
		var buildingIdName = parentNode.data['gp.buildingIdName'];
		var buildingId = parentNode.data['gp.bl_id'];
		if (level == 1) {
			restriction = new Ab.view.Restriction();
			restriction.addClause('gp.buildingIdName',buildingIdName, '=');
			restriction.addClause('gp.buildingIdName', buildingId, '=', 'OR', true);
		}
		return restriction;
	},
	
	stackBuildingTreePanel_onLocateBuilding: function() {
		var node = this.stackBuildingTreePanel.lastNodeClicked;
		var blId = node.data['gp.bl_id'];
		var lat = node.data['gp.lat'];
		var lon = node.data['gp.lon'];
		if(lat && lon) {
			//refresh to zoom to the extent of the current restriction.
			var restriction = new Ab.view.Restriction();
			restriction.addClause('bl.bl_id', blId, "=", "OR");
			if (!!lon && !!lat) {
				var point = esri.geometry.geographicToWebMercator(new esri.geometry.Point(lon, lat));
				abAllocWizStackController.mapControl.map.centerAndZoom(point);
			}
			
			abAllocWizStackController.assetLocatorControl.startLocate(
				'buildingAssetDS',
				restriction,
				'bl.bl_id',
				['bl.lon', 'bl.lat'],
				['bl.name']
			);
		} else {
			View.alert(getMessage('unGeocode'));
		}
	},
	
	/**
	 * Show the building in stack chart area.
	 */
	stackBuildingTreePanel_onShowBuildingOnStack: function(button,panel,node1) {
		try{
			var node = this.stackBuildingTreePanel.lastNodeClicked;
			var blId = node.data['gp.bl_id'];
			var blName = node.data['gp.buildingIdName'];
			if (this.isBuildingDisplayed(blId)) {
				//TODO A tricky solution to change the title. Can core provide function setTitle(newTitle) for button?
				button.attributes.value.value = getMessage('displayScenarioOnStack');
				this.buildingDisplayTitlesMap[blName] = getMessage('displayScenarioOnStack');
				this.stackControl.removeBuilding(blId);
			} else {
				button.attributes.value.value = getMessage('hideScenarioOnStack');
				this.buildingDisplayTitlesMap[blName] = getMessage('hideScenarioOnStack');
				this.stackControl.addBuilding(blId);
			}
			this.toggleUnavailableAreas = true;
		} catch(e) {
			
		}
		
	},
	
	/**
	 * Remove all the buildings from the stack chart.
	 */
	stackBuildingTreePanel_onHideAllBuildingSp: function() {
		this.stackBuildingTreePanel.refresh();
		var buildings = this.buildingTreeDataSource.getRecords();
		for (var i = 0; i < buildings.length; i++) {
			var blId = buildings[i].getValue('gp.bl_id');
			var blName = buildings[i].getValue('gp.buildingIdName');
			try{
				this.stackControl.removeBuilding(blId);
				this.buildingDisplayTitlesMap[blName] = getMessage('hideScenarioOnStack');
			}catch(e){
				//Keep working.
			}
		}
		this.toggleUnavailableAreas = true;
		//this.changeDisplayButtonValue(getMessage('displayScenarioOnStack'));
	},

	stackBuildingTreePanel_afterRefresh: function (){
    	var rows = Ext.query('.treeTable .ygtvrow', $('stackBuildingTreePanel'));
		for (var i=0; i<rows.length; i++ ){
			var blName = rows[i].children[0].innerText.replace(/\r\n/g,""); 
			if (	 this.buildingDisplayTitlesMap[blName] == getMessage('hideScenarioOnStack') ){
				rows[i].children[2].children[0].children[0].value = getMessage('hideScenarioOnStack'); 
			}
		}
	},

	/**
	 * Open Add Building Inventory pop-up.
	 */
	stackBuildingTreePanel_onAddBuildingsToGp: function() {
		var allocWizController = View.getOpenerView().controllers.get('allocWiz');
		var scnId = allocWizController.scn_id;
		this.addNewSpaceFromInventoryPanel.addParameter('scn_id', scnId);
		this.addNewSpaceFromInventoryPanel.refresh();
	},
		 
	/**
	 * Open Add Building Inventory pop-up.
	 */
	stackBuildingTreePanel_onAddNewSpaceToGp: function() {
		var action = this.stackBuildingTreePanel.actions.get('addNewBuildingToSp');
		this.addNewSpaceForm.showInWindow({
			anchor: action.button.el.dom, 
			width: 800,
			height: 360,
			title: getMessage('addNewSpaceTitle')
		});
	},
		 
	/**
	 * Decide whether a floor has been displayed. 
	 */
	isBuildingDisplayed: function(buildingId){
		var showedBuilding = this.stackControl.config.buildings;
		for (var i = 0;  i < showedBuilding.length; i++) {
			if(showedBuilding[i] == buildingId) {
				return true;
			}
		}
		return false;
	},
	
	/**
	 * Open the dialog for editting the building.
	 */
	openEditBuildingDialog: function() {
		var thisController = this;
		var editBuildingDialog = View.openDialog('ab-alloc-wiz-bl-edit.axvw', null, true, {
			width:800,
    		height:600,
    		
    		afterViewLoad: function(dialogView) {
    			var dialogController = dialogView.controllers.get('buildingEditDialogController');
    			var bldgNode = thisController.stackBuildingTreePanel.lastNodeClicked;
    			var buildingId = bldgNode.data['gp.bl_id'];
    			dialogController.selectedBlId = buildingId;
    		}
		});
	},
	
	/**
	 * Open the dialog for the floor tree
	 */
	openEditFloorDialog: function() {
		var thisController = this;
		var editBuildingDialog = View.openDialog('ab-alloc-wiz-fl-edit.axvw', null, true, {
			width:800,
    		height:600,
    		
    		afterViewLoad: function(dialogView) {
    			var dialogController = dialogView.controllers.get('floorEditDialogController');
    			var currentNode = thisController.stackBuildingTreePanel.lastNodeClicked;
    			var flNameId = currentNode.data['gp.floorIdName'];
    			var flId = flNameId.split(" ")[0];
    			
    			var buildingId = currentNode.parent.data['gp.bl_id'];
    			dialogController.selectedBlId = buildingId;
    			dialogController.selectedFlId = flId;
    		}
		});
	},
	
	/**
	 * Delete building record from the group.
	 */
	stackBuildingTreePanel_onDeleteBuilding: function(button, panel, node) {
		
		var buildingId = node.data['gp.bl_id'];
		if (buildingId == 'UNALLOC') {
			View.alert(getMessage('cannotDeleteUnallocBuilding'));
			return;
		}
		
		var warningMessage = getMessage('deleteBuildingFromGroup');
		var innerThis = this;
		View.confirm(warningMessage, function(button){
			if(button == 'yes') {
				var blId = node.data['gp.bl_id'];
				var restriction = new Ab.view.Restriction();
				restriction.addClause('gp.bl_id', blId, '=');
				restriction.addClause('gp.portfolio_scenario_id', innerThis.scn_id, '=', 'AND', true);
				var records = innerThis.addNewSpaceGpDataSource.getRecords(restriction);
				for(var i = 0; i < records.length; i++) {
					var record = records[i];
					innerThis.addNewSpaceGpDataSource.deleteRecord(record);
					innerThis.stackBuildingTreePanel.refresh();
				}
				innerThis.removeBuildingFromStackControl(blId);
				innerThis.decideShowMapOrChartPanel();
			}
		});
	},
	
	/**
	 * Delete floor record from the group.
	 */
	floorTree_onDeleteFloor: function(button, panel, node) {
		
		var buildingId = node.parent.data['gp.bl_id'];
		if (buildingId == 'UNALLOC') {
			View.alert(getMessage('cannotDeleteUnallocFloor'));
			return;
		}
		
		var warningMessage = getMessage('deleteFloorFromGroup');
		var innerThis = this;
		var parent = node.parent;
		View.confirm(warningMessage, function(button){
			if(button == 'yes') {
				var blId = node.parent.data['gp.bl_id'];
				
				var flNameId = node.data['gp.floorIdName'];
				var flNameIdArray = flNameId.split(" ");
				var flId = flNameIdArray[0];
				var restriction = new Ab.view.Restriction();
				restriction.addClause('gp.bl_id', blId, '=');
				restriction.addClause('gp.fl_id', flId, '=');
				restriction.addClause('gp.portfolio_scenario_id', innerThis.scn_id, '=');
				var records = innerThis.addNewSpaceGpDataSource.getRecords(restriction);
				for(var i = 0; i < records.length; i++) {
					var record = records[i];
					innerThis.addNewSpaceGpDataSource.deleteRecord(record);
				}
				innerThis.stackBuildingTreePanel.refresh();
				innerThis.removeBuildingFromStackControl();
			}
		});
	},
	
	/**
	 * We refresh the stack after the building is removed
	 */
	removeBuildingFromStackControl: function(buildingId) {
		var buildings = this.stackControl.config.buildings;
		for (var i = 0; i < buildings.length; i++) {
			if (buildingId == buildings[i]) {
				buildings.splice(i, 1);
				break;
			}
		}
		
		try {
			this.stackControl.refresh(this.toggleUnavailableRestriction);
		}catch(e){
			
		}
	},
	
	/**
	 * Open building details dialog. 
	 */
	openBuildingDetailsDialog: function(row) {
		var bl_id = row["bl.bl_id"];
		var dialog = View.openDialog("ab-alloc-wiz-bl-edit.axvw",null, true, {
			width:800,
    		height:600,
    		
    		afterViewLoad: function(dialogView) {
    			var dialogController = dialogView.controllers.get('buildingEditDialogController');
    			dialogController.selectedBlId = bl_id;
    		}
    	});
	},
	
	openFloorDetailsDialog: function(row) {
		var bl_id = row["bl.bl_id"];
		var controller = this;
		var allocWizController = View.getOpenerView().controllers.get('allocWiz');
		var scnId = allocWizController.scn_id;
		var dialog = View.openDialog("ab-alloc-wiz-stack-gp-floors.axvw",null, true, {
			width:800,
    		height:600,
    		closeButton: false,
    		
    		afterViewLoad: function(dialogView) {
    			var dialogController = dialogView.controllers.get('allocWizGpFloorsController');
    			dialogController.selectedBlId = bl_id;
    			dialogController.scn_id = scnId;
    			dialogController.callback = View.controllers.get('abAllocWizStackController').createGroupFromFloorDetailsCallback;
    		}
    	});
	},
	
	/**
	 * 
	 */
	createGroupFromFloorDetailsCallback: function() {
		View.controllers.get('abAllocWizStackController').stackBuildingTreePanel.refresh();
		if (View.controllers.get('abAllocWizStackController').stackControl.config.buildings.length > 0) {
			View.controllers.get('abAllocWizStackController').rebuildStackPanelChart();
		}
	},
	
	/**
	 * Create group records from a building and its all floors.
	 */
	addNewSpaceFromInventoryPanel_onCreateGroupFromBuilding: function() {
		var selectedBuildingRecords = this.addNewSpaceFromInventoryPanel.getSelectedRecords();
		if (selectedBuildingRecords.length == 0) {
			View.alert(getMessage('noSelectedBulding'));
			return;
		}
		
		//Call the workflow rule to create group record.
		this.createGroupsForBuildings(selectedBuildingRecords);
		
		this.addNewSpaceFromInventoryPanel.refresh(new Ab.view.Restriction());
		this.stackBuildingTreePanel.refresh();
		this.eventsTreePanel.refresh();
		this.eventsTreePopPanel.refresh();
		this.decideShowMapOrChartPanel();
	},
	
	/**
	 * Call the workflow rule to 'AbRPLMGroupSpaceAllocation-PortfolioForecastingService-addRmEmLsGroups' to create groups for the buildings.
	 */
	createGroupsForBuildings: function(buildingList) {
		var restriction = new Ab.view.Restriction();
		restriction.addClause('portfolio_scenario.portfolio_scenario_id', this.scn_id, '=');
		var currentSelectedScenario = this.portfolioScenarioDataSource.getRecords(restriction)[0];
		var dateStart = currentSelectedScenario.getValue('portfolio_scenario.date_start');
		var year = dateStart.getFullYear();
		var month = dateStart.getMonth() + 1;
		if(month < 10) {
			month = "0" + month;
		}
		var day = dateStart.getDate();
		if(day < 10) {
			day = "0" + day;
		}
		dateStart = year + "-" + month + "-" + day;
		var scnLevel = this.scnLevel;
		
		var blDataSet = new Ab.data.DataSetList();
		blDataSet.addRecords(buildingList);
		
		var flDataSet = new Ab.data.DataSetList();
		try{
			var result =  Workflow.callMethod('AbRPLMGroupSpaceAllocation-PortfolioForecastingService-createGroupFromInventory', this.scn_id, blDataSet, flDataSet, dateStart, scnLevel, 0, this.unitTitle);
		}catch(e) {
			Workflow.handleError(e);
		}
	},
	
	/**
	 * Change the default value of this add new space form.
	 */
	addNewSpaceForm_afterRefresh: function() {
		this.addNewSpaceForm.setFieldValue('gp.bl_id', '');
		this.addNewSpaceForm.setFieldValue('gp.fl_id', '');
		this.addNewSpaceForm.setFieldValue('gp.date_start', this.asOfDate);
	},
	
	/**
	 * Select the distinct building value from the gp table.
	 */
	selectBuildingsForAddNewSpace: function() {
		var controller = this;
		var selectBuildingActionListener =  function(fieldName, newValue, oldValue) {
            controller.addNewSpaceForm.setFieldValue('gp.bl_id', newValue);
            return false;
        };
        var restriction = getScenarioIdRestriction(this.scn_id);
        
		View.selectValue({
			title: getMessage('selectBuilding'),
	    	fieldNames: ['gp.bl_id'],
	    	selectTableName: 'gp',
	    	selectFieldNames: ['gp.bl_id'],
	    	visibleFieldNames: ['gp.bl_id'],
	    	actionListener: selectBuildingActionListener,
	    	restriction: restriction,
	    	width: 500,
	    	height: 350
		});
	},
	
	/**
	 * Save the new space form.
	 */
	addNewSpaceForm_onSaveNewSpace: function() {
		if ( !this.addNewSpaceForm.canSave() ) {
			return; 
		}
		var dateStart = this.addNewSpaceForm.getFieldValue('gp.date_start');
		if (!dateStart) {
			alert(getMessage('dateStartRequired'));
			return;
		}
		var blId = this.addNewSpaceForm.getFieldValue('gp.bl_id');
		var flId = this.addNewSpaceForm.getFieldValue('gp.fl_id');
		
		var allocType = "Usable Area - Leased";
		var allocTypeValue = jQuery('input[name="spaceAllocationType"]').filter(':checked').val();
		if (allocTypeValue == 'owned') {
			allocType= "Usable Area - Owned";
		}
		
		//save the main gp record
		var usableArea = this.addNewSpaceForm.getFieldValue('gp.area_manual');
		
		var mainGpRecord = new Ab.data.Record();
		mainGpRecord.setValue('gp.bl_id', blId);
		mainGpRecord.setValue('gp.fl_id', flId);
		mainGpRecord.setValue('gp.date_start', dateStart);
		mainGpRecord.setValue('gp.area_manual', usableArea);
		mainGpRecord.setValue('gp.allocation_type', allocType);
		mainGpRecord.setValue('gp.event_name', 'Add New Space');
		mainGpRecord.setValue('gp.portfolio_scenario_id', this.scn_id);
		mainGpRecord.setValue('gp.date_end', this.addNewSpaceForm.getFieldValue('gp.date_end'));
		var mainGpRecordSortOrder = 0;
		if (!isNaN(flId)) {
			mainGpRecordSortOrder = Number(flId);
		}
		mainGpRecord.setValue('gp.sort_order', mainGpRecordSortOrder);
		if (allocType == 'Usable Area - Leased'){
			mainGpRecord.setValue('gp.name', 'Leased Floor');
		} else {
			mainGpRecord.setValue('gp.name', 'Owned Floor');
		}
		
		this.addNewSpaceGpDataSource.saveRecord(mainGpRecord);
		
		//check to see if need to create date available space.
		var dateAvailable = this.addNewSpaceForm.getFieldValue('date_available');
		var otherUnavailableArea = this.addNewSpaceForm.getFieldValue('other_unavailable_area');
		if (dateAvailable > dateStart) {
			var dateAvailableRecord = new Ab.data.Record();
			dateAvailableRecord.setValue('gp.bl_id', blId);
			dateAvailableRecord.setValue('gp.fl_id', flId);
			dateAvailableRecord.setValue('gp.date_start', dateStart);
			dateAvailableRecord.setValue('gp.date_end', this.addDay(dateAvailable, -1));
			dateAvailableRecord.setValue('gp.area_manual', usableArea - otherUnavailableArea);
			dateAvailableRecord.setValue('gp.allocation_type', 'Unavailable Area');
			dateAvailableRecord.setValue('gp.event_name', 'Add New Space');
			dateAvailableRecord.setValue('gp.portfolio_scenario_id', this.scn_id);
			dateAvailableRecord.setValue('gp.name', 'Unavailable Area');
			
			this.addNewSpaceGpDataSource.saveRecord(dateAvailableRecord);
		}
		
		var verticalPenetrationArea = this.addNewSpaceForm.getFieldValue('vertical_penetration_area');
		if (verticalPenetrationArea > 0) {
			var vpaRecord = new Ab.data.Record();
			vpaRecord.setValue('gp.bl_id', blId);
			vpaRecord.setValue('gp.fl_id', flId);
			vpaRecord.setValue('gp.date_start', dateStart);
			vpaRecord.setValue('gp.area_manual', verticalPenetrationArea);
			vpaRecord.setValue('gp.allocation_type', 'Unavailable - Vertical Penetration Area');
			vpaRecord.setValue('gp.event_name', 'Add New Space');
			vpaRecord.setValue('gp.portfolio_scenario_id', this.scn_id);
			vpaRecord.setValue('gp.sort_order', -3);
			vpaRecord.setValue('gp.name', 'Unavailable - Vertical Penetration Area');
			this.addNewSpaceGpDataSource.saveRecord(vpaRecord);
		}
		
		var serviceArea = this.addNewSpaceForm.getFieldValue('service_area');
		if(serviceArea > 0) {
			var serviceAreaRecord = new Ab.data.Record();
			serviceAreaRecord.setValue('gp.bl_id', blId);
			serviceAreaRecord.setValue('gp.fl_id', flId);
			serviceAreaRecord.setValue('gp.date_start', dateStart);
			serviceAreaRecord.setValue('gp.area_manual', serviceArea);
			serviceAreaRecord.setValue('gp.allocation_type', 'Unavailable - Service Area');
			serviceAreaRecord.setValue('gp.event_name', 'Add New Space');
			serviceAreaRecord.setValue('gp.portfolio_scenario_id', this.scn_id);
			serviceAreaRecord.setValue('gp.sort_order', -2);
			serviceAreaRecord.setValue('gp.name', 'Unavailable - Service Area');
			this.addNewSpaceGpDataSource.saveRecord(serviceAreaRecord);
		}
		
		var remainingArea = this.addNewSpaceForm.getFieldValue('remaining_area');
		if(remainingArea > 0) {
			var remainingAreaRecord = new Ab.data.Record();
			remainingAreaRecord.setValue('gp.bl_id', blId);
			remainingAreaRecord.setValue('gp.fl_id', flId);
			remainingAreaRecord.setValue('gp.date_start', dateStart);
			remainingAreaRecord.setValue('gp.area_manual', remainingArea);
			remainingAreaRecord.setValue('gp.allocation_type', 'Unavailable - Remaining Area');
			remainingAreaRecord.setValue('gp.event_name', 'Add New Space');
			remainingAreaRecord.setValue('gp.portfolio_scenario_id', this.scn_id);
			remainingAreaRecord.setValue('gp.sort_order', -1);
			remainingAreaRecord.setValue('gp.name', 'Unavailable - Remaining Area');
			this.addNewSpaceGpDataSource.saveRecord(remainingAreaRecord);
		}
		
		if (otherUnavailableArea > 0) {
			var otherUnavailableAreaRecord = new Ab.data.Record();
			otherUnavailableAreaRecord.setValue('gp.bl_id', blId);
			otherUnavailableAreaRecord.setValue('gp.fl_id', flId);
			otherUnavailableAreaRecord.setValue('gp.date_start', dateStart);
			otherUnavailableAreaRecord.setValue('gp.area_manual', otherUnavailableArea);
			otherUnavailableAreaRecord.setValue('gp.allocation_type', 'Unavailable Area');
			otherUnavailableAreaRecord.setValue('gp.event_name', 'Add New Space');
			otherUnavailableAreaRecord.setValue('gp.portfolio_scenario_id', this.scn_id);
			otherUnavailableAreaRecord.setValue('gp.sort_order', 0);
			otherUnavailableAreaRecord.setValue('gp.name', 'Unavailable Area');
			this.addNewSpaceGpDataSource.saveRecord(otherUnavailableAreaRecord);
		}
		
		this.stackBuildingTreePanel.refresh();
		this.eventsTreePanel.refresh();
		this.eventsTreePopPanel.refresh();
		this.refreshStackChartWithNewDate();

		this.addNewSpaceForm.displayTemporaryMessage(getMessage('created'), 2000);
		
		this.addNewSpaceForm.closeWindow.defer(2000, this.addNewSpaceForm);
	},
    // ---------------------------------------------------------------------------------------------
    // BEGIN 'Allocated Buildings' tree Section 
    // ---------------------------------------------------------------------------------------------
    
    // ---------------------------------------------------------------------------------------------
    // BEGIN Map/Chart showing Section 
    // ---------------------------------------------------------------------------------------------
	/**
	 * According to the building geocode info and Internet status to decide which tab will be display.  
	 */
	decideShowMapOrChartPanel: function() {
		this.addParametersForBuildingTreeDataSource();
		var geocodedBuildings = this.buildingTreeDataSource.getRecords();
		var showGisMap = false;
		for (var i = 0; i < geocodedBuildings.length; i++) {
			var building = geocodedBuildings[i];
			if (building.getValue('gp.lat') && building.getValue('gp.lon')) {
				showGisMap = true;
				break;
			}
		}

		if (!showGisMap) {
			if (this.initialLoad) {
				this.showChartTabControl(false);
				this.locationsInScenarioPanel.show(true);
				this.showDefaultMap();
			} 
			else {
				this.locationsInScenarioPanel.show(false);
				this.showChartTabControl(true);
			}
		} else {
			this.showChartTabControl(false);
			try{
				this.buildScenarioThematic.defer(2000, this);
				this.locationsInScenarioPanel.show(true);
			}catch(e){
				
			}
		}
	},

	afterMapLoaded: function() {
		if (this.initialLoad) {
			this.initialLoad = false;
			this.decideShowMapOrChartPanel();	
		} 
	},
	
	/**
	 * Initialize the chart tab to display the utilization.
	 */
	showChartTabControl: function(show) {
		if(show) {
			this.addParametersForBuildingTreeDataSource();
	    	var buildings = this.buildingTreeDataSource.getRecords();
			var buildingsArray = [];
			for (var i = 0; i < buildings.length; i++) {
				var buildingId = buildings[i].getValue('gp.bl_id');
	    		buildingsArray.push(buildingId);
			}
			var restriction = new Ab.view.Restriction();
			if(buildingsArray.length == 0) {
				buildingsArray.push("NOT EXISTING BUILDING")
			}
			restriction.addClause('gp.bl_id', buildingsArray, 'IN');
			restriction.addClause('gp.portfolio_scenario_id', this.scn_id, '=');
			
			if (this.asOfDate != null) {
				restriction.addClause('gp.date_start', this.asOfDate, '&lt;=');
				restriction.addClause('gp.date_end', this.asOfDate, '&gt;=', ') AND (');
				restriction.addClause('gp.date_end', this.asOfDate, 'IS NULL', 'OR');
	    		this.chartTabBuildingUtilization_chart.setTitle(getMessage('locationsInScenario') + ' ' + this.asOfDate);
	    	}
			this.addParametersForChartTabPanel();
			this.chartTabBuildingUtilization_chart.refresh(restriction);
			this.chartTabBuildingUtilization_chart.show(true);
		} else {
			this.chartTabBuildingUtilization_chart.show(false);
		}
	},
		
	/**
     * Show color legend.
     */
    locationsInScenarioPanel_onShowMapLegend: function() {
		this.mapControl.thematicLegend = null;
		this.buildThematicLegend();
    },

    /**
     * Show all buildings in Scenario.
     */
    locationsInScenarioPanel_onShowAllInScenario: function() {
    	this.buildScenarioThematic();
    },
    // ---------------------------------------------------------------------------------------------
    // END Map/Chart showing Section 
    // ---------------------------------------------------------------------------------------------
	
    // ---------------------------------------------------------------------------------------------
    // BEGIN Map Thematic Section 
    // ---------------------------------------------------------------------------------------------
	/**
	 * Build the scenario thematic and marker all the buildings that have lat and lon values.
	 */
	buildScenarioThematic: function() {
		if (this.initialLoad) {
			return;
		}
		var title = getMessage('locationsInScenario') + ' ' + this.asOfDate;
		this.locationsInScenarioPanel.setTitle(title);
		
		var buildingMarkerProperty = this.mapControl.getMarkerPropertyByDataSource('scenarioMarkerPropertyDataSource');
		if (buildingMarkerProperty == null) {
			buildingMarkerProperty = this.buildThematicLegend();
		}

		this.addParametersForBuildingTreeDataSource();
    	var buildings = this.buildingTreeDataSource.getRecords();
		var buildingsArray = [];
		for (var i = 0; i < buildings.length; i++) {
			var buildingId = buildings[i].getValue('gp.bl_id');
			var lon = buildings[i].getValue('gp.lon');
			var lat = buildings[i].getValue('gp.lat');
			if (lon && lat) {
				buildingsArray.push(buildingId);
			}
		}
		var restriction = new Ab.view.Restriction();
		if (buildingsArray.length == 0) {
			buildingsArray.push("NOT EXISTED BUILDING");
			this.showDefaultMap();
		} 
		else {
			restriction.addClause('gp.bl_id', buildingsArray, 'IN');
			restriction.addClause('gp.portfolio_scenario_id', this.scn_id, '=');
			if (this.asOfDate) {
				restriction.addClause('gp.date_start', this.asOfDate, '&lt;=');
				restriction.addClause('gp.date_end', this.asOfDate, '&gt;=', ') AND (');
				restriction.addClause('gp.date_end', this.asOfDate, 'IS NULL', 'OR');
			}
			
			this.scenarioMarkerPropertyDataSource.setRestriction(restriction);
			this.addParametersForScenarioMarkerDs();
			this.mapControl.updateDataSourceMarkerPropertyPair('scenarioMarkerPropertyDataSource', buildingMarkerProperty);
			this.mapControl.refresh();
			this.mapControl.hideThematicLegend();
		}
	},

	/**
	 * Build the scenario thematic and marker all the buildings that have lat and lon values.
	 */
	buildThematicLegend: function() {
		var infoWindowFields = ['bl.name', 'gp.utilization'];
		var buildingMarkerProperty = new Ab.arcgis.ArcGISMarkerProperty('scenarioMarkerPropertyDataSource', ['bl.lat', 'bl.lon'],'gp.bl_id',infoWindowFields);
		// set marker options
		buildingMarkerProperty.showLabels = false;
		buildingMarkerProperty.symbolSize = 15;
		buildingMarkerProperty.symbolColors = this.mapControl.colorbrewer2rgb(this.thematicLegendColor);
		var thematicBuckets = [70, 80, 90, 95];	 
		buildingMarkerProperty.setThematic('gp.utilization', thematicBuckets); 
		buildingMarkerProperty.setLegendLabels(['< 70%','70 - 80%','80 - 90%','90 - 95%','> 95%']); 
		this.mapControl.buildThematicLegend(buildingMarkerProperty);
		return buildingMarkerProperty;
	},	

	/**
	 * Build the scenario thematic and marker all the buildings that have lat and lon values.
	 */
	showDefaultMap: function() {
		var prMarkerProperty = this.mapControl.getMarkerPropertyByDataSource('defaultMarkerPropertyDataSource');
		
		if( prMarkerProperty == null ){
			var infoWindowFields = ['bl.name'];
			prMarkerProperty = new Ab.arcgis.ArcGISMarkerProperty('defaultMarkerPropertyDataSource', ['bl.lat', 'bl.lon'],'bl.bl_id',infoWindowFields);

			// set marker options
			prMarkerProperty.showLabels = false;
			prMarkerProperty.symbolSize = 1;
			//var hexColors = colorbrewer.Reds[5];
			//var rgbColors = this.mapControl.colorbrewer2rgb(colorbrewer.Reds[5]);
			prMarkerProperty.symbolColors = this.mapControl.colorbrewer2rgb(colorbrewer.Reds[6]);
			var thematicBuckets = [0, 1, 2,3,4];	 
			prMarkerProperty.setThematic('bl.utilization', thematicBuckets); 
			
			//build the thematic legend which is an ext.window 
			this.mapControl.buildThematicLegend(prMarkerProperty);
		}
		
		//this.mapControl.updateDataSourceMarkerPropertyPair('defaultMarkerPropertyDataSource', prMarkerProperty);
		this.mapControl.refresh();
		this.mapControl.hideThematicLegend();
	},	
	
	// ---------------------------------------------------------------------------------------------
    // END Map Thematic Section 
    // ---------------------------------------------------------------------------------------------

	// ---------------------------------------------------------------------------------------------
    // BEGIN adding sql parameter Section 
    // ---------------------------------------------------------------------------------------------
 	/**
 	 * Add parameters for the building tree datasource.
 	 */
 	addParametersForBuildingTreeDataSource: function() {
		var scnIdRestriction = getScenarioIdRestriction(this.scn_id);
 		this.buildingTreeDataSource.addParameter('scenarioIdRestriction', scnIdRestriction);
 		
 		var fromDate = this.filter['from_date'];
    	var endDate = this.filter['end_date'];
    	var dateRestriction = "1=1";
    	if (fromDate != null && fromDate != "") {
    		if (this.isOracle == 1) {
    			dataRestriction = "gp.date_start >= to_date('" + fromDate + "', 'YYYY-MM-DD')";
    		} else {
    			dateRestriction = "gp.date_start >= '" + fromDate + "'";
    		}
    	}
    	if(endDate != null &&  endDate != "") {
    		if (this.isOracle == 1) {
    			dateRestriction = dateRestriction + " AND gp.date_start <= to_date('" + endDate + "', 'YYYY-MM-DD')";
    		} else {
    			dateRestriction = dateRestriction + " AND gp.date_start <= '" + endDate + "'";
    		}
    	}
    	this.buildingTreeDataSource.addParameter('dateRestriction', dateRestriction);
    	
		addLocationRestriction([this.buildingTreeDataSource], this.filter);
		addOrganizationRestriction([this.buildingTreeDataSource], this.filter);
 	},

	/**
 	 * Add parameters for the marker data source.
 	 */
 	addParametersForChartTabPanel: function() {
    	if (this.asOfDate != null) {
    		var isoDate = this.asOfDate;
    		var innerDateStartAsOfDate = "";
    		var innerDateEndAsOfDate = "";
    		if (this.isOracle == 1) {
    			innerDateStartAsOfDate = " (gp_inner.date_start <= to_date('" + this.asOfDate + "', 'YYYY-MM-DD'))";
    			innerDateEndAsOfDate = " (gp_inner.date_end >= to_date('" + this.asOfDate + "', 'YYYY-MM-DD') OR gp_inner.date_end IS NULL)";
    		} else {
    			innerDateStartAsOfDate = " (gp_inner.date_start <= '" + this.asOfDate + "')";
    			innerDateEndAsOfDate = " (gp_inner.date_end >= '" + this.asOfDate + "' OR gp_inner.date_end IS NULL)";
    		}
    		this.chartTabBuildingUtilization_chart.addParameter('innerDateStartAsOfDate', innerDateStartAsOfDate);
    		this.chartTabBuildingUtilization_chart.addParameter('innerDateEndAsOfDate', innerDateEndAsOfDate);
    	}
 	},

 	/**
 	 * Add parameters for the marker data source.
 	 */
 	addParametersForScenarioMarkerDs: function(buildingMarkerProperty) {
    	if (this.asOfDate != null) {
    		var isoDate = this.asOfDate;
    		var innerDateStartAsOfDate = "";
    		var innerDateEndAsOfDate = "";
    		if (this.isOracle == 1) {
    			innerDateStartAsOfDate = " (gp_inner.date_start <= to_date('" + this.asOfDate + "', 'YYYY-MM-DD'))";
    			innerDateEndAsOfDate = " (gp_inner.date_end >= to_date('" + this.asOfDate + "', 'YYYY-MM-DD') OR gp_inner.date_end IS NULL)";
    		} else {
    			innerDateStartAsOfDate = " (gp_inner.date_start <= '" + this.asOfDate + "')";
    			innerDateEndAsOfDate = " (gp_inner.date_end >= '" + this.asOfDate + "' OR gp_inner.date_end IS NULL)";
    		}
    		this.scenarioMarkerPropertyDataSource.addParameter('innerDateStartAsOfDate', innerDateStartAsOfDate);
    		this.scenarioMarkerPropertyDataSource.addParameter('innerDateEndAsOfDate', innerDateEndAsOfDate);
    	}
 	},
	// ---------------------------------------------------------------------------------------------
    // END adding sql parameter Section 
    // ---------------------------------------------------------------------------------------------
	
	// ---------------------------------------------------------------------------------------------
    // BEGIN Common function Section 
    // ---------------------------------------------------------------------------------------------
	/**
	 * Set the as of date for map control, chart tab control and stack panel control.
	 */
	setAsOfDate: function() {
		if (this.filter['from_date']) {
			this.asOfDate = this.filter['from_date'];
		} else {
			var restriction = new Ab.view.Restriction();
			restriction.addClause('portfolio_scenario.portfolio_scenario_id', this.scn_id, '=');
			var scenario = this.portfolioScenarioDataSource.getRecords(restriction)[0];
			var asOfDate = scenario.getValue('portfolio_scenario.date_start');
			if (asOfDate) {
				this.asOfDate = getIsoFormatDate(asOfDate);
			}
		}
	},
	
	/**
	 * Display the stack chart title after the map and stack chart.
	 */
	displayStackChartTitlebar: function() {
		jQuery("#stackChartTitlebar").show();
	},
		
	addDay: function(original, day) {
		var startDate = Date.parseDate(original, 'Y-m-d');
		var newDate = new Date(startDate.getTime() + day * 24 * 60 * 60 * 1000);
		var month = newDate.getMonth() + 1;
	    if (month < 10) 
	        month = "0" + month;
	    var day = newDate.getDate();
	    if (day < 10) 
	        day = "0" + day;
	    return newDate.getFullYear() + '-' + month + '-' + day;
	},
    // ---------------------------------------------------------------------------------------------
    // END Common function Section 
    // ---------------------------------------------------------------------------------------------

    // ---------------------------------------------------------------------------------------------
    // BEGIN toggle highlights on events function Section 
    // ---------------------------------------------------------------------------------------------
	toggleEventsHighlight: false,
	onToggleHighlightsEvent:function() {
		var toggleAction = this.eventsTreePanel.actions.get('toggleHighlight');
		var popToggleAction = this.eventsTreePopPanel.actions.get('toggleHighlight');

		if ( !this.toggleEventsHighlight ){
			toggleAction.setTitle( getMessage('highlightsOff') );	
			popToggleAction.setTitle( getMessage('highlightsOff') );	
			this.toggleEventsHighlight = true;
		} 
		else {
			toggleAction.setTitle( getMessage('highlightsOn') );	
			popToggleAction.setTitle( getMessage('highlightsOn') );	
			this.toggleEventsHighlight = false;
		}
	}
    // ---------------------------------------------------------------------------------------------
    // END toggle highlights on events function Section 
    // ---------------------------------------------------------------------------------------------
});