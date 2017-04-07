// CHANGE LOG:


// *****************************************************************************
// View controller object for the Info tab.
// *****************************************************************************
// 2012/10 - DC - added to handle vehicle request.

var infoTabController = View.createController('infoTabController', {


	// ************************************************************************
	afterViewLoad: function() {
		this.inherit();
		
		
	},


	afterInitialDataFetch: function() {
	
		var rest = "";
		
		var multirestrict = window.location.parameters['restrict'];
		if (multirestrict)
		{
			//alert(multirestrict);
			var res=multirestrict.split(" ");
			
			for (var i = 0; i < res.length-1; i++) {

				rest = rest + "(bl_id='" + res[i].substring(0, res[i].indexOf("-")) + "' AND fl_id='" + res[i].substring(res[i].indexOf("-")+1) + "') "
				if (i < res.length-2)
				{
					rest = rest + " OR ";
				}
			}
		
			
		} else {
			
			var bl_id = window.location.parameters['blId'];
			var fl_id = window.location.parameters['flId'];
			var rm_id = window.location.parameters['rmId'];
			
			rest = "bl_id='" + bl_id + "' AND fl_id='" + fl_id + "' AND rm_id='" + rm_id + "'";

			
		}
		this.wr_grid.refresh(rest);
		this.hwr_grid.refresh(rest);

	},

	// ************************************************************************
	// After refresh event handler.
	
});


	