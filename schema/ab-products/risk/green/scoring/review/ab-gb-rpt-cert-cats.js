

var abGbRptstdTypeController = View.createController('abGbRptstdTypeController',{
	
   // Export  restriction data to paginatedRport when click Doc button
   abGbRptCertCatConsole_onDoc: function(){
   	var reportViewName = "ab-gb-rpt-cert-cats-paginate.axvw";
		var console=this.abGbRptCertCatConsole;
		var certStd;
		var stdType;
		var printableRestrictions = [];
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

	
	