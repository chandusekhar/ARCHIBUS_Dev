function updateCostPback(panel){
	var form = View.panels.get(panel);
	var cFim = form.getFieldValue("activity_log.cost_fim");
	var cAnnual = form.getFieldValue("activity_log.cost_annual_save");
	if (valueExistsNotEmpty(cFim) && valueExistsNotEmpty(cAnnual)){
		var cPback = parseFloat(cFim)/parseFloat(cAnnual);
		form.setFieldValue("activity_log.cost_payback", cPback.toFixed(2));
	}
}