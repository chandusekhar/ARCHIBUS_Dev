var projFcpmDashQcPkgsDtlController = View.createController('projFcpmDashQcPkgsDtl',{
	
	afterViewLoad: function(){	
		this.inherit();

		var grid = this.projFcpmDashQcPkgsDtl_cps;
		
		grid.afterCreateCellContent = function(row, column, cellElement) {
        	var exceeds_max = row['work_pkgs.exceeds_max'];
			if (exceeds_max == '1')	{
				cellElement.style.background = '#FF8B73';//Red
			}
			else {
				cellElement.style.background = 'transparent';
			}
        }
		grid.showColumn('work_pkgs.exceeds_max', false);
    }
});

