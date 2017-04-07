/**
 * @author vike
 */
var abGbCertProjController = View.createController('abGbCertProjController', {
	
	scoreCount: -1,
	
	// fix KB3030485 - disable field gb_cert_proj.cert_std if any gb_cert_scores records exist for the project(Guo 2011/5/6)
	abGbDefRatingProjForm_afterRefresh : function() {

		if (this.scoreCount>0) {
			this.abGbDefRatingProjForm.enableField('gb_cert_proj.cert_std', false);
		}else{
			this.abGbDefRatingProjForm.enableField('gb_cert_proj.cert_std', true);
		}
	},

	/**
	 * This event handler is called by Add New button in Document grid
	 * panel.
	 */
	abGbDefRatingProjGrid_onAddNew : function() {

		// create and show a new record in Project Document edit form
		this.scoreCount = -1;
		var projForm = this.abGbDefRatingProjForm;
		projForm.show(true);
		projForm.newRecord = true;
		projForm.refresh();
		projForm.clear();

	},

	// Process delete action
	abGbDefRatingProjForm_onDelete : function() {

		// If new record, do nothing
		if (this.abGbDefRatingProjForm.newRecord) {
			return;
		}

		// Else retrieve pk value and pop confirm window
		var certProjDS = this.abGbDefRatingProjFormDs;
		var record = this.abGbDefRatingProjForm.getRecord();
		var certStdPK = record.getValue('gb_cert_proj.cert_std');
		var blPK = record.getValue('gb_cert_proj.bl_id');
		var projNamePK = record.getValue('gb_cert_proj.project_name');
		var confirmMessage = getMessage("messageConfirmDelete").replace('{0}',
				certStdPK).replace('{1}', blPK).replace('{2}', projNamePK);
		View.confirm(confirmMessage, function(button) {
			if (button == 'yes') {
				try {
					// confirm to delete: delete record and refresh panels
					certProjDS.deleteRecord(record);
					abGbCertProjController.abGbDefRatingProjForm.show(false);
					abGbCertProjController.abGbDefRatingProjGrid.refresh();
				} catch (e) {
					var errMessage = getMessage("errorDelete");
					View.showMessage('error', errMessage, e.message, e.data);
					return;
				}
			}
		})
	},
	/**
	 * get selectValue restrition.
	 */
	getRes : function() {
		var std = this.abGbDefRatingProjForm
				.getFieldValue('gb_cert_proj.cert_std');
		var res = '';
		if (std != '') {
			res = "gb_cert_levels.cert_std='" + std + "'";
		}
		return res;
	}
});

/**
 * This event handler is called by onclick selectValue of GoalLeve.
 */
function selectGoalLevel() {

	// ordered by min_score ascending
	var sortValues = [];
	sortValues.push( {
		fieldName : 'gb_cert_levels.cert_std',
		sortOrder : 1
	});
	sortValues.push( {
		fieldName : 'gb_cert_levels.min_score',
		sortOrder : 1
	});
	var res = abGbCertProjController.getRes();
	View.selectValue("abGbDefRatingProjForm", '', [ 'gb_cert_proj.goal_level',
			'gb_cert_proj.cert_std' ], 'gb_cert_levels', [
			'gb_cert_levels.cert_level', 'gb_cert_levels.cert_std',
			'gb_cert_levels.min_score' ], [ 'gb_cert_levels.cert_std',
			'gb_cert_levels.cert_level' ], res, null, false, true, null, null,
			null, 'grid', null, toJSON(sortValues));
}

/**
 * This event handler is called by onclick selectValue of certified_level.
 */
function selectCertLevel() {

	// ordered by cert_std and min_score ascending
	var sortValues = [];
	sortValues.push( {
		fieldName : 'gb_cert_levels.cert_std',
		sortOrder : 1
	});
	sortValues.push( {
		fieldName : 'gb_cert_levels.min_score',
		sortOrder : 1
	});
	var res = abGbCertProjController.getRes();
	View.selectValue("abGbDefRatingProjForm", '', [
			'gb_cert_proj.certified_level', 'gb_cert_proj.cert_std' ],
			'gb_cert_levels', [ 'gb_cert_levels.cert_level',
					'gb_cert_levels.cert_std', 'gb_cert_levels.min_score' ], [
					'gb_cert_levels.cert_std', 'gb_cert_levels.cert_level' ],
			res, null, false, true, null, null, null, 'grid', null,
			toJSON(sortValues));
}

function setScoreCount(){
	var grid = abGbCertProjController.abGbDefRatingProjGrid;
	var row = grid.rows[grid.selectedRowIndex];
	abGbCertProjController.scoreCount = row['gb_cert_proj.score_count'];
}
