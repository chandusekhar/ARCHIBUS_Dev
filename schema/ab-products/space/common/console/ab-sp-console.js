/**
 * Controller for Space Express Console.
 *
 * Events:
 * app:space:express:console:changeMode
 * app:space:express:console:cancelAssignment
 */
var spaceExpressConsole = View.createController('spaceExpressConsole', {

    /**
     * Mode: 'spaceMode' or 'employeeMode'
     */
    mode: '',
    
    /**
     * If show the room standard panel.
     */
    showRoomStandard:0,

    /**
     * If show the teams panel.
     */
    showTeams:0,

    /**
     * If current schema support the Team Space functionality.
     */
    hasTeamSchema:false,

	/**
     * The Teams tab will display the As-Of date.  This is a read-only field that will default to today¡¯s date when the Space Console is loaded.  
	 * All team statistics that are visible in the Teams tab are calculated based on this date.  
	 * The user cannot change this date from this tab.  Instead, the user can change the date in the Drawing Control when the floor plan is highlighted by Teams. .
     */
    asOfDate: getCurrentDateInISOFormat(),

    /**
     * Maps DOM events to controller methods.
     */
    events: {
        "click #spaceMode": function() {
            this.selectMode('spaceMode')
        },
        "click #employeeMode": function() {
            this.selectMode('employeeMode')
        }
    },

    /**
     * tab name and filter event array.
     */
    filterArray: [{'key':'departmentsTab', 'value':'app:space:express:console:orgFilter'}, 
                 {'key':'categoriesTab', 'value':'app:space:express:console:rmCatFilter'}, 
                 {'key':'roomsTab', 'value':'app:space:express:console:rmFilter'}, 
                 {'key':'roomStandardTab', 'value':'app:space:express:console:rmStdFilter'}, 
                 {'key':'teamsTab', 'value':'app:space:express:console:teamFilter'},
                 {'key':'employeesTab', 'value':'app:space:express:console:emFilter'}
                 ],
                 
    /**
     * Constructor.
     */
    afterCreate: function() {
        this.on('app:space:express:console:changeRoomStandardStatus', this.changeRoomStandardStatus);
        this.on('app:space:express:console:openTeamsTab', this.openTeamsTab);
        this.on('app:space:express:console:showTabs', this.showTabs);
    },

    /**
     * Sets the default mode.
     */
    afterInitialDataFetch: function() {
		var teamPropTbl = View.dataSources.get('teamSchemaDs').getRecords();
		if ( teamPropTbl && teamPropTbl[0]) {
			this.hasTeamSchema = true;
		}

    	var pastMode = this.modeSelector.getSidecar().get('mode');
    	if (!pastMode) {
    		pastMode = 'spaceMode';
    	}
        this.switchMode(pastMode, true);

		this.attributeTabs.addEventListener('afterTabChange', this.afterTabChange.createDelegate(this));
    },
    
    /**
     * call after tabs 'attributeTabs' change.
     */
    afterTabChange: function(tabPanel,selectedTabName){
        var filter = View.controllers.get('spaceExpressConsoleLocations').filter;
    	clearUIRestricTo(filter);
        for (var i=0; i< this.filterArray.length; i++) {
        	var obj = this.filterArray[i];
        	if (obj.key == selectedTabName) {
            	this.trigger(obj.value, filter);
            	break;
        	}
        }
    },
    
    /**
     * Change the status of the room standard tab.
     */
    changeRoomStandardStatus: function(value) {
    	this.showRoomStandard = value;
    },
    
    /**
     * Added for 23.1: Show or hide Teams tab.
     */
    openTeamsTab: function(isShow) {
		if (isShow) {
			this.showTeams = 1;
			if ( this.attributeTabs.findTab('teamsTab') ){
				this.attributeTabs.showTab('teamsTab');
				this.attributeTabs.selectTab('teamsTab');
			} 
		} else {
			this.showTeams = 0;
			this.attributeTabs.hideTab('teamsTab');
			if (this.mode == 'employeeMode') {
				this.attributeTabs.selectTab('employeesTab');
			}
		}		
    },
	
    /**
     * Added for 23.1: Show Room Standard tab and Teams tab according to stored cookies.
     */
    showTabs: function(isShowRoomStandardTab, isShowTeamSpaceTab) {
		if ( isShowRoomStandardTab ) {
			this.showRoomStandard = '1'; 
			this.attributeTabs.showTab('roomStandardTab');
		}

		if ( isShowTeamSpaceTab ) {
			this.showTeams = 1;
			if ( this.attributeTabs.findTab('teamsTab') ){
				this.attributeTabs.showTab('teamsTab');
			} 
		}
    },

	/**
     * Displays mode button states according to the current mode.
     */
    updateModeButtons: function() {
        Ext.get('spaceMode').removeClass('selected');
        Ext.get('employeeMode').removeClass('selected');
        Ext.get(this.mode).addClass('selected');
    },
    
    /**
     * Sets the mode.
     * @param mode
     */
    selectMode: function(mode) {
        if  (this.mode != mode) {
            //check if the sidecar contains previously saved pending assignments
            var currentPendingAssignments = this.drawingPanel.getSidecar().get('pendingAssignments');
        	if  (currentPendingAssignments && currentPendingAssignments.length>0) {
				var message = getMessage('switchMode');
				var innerThis = this;
				View.confirm(message, function(button) {
					if (button == 'yes') {
						innerThis.switchMode(mode);
						innerThis.trigger('app:space:express:console:cancelAssignment');
					}
				});
			} else {
		        this.switchMode(mode);
			}
        }
    },
    
    /**
     * Switch the mode: show/hide tab pages according to mode selection; refresh mode selector; trigger mode change event and clear pending assigments.
     */
    switchMode: function(mode, first) {
    	//save the checked rows in a variable.
		this.mode = mode;
        this.updateModeButtons();
        this.attributeTabs.hideTab('roomStandardTab');

		if ( this.attributeTabs.findTab('teamsTab') ) {
			this.attributeTabs.hideTab('teamsTab');
		}

        if (mode === 'employeeMode') {
            this.attributeTabs.hideTab('departmentsTab');
            this.attributeTabs.hideTab('categoriesTab');
            this.attributeTabs.hideTab('roomsTab');
            if (this.showTeams == 1) {
            	this.attributeTabs.showTab('teamsTab');
            }
			if ( this.attributeTabs.findTab('utilTab') ) {
				this.attributeTabs.showTab('utilTab');
			}
            this.attributeTabs.showTab('employeesTab');
            this.attributeTabs.selectTab('employeesTab');
        } else {
            this.attributeTabs.showTab('departmentsTab');
            this.attributeTabs.showTab('categoriesTab');
            this.attributeTabs.showTab('roomsTab');
            if (this.showRoomStandard == "1") {
            	this.attributeTabs.showTab('roomStandardTab');
            }
			if ( this.attributeTabs.findTab('utilTab') ) {
				this.attributeTabs.hideTab('utilTab');
			}
            this.attributeTabs.hideTab('employeesTab');
            this.attributeTabs.selectTab('departmentsTab');
        }

        this.modeSelector.getSidecar().set('mode', this.mode);
        this.modeSelector.getSidecar().save();
        if (first &&  this.mode == 'employeeMode') {
        	//At first time, we need to wait the initialization of the drawing to enable the asset panel.
        	this.triggerInitialEvent.defer(1500, this);
        } else {
        	this.triggerInitialEvent();
        }
    },
    
    /**
     * Trigger events to cancel assignment and change mode.
     */
    triggerInitialEvent: function() {
        this.trigger('app:space:express:console:changeMode', this.mode);
    }
});
