Ab.namespace('svg');

/***
 * Color Picker Control for Redlining.
 * 
 * Defines a panel title with Color Picker selector of 3 input element: red, black and custom.
 * When user clicks red control, all the subsequent redlining legends will use the red color.
 * When user clicks black control, all the subsequent redlining legends will use the black color.
 * When user clicks custom control, a color picker dialog will show for user to pick a color. custom control will update with the user picked color 
 * and all the subsequent redlining legends will use the custom color.
 * 
 * @author   Ying Qin
 * @version  22.1
 * @date     5/2015
 */

Ab.svg.ColorPicker = Base.extend({

	//text before color elements or panel title
    title: View.getLocalizedString(this.Z_REDLINES_TITLE),
    
    //user define config for color picker's appearance
    config: {},
    
    //RedlineSvg control - used to set the legend colors
    control: null,
    
    // @begin_translatable
    Z_REDLINES_TITLE: 		 'Redlines',
	Z_UPLOADPANEL_ERRORMSG : 'You need to define Upload Panel in your view in order to upload image or load saved image/redlines from database.',
	Z_SCALE_TEXT:                 'scale',
    // @end_translatable
	
    /**
     * Constructor.
	 * @param divId String Id of <div/> that holds the svg
     * @param panelId String Id of the panel
	 * @param config configObject
     */
    constructor: function(parentDivId, title, control) {

    	this.parentDiv = document.getElementById(parentDivId);
    	
    	if(title)
    		this.title = title;
    	else
    		this.title = View.getLocalizedString(this.Z_REDLINES_TITLE);
    	
        this.config = {divClass: "x-toolbar x-small-editor panelToolbar",
        				   spacerWidth: "20%",
        				   customStyle: "height:20px; width:10%",
        				   customInputStyle: "height:20px; width:50px",
        				   customColorId: "redlineColor"};
        
        this.control = control;
        
       	this.setup();
        
    },
    
    /**
     * create color picker with three buttons in specified div.
     */
    setup: function(){
    	
    	// create div to contain the table.
    	var div=document.createElement("div");
    	div.className = this.config.divClass;
    	
    	var table = this.createTable();    	
    	div.appendChild(table);

    	if(this.parentDiv){
    		this.parentDiv.innerHTML = '';
    		this.parentDiv.appendChild(div);
    		
        	var jsColor = new jscolor.color(document.getElementById(this.config.customColorId), {valueElement: 'redlineColorValue'});
    	}
    },

    /**
     * create color picker table
     */
    createTable: function(){
    	var table = document.createElement('table');
    	table.style.borderSpacing = "0px";
    	
	    var tbody = document.createElement('tbody');

	    var tr = document.createElement('tr');   
    	
	    tr.appendChild(this.createText("ytb-text", this.title));
    	tr.appendChild(this.createColumn(this.config.spacerWidth));
    	tr.appendChild(this.createColumn());
    	
    	tr.appendChild(this.createText("redlineScaleText", parseInt(this.control.currentFontSize*100/10) + "% ", "redlineScale"));
    	tr.appendChild(this.createColumn());
    	tr.appendChild(this.createText("redlineScaleText", View.getLocalizedString(this.Z_SCALE_TEXT)));
    	tr.appendChild(this.createColumn());
    	tr.appendChild(this.createColumn("4%"));
    	tr.appendChild(this.createColumn());
    	
    	
    	var td = this.createFontElement("large");
    	tr.appendChild(td);

    	var td = this.createFontElement("small");
    	tr.appendChild(td);


    	
    	var td = this.createColorElement('redlineColorRed', '#FF0000', this.config.customColorId, this.control.setCurrentColor);
    	tr.appendChild(td);
        
    	tr.appendChild(this.createColumn());
    	
    	td = this.createColorElement('redlineColorBlack', '#000000', this.config.customColorId, this.control.setCurrentColor);
    	tr.appendChild(td);

    	tr.appendChild(this.createColumn());

    	td = this.createCustomElement(this.config.customStyle, this.config.customColorId, this.config.customInputStyle, this.control.setCurrentColor);
    	tr.appendChild(td);
    	
    	tbody.appendChild(tr);
    	
    	table.appendChild(tbody);
    	
    	return table;
    },
    

    /**
     * add the title
     */
    createText: function(className, text, id){
    	
    	var span = document.createElement("span");
    	if(id){
	    	span.id = id;
	    	span.name = name;
    	}
    	span.className = className;
    	span.appendChild( document.createTextNode(text) );
    	
    	var td = document.createElement('td');
    	td.appendChild(span);
    	
    	return td;
    },
    
    /**
     * add column
     */
    createColumn: function(width){
    	var td = document.createElement('td');
    	if(width)
    		td.style.width = width;  
    	td.innerHTML = this.createSpacer();
    	return td;
    },
    
    /**
     * spacer needed between buttons
     */
    createSpacer: function(){
    	
    	var spacerDiv = document.createElement('div');
    	spacerDiv.className = "ytb-spacer";
    	
    	return spacerDiv.outerHTML;
    },
    
    /**
     * red/black picker
     */
   	createColorElement: function(className, color, customColorId, fn){
    	var td = document.createElement('td');
    	td.className =  className;
    	td.addEventListener("click", changeRedlineColor.createDelegate(td, [color, customColorId, fn]));
    	td.innerHTML = this.createSpacer();
    	return td;
   	},

   	createFontElement: function(type){
    	var td = document.createElement('td');
    	
    	
    	var fontInput = document.createElement('input');
    	fontInput.id = "redline_" + type + "Font";
    	fontInput.src = "/archibus/schema/ab-core/graphics/icons/view/a-" + type + ".png";
    	fontInput.className = "image";
    	fontInput.type = "image";
    	td.appendChild(fontInput);

    	var control = this.control;
    	if(type == 'large'){
    		td.width =  '6%';
    		td.addEventListener("click", changeRedlineFont.createDelegate(td, [control, true]));
    	} else {
    		td.width =  '8%';
        	td.addEventListener("click", changeRedlineFont.createDelegate(td, [control, false]));
    	}
    	td.style="padding-top: 5px";
    	
    	return td;
   	},
   	
   	/**
   	 * custom picker with color selector
   	 */
   	createCustomElement: function(customStyle, customColorId, customInputStyle, fn){
   		var td = document.createElement('td');
    	td.style =  customStyle;
    	
    	var colorInput = document.createElement('input');
    	colorInput.id = customColorId;
    	colorInput.className = "color {valueElement: 'redlineColorValue'}";
    	//colorInput.setAttribute("autoComplete", "off");
    	colorInput.style = customInputStyle;
    	
    	td.appendChild(colorInput);

   		var colorValueInput = document.createElement('input');
    	colorValueInput.id = "redlineColorValue";
    	colorValueInput.type = "hidden";
    	colorValueInput.setAttribute("value", "#FF0000");
    	colorValueInput.setAttribute("onchange", "changeRedlineColor(this, '" + customColorId + "', " + fn + ")");
    	td.appendChild(colorValueInput);
    	
    	return td;
    	
   	},
   	
   	updateCustomColor: function(colorValue){
   		if(!colorValue)
   			return;
   		
   		var colorElement = document.getElementById(this.config.customColorId);
   		if(colorElement){
   			colorElement.style.color = "#FFFFFF";
   			colorElement.style.backgroundColor = colorValue;
   		}	
   	}
   	
});

/**
 * event for change redline color.
 * 
 * @param color new color
 * @param customColorId  custom color picker id
 * @param fn function to call after color changes (i.e. setCurrentColor)
 */
function changeRedlineColor(color, customColorId, fn){

	if(!color)
		return;
	
	var colorValue;
	if(typeof color == 'string'){
		colorValue = color;
	} else {
		colorValue = color.value;
	}

	fn(colorValue);
	var colorElement = document.getElementById(customColorId);
	colorElement.style.color = "#FFFFFF";
	colorElement.style.backgroundColor = colorValue;
}

function changeRedlineFont(control, isIncrease, scale){
	control.setCurrentFontSize(isIncrease);
	
	var scaleSpan = document.getElementById("redlineScale");
	scaleSpan.textContent = parseInt(control.currentFontSize*100/10) + "% ";
}

