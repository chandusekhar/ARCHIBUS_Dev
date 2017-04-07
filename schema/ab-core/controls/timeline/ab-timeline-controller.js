/**
 * @fileoverview This file contains classes that implement the timeline control UI.
 * 
 * Copyright (c) 1984-2007 ARCHIBUS, Inc.
 */
 
/**
 * All timeline classes are contained in the Ab.timeline namespace.
 */
Ab.namespace('timeline');

/**
 * Shortcuts or YAHOO modules.
 */
var DOM = YAHOO.util.Dom;
var EVENT = YAHOO.util.Event;

/**
 * A block represents continuous areas of timeslots with the same status,
 * such as unavailable periods, future pre/post-blocks and events.
 * The timeline control renders blocks as absolutely positioned DIVs
 * on top the timeline grid.
 * 
 * @class Ab.timeline.Block
 * @constructor
 */
Ab.timeline.Block = Base.extend({
    // timeline control reference
    timeline: null,
    
    // row index
    row: 0,
    
    // start timemark index
    start: 0,
    
    // end timemark index
    end: 0,
    
    // status (one of the Ab.timeline.Timeslot status codes)
    status: null,
    
    // DOM element that displays the block (div)
    element: null,

    // True if this is a pre-block.
    isPreBlock: false,
    
    /**
     * @constructor
     */
    constructor: function(timeline, row, start, end, status, registerEvents, isPreBlock) {
        this.timeline = timeline;
        this.row = row;
        this.start = start;
        this.end = end;
        this.status = status;
        this.isPreBlock = isPreBlock;
        
        this.render();
        
        if (registerEvents) {
            EVENT.on(this.element, "mousemove", this.timeline.handleMouseMove, this.timeline, true);
            EVENT.on(this.element, "mouseup", this.timeline.handleMouseUp, this.timeline, true);
        }
    },
    
    /**
     * Displays the block at its current start-end position.
     * If the block DOM element does not exist, creates it.
     * Otherwise, moves the DOM element to the new position. 
     */
    render: function() {
        if (this.element == null) {
            var div = document.createElement('div');
            this.element = div;
            div.className = this.getCssClassName();
            
            var s = this.element.style;
            s.position = 'absolute';
            s.zIndex   = this.getZIndex();
            
            DOM.setStyle(this.element, 'opacity', this.timeline.blockOpacity);
            
            // position and size the element along the Y-axis
            s.height = this.getBlockHeight() + 'px';
            var y = this.timeline.timeslotPositionsY[this.row];
            s.top = y + 'px';

            // position and size the element along the X-axis
            this.updateXPosition();

            var parentElement = this.timeline.rowBlocksParent;
            parentElement.insertBefore(div, parentElement.firstChild);
        } else {
            this.updateXPosition();
        }
    },

    /**
     * Returns the height of the block in pixels.
     */
    getBlockHeight: function() {
        var blockHeight = this.timeline.timeslotHeight - 1;
        if (this.status == Ab.timeline.Timeslot.STATUS_FUTURE_BLOCK || this.status == Ab.timeline.Timeslot.STATUS_NOT_AVAILABLE) {
            blockHeight--;
        }
        return blockHeight;
    },
    
    /**
     * Updates the element position on the page.
     */
    updateXPosition: function() {
        var s = this.element.style;
        
        // size the element to match the timeslot size
        var width = this.timeline.timeslotWidth * (this.end - this.start + 1);
        s.width = width + 'px';
        
        // position the element horizontally to match the start timeslot
        var x = this.timeline.timeslotPositionsX[this.start];
            if (EVENT.isIE) {
                x = x + 1;
            }
        s.left = x + 'px';
    },
    
    /**
     * Removes the DOM element from the parent.
     */
    remove: function() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    },
    
    /**
     * Returns CSS class name based on the block status.
     */
    getCssClassName: function() {
        var className = '';
        if (this.status == Ab.timeline.Timeslot.STATUS_NOT_AVAILABLE) {
            className =  'timeline_unavailable';
        } else if (this.status == Ab.timeline.Timeslot.STATUS_BLOCK) {
            className =  'timeline_block';
        } else if (this.status == Ab.timeline.Timeslot.STATUS_FUTURE_BLOCK) {
            className =  'timeline_future ';
            className += this.isPreBlock ? 'timeline_before' : 'timeline_after';
        } else if (this.status == Ab.timeline.Timeslot.STATUS_EXISTING_RESERVATION) {
            className =  'timeline_eventReadOnly ';
        } else if (this.status == Ab.timeline.Timeslot.STATUS_NEW_RESERVATION) {
            className =  'timeline_event';
        }
        return className;
    },
    
    /**
     * Returns z-index CSS property for this block DOM element.
     */
    getZIndex: function() {
        return Ab.timeline.Block.Z_INDEX_BLOCK;
    }
}, 
{
    // z-index constants
    Z_INDEX_BLOCK: 997,
    Z_INDEX_EXISTIG_EVENT: 998,
    Z_INDEX_NEW_EVENT: 999
});


/**
 * EventBlock is a kind of Block that displays the timeline event.
 * Unlike other blocks it can be resized using drag and drop.
 * 
 * @class Ab.timeline.EventBlock
 * @constructor
 */
Ab.timeline.EventBlock = Ab.timeline.Block.extend({
    
    // reference to Ab.timeline.Event that is displayed by this block
    event: null,
    
    // reference to Ab.timeline.Resource that is this block belongs to
    resource: null,

    // "satellite" blocks that the event block displays initially and updates as it is dragged
    preBlock: null,
    postBlock: null,
    
    // div that displays the right arrow
    right: null,

    // @begin_translatable
    z_TOOLTIP_EXISTING_RESERVATION: 'Existing Reservation',
    z_TOOLTIP_NEW_RESERVATION: 'New Reservation',
    z_TOOLTIP_TIME_START: 'Time Start:',
    z_TOOLTIP_TIME_END: 'Time End:',
    // @end_translatable
        
    /**
     * @constructor
     */
    constructor: function(timeline, row, start, end, event, resource) {
        var status = Ab.timeline.Timeslot.STATUS_NEW_RESERVATION;
 
        this.LOCALIZED_TOOLTIP_EXISTING_RESERVATION = Ab.view.View.getLocalizedString(this.z_TOOLTIP_EXISTING_RESERVATION);
        this.LOCALIZED_TOOLTIP_NEW_RESERVATION = Ab.view.View.getLocalizedString(this.z_TOOLTIP_NEW_RESERVATION);
        this.LOCALIZED_TOOLTIP_TIME_START = Ab.view.View.getLocalizedString(this.z_TOOLTIP_TIME_START);
        this.LOCALIZED_TOOLTIP_TIME_END = Ab.view.View.getLocalizedString(this.z_TOOLTIP_TIME_END);

        this.resource = resource;
        if (valueExists(event)) {
            this.event = event;
            if (event.isExisting()) {
                status = Ab.timeline.Timeslot.STATUS_EXISTING_RESERVATION;
            }
        }
        
        this.inherit(timeline, row, start, end, status, false);

        if (event == null || event.canEdit) {        
            EVENT.on(this.element, "mousedown", this.handleMouseDown, this, true);
            EVENT.on(this.element, "mousemove", this.handleMouseMove, this, true);
        }
        EVENT.on(this.element, "mouseup",   this.handleMouseUp, this, true);
        EVENT.on(this.element, "dblclick",  this.handleDoubleClick, this, true);
        EVENT.on(this.element, "mouseover", this.handleMouseOver, this, true);
        EVENT.on(this.element, "mouseout",  this.handleMouseOut, this, true);

        // create pre and post blocks
        var position = this.getPreBlockPosition();
        if (position.start < start) {
	        this.preBlock = new Ab.timeline.Block(timeline, row, position.start, position.end, Ab.timeline.Timeslot.STATUS_BLOCK, false);
            EVENT.on(this.preBlock.element, "mousemove", this.handleMouseMove, this, true);
            EVENT.on(this.preBlock.element, "mouseup",   this.handleMouseUp, this, true);
            EVENT.on(this.preBlock.element, "mouseover", this.timeline.handleMouseOver, this.timeline, true);
            EVENT.on(this.preBlock.element, "mouseout",  this.timeline.handleMouseOut, this.timeline, true);
        }
        position = this.getPostBlockPosition();
        if (position.end > end) {
	        this.postBlock = new Ab.timeline.Block(timeline, row, position.start, position.end, Ab.timeline.Timeslot.STATUS_BLOCK, false);
            EVENT.on(this.postBlock.element, "mousemove", this.handleMouseMove, this, true);
            EVENT.on(this.postBlock.element, "mouseup",   this.handleMouseUp, this, true);
            EVENT.on(this.postBlock.element, "mouseover", this.timeline.handleMouseOver, this.timeline, true);
            EVENT.on(this.postBlock.element, "mouseout",  this.timeline.handleMouseOut, this.timeline, true);
        }
    },

    /**
     * Returns the height of the block in pixels.
     */
    getBlockHeight: function() {
        return this.timeline.timeslotHeight - 1;
    },

    /**
     * Returns CSS class name based on the block status.
     */
    getCssClassName: function() {
        var className = this.inherit();
        if (this.end == this.start) {
            if (this.status == Ab.timeline.Timeslot.STATUS_EXISTING_RESERVATION) {
                className =  'timeline_eventReadOnly_short';
            } else {
                className =  'timeline_event_short';
            }
        }
        return className;
    },

    /**
     * Returns z-index CSS property for this block DOM element.
     */
    getZIndex: function() {
        return (this.status == Ab.timeline.Timeslot.STATUS_EXISTING_RESERVATION) 
               ? Ab.timeline.Block.Z_INDEX_EXISTIG_EVENT
               : Ab.timeline.Block.Z_INDEX_NEW_EVENT;
    },
    
    /**
     * Displays this block and its pre and post blocks.
     */
    render: function() {
        this.inherit();
        
        if (this.end > this.start && !this.right) {
            this.right = document.createElement('div');

            // the right arrow div height has to match the row height
            this.right.style.height = this.element.style.height;
            
            if (this.status == Ab.timeline.Timeslot.STATUS_EXISTING_RESERVATION) {
                this.right.className = 'rightArrow_readOnly';
            } else {
                this.right.className = 'rightArrow';
            }
            this.element.appendChild(this.right);
        } 
        
        if (this.preBlock != null) {
            this.preBlock.render();
        }
        if (this.postBlock != null) {
            this.postBlock.render();
        }
    },
    
    /**
     * Removes the DOM element from the parent. Removes pre/post blocks as well.
     */
    remove: function() {
        this.inherit();
        
        if (this.preBlock != null) {
            this.preBlock.remove();
        }
        if (this.postBlock != null) {
            this.postBlock.remove();
        }
    },
    
    /**
     * Updates positions of pre and post blocks based on the event start and end.
     */
    updatePrePostBlocks: function() {
        if (this.preBlock != null) {
            var position = this.getPreBlockPosition();
            this.preBlock.start = position.start;
            this.preBlock.end = position.end;
        }
        if (this.postBlock != null) {
            var position = this.getPostBlockPosition();
            this.postBlock.start = position.start;
            this.postBlock.end = position.end;
        }
    },
    
    /**
     * Calculates the pre block position based on the event start and end.
     */
    getPreBlockPosition: function() {
        var preBlockTimeslots = this.resource.preBlockTimeslots;
        
        if (valueExists(this.event) && valueExists(this.event.preBlockTimeslots)) {
            preBlockTimeslots = this.event.preBlockTimeslots;
        }
        
        var preStart = this.start - preBlockTimeslots;
        if (preStart < this.resource.columnAvailableFrom) {
            preStart = this.resource.columnAvailableFrom;
        }
        return {'start':preStart, 'end':this.start - 1};
    },
    
    /**
     * Calculates the pre blcok position based on the event start and end.
     */
    getPostBlockPosition: function() {
        var postBlockTimeslots = this.resource.postBlockTimeslots;
        
        if (valueExists(this.event) && valueExists(this.event.postBlockTimeslots)) {
            postBlockTimeslots = this.event.postBlockTimeslots;
        }
        
        var postEnd = this.end + postBlockTimeslots;
        if (postEnd > this.resource.columnAvailableTo) {
            postEnd = this.resource.columnAvailableTo;
        }
        return {'start':this.end + 1, 'end':postEnd};
    },
    
    /**
     * Called when the user presses the mouse button on the event block.
     */
    handleMouseDown: function(e) {
        var timeslotPosition = this.timeline.getTimeslotPosition(e);
        var column = timeslotPosition.column;
        if (column == this.start || column == this.end) {
            this.timeline.suspectDrag(e, this);
            
            if (this.start < this.end) {
                if (column == this.start) {
                    this.timeline.dragStartHandle = 'start';
                } else {
                    this.timeline.dragStartHandle = 'end';
                }
            }
        }
    },
    
    /**
     * Called when the user moves the mouse during drag operation.
     */
    handleMouseMove: function(e) {
        // mouse button not pressed - no drag
        if (EVENT.isIE > 0 && EVENT.isIE < 9 && !e.button) {
            // detect the case when the user dragged the mouse outside of the timeline and released the button
            // when the mouse returns to the timeline, finalize the drag operation
            if (this.timeline.dragDetected && this == this.timeline.selectedEventBlock) {
                this.timeline.endDrag();
                this.endDrag();
            }
            return;
        }

        // mouse is in a different row - no drag
        var timeslotPosition = this.timeline.getTimeslotPosition(e);
        if (timeslotPosition.row != this.row) {
            return;
        }

        if (!this.timeline.dragDetected) {
            this.timeline.startDrag(e, this);
        }
       
        if (this.timeline.dragDetected && this == this.timeline.selectedEventBlock) {
            var column = timeslotPosition.column;

            if (!this.timeline.policy.canContinueDrag(this.timeline, timeslotPosition, this)) {
                return;
            }

            if (this.timeline.dragStartHandle != 'start') {
                if (column > this.end) {
                    // extending the event end
                    this.timeline.dragStartHandle = 'end';
                    this.end = column;
                    this.updatePrePostBlocks();
                    this.render();
                } else if (column > this.start && column < this.end) {
                    // reducing the event end
                    this.timeline.dragStartHandle = 'end';
                    this.end = column;
                    this.updatePrePostBlocks();
                    this.render();
                }    
            }
                        
            if (this.timeline.dragStartHandle != 'end') {
                if (column < this.start) {
                    // extending the event start
                    this.timeline.dragStartHandle = 'start';
                    this.start = column;
                    this.updatePrePostBlocks();
                    this.render();
                } else if (column < this.end && column > this.start) {
                    // reducing the event start
                    this.timeline.dragStartHandle = 'start';
                    this.start = column;
                    this.updatePrePostBlocks();
                    this.render();
                }
            }
            
            // show updated tooltip
            this.handleMouseOver(e);
        }
        this.timeline.stopEvent(e);
    },
    
    /**
     * Called when the user releases the mouse button during drag operation.
     */
    handleMouseUp: function(e) {
        if (this.timeline.dragDetected) {
            var selectedEventBlock = this.timeline.selectedEventBlock;
            this.timeline.endDrag();
            if (this == selectedEventBlock) {
                this.endDrag();
            }
        } else if (this.timeline.dragSuspected) {
            this.timeline.dragSuspected = false;
        }
        this.timeline.stopEvent(e);
    },

    /**
     * Finalizes the result of the drag operation.
     */    
    endDrag: function() {
        if (this.event == null) {
            // create new event
			this.event = new Ab.timeline.Event(null, this.row, this.start, this.end, true, this.timeline.model);
			var canAddEvent = true;
			var listener = this.timeline.onCreateEventListener;
			if (listener != null && typeof listener == "function") {
			    canAddEvent = listener(this.event);
			}
			if (canAddEvent) {
				this.timeline.addEvent(this.event);
		        this.timeline.refreshTimelineRow(this.row);
			}
        } else {
            // update existing event
			var canChangeEvent = true;
			var listener = this.timeline.onChangeEventListener;
			if (listener != null && typeof listener == "function") {
				canChangeEvent = listener(this.event, this.start, this.end);
			}
			if (canChangeEvent) {
			    if (this.timeline.model.canModifyEvent(this.event, this.start, this.end, false)) {
			        this.timeline.model.modifyEvent(this.event, this.start, this.end);
			    }
		        this.timeline.refreshTimelineRow(this.row);
			}
        }
        
        this.timeline.selectedEvent = this.event;
    },
    
    /**
     * Displays an event tooltip when the user hovers the mouse over the block.
     */
    handleMouseOver: function(e) {
        // do not display the tooltip during drag operation
        if (this.timeline.dragSuspected || !this.timeline.displayEventTooltip) {
            return;
        }
        
        var timeslotPosition = this.timeline.getTimeslotPosition(e);
        var timeslotStart = this.timeline.model.getTimeslot(this.row, this.start);
        var timeslotEnd   = this.timeline.model.getTimeslot(this.row, this.end + 1);
        var eventStatus = this.status == Ab.timeline.Timeslot.STATUS_EXISTING_RESERVATION ? this.LOCALIZED_TOOLTIP_EXISTING_RESERVATION : this.LOCALIZED_TOOLTIP_NEW_RESERVATION;
        
        var defaultTooltip = 
            '<tr><td class="title" colspan="2">' + eventStatus + '</td></tr>'
          + '<tr><td class="label">' + this.LOCALIZED_TOOLTIP_TIME_START + '</td><td class="value">' + timeslotStart.timemark.dateTimeLabel + '</td></tr>';
        if (timeslotEnd) {
            defaultTooltip = defaultTooltip +
                '<tr><td class="label">' + this.LOCALIZED_TOOLTIP_TIME_END + '</td><td class="value">' + timeslotEnd.timemark.dateTimeLabel + '</td></tr>';
        } else {
            defaultTooltip = defaultTooltip +
                '<tr><td class="label">' + this.LOCALIZED_TOOLTIP_TIME_END + '</td><td class="value">' + this.timeline.model.dateTimeEndLabel + '</td></tr>';
        }
        var customTooltip = null;
        
        // call application-specific tooltip handler
        if (this.timeline.onShowEventTooltipListener != null) {
            var result = this.timeline.onShowEventTooltipListener(this.event, eventStatus, timeslotStart, timeslotEnd);
            if (result.cancel === true) {
                return;
            }
            if (result.override === true) {
                defaultTooltip = null;
            }
            customTooltip = result.text;
        }
        var content = '<table border="0" cellspacing="0" cellpadding="2px">' 
                    + (defaultTooltip === null ? '' : defaultTooltip)
                    + (customTooltip === null ? '' : customTooltip)
                    + '</table>';
        this.timeline.showTooltip(timeslotPosition, content);
    },
    
    /**
     * Hides the event tooltip when the user leaves the block.
     */
    handleMouseOut: function(e) {
        this.timeline.hideTooltip();
    },
       
    /**
     * Called when the user double-clicks on the event.
     */
    handleDoubleClick: function(e) {
        if (valueExists(this.timeline.onClickEventListener) && this.event != null) {
            this.timeline.onClickEventListener(e, this.event);
        }
    }
});


/**
 * Main timeline control class. 
 * Displays the timeline using the data provided by the timeline model.
 * Handlers user input (drag and drop).
 * Provides an API to programmatically add, change or remove new resources and/or events.
 * 
 * @class Ab.timeline.TimelineController
 * @constructor
 */
Ab.timeline.TimelineController = Base.extend({
    // the grid control used to render the timeline grid
	grid: null,
	
	// the timeline data model
	model: null,
	
	// policy object that decides when the events can be created or changed
	policy: null,
	
	// number of fixed grid columns, not including timemark columns
	// fixed columns are used to display resource fields and optional UI controls
	numberOfFixedColumns: 0,
	
	// whether the user can drag and drop timeline events; does not affect the programmatic API
	isEditable: true,
	
	// whether the timeline is displayed
	isVisible: true,
	
	// the currently selected event block
	selectedEventBlock: null,
	
	// event for the currently selected event block
	selectedEvent: null,
	
	// set to true when possible drag operation is suspected
	dragSuspected: false,
	
	// set to true when the drag operation is in progress
	dragDetected: false,
	
	// drag start mouse position: object with two properties: {x, y}
	dragStartPoistion: null,
	
	// initial drag direction: 'left' or 'right'
	dragStartDirection: '',
	
	// the handle that is initially affected by the drag: 'start' or 'end'
	dragStartHandle: '',
	
	// whether to display a tooltip when the user hovers over an event
	displayEventTooltip: true,
	
	// whether to display a tooltip when the user hovers over a timeslot
	displayTimeslotTooltip: true,
	
	// custom event handlers set from the parent view
	onClickEventListener:    null,
	onCreateEventListener:   null,
	onChangeEventListener:   null,
	onShowTimeslotTooltipListener: null,
    onShowEventTooltipListener: null,
    beforeAddRowEventsListener: null,
	
	// opacity level for row blocks: numeric value from 0 to 1
	blockOpacity: 0.75,

    // On very large screens the timeline drag-and-drop logic breaks, see KB 3040864.
    // Limit the timeline width to 1600px.
    maxWidth: 1600,
	
	// for each resource row the controller holds an array of rendered blocks;
	// blocks represent continuous areas of timeslots with the same status,
	// such as unavailable periods, future pre/post-blocks and events.
	rowBlocks: null,
	
	// parent DOM element for absolutely positioned row blocks
	rowBlocksParent: null,
	
	// whether row blocks have been created
	rowBlocksReady: false,
	
	// whether to use absolutely positioned DIV element as row blocks parent
	useLayer: false,
	
	// absolutely positioned DIV element used as row blocks parent (if useLayer == true)
	timelineLayer: null,
	
	// timeslot configuration parameter used to render blocks; cached for efficiency
	timelineX: 0,
	timelineY: 0,
	timeslotHeight: 0,
	timeslotWidth: 0,
	timeslotPositionsX: null,
	timeslotPositionsY: null,
	timeslotCSSClass:null,

    // additional absolutely positioned DIV that holds row blocks
	timelineLayerDiv: null,
	
	// whether to maintain fixed header rows during scrolling
	useFixedHeader: false,
	
	isMouseDown: false,
	
	/**
	 * @constructor
	 */
	constructor: function(id, isEditable, policy) {

	    // create the grid control
		var configObj = new Ab.view.ConfigObject();
        configObj.setConfigParameter('compatibilityMode', true);
		this.grid = new Ab.grid.Grid(id, configObj);

		// create the empty model
		this.model = new Ab.timeline.Model(id);
		
		if (typeof isEditable == 'boolean') {
			this.isEditable = isEditable;
		}
		
		if (valueExists(policy)) {
		    this.policy = policy;
		} else {
		    this.policy = new Ab.timeline.DefaultPolicy();
		}

        // if the browser window is resized, the timeline must be rebuilt to reposition blocks
        EVENT.on(window, "resize", this.afterResize, this, true);
        this.limitTimelineWidth();
	},

    afterResize: function() {
        this.refreshTimelineUI.defer(100, this);
    },

    /**
     * On very large screens the timeline drag-and-drop logic breaks, see KB 3040864.
     */
    limitTimelineWidth: function() {
        var table = Ext.get('grid_' + this.grid.getParentElementId());
        if (table) {
            if (table.getWidth() > this.maxWidth) {
                table.setWidth(this.maxWidth);
            } else {
                table.setWidth('100%');
            }
        }
    },
	
	// ----------------------- drag and drop support -----------------------------------------------
	
	/**
	 * Captures the mouse position for possible drag operation.
	 */
	suspectDrag: function(e, eventBlock) {
        var position = this.getTimeslotPosition(e);
        if (!this.policy.canStartDrag(this, position, eventBlock)) {
	        return;
	    }
        if (this.dragDetected) {
            this.endDrag(e, eventBlock);
        }
        this.dragStartHandle = '';
        this.dragStartPosition = position;
        this.dragSuspected = true;
	},
	
	/**
	 * Checks whether the drag operation should be started, and starts it if so.
	 * @param {e} Mouse event.
	 * @param {eventBlock} Existsing event block under the mouse, or null.
	 */
	startDrag: function(e, eventBlock) {
	    if (!this.isEditable) {
	        return;
	    }
	    
	    if (!this.dragSuspected || this.dragDetected) {
	        return;
	    }
	    
        // mouse button not pressed - no drag
        if (EVENT.isIE > 0 && EVENT.isIE < 9 && !e.button) {
            return;
        }

        // the user has to move the mouse at least 3 pixels to start the drag	    
	    var currentPosition = this.getTimeslotPosition(e);
	    if (Math.abs(currentPosition.x - this.dragStartPosition.x) < 3) {
	        return;
	    }
	    
	    // should start the drag
	    this.dragSuspected = false;
	    this.dragDetected = true;
	    
	    if (currentPosition.x > this.dragStartPosition.x) {
	        this.dragStartDirection = 'right';
	    } else {
	        this.dragStartDirection = 'left';
	    }
	    
	    if (!eventBlock) {
	        // drag stars over an empty timeslot - create new event block
            var row = this.dragStartPosition.row;
            var column = this.dragStartPosition.column;
	        eventBlock = new Ab.timeline.EventBlock(this, row, column, column, null, this.getResource(row));
	    }
	    
	    this.selectedEventBlock = eventBlock;
	},
	
	/**
	 * Ends the drag operation.
	 * @param {e} Mouse event.
	 * @param {eventBlock} Existsing event block under the mouse, or null.
	 */
	endDrag: function(e, eventBlock) {
	    if (this.selectedEventBlock && !this.selectedEventBlock.event) {
	        this.selectedEventBlock.remove();
	    }
        this.dragStartHandle = '';
	    this.dragDetected = false;
	    this.selectedEventBlock = null;
	},
	
	/**
	 * When the user presses the mouse button.
	 */ 
	handleMouseDown: function(e) {
        this.isMouseDown = true;
	    if (!this.rowBlocksReady) {
	        return;
	    }
        this.hideTooltip();
        // capture the mouse position for possible drag
	    this.suspectDrag(e, null);
        this.stopEvent(e);
	},
	
	/**
	 * When the user moves the mouse.
	 */ 
	handleMouseMove: function(e) {
	    if (!this.rowBlocksReady ) {
	        return;
	    }

	    // if drag is not in process, display timeslot tooltip
        if (!this.dragDetected && !this.dragSuspected) {
            this.handleMouseOver(e);
        }
        
        if (this.dragDetected && this.selectedEventBlock) {
            // if drag has started, delegate to the event block to handle resize
            this.selectedEventBlock.handleMouseMove(e);
        } else if(this.isMouseDown){ 
    	
            // if drag has not started, see if it should be started now
	        this.startDrag(e, null);
        }
        this.stopEvent(e);
	},
	
	/**
	 * When the user releases the mouse button.
	 */ 
	handleMouseUp: function(e) {
        this.isMouseDown = false;
	    if (!this.rowBlocksReady || this.dragSuspected) {
            this.dragSuspected = false;
	        return;
	    }

	    if ((this.dragDetected && this.selectedEventBlock)) {
	        var eventBlock = this.selectedEventBlock;
            this.endDrag(e, null);
	        eventBlock.endDrag();
	    }
        this.stopEvent(e);

	},
	
    /**
     * Displays a timeslot tooltip when the user hovers the mouse over any timeslot.
     */
    handleMouseOver: function(e) {
        // do not display the tooltip during drag operation, or if the event is not yet created
        if (this.dragDetected || this.dragSuspected || !this.displayTimeslotTooltip || !this.rowBlocksReady) {
            return;
        }
        
        var timeslotPosition = this.getTimeslotPosition(e);
        var timeslot = this.model.getTimeslot(timeslotPosition.row, timeslotPosition.column);
        if (timeslot && timeslot.timemark) {
            var defaultTooltip = '<tr><td class="value">' + timeslot.timemark.dateTimeLabel + '</td></tr>';
            var customTooltip = null;
            
            // call application-specific tooltip handler
            if (this.onShowTimeslotTooltipListener != null) {
                var result = this.onShowTimeslotTooltipListener(timeslot);
                if (result.cancel === true) {
                    return;
                }
                if (result.override === true) {
                    defaultTooltip = null;
                }
                customTooltip = result.text;
            }
            var content = '<table border="0" cellspacing="0" cellpadding="2px">' 
                        + (defaultTooltip === null ? '' : defaultTooltip)
                        + (customTooltip === null ? '' : customTooltip)
                        + '</table>';
            this.showTooltip(timeslotPosition, content);
        }
    },
    
    /**
     * Hides the event tooltip when the user leaves the timeslot.
     */
    handleMouseOut: function(e) {
        this.hideTooltip();
    },
    
	/**
	 * Stops the event handling.
	 */
	stopEvent: function(e) {
        EVENT.stopPropagation(e);
        EVENT.preventDefault(e);
	},
	
	/**
	 * Finds the timeslot position for specified mouse event (onmousedown etc).
	 * @return [row, column, pageX, pageY]
	 */
	getTimeslotPosition: function(e) {
	    var x = EVENT.getPageX(e) - this.timelineX;
	    var y = EVENT.getPageY(e) - this.timelineY;
	    if (this.useLayer) {
	    	var scrollParent = this.getScrollParent();
	    	if (scrollParent) {
		        x = x + scrollParent.scrollLeft;
		        y = y + scrollParent.scrollTop;
	    	}
	    }
	    
	    var row = this.timeslotPositionsY.length - 1;
	    for (var i = 0; i < this.timeslotPositionsY.length; i++) {
	        if (y < this.timeslotPositionsY[i]) {
	            row = i - 1;
	            break;
	        }
	    }
	    
	    var column = this.timeslotPositionsX.length - 1;
	    for (var i = 0; i < this.timeslotPositionsX.length; i++) {
	        if (x < this.timeslotPositionsX[i]) {
	            column = i - 1;
	            break;
	        }
	    }
	    return {'row':row, 'column':column, 'x':x, 'y':y};
	},
	
	/**
	 * Returns block at position [row, column], or null if there is no block there.
	 */
	getBlockAtPosition: function(row, column) {
	    if (this.rowBlocks && this.rowBlocks[row]) {
    	    var blocks = this.rowBlocks[row];
    	    for (var i = 0; i < blocks.length; i++) {
    	        var block = blocks[i];
    	        if (block.start <= column && block.end >= column) {
    	            return block;
    	        }
    	    }
	    }
	    return null;
	},
	
	// ----------------------- public API ----------------------------------------------------------
	
	/**
	 * Adds JS event handler for onClickEvent event.
	 */
	addOnClickEvent: function(onClickEventListener) {
		this.onClickEventListener = onClickEventListener;
	},
	
	/**
	 * Adds JS event handler for onCreateEvent event.
	 */
	addOnCreateEvent: function(onCreateEventListener) {
		this.onCreateEventListener = onCreateEventListener;
	},	
	
	/**
	 * Adds JS event handler for onChangeEvent event.
	 */
	addOnChangeEvent: function(onChangeEventListener) {
		this.onChangeEventListener = onChangeEventListener;
	},	
	
    /**
     * Adds JS event handler for onShowTimeslotTooltip event.
     */
    addOnShowTimeslotTooltip: function(onShowTimeslotTooltipListener) {
        this.onShowTimeslotTooltipListener = onShowTimeslotTooltipListener;
    },  
    
    /**
     * Adds JS event handler for onShowEventTooltip event.
     */
    addOnShowEventTooltip: function(onShowEventTooltipListener) {
        this.onShowEventTooltipListener = onShowEventTooltipListener;
    },

    /**
     * Adds JS event handler for beforeAddRowEvents event.
     */
    addBeforeAddRowEvents: function(beforeAddRowEventsListener) {
        this.beforeAddRowEventsListener = beforeAddRowEventsListener;
    },

    /**
	 * Adds custom timeline column that displays a property of the resource object.
	 */
	addColumn: function(id, name, type, defaultActionHandler, text, imageName) {
		// create major column (1st row) that displays a title
		var majorColumn = new Ab.grid.Column(id, name, type);
		// force custom columns to be as large as possible, and timemark columns to have minimal width
        if (this.numberOfFixedColumns == 0) {
            majorColumn.width = '5%';
        } else {
            majorColumn.width = '20%';
        }
		this.grid.addColumn(majorColumn, 1);

		// create minor column (2nd row) that specifies JS action handler and additional parameters
		var minorColumn = new Ab.grid.Column(id, '', type, defaultActionHandler);
		if (typeof text != 'undefined') {
		    minorColumn.text = text;
		}
		if (typeof imageName != 'undefined') {
		    minorColumn.imageName = imageName;
		}
		this.grid.addColumn(minorColumn, 2);

		this.numberOfFixedColumns++;

	},
	
	/**
	 * Returns true if the timeline has data rows.
	 */
	hasData: function() {
	    return (this.getResources() && this.getResources().length > 0);
	},
	
	/**
	 * Clears the visible timeline content.
	 */
	clear: function() {
		/*
		 * In 2.0 views this commented code causes the complete view layout to disappear.
		 *
	    // remove absolutely positioned timeline layer, if it is used
	    if (this.timelineLayer) {
	        this.timelineLayer.parentNode.removeChild(this.timelineLayer);
	        this.timelineLayer = null;
	    }
	    
	    this.rowBlocksParent = null;
	    */
	    
	    // remove all row blocks
        this.clearRowBlocks();		
		
	    // remove the grid content
	    this.grid.clear();
	},
	
	/**
	 * Clears the row blocks and their DOM elements.
	 */
	clearRowBlocks: function() {
	    this.rowBlocksReady = false;
		for (var r = 0; r < this.getRowNumber(); r++) {
			this.removeRowBlocks(r);
		}
	},
	
	/**
	 * Loads the timeline mode from specified DTO object.
	 */
	loadTimelineModel: function(timelineDTO){
		this.model.loadTimeline(timelineDTO);
	},
	
	/**
	 * Shows the timeline. 
	 */
	show: function() {
        this.isVisible = true;
        this.grid.parentElement.style.visibility = 'visible';
        this.refreshTimelineUI();
	},
	
	/**
	 * Hides the timeline. 
	 */
	hide: function() {
        this.isVisible = false;
        this.grid.parentElement.style.visibility = 'hidden';
        this.clearRowBlocks();
	},
	
	/**
	 * Refreshed visible timeline content from the model.
	 */
	refreshTimelineUI: function() {
        if (!this.model.isLoaded()) {
            return;
        }

        this.grid.parentEl.addClass('timeline');

		// remove timemark columns (do not remove fixed columns)
		this.grid.removeColumns(this.numberOfFixedColumns);
		this.grid.removeColumns(this.numberOfFixedColumns, 2);

		// add timemark columns
		var numColumns = this.getTimemarks().length;
		for (var c = 0; c < numColumns; c++) {
			var timemark = this.getTimemarks()[c];
			if (typeof timemark.type == 'undefined' || timemark.type == 'major') {
			    var majorTimemarkSpan = this.model.minorToMajorRatio;
			    var column = new Ab.grid.Column("timemark-" + c, timemark.dateTimeLabel, 'time', null, null, majorTimemarkSpan);
			    this.grid.addColumn(column);
			} 
			var column = new Ab.grid.Column('', '', 'time', null, this.onCreateTimeslot);
			column.timemarkIndex = c;
			column.controller = this;
			this.grid.addColumn(column, 2);
		}

		// remove all rows and row blocks
        this.clearRowBlocks();		
		this.grid.removeRows(0);
		
		// add model resources as grid rows
		var numRows = this.getResources().length;
		for (var r = 0; r < numRows; r++) {
			this.grid.addRow(this.getResource(r));
		}
		
		// find parent element for the grid and for row blocks
		this.findRowBlocksParent();

		// generate HTML grid
		this.grid.build();
		
	    if (this.useFixedHeader && this.timelineInScrollPane()) {
			// generate 'second' header that doesn't v-scroll 
			this.insertTimelineHeaderLayer();
		}

		//the scrolling for the grid's parent div - This is a bug in IE. 
        if (valueExists(this.timelineLayerDiv)) {
			this.timelineLayerDiv.scrollLeft = 0;
			this.timelineLayerDiv.scrollTop = 0;
		}
			
		// create and render row blocks for unavailable intervals and existing events
		this.rowBlocks = new Array(numRows);
        EVENT.onAvailable(this.grid.parentElementId, this.refreshRowBlocks, this, true);
		
		// if the browser window is resized, the timeline must be rebuilt to reposition blocks
        // KB 3038890: the event listener is attached in the constructor, to work in IE10
		// EVENT.on(window, "resize", this.refreshRowBlocks, this, true);

        this.limitTimelineWidth();
	},
	
	/**
	 * Finds the parent element for the grid and for row blocks.
	 * If the timeline DIV specifies height, creates new absolutely positioned DIV 
	 * that overlaps the original one, and uses it as a parent.
	 */
	findRowBlocksParent: function() {
	    if (this.rowBlocksParent) {
	        return;
	    }
	    
        var gridParent = this.grid.parentElement;
	    var gridHeight = gridParent.style.height;
	    
	    // KB 3025626: disable the first approach
	    if (false && gridHeight != 'undefined' && gridHeight != '') {
	        // height is defined - create absolutely positioned copy of the parent element with the scrollbar
	        this.useLayer = true;
	        
	        var timelineLayer = document.createElement('div');
	        timelineLayer.id = gridParent.id;
	        timelineLayer.className = 'timelineLayer';
	        timelineLayer.style.top = DOM.getY(gridParent) + 'px';
	        timelineLayer.style.height = gridHeight;
			document.body.insertBefore(timelineLayer, document.body.firstChild);
			this.timelineLayerDiv = timelineLayer;
	        
	        this.grid.setParentElement(timelineLayer);
	        this.rowBlocksParent = timelineLayer;
	        this.timelineLayer = timelineLayer;
	        
	        // block positions are calculated relative to the original parent element
            this.updateTimelinePosition();

	    } else {
	    	// KB 3025626: position blocks in the grid parent
	        this.useLayer = true;
	        this.rowBlocksParent = gridParent;
	        
	        // block positions are relative to the grid parent
            this.updateTimelinePosition();
	    }
	},

    /**
     * Updates the cached X and Y coordinates of the timeline. Call this method if the screen position
     * of the timeline panel changes, for example after the user collapses another panel.
     */
    updateTimelinePosition: function() {
        this.timelineX = DOM.getX(this.grid.parentElement);
        this.timelineY = DOM.getY(this.grid.parentElement);

        var scrollParent = this.getScrollParent();
        if (scrollParent) {
            this.timelineX += scrollParent.scrollLeft;
            this.timelineY += scrollParent.scrollTop;
        }
    },
	
	/**
	 * Finds and returns any parent element that has been scrolled.
	 */
	getScrollParent: function() {
        var parent = this.grid.parentElement;
		while (valueExists(parent.scrollLeft) && parent.scrollLeft == 0 && parent.scrollTop == 0) {
			parent = parent.parentNode;
		}
		return valueExists(parent.scrollLeft) ? parent : null;
	},
	
	/**
	 * Repositions all row blocks if the window layout has changed.
	 */
	refreshRowBlocks: function() {
	    if (!this.hasData() || !this.isVisible) {
	        return;
	    }

		//the scrolling for the grid's parent div - This is a bug in IE. 
        if (valueExists(this.timelineLayerDiv)) {
			this.timelineLayerDiv.scrollLeft = 0;
			this.timelineLayerDiv.scrollTop = 0;
		}
	    
		// determine and cache timeslot parameters
	    this.cacheTimeslotPositions();
	    
	    // remove and render again all row blocks
		for (var r = 0; r < this.getRowNumber(); r++) {
			this.refreshTimelineRow(r);
		}

	    if (this.useFixedHeader && this.timelineInScrollPane()) {
			// reposition faux header
			this.rePositionHeaderDiv();
		}

	    this.rowBlocksReady = true;
	},
	
	/**
	 * Calculates and caches timeslot positions.
	 */
	cacheTimeslotPositions: function() {
	    if (!this.hasData()) {
	        return;
	    }
		
	    // account for possible timeline scrolling
	    var offsetX = 0;
	    var offsetY = 0;
    	var scrollParent = this.getScrollParent();
    	if (scrollParent) {
	        offsetX = scrollParent.scrollLeft;
	        offsetY = scrollParent.scrollTop;
    	}

		this.timeslotPositionsX = new Array();
		for (var c = 0; c < this.getTimemarks().length; c++) {
		    var timemarkCell = this.getTimemarkCell(c);
	        var left = DOM.getX(timemarkCell) + offsetX;
		    this.timeslotPositionsX.push(left);
		    if (c == 0) {
		        this.timeslotWidth = timemarkCell.offsetWidth;
		    }
		}
		
		this.timeslotPositionsY = new Array();
		for (var r = 0; r < this.getRowNumber(); r++) {
	        var rowElement = this.grid.rowElements[r + 2];
	        var top = DOM.getY(rowElement) - this.timelineY + offsetY;
		    this.timeslotPositionsY.push(top);
		    if (r == 0) {
		        this.timeslotHeight = rowElement.offsetHeight;
		    }
		}
	},
	
	/**
	 * Called from the grid to create timeline cells (not for fixed columns).
	 * Forces the grid to create a single cell that spans all timemark columns.
	 */
	onCreateTimeslot: function(resource, column, cell) {
		cell.colSpan = column.controller.getTimemarks().length;
		if(this.timeslotCSSClass==null){
			var minorToMajorRatio = column.controller.model.minorToMajorRatio + "";
			minorToMajorRatio = parseInt(minorToMajorRatio, 10);
			minorToMajorRatio = 60/minorToMajorRatio + "";	
			this.timeslotCSSClass = 'timeslot_'+minorToMajorRatio;
		}
		DOM.addClass(cell, this.timeslotCSSClass);	
		
        if (column.controller.isEditable) {
            EVENT.on(cell, "mousedown", column.controller.handleMouseDown, column.controller, true);
            EVENT.on(cell, "mousemove", column.controller.handleMouseMove, column.controller, true);
            EVENT.on(cell, "mouseup",   column.controller.handleMouseUp, column.controller, true);
            EVENT.on(cell, "mouseover", column.controller.handleMouseOver, column.controller, true);
            EVENT.on(cell, "mouseout",  column.controller.handleMouseOut, column.controller, true);
        }
	},


	//--------------------- faux header - second header remains fixed at top of timeline div as table scrolls ----------
	/**
	 * Returns (true or false) whether the timeline is placed in a DIV that has a height set
	 * & should show scrollbars when the timeline is too tall
	 */
	timelineInScrollPane: function() {
        var gridParent = this.grid.parentElement;
	    var gridHeight = gridParent.style.height;
	    return (gridHeight != 'undefined' && gridHeight != '');

	},

	/**
	 * insert the faux timeline header table in the doc just before the timeblock divs and the timeline grid
	 *
	 */
	insertTimelineHeaderLayer: function() {
		// generate 'second' header that doesn't v-scroll 
		var timelineHeaderLayer = this.getTimelineHeaderLayer();
		document.body.insertBefore(timelineHeaderLayer, document.body.firstChild);
	},

	/**
	 *  Create a second header that is not part of the timeline table by copying the timeline grid's header
	 *  Position it absolutely and give it a high zIndex so that it overlays the original header
	 *
	 *  @return a DIV conaining a table only containing a thead whose th cells are absolutely positioned over the original header
	 */
	getTimelineHeaderLayer: function() {
		var header1Height = 18;
		var maxHeaderWidth = document.body.clientWidth - 24;
		//alert('MaxHeaderWidth <' + maxHeaderWidth + '> timelineDiv width = <' + this.timelineLayerDiv.clientWidth + '>.');

		var timelineHeaderLayer = document.createElement('div');
		timelineHeaderLayer.style.position = 'absolute';
		timelineHeaderLayer.id = 'timeline_header';
		timelineHeaderLayer.style.zIndex = 1002;
		
		var timelineHeaderTable = document.createElement('table');
		timelineHeaderTable.className = 'panelReport';
		timelineHeaderLayer.appendChild(timelineHeaderTable);
		var tHead = document.createElement('thead');
		timelineHeaderTable.appendChild(tHead);

		// Major header row
		var tRow = document.createElement('tr');
		tHead.appendChild(tRow);	
		this.copyAndAppendHeaderCell(this.grid.headerCells, tRow, (this.timelineY - 2), maxHeaderWidth);
		// timeMark header row
		tRow = document.createElement('tr');
		tHead.appendChild(tRow);
		this.copyAndAppendHeaderCell(this.grid.headerCells2, tRow, (this.timelineY + header1Height - 2), maxHeaderWidth);

		this.initDivScrolling();
		return timelineHeaderLayer;
	},
		
	/**
	 * helper function creating and positioning a header row
	 *
	 */	
	copyAndAppendHeaderCell: function(sourceCells, tableRow, top, maxWidth) {		
		for (var i=0, hCell; hCell = sourceCells[i]; i++) {
			var cell = document.createElement('th');
			cell.appendChild(document.createTextNode(hCell.innerHTML));
			cell.style.position = 'absolute';
			cell.style.top = top  + 'px';
			cell.style.left = Math.min(hCell.offsetLeft, maxWidth) + 'px';
			cell.style.height = Math.max(hCell.offsetHeight, 6) + 'px';
			var w = ( (hCell.offsetLeft + hCell.offsetWidth) > maxWidth) ? Math.max(0, maxWidth - hCell.offsetLeft)  : hCell.offsetWidth;
			cell.style.width = w + 'px';
			cell.style.borderLeft = '1px solid #CCCCCC';
			cell.style.paddingRight = '0px';
			tableRow.appendChild(cell);
		}
	},

	/**
	 * initialize the scrolling listener for the faux header
	 *
	 */
	initDivScrolling: function() {
		window.timelineDivPrevScrollPos = { left: this.timelineLayerDiv.scrollLeft, top: this.timelineLayerDiv.scrollTop };
		window.timelineController = this;
		window.timelineLayerDiv = this.timelineLayerDiv;
		this.timelineLayerDiv.onscroll = this.onScrollTimelineDiv;
	},


	/**
	 * listener for handling scrolling of timeline div
	 * only reacts to horizontal scroll (i.e., scrollLeft changes)
	 * calls common repositioning method
	 *
	 */
	onScrollTimelineDiv: function(event) {
		var currentScrollPos = { left: timelineLayerDiv.scrollLeft, top: timelineLayerDiv.scrollTop};
		if (currentScrollPos.left != timelineDivPrevScrollPos.left) {
			timelineDivPrevScrollPos = currentScrollPos;
			timelineController.rePositionHeaderDiv();
		}
	},


	/**
     *  resposition the header when scrolling or resizing
	 */
	rePositionHeaderDiv: function() {
		var scrollOffset = this.timelineLayerDiv.scrollLeft;
		var maxHeaderWidth = document.body.clientWidth - 24;

		var headerDiv = document.getElementById('timeline_header');
		var grid = Ab.view.View.getControl(window, 'timeline');
		var timelineHeaderTable = headerDiv.getElementsByTagName('table')[0]; 
		var rows = headerDiv.getElementsByTagName('tr');

		this.repositionHeaderCells(grid.headerCells, rows[0].getElementsByTagName('th'), scrollOffset, maxHeaderWidth);
		this.repositionHeaderCells(grid.headerCells2, rows[1].getElementsByTagName('th'), scrollOffset, maxHeaderWidth);
	},

	/**
	 * helper function positioning previously created header row cells
	 *
	 */	
	repositionHeaderCells: function(sourceHeaderCells, targetHeaderCells, scrollOffset, maxWidth) {
		for (var i=0, hCell; hCell = sourceHeaderCells[i]; i++) {
			var cell = targetHeaderCells[i];
			var left = Math.min((hCell.offsetLeft - scrollOffset), maxWidth);
			cell.style.left = left + 'px';
			var w = ( ((hCell.offsetLeft - scrollOffset) + hCell.offsetWidth) > maxWidth) ? Math.max(0, maxWidth - (hCell.offsetLeft - scrollOffset))  : hCell.offsetWidth;
			cell.style.width = w + 'px';
			if (w < 1) {
				cell.style.display = 'none';
			}
			else {
				cell.style.display = 'block';
				if ((w + 12) < hCell.offsetWidth) {
					cell.innerHTML = '';
				}
				else {
					cell.innerHTML = hCell.innerHTML;
				}
			}
		}
	},
	//--------------- end faux header --------

	
	/**
	 * Removes the old content of the specified row and displays updated content.
	 */
	refreshTimelineRow: function(row, clearActiveEvent){	
        this.removeRowBlocks(row);
        this.renderTimelineRow(row, clearActiveEvent);
    },
    
    /**
     * Renders specified timeline row: locked blocks and events.
     * @param {row} Row index.
     * @param {clearActiveEvent} If specified and is true, the current event selection is cleared.
     */
    renderTimelineRow: function(row, clearActiveEvent) {
		this.createRowBlocks(row);
	},
	
	/**
	 * Returns a reference to the timemark DOM element (th).
	 * @param {column} Timemark column index (fixed columns are not included).
	 */
	getTimemarkCell: function(column) {
	    return this.grid.headerCells2[this.numberOfFixedColumns + column];
	},
	
	/**
	 * Returns the timemarks array.
	 */
	getTimemarks: function() {
		return (this.model != null ? this.model.timemarks : null);
	},

	/**
	 * Returns the resources array.
	 */
	getResources: function() {
		return (this.model != null ? this.model.resources : null);
	},
	
	/**
	 * Returns number of resource rows.
	 */
	getRowNumber: function() {
	    var rowNum = 0;
	    var resources = this.getResources();
	    if (resources) {
	        rowNum = resources.length;
	    }
	    return rowNum;
	},
	
	/**
	 * Returns the resource object for specified row.
	 */
	getResource: function(row) {
	    return this.model.getResource(row);
	},
	
	/**
	 * Returns the event that occupies specified row and column.
	 * If there are multiple overlapping events, returns the newest.
	 */
	getEvent: function(row, column){
		var events = this.getTimeline().events;
		// iterate row events starting from the last event, to catch the most recently added event
		for(var i = events.length - 1; i >= 0; i--){
		    var event = events[i];
		    if (!event.isDeleted() && event.contains(row, column)) {
			    return event;
		    }			    
		}
		return null;
	},
	
	/**
	 * Adds new event to the timeline model.
	 */
	addEvent: function(event){
		this.model.addEvent(event);
	},
	
	/**
	 * Adds specified resource object to the timeline model and displays a new row in the timeline.
	 * @param {resource} timeline.Resource instance.
	 */
	addRow: function(resource) {
		this.model.addResource(resource);
		this.refreshTimelineUI();
	},
	
	/**
	 * Removes the resource object specified by the row index from the timeline.
	 * @param {row} 0-based row index.
	 */
	removeRow: function(row) {
		this.model.removeResource(row);
		this.refreshTimelineUI();
	},
	
	/**
	 * Removes specified event object from the timeline.
	 * @param {event} Event object instance.
	 */
	removeEvent: function(event) {
 		if (event != null){
 		    // the model removes new events, and marks existing events as deleted
 		    this.model.removeEvent(event);
 		    
		    this.refreshTimelineRow(event.getRow());
		}
	},
	
	/**
	 * Removes specified event objects from the timeline.
	 * @param {events} Array of event objects.
	 */
	removeEvents: function(events) {
		for (var i = 0; i < events.length; i++) {
			this.removeEvent(events[i]);
		}
	},
	
	/**
	 * Returns the timeline model reference.
	 */
	getTimeline: function(){
		    return this.model;
	},
	
	/**
	 * Sets the timeline model for this controlle.
	 * @param {model} Instance of the Ab.timeline.Model class.
	 */
	setTimeline: function(model) {
		this.model = model;
	},
	
	/**
	 * Returns an array of pending events (newly created and marked as deleted).
	 */
	getPendingEvents: function(){
		return  this.model.getPendingEvents();
	},
	
	// ----------------------- rendering methods ---------------------------------------------------
	
	/**
	 * Creates all blocks for specified row.
     * @param {row} Row index.
	 */
	createRowBlocks: function(row) {
	    this.rowBlocks[row] = new Array();
	    
	    var rowResource = this.model.getResource(row);

        // add unavailable and future pre/post blocks at the both ends of the timeline
	    this.addRowBlock(row, Ab.timeline.Timeslot.STATUS_NOT_AVAILABLE, 0, rowResource.columnAvailableFrom - 1, true);
	    this.addRowBlock(row, Ab.timeline.Timeslot.STATUS_FUTURE_BLOCK,  rowResource.columnAvailableFrom, rowResource.columnAvailableFrom + rowResource.preBlockTimeslots - 1, true);
	    this.addRowBlock(row, Ab.timeline.Timeslot.STATUS_FUTURE_BLOCK,  rowResource.columnAvailableTo - rowResource.postBlockTimeslots, rowResource.columnAvailableTo - 1, false);
	    this.addRowBlock(row, Ab.timeline.Timeslot.STATUS_NOT_AVAILABLE, rowResource.columnAvailableTo, this.getTimemarks().length - 1, false);

        // add custom unavailable blocks
        if (this.beforeAddRowEventsListener) {
            this.beforeAddRowEventsListener(row);
        }
	    
	    // add row events
		var events = this.model.getRowEvents(row);
		for(var i = 0; i < events.length; i++){
			var event = events[i];
			
			if (!event.isDeleted()) {
    	        var eventBlock = new Ab.timeline.EventBlock(this, row, event.columnStart, event.columnEnd, event, rowResource);
    	        this.rowBlocks[row].push(eventBlock);
			}
		}
	},
	
	/**
	 * Adds a block to the array of row blocks.
     * @param {row} Row index.
     * @param {status} The status of the block, e.g. Ab.timeline.Timeslot.STATUS_FUTURE_BLOCK.
     * @param {startColumn} The first column of the block.
     * @param {endColumn} The last column of the block.
     * @param {isPreBlock} True if this is a pre-block.
	 */
	addRowBlock: function(row, status, startColumn, endColumn, isPreBlock) {
	    if (endColumn >= startColumn) {
	        var block = new Ab.timeline.Block(this, row, startColumn, endColumn, status, true, isPreBlock);
	        this.rowBlocks[row].push(block);
	    }
	},
	
	/**
	 * Renders all blocks for specified row.
     * @param {row} Row index.
	 */
	renderRowBlocks: function(row) {
        if (this.rowBlocks && this.rowBlocks[row]) {
    	    for (var i = 0; i < this.rowBlocks[row].length; i++) {
    	        var block = this.rowBlocks[row][i];
    	        block.render();
    	    }
        }
	},
	
    /**
     * Remove all blocks for the specified row.
     */
    removeRowBlocks: function(row) {	
        if (this.rowBlocks && this.rowBlocks[row]) {
    	    for (var i = 0; i < this.rowBlocks[row].length; i++) {
    	        var block = this.rowBlocks[row][i];
    	        block.remove();
    	    }
        }
    },
    
    /**
     * Displays the tooltip with custom content near specified timeslot position.
     * @param {timeslotPosition} Position of the nearest timeslot.
     * @param {content} HTML content to be displayed.
     */
    showTooltip: function(timeslotPosition, content) {
        // create tooltip element if it has not been created yet
        if (!valueExists(this.tooltip)) {
            var tooltip = document.createElement('div'); 
            tooltip.id = 'tooltip';     
            document.body.appendChild(tooltip);   
            this.tooltip = tooltip;          
        }

        // position the tooltip
        var tooltipLeft = this.timelineX + timeslotPosition.x + 8;
        var tooltipTop = this.timelineY + timeslotPosition.y + 8;
	    if (this.useLayer) {
	    	var scrollParent = this.getScrollParent();
	    	if (scrollParent) {
	            tooltipLeft = tooltipLeft - scrollParent.scrollLeft;
	            tooltipTop = tooltipTop - scrollParent.scrollTop;
	    	}
	    }
        this.tooltip.style.left = tooltipLeft + 'px';
        this.tooltip.style.top = tooltipTop + 'px';
        
        // add HTML content
        this.tooltip.innerHTML = content;                        
        
        // display tooltip
        this.tooltip.style.display = '';
    },
    
    /**
     * Hides the tooltip.
     */
    hideTooltip: function() {
        if (valueExists(this.tooltip)) {
            this.tooltip.style.display = 'none';
        }
    }
});

/**
 * Class that enforces timeline policies. This is the default implementation,
 * applications can define their own classes that implement the same contract.
 */
Ab.timeline.DefaultPolicy = Base.extend({
    
    /**
     * Checks whether the drag operation can be started at specified timeslot.
     * @param {timeline}         Timeline control.
     * @param {timeslotPosition} The position of the timeslot under the mouse.
     * @param {event}            Event that is being changed, or null if the drag starts at an empty timeslot.
     * @return                   True if the operation can proceed.
     */
    canStartDrag: function(timeline, timeslotPosition, eventBlock) {
        // if the drag starts at an event, it is always allowed
        if (eventBlock) {
            return true;
        }

        var row = timeslotPosition.row;
        var column = timeslotPosition.column;
        var resource = timeline.getResource(row);
        var start = column - resource.preBlockTimeslots;
        var end = column + resource.postBlockTimeslots;
        
        return this.checkTimeslotRange(timeline, resource, row, start, end, null);
    },
   
    /**
     * Checks whether the drag operation can be continued at speciied timeslot.
     * @param {timeline}         Timeline control.
     * @param {timeslotPosition} The position of the timeslot under the mouse.
     * @param {event}            Currently dragged event.
     * @return                   True i the operation can proceed.
     */ 
    canContinueDrag: function(timeline, timeslotPosition, eventBlock) {
        var row = timeslotPosition.row;
        var column = timeslotPosition.column;
        var resource = timeline.getResource(row);
        var eventStart = eventBlock.start;
        var eventEnd = eventBlock.end;
        var eventPreStart = eventStart - resource.preBlockTimeslots;
        var eventPostEnd = eventEnd + resource.postBlockTimeslots;

        // it is allowed to reduce the event start or end
        if (eventStart <= column && column <= eventEnd) {
            return true;
        }

        // calculate hypothetical updated event start or end
        if (column < eventStart) {
            eventPreStart = column - resource.preBlockTimeslots;
        }
        if (column > eventEnd) {
            eventPostEnd = column + resource.postBlockTimeslots;
        }

        return this.checkTimeslotRange(timeline, resource, row, eventPreStart, eventPostEnd, eventBlock);
    },

    /**
     * Checks that specified start, end range is available.
     */
    checkTimeslotRange: function(timeline, resource, row, start, end, eventBlock) {
        // cannot drag outside of the available range
        if (start < resource.columnAvailableFrom || end > resource.columnAvailableTo) {
            return;
        }

        // event+pre/post-blocks must not conflict with any existing event
        var existingEvents = timeline.model.getRowEvents(row);
        for (var e = 0; e < existingEvents.length; e++) {
            var existingEvent = existingEvents[e];
            if (!eventBlock || existingEvent != eventBlock.event) {
                if (existingEvent.intersectsWith(start, end)) {
                    return false;
                }
            }
        }

        // event+pre/post-blocks must not conflict with unavailable blocks
        return timeline.model.allTimeslotsAvailable(row, start, end, true);
    }
});