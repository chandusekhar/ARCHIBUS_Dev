
function drawPlotLines() {
    var chart = View.getControl('', 'chartPlot_chart');
    
    // draw a line from point 1 to point 2
	chart.addLine(
			'1 HARRISON PARK', 6000000,		// point 1 
			'OLD CITY', 7000000, 			// point 2
			0xFF0000, 						// color
			'Heating Demand');				// title for legend

	chart.addLine(
			'SCIENCE-PARK-E', 50000000,		// point 1 
			'SMITH PARK', 12000000, 		// point 2
			0x0000FF, 						// color
			'Cooling Demand');				// title for legend
}
