/*
 * AFM Custom Progress Report class
 * 
 */

Ab.namespace('paginate');

Ab.paginate.BaseReport = Base.extend({	

	// the panel object that the progress/result report resides
    panel: null,
    
    // JSON map tp hold the job progresses/results for all job statuses
    result: null,
    
    constructor: function(panel, result) {
   		//set the progress panel object
		this.panel = panel;
	
		this.result = result;
		
    },
   	
	removeHeader: function(){   
		// remove the header to avoid the space bar
	    var oHeader = this.panel.getTableHeadElement();
	   	oHeader.parentNode.removeChild(oHeader);
	},
	
	removeFooter: function(){
		// remove the footer to avoid "Not all record can be shown" message
	    var oFooter = this.panel.tableFootElement;
	    
	    if(oFooter==null){
	    	return;
		}
			    
	   	while (oFooter.firstChild) 
		{
		    //The list is LIVE so it will re-index each call
		    oFooter.removeChild(oFooter.firstChild);
		 };
	},
	
	addFooter: function(colSpan, content){
		var oFooter = this.panel.tableFootElement;
		var oTr = this.insertChild(oFooter, "tr", {height:"25px"});
		var oTd = this.insertChild(oTr, "td", null, "");
		if(oTd!=null){
			oTd.colSpan = colSpan;
		}
		
		oTr = this.insertChild(oFooter, "tr", {"class":"instruction"});
		oTd = this.insertChild(oTr, "td", null, "<i>" + content + "</i>");
		if(oTd!=null){
			oTd.colSpan = colSpan;
		}
	},
	
	getValidDataResult: function(index, data){
		if(typeof(data.jobId) == 'undefined'){
			return data[index];
		} else {
			return data;
		}
		return data;
	},

	insertChild: function(oParent, childTag, params, innerHTML, oTrAfter){
		if(oParent==null){
			return null;
		}
	
		var oChild = document.createElement(childTag);
	
		if( typeof(params) !== 'undefined' && params != null) {
			for(key in params){
				oChild.setAttribute(key, params[key]);
			}
		}
				
		if( typeof(innerHTML) !== 'undefined' && innerHTML != null) {
			oChild.innerHTML = innerHTML;
		}
		
		if( typeof(oTrAfter) !== 'undefined') { 
			oParent.insertBefore(oChild, oTrAfter);
		} else {
			oParent.appendChild(oChild);
		}
	
		return oChild;
	},

    // @begin_translatable
    REPORT_GENERATING: 'Still Generating...',
	REPORT_USELINK_PREVIEW_MESSAGE: 'Use these links to preview portions of the report as it generates.'
	// @end_translatable

});

