var emNameLabelConfig = {lengthLimit : 50, textTemplate : "<span style='color:#FF0000;'>{0}</span>", nameFieldTemplate : "{0}<br/>{1}<br/>{2}",
        textColor : "#000000", defaultValue : "", raw : false };
		
var reservationAdminController = View.createController('reservationAdminController', {

	  afterViewLoad: function(){
			this.wr_subwork_grid.restriction="1=2"
			if ( this.view.parameters.wo!=""){
				this.wr_subwork_grid.restriction="wr.wr_id<>" + this.view.parameters.wr + " and wr.wo_id=" + this.view.parameters.wo
				this.wr_other_grid.addParameter('wrID',  this.view.parameters.wr);
				this.wr_other_grid.addParameter('woID',  this.view.parameters.wo); 
				
			}
			else {
				this.wr_other_gridv
				this.wr_subwork_grid.show(false,true)
			}
			
			
		this.createWR_OtherGrid()
		this.createWR_SubGrid()
	},
	
	createWR_SubGrid :function(){
		this.wr_subwork_grid.afterCreateCellContent = function(row, col, cellElement) {
			
			if (col.id === "cancel") {
				switch(row["wr.status.raw"]){
					case "Rej":
					case "Clo":
					case "Com":
					case "FWC":
					case "Can":
						cellElement.style.visibility = "hidden";
						break
					//case "Can":
					//	cellElement.firstChild.value="Reopen"
					//	break
					
				}
					
			}
		};
		
	},

	createWR_OtherGrid :function(){
		this.wr_other_grid.afterCreateCellContent = function(row, col, cellElement) {
			
			if (col.id === "wr_other.units_used") {
				if (parseInt(row["wr_other.seq2.raw"]) > 1){
				}
				else {
					
					
					if (row["wr_other.seq1.raw"] === "0"){
						//make background dark blue and font white and font bold
						row.row.dom.style.cssText += ";background:#003DF5;font-weight:bold;color:white;";
					}
					else if (row["wr_other.seq2.raw"] === "0"){
						//make background light blue and font bold
						 row.row.dom.style.cssText += ";background:#CCCCCC;font-weight:bold;";
					}
					else if (row["wr_other.seq2.raw"] === "1"){
						//make background dark silver and font bold
						 row.row.dom.style.cssText += ";background:#E0E0E0;font-weight:bold;";
						
					}
				}
			}
        };
		
	},
	  
	  afterInitialDataFetch: function() {
	  //hide Save button if the status is completed
	   var stat = this.reservations_form.getFieldValue("wr.status");
		if (!(stat === 'A' || stat=='Rev' || stat=='AA')) {

	     //  this.reservations_form.actions.get('save').show(false);
		   this.reservations_form.actions.get('cancel').show(false);
		   //hide vertical bars of buttons - separators
		   var allButtonSeparators = Ext.DomQuery.select("*[class = ytb-sep]");
	       for (var i=0; i< allButtonSeparators.length; i ++ )
	       allButtonSeparators[i].style.display = "none";
	   }
	  },
	 
	  reservations_form_onCancel: function(){
		this.reservations_form.setFieldValue('wr.status','Can')
		this.reservations_form.save()
		
		View.getOpenerView().panels.get('reservations_grid').refresh()
		View.closeThisDialog();
		
	  },
	  wr_subwork_grid_view_onClick: function(row){
	   
		   var rowRecord = row.getRecord();
		   var wr_id = row.getRecord().getValue('wr.wr_id');
		   
			window.open('uc-wr-manager-printCFVehicle.axvw?handler=com.archibus.config.ActionHandlerDrawing&wr.wr_id='+wr_id, 'newWindow', 'width=800, height=600, resizable=yes, toolbar=no, location=no, directories=no, status=no, menubar=no, copyhistory=no');

	   
	},
	  reservations_form_afterRefresh: function() {
		BRG.UI.addNameField('wr_driver_info', this.reservations_form, 'wr.driver', 'em', ['name_first','name_last','phone','email'], {'em.em_id' : 'wr.driver'}, emNameLabelConfig);
		BRG.UI.addNameField('wr_requestor_info', this.reservations_form, 'wr.requestor', 'em', ['name_first','name_last','phone','email'], {'em.em_id' : 'wr.requestor'}, emNameLabelConfig);
		BRG.UI.addNameField('wr_budgetowner_info', this.reservations_form, 'wr.budget_owner', 'em', ['name_first','name_last','phone','email'], {'em.em_id' : 'wr.budget_owner'}, emNameLabelConfig);
	
		
		
    }
})


	
