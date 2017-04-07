

var abGbRptstdController = View.createController('abGbRptstdController',{
	
   // Export  restriction data to paginatedRport when click Doc button
	abGbRptStdConsole_onDoc: function(){
   	var reportViewName = "ab-gb-rpt-cert-std-paginate.axvw";
		var console=this.abGbRptStdConsole;
		var printableRestrictions = [];
		var certStd;
		var stdType;
		 certStd=console.getFieldValue('gb_cert_std.cert_std');
		 stdType=console.getFieldValue('gb_cert_std.std_type');
		 if(certStd==''){
			 certStd=" is not null";
		 }else{
			 printableRestrictions.push({'title': getMessage('certStd'), 'value': certStd});
			 certStd="='"+certStd+"'";
		 } 
		 if(stdType==''){
			 stdType=" is not null";
		 }else{
			 printableRestrictions.push({'title': getMessage('stdType'), 'value': stdType});
			 stdType="='"+stdType+"'";
		 }
		//paired parameter names with parameter values
		var parameters = {
				'stdCertStd':certStd,
				'stdStdType':stdType,
				'printRestriction':true, 
				'printableRestriction':printableRestrictions
		};
		//passing parameters
		View.openPaginatedReportDialog(reportViewName, null, parameters);
        }
	})

	
	