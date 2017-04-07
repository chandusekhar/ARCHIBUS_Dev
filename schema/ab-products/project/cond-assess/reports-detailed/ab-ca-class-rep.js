var caClassRepController = View.createController('caClassRepCtrl',{
	
	afterViewLoad: function(){
		var gridPanel = this.repClassifications;
		gridPanel.originalCreateCellContent = gridPanel.createCellContent;
		gridPanel.createCellContent = function (row, column, cellElement){
			gridPanel.originalCreateCellContent(row, column, cellElement);
			if (column.id == "csi.description") {
				var padding = "";
				if (valueExistsNotEmpty(row["csi.hier_level_1"])) {
					padding = "20px";
				} else if (valueExistsNotEmpty(row["csi.hier_level_2"])) {
					padding = "40px";
				}else if (valueExistsNotEmpty(row["csi.hier_level_3"])) {
					padding = "60px";
				}
				cellElement.style.paddingLeft = padding;
			}
		}
	},
	
	afterInitialDataFetch: function(){
		/**
		 * remove sorting from grid report 
		 * data come from a hierachy structure 
		 */ 
		this.repClassifications.removeSorting();
	},
	
	/**
	 * show paginated report
	 */
	repClassifications_onPaginatedReport: function(){
		
		View.openPaginatedReportDialog('ab-ca-class-prnt.axvw');
	}
})
