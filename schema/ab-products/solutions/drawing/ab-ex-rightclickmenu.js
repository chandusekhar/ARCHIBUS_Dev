

// Create controller

var controller = View.createController('ab_ex_rightclickmenu_Controller', {
        afterViewLoad: function() {

        // overrides Grid.onChangeMultipleSelection to load a drawing
        this.ab_ex_rightclickmenuGrid.addEventListener('onMultipleSelectionChange', function(row) {
        	var opts = null;
        	View.panels.get('ab_ex_rightclickmenu_DwgControl').addDrawing(row, opts);
    	});
        	
        this.ab_ex_rightclickmenuGrid.multipleSelectionEnabled = false;
        	
        // Register the 'onload' handler, where the actual right click menu 
        //  creation occurs
        this.ab_ex_rightclickmenu_DwgControl.addEventListener('onload', 
            onLoadHandler);    
	}
});

function onLoadHandler() {
    // Construct the right click menu items

    // Each item consists of the following per array position:
    //  0:  The caption displayed in the right click menu.  Can be localized 
    //      as needed.
    //  1:  The name of the javascript function that handles that right click
    var item0 = { title: "Do Something", handler: "doSomething"};
    var item1 = { title: "Do Something Else", handler: "doSomethingElse"};
    var items = [ item0, item1 ];
				
    View.panels.get('ab_ex_rightclickmenu_DwgControl').setRightClickMenu(items);
}

// A function to handle one of the right click menu items.  
function doSomething(ob) {
    // the value of ob is the primary key of the selected item in the 
    // following form:
    //      [ "value_0", "value_1", "value_n" ]
	if(ob.length > 0){
		alert("Do Something returns primary keys [" + ob[0].value + ", " + ob[1].value + ", "  + ob[2].value + "]");
	} else {
		alert("Do Something with no pks.");
	}
    // Business logic to support the associated right click item will go here.
}

// A function to handle one of the right click menu items.  
function doSomethingElse(ob) {
    alert("Do Something Else.");
}





