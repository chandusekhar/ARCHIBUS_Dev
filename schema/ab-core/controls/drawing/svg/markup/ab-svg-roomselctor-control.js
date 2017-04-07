/***
 * Room Selector Control for SVG Drawing.
 * 
 * 
 * @author   Ying Qin
 * @version  22.1
 * @date     5/2015
 */

var RoomSelector = Base.extend({

    
    // panel id for background highlight
    panelId: '',
    
    // div id to insert the room selector
    divId: '',

    // svg drawing control
    control: null,
    
    highlightTitle: '',
    
    highlightColor: '',
    
    //color picker
    jsColor: null,
    
    // @begin_translatable
    DEFAULT_INSTRUCTION: "Click on Room(s) to Highlight then 'Add' to save the filter.",
    DEFAULT_TITLE_HIGHLIGHT: "Enter a title",
    DEFAULT_TITLE_COLOR: "Pick a color",
    MESSAGE_CLICKROOM: "Please click on a room to highlight.",
    TEXT_ADDFILTER: "Add",
   	TEXT_CANCEL: "Cancel",
    // @end_translatable
    
    
    /**
     * Constructor.
	 * @param divId String Id of <div/> that holds the room selector
     * @param panelId String Id of the panel
     */
    constructor: function(control) {

    	this.divId = control.divId+ "_roomselector",

    	this.panelId = control.panelId;

    	this.control = control;
    	
    	this.control.selectRoomsMode = 'selectRooms';
    	
    	var table=document.getElementById(this.divId);
    	if(!table)
    		this.setup();
        
    },
    
    /**
     * create dynamic room selector
     */
    setup: function(){
    	
    	var svgDiv = this.control.getDiv().node();
    	
    	// create div to contain the table.
    	var div=document.createElement("div");
    	div.id = this.divId;
    	div.style = "border:1px solid #FFC08A";
    	
    	div.className = "x-toolbar x-small-editor actionbar";
    	
    	var table = this.createTable();    	
    	div.appendChild(table);
    	
    	svgDiv.parentNode.insertBefore(div, svgDiv);
    	
    	this.jsColor = new jscolor.color(document.getElementById('highlightRoomColor'), {valueElement: 'highlightRoomColorValue'});

    	var control = this.control;
    	var selector = this;
    	
    	document.getElementById("highlightTitle").addEventListener("click", this.onClearTitle);
   		document.getElementById("okButton").addEventListener("click", this.onRoomSelectionOk.createDelegate(this, [control, selector]), false);
    	document.getElementById("cancelButton").addEventListener("click", this.onRoomSelectionCancel.createDelegate(this, [control]), false);
    	
    },

    /**
     * clear highlight title field
     */
    onClearTitle: function(){
    	this.value = '';
    },
    
    /**
     * event when user cancel the room selection
     */
    onRoomSelectionCancel: function(control){
    	var rooms = Object.keys(control.filterHighlight.pendingRoomColors)
    	control.filterHighlight.clearPendingHighlight(rooms);
    	control.filterHighlight.unloadRoomSelector();
    	control.enableActions(true, true);
    },
    
    /**
     * Save the highlight in the JSON field
     * Apply the highlight to the floor plan
     * Add or Update the highlight on the Filter Highlights panel	
     * Close the form
     * Update the Custom color in the Redlines panel to match the selected color
     */
    onRoomSelectionOk: function(control, selector){
    	
    	var highlightTitleElem = document.getElementById("highlightTitle");
    	var highlightTitle = highlightTitleElem.value;
    	var highlightColor = document.getElementById("highlightRoomColorValue").value;
    	
    	var roomSelectorIntruction = document.getElementById("roomSelectorIntruction");
    	if(!highlightTitle){
    		highlightTitleElem.style.border = '1px solid #FF0000';
    		highlightTitleElem.focus();
    	}else {
    		highlightTitleElem.style.border = '';

    		var roomSelected = {"title": highlightTitle, "color": {}};
    		if(Object.keys(control.filterHighlight.pendingRoomColors).length < 1){
        		roomSelectorIntruction.innerHTML = "<font color='red'>" + View.getLocalizedString(this.MESSAGE_CLICKROOM) + "</font>";
    		} else {
	    		roomSelected["color"] = highlightColor;
	    		var rooms = [];
	    		if(control.editRowIndex > -1){
	    			rooms = control.filterHighlight.rows[control.editRowIndex].highlightRooms;
	    		}
	    		roomSelected["rooms"] = rooms.concat(Object.keys(control.filterHighlight.pendingRoomColors));
	    		roomSelected["selectRoomsMode"] = control.selectRoomsMode;

	    		var filterJson = {};
	    		filterJson['type'] = "selectRooms";
	    		filterJson['title'] = highlightTitle;
	    		filterJson['color'] = highlightColor;
	    		filterJson['rooms'] = roomSelected["rooms"];
	    		
	    		roomSelected['filterJson'] = filterJson;
	    		
	    		control.filterHighlight.addOrUpdateRow(roomSelected, control.editRowIndex);
	    		control.filterHighlight.commitPendingHighlights();
	    		
    			control.filterHighlight.unloadRoomSelector();

    			
	    		control.hasUnsavedChanges = true;

	    		control.enableActions(true, true);
	    		
	    		control.redlineControl.getControl().setCurrentColor(highlightColor);
	    		

    		}
    	}
    },
    
    /**
     * removes the room selector control from panel
     */
    remove: function(){
    	// create div to contain the table.
    	var div=document.getElementById(this.divId);
    	var panel=document.getElementById(this.panelId);

    	if(div)
    		panel.removeChild(div);
    },
    
    /**
     * create table
     */
    createTable: function(){
    	var table = document.createElement('table');
    	table.id = this.divId + "_tbl";
    	
	    var tbody = document.createElement('tbody');

    	var tr = document.createElement('tr');  
    	tr.appendChild(this.createTitleColumn("text-align:right", "label", View.getLocalizedString(this.DEFAULT_TITLE_HIGHLIGHT)));
    	tr.appendChild(this.createInputColumn("text" , "inputField", "highlightTitle", "", "textbox", "true"));
    	tr.appendChild(this.createTitleColumn("text-align:right", "label", View.getLocalizedString(this.DEFAULT_TITLE_COLOR)));
    	tr.appendChild(this.createColorElement());

    	// add instruction text
    	var td = document.createElement('td');
    	var div = this.addIntructionText(View.getLocalizedString(this.DEFAULT_INSTRUCTION));
    	td.appendChild(div);
    	tr.appendChild(td);
    	
    	tr.appendChild(this.createButtonColumn(false));
        
    	tbody.appendChild(tr);
    	table.appendChild(tbody);
    	
    	return table;
    },
    
    /**
     * add instructional text
     */
    addIntructionText: function(textContent){
    	var div = document.getElementById("roomSelectorIntruction");
    	if(div){
    		div.innerHTML = "";
    	} else {
    		div = document.createElement('div');
    		div.id = "roomSelectorIntruction";
    	}
    	var span =  document.createElement('span');
   		span.className = "itemsSelected";
   		span.appendChild( document.createTextNode(textContent) );
   		div.appendChild(span);
    	
   		return div;
    },
    
    /**
     * create color picker element
     */
    createColorElement: function(){
   		var td = document.createElement('td');
    	
    	var colorInput = document.createElement('input');
    	colorInput.id = "highlightRoomColor";
    	colorInput.className = "color {valueElement: 'highlightRoomColorValue'}";
    	
    	td.appendChild(colorInput);

    	var colorValueInput = document.createElement('input');
    	colorValueInput.id = "highlightRoomColorValue";
    	colorValueInput.setAttribute("value", generateRandomColor());
    	colorValueInput.type = "hidden";
    	td.appendChild(colorValueInput);

    	return td;
    	
   	},
    
   	/**
   	 * create title column
   	 */
    createTitleColumn: function(style, className, title){
    	var td = document.createElement('td');
   		td.style = style; 
   		td.className = className;
   		
   		var span =  document.createElement('span');
   		span.appendChild( document.createTextNode(title) );
   		td.appendChild(span);
   		return td;
    },
    
    /**
     * create input column
     */
    createInputColumn: function(type, className, id, value, role, required){

    	var td = document.createElement('td');

    	var inputElement = this.createInput(type, className, id, value, role, required);
   		td.appendChild(inputElement);
    	
   		return td;
   	},
   	
   	/**
   	 * create ok and cancel button
   	 */
   	createButtonColumn: function(){
   		var td = document.createElement('td');

   		td.appendChild(this.createInput("button", "mainAction",  "okButton", View.getLocalizedString(this.TEXT_ADDFILTER), null, null));
   		td.appendChild(this.createInput("button", null,  "cancelButton", View.getLocalizedString(this.TEXT_CANCEL), null, null));

   		return td;
    	 		
   	},
   	
   	/**
   	 * create input element
   	 */
   	createInput: function(type, className, id, value, role, required ){
   		var input = document.createElement('input');
    	if(type)
    		input.setAttribute("type", type);
    	
    	if(className)
    		input.setAttribute("class", className);
   		
    	input.setAttribute("id", id);
   		
   		input.setAttribute("value", value);
    	
   		if(role)
   			input.setAttribute("role", role);
   		
   		if(required)
   			input.setAttribute("required", required);

   		return input;
   		
   	}
   	
});

