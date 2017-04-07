function reSize(){
	try{
			objViewer.width=parent.document.body.clientWidth-30;

			objViewer.height=270;
			window.scrollTo(-100, objViewer.height/2);

	} catch(e){
	}
}
