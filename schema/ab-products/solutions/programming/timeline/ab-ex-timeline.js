
var timelineExampleController = View.createController('timelineExample', {
    
    selectedBuildingId: null,
    
    /**
     * Creates the timeline control "from scratch".
     */
    afterViewLoad: function() {
        this.timeline = new Ab.timeline.TimelineController('timeline', true);
        // add event listeners
        this.timeline.addOnClickEvent(this.timeline_onClickEvent.createDelegate(this));
        this.timeline.addOnCreateEvent(this.timeline_onCreateEvent.createDelegate(this));
        this.timeline.addOnChangeEvent(this.timeline_onChangeEvent.createDelegate(this));
        this.timeline.addOnShowTimeslotTooltip(this.timeline_onShowTimeslotTooltip.createDelegate(this));
        this.timeline.addOnShowEventTooltip(this.timeline_onShowEventTooltip.createDelegate(this));
        // add custom timeline columns
        this.timeline.addColumn('room', getMessage('room'), 'text');
        this.timeline.addColumn('roomArrangement', getMessage('arrangement'), 'text');
        this.timeline.addColumn('roomConfiguration', getMessage('configuration'), 'text');
    },
    
    /**
     * Loads the timeline for selected building and room arrangement type.
     */
    exTimeline_buildingGrid_selectBuilding_onClick: function(row, action) {
        this.selectedBuildingId = row.getRecord().getValue('bl.bl_id');
        
        var roomArrangeType = this.exTimeline_roomConsole.getRecord().getValue('rm_arrange.rm_arrange_type_id');
        this.loadTimeline(roomArrangeType);
    },
    
    /**
     * Loads the timeline for selected room arrangement type.
     */
    exTimeline_roomConsole_onSearch: function() {
        var roomArrangeType = this.exTimeline_roomConsole.getRecord().getValue('rm_arrange.rm_arrange_type_id');
        this.loadTimeline(roomArrangeType);
    },
    
    /**
     * Helper method to load the timeline.
     */
    loadTimeline: function(roomArrangeId) {
        var buildingId = "";
        if (this.selectedBuildingId) {
            buildingId = this.selectedBuildingId;
        }
        try {
            var result = Workflow.callMethod('AbSolutionsViewExamples-TimelineExamples-loadTimeline',
                    roomArrangeId, buildingId, '2008-05-31', '08:00:00', '20:00:00');
            this.timeline.clearRowBlocks();
            this.timeline.loadTimelineModel(result.data);
            this.timeline.refreshTimelineUI();
        } catch (e) {
            Workflow.handleError(e);
        }
    },
    
    // ----------------------- custom timeline event listeners ------------------------------------
    
    /**
     * Called by the timeline to display custom tooltip for the timeslot.
     */
    timeline_onShowTimeslotTooltip: function(timeslot) {
        return {
            text: '<tr><td>' + getMessage('status') + ' ' + timeslot.status + '</td></tr>',
            override: false, // true to override default tooltip text, false to append
            cancel: false // true to cancel the tooltip display for this timeslot 
        }
    },
    
    /**
     * Called by the timeline to display custom tooltip for the event.
     * Event parameter can be null or undefined if the tooltip is displyed for in-progress drag.
     */
    timeline_onShowEventTooltip: function(event, eventStatus, timeslotStart, timeslotEnd) {
        return {
            text: '<tr><td class="label">' + getMessage('room') + ':</td><td class="value">' + timeslotStart.resource.room + '</td></tr>'
                + '<tr><td class="label">' + getMessage('arrangement') + ':</td><td class="value">' + timeslotStart.resource.roomArrangement + '</td></tr>',
            override: false, // true to override default tooltip text, false to append
            cancel: false // true to cancel the tooltip display for this event 
        }
    },

    /**
     * Called by the timeline when the user double-clicks on any event. 
     */
    timeline_onClickEvent: function(e, event) {
        var result= "onClickEvent: type=["+e.type+"] id=["+event.eventId+"] columnStart=["+event.columnStart+"] columnEnd=["+event.columnEnd+"]";
        View.showMessage(result);
    },
    
    /**
     * Called by the timeline when the user creates an event using drag and drop. 
     */
    timeline_onCreateEvent: function(event) {
        var result = "Create Event: id=["+event.eventId+"], status=["+event.getDescribingStatus()+"], resource=[" +event.resource.resourceId+"],start=["+event.getStart()+"], end=["+event.getEnd() +"]";
        //View.showMessage(result);
        return true;  // OK to create event
    },
    
    /**
     * Called by the timeline when the user changes an event using drag and drop. 
     */
    timeline_onChangeEvent: function(event, startColumn, endColumn) {
        var result= "Change Event: id=["+event.eventId+"], status=["+event.getDescribingStatus()+"], resource=[" +event.resource.resourceId+"],start=["+event.getStart()+"], end=["+event.getEnd() +"], new start=["+startColumn+"], new end=["+endColumn+"]";
        //View.showMessage(result);
        return true; // OK to change event
    },

    // ----------------------- button action listeners --------------------------------------------
    
    /**
     * Deletes the event selected by the user in the timeline.
     */
    exTimeline_roomConsole_onDeleteEvent: function() {
        var event = this.timeline.selectedEvent;
        if (valueExists(event)) {
            this.timeline.removeEvent(event);
        }
    },
    
    /**
     * Deletes all events created by the user in the timeline.
     */
    exTimeline_roomConsole_onDeleteEvents: function(){
        var newEvents = this.timeline.getPendingEvents();
        if (newEvents.length > 0) {
            this.timeline.removeEvents(newEvents);
        }
    },
    
    /**
     * Displays a message dialog with data for all events created by the user in the timeline. 
     */
    exTimeline_roomConsole_onShowEvents: function() {
        var es = this.timeline.getPendingEvents();
        var result="";
        for (var i = 0; i < es.length; i++) {
            var e = es[i];
            result = result + "Saving Event: id=["+e.eventId+"], status=["+e.getDescribingStatus()+"], resource=[" +e.resource.resourceId+"],start=["+e.getStart()+"], end=["+e.getEnd() +"]\n";
        }
        View.showMessage(result);
    },
    
    /**
     * Adds a new empty row in the timeline.
     */
    exTimeline_roomConsole_onAddRow: function() {
        this.newResource = new Ab.timeline.Resource("myRoom", 3, 3);
        // set resource properties for custom timeline columns
        this.newResource.room = "Test Room";
        this.newResource.roomArrangement = "Test Arrangement";
        this.newResource.roomConfiguration = "Test Configuration";
        this.timeline.addRow(this.newResource);
    },
    
    /**
     * Deletes the last created row (can only delete one row).
     */
    exTimeline_roomConsole_onDeleteRow: function() {
        if (this.newResource != 'undefined' && this.newResource != null) {
            this.timeline.removeRow(this.newResource.row);
            this.newResource = null;
        } else {
            View.showMessage(getMessage('click_message'));
        }
    }
});
