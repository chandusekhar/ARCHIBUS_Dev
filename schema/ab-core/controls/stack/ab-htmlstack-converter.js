var StackConverter = Base.extend({
	
  constructor: function(controlId, configObject) {
	  this.inherit(controlId, 'htmlStack', configObject);
  },

/**
 * Converts group data returned from our getRecords structure to the one that is needed for the stack.  May be ported to the .java side.
 * @param records
 * @param stackNumber
 * @param stackControl
 * @param colorArray
 * @returns {Array}
 */
convertData: function(records, stackNumber, stackControl, colorArray, colorMapping, bSortRecords) {

	var data = [];
	var maxValuesLength = 0,
		flField = stackControl.groupDataSourceConfig['floorField'],			// gp.fl_id
		xField = stackControl.groupDataSourceConfig['sortOrderField'],		// gp.sort_order
		yField = stackControl.groupDataSourceConfig['areaField'],			// gp.area_manual
		colorField = stackControl.groupDataSourceConfig['highlightField'],	// dv.hpattern_acad
		labelField = stackControl.groupDataSourceConfig['groupLabels'],		// gp.dv_id 
		allocationTypeField = stackControl.groupDataSourceConfig['allocationTypeField'],  // gp.allocation_type
		groupField = stackControl.groupDataSourceConfig['groupField']		// gp.gp_id
	
	// consolidate floors
	if (typeof records !== 'undefined') {
		
		//sort the group records by bl_id, fl.sort_order, fl_id, and gp.sort_order
		if (bSortRecords === true) {
			cmp = function(x, y){
			    return x > y ? 1 : x < y ? -1 : 0; 
			};
			
			records.sort(function(a, b){
			    return cmp( 
			        [cmp(a['gp.bl_id'], b['gp.bl_id']), cmp(a['fl.sort_order'], b['fl.sort_order']), -cmp(a['gp.fl_id'], b['gp.fl_id']), cmp(a['gp.sort_order'], b['gp.sort_order'])], 
			        [cmp(b['gp.bl_id'], a['gp.bl_id']), cmp(b['fl.sort_order'], a['fl.sort_order']), -cmp(b['fl.fl_id'], a['fl.fl_id']), cmp(b['gp.sort_order'], a['gp.sort_order'])]
			    );
			});			
		}		

    	if (typeof Hpattern == 'function') {
        	var hpattern = new Hpattern();
    		var recordsNew = [];
    		for (var i=0; i<records.length; i++) {
        		var record = records[i];
        		var color = "";
        		var allocationType = (record[allocationTypeField + '.raw']) ? record[allocationTypeField + '.raw'] : record[allocationTypeField];        		
        		// recycle colors if the array runs out
        		if (colorArray.length == 0) {
        			colorArray = stackControl.areaColorAllocatedList.slice().reverse();
        		}

        		if (allocationType == 'Unavailable - Vertical Penetration Area') {
        			color = stackControl.areaColorUnavailableVerticalPentration;
        			//color = "#484848";
        		} else if (allocationType == 'Unavailable - Service Area'){
        			color = stackControl.areaColorUnavailableSupportSpace;
        			//color = "#787878";
        		} else if (allocationType == 'Unavailable - Remaining Area'){
        			color = stackControl.areaColorUnavailableRemaining;
        			//color = "#999999";
        		} else if (allocationType == 'Unavailable Area'){
        			color = stackControl.areaColorUnavailable;
        			//color = "#B0B0B0";
        		} else if (allocationType == 'Usable Area - Leased'){
        			color = stackControl.areaColorAvailableLeased;
        			//color = "#ffffff";
        		} else if (allocationType == 'Usable Area - Owned'){
        			color = stackControl.areaColorAvailableOwned;
        			//color = "#ffffff";
        		//} else if (allocationType == 'Allocated Area'){
        		} else {
            		//color = '#' + hpattern.getColor(record['dv.hpattern_acad']);
        			color = '#' + hpattern.getColor(record[colorField]);
        			
        			// if have not been assigned a color
        			if (color == '#cccccc' || record[colorField].match(/[a-z]/i)) { 
        				
        				// check the color mapping to see if a color has been previously assigned
        				if (colorMapping.hasOwnProperty(record[groupField])) {
        					color = colorMapping[record[groupField]];
        				} else {
        					
        					// otherwise, take one out of the color array
            				color = colorArray.pop();
            				colorMapping[record[groupField]] = color;        					
        				}
        			} 
        		}
        		
        		//record['dv.hpattern_acad'] = color;
        		record[colorField] = color;
        		
        		recordsNew.push(record);
        	}
    		records = recordsNew;    		
    	}    	
	
		
		var floorId = '';
		for (var i=0; i<records.length; i++) {
			var record = records[i];
			var graph = {
					//row: data.length,
					x:	Number(record[xField]),
					y: record.hasOwnProperty(yField + ".raw") ? Number(record[yField + ".raw"]) : Number(record[yField].replace(strGroupingSeparator, "")),
					color: record[colorField],
					label: record[labelField],
					recordNumber: i,
					stackNumber: stackNumber
				};
	
			for (var key in record) {
				graph[key] = record[key];
			}
			
			if (floorId != record[flField]) {
				var obj = {'key': records[i][flField],
				 		   'name': records[i][stackControl.groupDataSourceConfig['floorNameField']]
						  };
				graph['row'] = data.length;
				graph['col'] = 0;
				obj.values = [graph];

				data.push(obj);
				floorId = record[flField];
			} else if (floorId == record[flField]) {
				var obj = data[data.length-1];
				graph['row'] = data.length-1;
				graph['col'] = obj.values.length;
				obj.values.push(graph);
			}
			
			if (obj.values.length > maxValuesLength) {
				maxValuesLength = obj.values.length;
			}
			
		}		
	}
		
	// pad values according to maxValuesLength
	for (var i=0; i<data.length; i++) {
		var datum = data[i];
		var currentLength = datum.values.length;
		for (var j=0; j< Number(maxValuesLength-currentLength); j++) {
			if (currentLength < maxValuesLength) {
				datum.values.push({
					'row': i,
					'col': currentLength + j,
					'x': -1000,
					'y': 0,
					'gp.bl_id': data[i].values[0]['gp.bl_id'],
					'gp.fl_id': data[i].values[0]['gp.fl_id'],
					'paddedData': true,
					'color': 'green'				
				});
			}
		}
	}

	return data;	
}

});
