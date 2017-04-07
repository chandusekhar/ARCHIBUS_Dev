var viewDocumentController = View.createController('viewDocument',{

	afterInitialDataFetch: function(){
		
		document.getElementById("viewDocumentPanel").innerHTML = this.dsViewDocument.getRecord().getValue('afm_docvers.file_contents');

	}
})