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
                 {'key':'employeesTab', 'value':'app:space:express:console:emFilter'}
                 ],
                 
    /**
     * Constructor.
     */
    afterCreate: function() {
        this.on('app:space:express:console:changeRoomStandardStatus', this.changeRoomStandardStatus);
    },

    /**
     * Sets the default mode.
     */
    afterInitialDataFetch: function() {
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
      
    },
    
    /**
     * Switch the mode: show/hide tab pages according to mode selection; refresh mode selector; trigger mode change event and clear pending assigments.
     */
    switchMode: function(mode, first) {
    	//save the checked rows in a variable.
		this.mode = mode;
        this.updateModeButtons();
        this.attributeTabs.hideTab('roomStandardTab');
        if (mode === 'employeeMode') {
            this.attributeTabs.hideTab('departmentsTab');
            this.attributeTabs.hideTab('categoriesTab');
            this.attributeTabs.hideTab('roomsTab');
            this.attributeTabs.showTab('employeesTab');
            this.attributeTabs.selectTab('employeesTab');
        } else {
            this.attributeTabs.showTab('departmentsTab');
            this.attributeTabs.showTab('categoriesTab');
            this.attributeTabs.showTab('roomsTab');
            if (this.showRoomStandard == "1") {
            	this.attributeTabs.showTab('roomStandardTab');
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
