var abGbDefFpEgrid_ctrl = View.createController('abGbDefFpEgrid_ctrl',{
	
	
	versionType:'gb_fp_egrid_subregions',
	versionName:null,
	versionRestriction:new Ab.view.Restriction(),
	
	afterInitialDataFetch: function(){
		customizeUnitField(this.abGbDefFpEgridSubRegnEdit_form, "gb_fp_egrid_subregions.co2_units", "EGRID CO2 EMISSIONS");
		customizeUnitField(this.abGbDefFpEgridSubRegnEdit_form, "gb_fp_egrid_subregions.ch4_n2o_units", "EGRID CH4-N2O EMISSIONS");		
	},

	
	
	/**
	 * Event handler for 'Save' action from 'abGbDefFpEgridVersEdit_grid' panel.
	 */
	abGbDefFpEgridVersEdit_form_onSave:function(){
		
		this.abGbDefFpEgridVersEdit_form.setFieldValue('gb_fp_versions.version_type',this.versionType);
		this.abGbDefFpEgridVersEdit_form.save();
		this.abGbDefFpEgridVersList_grid.refresh();
	},
	
	/**
	 * Event handler for 'Save' action from 'abGbDefFpEgridSubRegnEdit_form' panel.
	 */
	abGbDefFpEgridSubRegnEdit_form_onSave:function(){
		this.abGbDefFpEgridSubRegnEdit_form.fields.get("gb_fp_egrid_subregions.co2").clear();
		this.abGbDefFpEgridSubRegnEdit_form.fields.get("gb_fp_egrid_subregions.ch4").clear();
		this.abGbDefFpEgridSubRegnEdit_form.fields.get("gb_fp_egrid_subregions.n2o").clear();
		this.abGbDefFpEgridSubRegnEdit_form.setFieldValue('gb_fp_egrid_subregions.version_type',this.versionType);
		this.abGbDefFpEgridSubRegnEdit_form.setFieldValue('gb_fp_egrid_subregions.version_name',this.versionName);
		
		
		if(this.abGbDefFpEgridSubRegnEdit_form.canSave()){
			
			// convert user entry  for co2_entry, ch4_entry and n2o_entry
			if(!convertUserEntry(this.abGbDefFpEgridSubRegnEdit_form, "gb_fp_egrid_subregions.co2_entry", "gb_fp_egrid_subregions.co2", "gb_fp_egrid_subregions.co2_units", "gb_fp_egrid_subregions.co2_units_type")){
				return;
			}
			if(!convertUserEntry(this.abGbDefFpEgridSubRegnEdit_form, "gb_fp_egrid_subregions.ch4_entry", "gb_fp_egrid_subregions.ch4", "gb_fp_egrid_subregions.ch4_n2o_units", "gb_fp_egrid_subregions.ch4_n2o_units_type")){
				return;
			}
			if(!convertUserEntry(this.abGbDefFpEgridSubRegnEdit_form, "gb_fp_egrid_subregions.n2o_entry", "gb_fp_egrid_subregions.n2o", "gb_fp_egrid_subregions.ch4_n2o_units", "gb_fp_egrid_subregions.ch4_n2o_units_type")){
				return;
			}
			
			this.abGbDefFpEgridSubRegnEdit_form.save();
			this.abGbDefFpEgridSubRegnList_grid.refresh(abGbDefFpEgrid_ctrl.versionRestriction);
		}
	},
	
	
	/**
	 * Listener for 'Delete' action button , from 'abGbDefFpEgridSubRegnEdit_form' panel.
	 */
	abGbDefFpEgridSubRegnEdit_form_onDelete: function(){
		this.commonDelete(this.abGbDefFpEgridSubRegnList_grid, this.abGbDefFpEgridSubRegnEdit_form);
	},
	
	/**
	 * Listener for 'Delete' action button , from 'abGbDefFpEgridSubRegnEdit_form' panel.
	 */
	abGbDefFpEgridZipCodeEdit_form_onDelete: function(){
		this.commonDelete(this.abGbDefFpEgridZipCodesList_grid, this.abGbDefFpEgridZipCodeEdit_form);
	},
	
	
	
	/**
	 * 
	 * The common functionality for 'Delete' actions from all the form panels.
	 * 
	 * @param {Object} listPanel - the grid panel which will refreshed after the 'deleteRecord' action.
	 * @param {Object} editPanel - the form panel which contains the record that will be deleted.
	 */
	commonDelete:function(listPanel, editPanel){
		View.confirm(getMessage('confirm_delete'), function(button){
            if (button == 'yes') {
                try {
                    editPanel.deleteRecord();
					editPanel.show(false);
                    listPanel.refresh();
                } 
                catch (e) {
                    var message = String.format(getMessage('error_delete'));
                    View.showMessage('error', message, e.message, e.data);
                }
                
            }
        });
	}
	
});

/**
 * onClick event handler for rows of 'abGbDefFpEgridVersList_grid' grid panel.
 * 
 * @param {Object} row
 */

function onClickVersionsGrid(row){
	
	//hide panels
	abGbDefFpEgrid_ctrl.abGbDefFpEgridSubRegnEdit_form.show(false);
	abGbDefFpEgrid_ctrl.abGbDefFpEgridZipCodesList_grid.show(false);
	abGbDefFpEgrid_ctrl.abGbDefFpEgridZipCodeEdit_form.show(false);
	
	//set versionName
	abGbDefFpEgrid_ctrl.versionName = row['gb_fp_versions.version_name'];
	
	//set versionRestriction
	abGbDefFpEgrid_ctrl.versionRestriction.addClause('gb_fp_egrid_subregions.version_name', row['gb_fp_versions.version_name'], '=', 'AND', true);

	//show panels
	abGbDefFpEgrid_ctrl.abGbDefFpEgridVersEdit_form.newRecord=false;
	abGbDefFpEgrid_ctrl.abGbDefFpEgridVersEdit_form.refresh(abGbDefFpEgrid_ctrl.versionRestriction);
	abGbDefFpEgrid_ctrl.abGbDefFpEgridSubRegnList_grid.refresh(abGbDefFpEgrid_ctrl.versionRestriction);
	
	
}


/**
 * onClick event handler for rows of 'abGbDefFpEgridVersList_grid' grid panel.
 * 
 * @param {Object} row
 */

function onClickZipCodes(row){
	
	//hide panels
	abGbDefFpEgrid_ctrl.abGbDefFpEgridVersEdit_form.show(false);
	abGbDefFpEgrid_ctrl.abGbDefFpEgridSubRegnEdit_form.show(false);
	abGbDefFpEgrid_ctrl.abGbDefFpEgridZipCodeEdit_form.show(false);
	
	//show restricted 'abGbDefFpEgridZipCodesList_grid' grid panel
	var restriction = new Ab.view.Restriction();
	restriction.addClause('gb_fp_egrid_zip.version_name', row['gb_fp_egrid_subregions.version_name']);
	restriction.addClause('gb_fp_egrid_zip.subregion_code', row['gb_fp_egrid_subregions.subregion_code']);
	abGbDefFpEgrid_ctrl.abGbDefFpEgridZipCodesList_grid.refresh(restriction);
	
}

/**
 * afterRefresh event handler for 'abGbDefFpEgridSubRegnEdit_form' grid panel
 */

function abGbDefFpEgridSubRegnEdit_form_afterRefresh(){
	
	// show 'Delete' action
	abGbDefFpEgrid_ctrl.abGbDefFpEgridSubRegnEdit_form.actions.get('delete').show(true);
	
}



