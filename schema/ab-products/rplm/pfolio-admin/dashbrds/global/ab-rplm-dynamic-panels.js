function dynamicPanelMap(panelId) {
	
	this.usesDynamicPanels = "no";  // ("no", "org", "loc", "all")
	this.org = [false,false,false,false];
	this.loc = [false,false,false,false];
	this.panelId = panelId;		
	
	this.initialize = function(){
		var i=1;		
		var panelCode = this.panelId.split('|'); // example id="occupancyBySite|all2" panelCode = "all2"
		if (panelCode[i] == undefined){
			return;
		}
		else if (panelCode[i].indexOf('all') != '-1'){
			this.usesDynamicPanels = 'all';			
		}
		else if (panelCode[i].indexOf('org') != '-1'){
			this.usesDynamicPanels = 'org';			
		}
		else if (panelCode[i].indexOf('loc') != '-1'){
			this.usesDynamicPanels = 'loc';			
		}			
		
		var activeLevels = panelCode[i].substring(3);
		var activeMethod = this.usesDynamicPanels;		
			
		for (var i=0; i<activeLevels.length; i++ ){
			var activeLevel = activeLevels.charAt(i);
			switch(activeMethod){
				case 'all':
					this.org[activeLevel] = true;
					this.loc[activeLevel] = true;
					break;
				case 'org':
					this.org[activeLevel] = true;
					break;
					
				case 'loc':
					this.loc[activeLevel] = true;				
				
			}
		}				
		
	};
	this.isVisible = function(method,thisLevel){
		if (method == 'org'){
			if (this.usesDynamicPanels == "no" || this.usesDynamicPanels == 'loc'){
				return true;
			}
			else if ( this.isOrgVisible(thisLevel) ){
				return true;
			}
			else{
				return false;
			} 			
		}
		else{ // method == 'loc'			
			if (this.usesDynamicPanels == "no" || this.usesDynamicPanels == 'org'){
				return true;
			}
			else if ( this.isLocVisible(thisLevel) ){
				return true;
			}
			else{
				return false;
			}
		}
	};
	this.isOrgVisible = function(thisLevel){
		if (this.org[thisLevel])
			return true;
		else
			return false;
	};
	this.isLocVisible = function(thisLevel){
		if (this.loc[thisLevel])
			return true;
		else
			return false;
	};
}