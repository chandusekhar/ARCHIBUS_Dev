/**
 * @author vike
 */
var abGbCertScoreController = View
		.createController(
				'abGbCertScoreController',
				{
					bl_id : '',
					project_name : '',
					cert_std : '',
					cert_cat : '',
					cat_name : '',
					selectIndex:'',
					show_noCalcInstructions : false,
					
                    /**
                     * This event handler is called when user click 'Update Totals' button in title bar of project grid panel
                     */
                    abGbCertScoreProjGrid_onUpdateProjTotalScore: function(){
                        //Call  scoring project wfr
                        try {
                            var result = Workflow.callMethod("AbRiskGreenBuilding-ScoringService-calculateProjectScores");
                            this.showWFRMessage();
                            // refresh all visible panels
                            View.panels.each(function(panel){
                            	if (panel.visible && (panel.type == 'grid' || panel.type == 'form' || panel.type == 'columnReport')) {
                            		var selectedRowIndex = -1;
                            		if (panel.type == 'grid') {
                            			selectedRowIndex = panel.selectedRowIndex;
                            		}
                            		panel.refresh(panel.restriction);
                            		if (selectedRowIndex != -1 && panel.type == 'grid') {
                            			panel.selectRow(selectedRowIndex);
                            		}
                            		
                            	}
                            });
                            
                        } 
                        catch (e) {
                            Workflow.handleError(e);
                        }
                    },

					abGbCertScoreProjForm_onUpdateProj : function() {
						this.callCalculateWFR();
						//Refresh detail project Panel
						var res = "gb_cert_proj.cert_std='" + this.cert_std
								+ "' and gb_cert_proj.project_name='"
								+ this.project_name
								+ "' and gb_cert_proj.bl_id='" + this.bl_id
								+ "'";
						this.abGbCertScoreProjForm.refresh(res);
												
					},
					
					/**
					 *  Hide instructions panel by default
					 */
                    abGbCertScoreProjForm_afterRefresh: function(){
                        //change the align to left for totCapitalCost and totAnnualSaving
                        this.abGbCertScoreProjForm.getFieldElement('gb_cert_proj.tot_capital_cost').style.textAlign = 'left';
                        this.abGbCertScoreProjForm.getFieldElement('gb_cert_proj.tot_annual_savings').style.textAlign = 'left';
                        
                        var scoringType = this.abGbCertScoreProjForm.getFieldValue('gb_cert_std.scoring_type');
                        
                        if (scoringType == 'pnt_tot') {
                       	  var selfscoreString = this.abGbCertScoreProjForm.getFieldValue('gb_cert_proj.totSelfScore');
                       	  var i = selfscoreString.indexOf("(");  // find first ( character
                       	  if (i >= 0) {
                       		selfscoreString = insertGroupingSeparator(''+parseInt(this.abGbCertScoreProjForm.getFieldValue('gb_cert_proj.tot_self_score')),true) + " " + selfscoreString.substr(i);  // concat localized score with rest of original string
                       	  }
                       	  
                       	  var finalscoreString = this.abGbCertScoreProjForm.getFieldValue('gb_cert_proj.totFinalScore');
                       	  i = finalscoreString.indexOf("(");  // find first ( character
                       	  if (i >= 0) {
                       		finalscoreString = insertGroupingSeparator(''+parseInt(this.abGbCertScoreProjForm.getFieldValue('gb_cert_proj.tot_final_score')),true) + " " + finalscoreString.substr(i);  // concat localized score with rest of original string
                       	  }
                       	  
                          this.abGbCertScoreProjForm.getFieldElement('gb_cert_proj.totSelfScore').innerHTML = selfscoreString;
                          this.abGbCertScoreProjForm.getFieldElement('gb_cert_proj.totFinalScore').innerHTML = finalscoreString;
                        }
                        if (this.show_noCalcInstructions) {
                            document.getElementById('abGbCertScoreProjForm_instructions').style.display = '';
                            this.show_noCalcInstructions = false;
                        }
                        else {
                            document.getElementById('abGbCertScoreProjForm_instructions').style.display = 'none';
                        }
                    },
					 
					callCalculateWFR : function(){
                        //change the align to left for totCapitalCost and totAnnualSaving
                        try {
                            var result = Workflow.callMethod("AbRiskGreenBuilding-ScoringService-calculateOneProjectScore", this.bl_id, this.cert_std, this.project_name);
							if (result.data.noCalcInstructions == "true") {
                                this.show_noCalcInstructions = true;
                            }else{
								this.show_noCalcInstructions = false;
							}
							this.showWFRMessage();
						} 
                        catch (e) {
                        }
                     },
					
                     
                     showWFRMessage: function(){
                    	var message = getMessage("msgUpdateTotalsComplete");
                    	View.showMessage(message);
                     },

					/**
					 *  get clicked row object and store values to controller's variables and get a restriction
					 */
					getProjForeign : function() {
						var grid = this.abGbCertScoreProjGrid;
						var num = grid.selectedRowIndex;
						var rows = grid.rows;
						var pro = rows[num];
						var bl_id = pro['gb_cert_proj.bl_id'];
						var proj = pro['gb_cert_proj.project_name'];
						var cert_std = pro['gb_cert_proj.cert_std'];
						this.cert_std = cert_std;
						this.bl_id = bl_id;
						this.project_name = proj;
						res = "  and gb_cert_cat.cert_std='" + cert_std + "'";
						return res;
					},
					
					/**
					 *  get clicked cat object and store values to controller's variables and get a restriction
					 */
					getRes : function() {
						var grid = this.abGbCertScoreCatGrid;
						var num = grid.selectedRowIndex;
						var rows = grid.rows;
						var cat = rows[num];
						var cert_cat = cat['gb_cert_cat.cert_cat'];
						var cat_name = cat['gb_cert_cat.cat_name'];
						this.cert_cat = cert_cat;
						this.cat_name = cat_name;
						res = "1=1 and  gb_cert_credits.cert_cat ='" + cert_cat
								+ "' and  gb_cert_credits.cert_std='"
								+ this.cert_std + "'";

						return res;
					},
					
					abGbCertScoreCreditForm_onSave : function() {
						var max = parseInt(this.abGbCertScoreCreditForm
								.getFieldValue('gb_cert_credits.max_points'));
						var min = parseInt(this.abGbCertScoreCreditForm
								.getFieldValue('gb_cert_credits.min_points'));
						var finalScore = parseInt(this.abGbCertScoreCreditForm
								.getFieldValue('gb_cert_scores.final_score'));
						var selfScore = parseInt(this.abGbCertScoreCreditForm
								.getFieldValue('gb_cert_scores.self_score'));
						if (((finalScore < min) || (finalScore > max))
								&& (finalScore != 0)) {
							View
									.showMessage(getMessage("finalScorevalueValidateMessage"));
							return;
						} else if (((selfScore < min) || (selfScore > max))
								&& (selfScore != 0)) {
							View
									.showMessage(getMessage("selfScorevalueValidateMessage"));
							return;
						} else {
							this.abGbCertScoreCreditForm.save();
							refreshScoreCreditForm(this.selectIndex);
							var res = "gb_cert_proj.cert_std='"
									+ abGbCertScoreController.cert_std
									+ "' and gb_cert_proj.project_name='"
									+ abGbCertScoreController.project_name
									+ "' and gb_cert_proj.bl_id='"
									+ abGbCertScoreController.bl_id + "'";
							
							//refresh abGbCertScoreProjForm 
							abGbCertScoreController.abGbCertScoreProjForm
									.refresh(res);
							refreshCredit();
							replaceType();
						}

					},
					
					/**
					 *  get the score parameter's value
					 */
					getScorePara : function() {
						res = "1=1 and  gb_cert_scores.cert_cat ='"
								+ this.cert_cat
								+ "' and gb_cert_credits.credit_num=gb_cert_scores.credit_num and gb_cert_credits.subcredit_num=gb_cert_scores.subcredit_num and  gb_cert_credits.credit_type=gb_cert_scores.credit_type  and  gb_cert_scores.cert_std='"
								+ this.cert_std
								+ "' and gb_cert_scores.bl_id='" + this.bl_id
								+ "' and  gb_cert_scores.project_name='"
								+ this.project_name + "'";
						return res;
					},
					
					/**
					 *  get the score res
					 */
					getScoreRestriction : function() {
						res = "1=1 and  gb_cert_scores.cert_cat ='"
								+ this.cert_cat
								+ "' and  gb_cert_scores.cert_std='"
								+ this.cert_std
								+ "' and gb_cert_scores.bl_id='" + this.bl_id
								+ "' and  gb_cert_scores.project_name='"
								+ this.project_name + "'";
						return res;
					}

				})
				
/**
 * This event handler is called when user click any row link of the projects grid panel
 */
function onClickProjectRow() {
		
	//Call getProjForeign function which get clicked row object and store values to controller's variables 
	//and return a restriction
	var res = '1=1' + abGbCertScoreController.getProjForeign();

	//refresh abGbCertScoreCatGrid according to restriction
	abGbCertScoreController.abGbCertScoreCatGrid.refresh(res);

	//refresh abGbCertScoreProjForm 
	var projRes = "gb_cert_proj.cert_std='" + abGbCertScoreController.cert_std
			+ "' and gb_cert_proj.project_name='"
			+ abGbCertScoreController.project_name
			+ "' and gb_cert_proj.bl_id='" + abGbCertScoreController.bl_id
			+ "'";
	abGbCertScoreController.abGbCertScoreProjForm.refresh(projRes);
	
	//hide abGbCertScoreCreditGrid Panel and abGbCertScoreCreditForm Panel
	abGbCertScoreController.abGbCertScoreCreditGrid.show(false);
	abGbCertScoreController.abGbCertScoreCreditForm.show(false);
	abGbCertScoreController.abGbCertScoreCreditRpt.show(false);

}

/**
 * Replace The field creditType
 */
function replaceType() {
	var grid = abGbCertScoreController.abGbCertScoreCreditGrid;
	var rows = grid.rows;
	var rs = new Array();
	for ( var i = 0; i <= rows.length - 1; i++) {
		var cred = rows[i];
		var credType = cred['gb_cert_credits.creditType'];
		var type = cred['gb_cert_credits.credit_type'];
		var t = credType.substring(1);
		credType = type + t;
		rs[i] = credType;
	}
	var n = 0;
	abGbCertScoreController.abGbCertScoreCreditGrid.gridRows
			.each(function(row) {
				
				// get the current record and update its value
				var record = row.updatedRecord;
				if (!valueExists(record)) {
					record = row.getRecord();
				}
				record.setValue('gb_cert_credits.creditType', credType);
				
				// store the updated record in the Ab.grid.Row object for pending Save
				row.updatedRecord = record;
				
				// update visible text
				row.cells.get(0).dom.firstChild.innerHTML = rs[n];
				n++;
			});
}

/**
 * This event handler is called when user click any row link of the categories grid panel
 */
function onClickCertCatRow() {
	refreshCredit();
	replaceType();
	abGbCertScoreController.abGbCertScoreCreditForm.show(false);
	abGbCertScoreController.abGbCertScoreCreditRpt.show(false);

}

/**
 * refresh the abGbCertScoreCreditGrid
 */
function refreshCredit() {
	
	//Call getRes function and return a restriction
	var restriction = abGbCertScoreController.getRes();
	
	//Call getScorePara function which get clicked row cat and store values to controller's variable  cat_name
	//and return a restriction
	var res = abGbCertScoreController.getScorePara();
	
	//set value to the 'score' parameter 
	var panel = abGbCertScoreController.abGbCertScoreCreditGrid;
	panel.addParameter('score', res);
	panel.addParameter('res', restriction);
	
	//refresh abGbCertScoreCreditGrid according to restriction 
	panel.refresh();

}

/**
 * This event handler is called when user click any row link of the credit grid panel.
 */
function onClickCreditRow() {
	var grid = View.panels.get('abGbCertScoreCreditGrid');
	var num = grid.selectedRowIndex;
	abGbCertScoreController.selectIndex=num;
	refreshScoreCreditForm(num);
}
function refreshScoreCreditForm(num){

	//get clicked row Credit and get fields values
	var grid = View.panels.get('abGbCertScoreCreditGrid');
	var creditForm = abGbCertScoreController.abGbCertScoreCreditForm;
	var creditRpt = abGbCertScoreController.abGbCertScoreCreditRpt;
	var rows = grid.rows;
	var cred = rows[num];
	var cred_num = cred['gb_cert_credits.credit_num'];
	var credit_type = cred['gb_cert_credits.credit_type.key'];
	var creditTypeText = cred['gb_cert_credits.credit_type'];
	var subcredit_num = cred['gb_cert_credits.subcredit_num'];
	var credit_name = cred['gb_cert_credits.credit_name'];
	var subcredit_name = cred['gb_cert_credits.subcredit_name'];
	var max_points = cred['gb_cert_credits.max_points'];
	var min_points = cred['gb_cert_credits.min_points'];
	var res = abGbCertScoreController.getScoreRestriction()
			+ " and gb_cert_scores.credit_num ='" + cred_num
			+ "' and gb_cert_scores.subcredit_num ='" + subcredit_num
			+ "' and gb_cert_scores.credit_type='" + credit_type + "'";
	var ds = abGbCertScoreController.abGbCertScoreCreditFormDs2;
	ds.addParameter('res', res);
	var record = '' + ds.getRecord();
	
	// if there is a Certification Score record attached to selected Credit, then show that Score record in Credit-Score Form panel 
	if (record != '') {
		creditForm.newRecord = false;
		creditForm.refresh(res);
		creditForm.setFieldValue("gb_cert_credits.credit_type", creditTypeText);
		creditRpt.refresh(res);
    creditRpt.getFieldElement("gb_cert_credits.credit_type").innerHTML = creditTypeText;

		//else show a new Score record in Credit Form, meanwhile fill other information to the fields except for 'self_score','capital_cost', 'final_score','annual_savings'
	} else {
		creditForm.show(true);
		creditForm.newRecord = true;
		creditForm.refresh();
		creditForm.setFieldValue("gb_cert_credits.credit_type", creditTypeText);
		creditForm.setFieldValue("gb_cert_credits.credit_num", cred_num);
		creditForm.setFieldValue("gb_cert_credits.subcredit_num", subcredit_num);
		creditForm.setFieldValue("gb_cert_credits.credit_name", credit_name);
		creditForm.setFieldValue("gb_cert_credits.subcredit_name",subcredit_name);
		creditForm.setFieldValue("gb_cert_cat.cat_name",abGbCertScoreController.cat_name);
		creditForm.setFieldValue("gb_cert_scores.bl_id",abGbCertScoreController.bl_id);
		creditForm.setFieldValue("gb_cert_scores.project_name",abGbCertScoreController.project_name);
		creditForm.setFieldValue("gb_cert_scores.cert_std",abGbCertScoreController.cert_std);
		creditForm.setFieldValue("gb_cert_scores.cert_cat",abGbCertScoreController.cert_cat);
		creditForm.setFieldValue("gb_cert_scores.credit_num", cred_num);
		creditForm.setFieldValue("gb_cert_scores.subcredit_num", subcredit_num);
		creditForm.setFieldValue("gb_cert_scores.credit_type", credit_type);
		creditForm.setFieldValue("gb_cert_credits.min_points", min_points);
		creditForm.setFieldValue("gb_cert_credits.max_points", max_points);

		creditRpt.show(true);
		creditRpt.refresh();
		creditRpt.getFieldElement("gb_cert_credits.credit_type").innerHTML = creditTypeText;
		creditRpt.getFieldElement("gb_cert_credits.credit_num").innerHTML = cred_num;
		creditRpt.getFieldElement("gb_cert_credits.subcredit_num").innerHTML = subcredit_num;
		creditRpt.getFieldElement("gb_cert_credits.credit_name").innerHTML = credit_name;
		creditRpt.getFieldElement("gb_cert_credits.subcredit_name").innerHTML =subcredit_name;
		creditRpt.getFieldElement("gb_cert_cat.cat_name").innerHTML =abGbCertScoreController.cat_name;
		creditRpt.getFieldElement("gb_cert_credits.min_points").innerHTML = min_points;
		creditRpt.getFieldElement("gb_cert_credits.max_points").innerHTML = max_points;

	}	
}
