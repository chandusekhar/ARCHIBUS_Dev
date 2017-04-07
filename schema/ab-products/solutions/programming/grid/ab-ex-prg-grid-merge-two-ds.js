var gridExampleController = View.createController('gridExample', {
    afterInitialDataFetch: function() {        
        try {      	
      	 //add columns
         var columns=[];
         //XXX:em
         for(var i=0;i<this.prgGridMergeTwoDs_emDs.fieldDefs.items.length;i++){
         	var fieldDef = this.prgGridMergeTwoDs_emDs.fieldDefs.items[i];
         	columns.push(new Ab.grid.Column(fieldDef.id, fieldDef.title, 'text'));
         }
         //XXX: eq
         for(var i=0;i<this.prgGridMergeTwoDs_eqDs.fieldDefs.items.length;i++){
         	var fieldDef = this.prgGridMergeTwoDs_eqDs.fieldDefs.items[i];
         	if(fieldDef.id.indexOf(".bl_id")< 0 && fieldDef.id.indexOf(".fl_id")< 0 && fieldDef.id.indexOf(".rm_id")< 0){
         		columns.push(new Ab.grid.Column(fieldDef.id, fieldDef.title, 'text'));
         	}
         }
        
         //add records
         var rows = [];
         var em_records = this.prgGridMergeTwoDs_emDs.getRecords(null, { recordLimit: 50 });
         var eq_records = this.prgGridMergeTwoDs_eqDs.getRecords(null, { recordLimit: 50 });
          
         for(var i=0;i<em_records.length;i++){
         	var values = em_records[i].values;         	
         	var em_key = values['em.bl_id'] + values['em.fl_id'] + values['em.rm_id'];
         	for(var j=0;j<eq_records.length;j++){
         			var eq_values = eq_records[j].values;
         			var eq_key = eq_values['eq.bl_id'] + eq_values['eq.fl_id'] + eq_values['eq.rm_id'];
         			if(eq_key == em_key){
         				//XXX: merge them together
         				values['eq.eq_id']= eq_values['eq.eq_id'];
         				values['eq.eq_std']= eq_values['eq.eq_std'];
         				eq_records.remove(eq_records[j]); break;
         			}
         	}
         	rows.push(values);
         }
         
         //XXX: rest of records of eq
	     for(var i=0;i<eq_records.length;i++){
	       	var newValues = {};
	        	var values = eq_records[i].values;
	        	for(var name in values){
	        		if(name == 'eq.bl_id'){
	        			newValues['em.bl_id']=values[name];
	        		}else if(name == 'eq.fl_id'){
	        			newValues['em.fl_id']=values[name];
	        		}else if(name == 'eq.rm_id'){
	        			newValues['em.rm_id']=values[name];
	        		}else{
	        			newValues[name]=values[name];
	        		}
	        	}
	        	rows.push(newValues);
	      }
       
       	  //XXX: built into one grid report
          var configObj = new Ab.view.ConfigObject();
          configObj['rows'] = rows;
          configObj['columns'] = columns;
          // create new Grid component instance   
          var grid = new Ab.grid.Grid('prgGridMergeTwoDs_projectReport', configObj);
          grid.build();
            
        } catch (e) { }
    }
});

