var dashDefLayoutController = View.createController('dashDefLayout',{
	image:null,
	layout:null,
	dashboardLayoutPanel_onNext: function(){
		this.saveData();
		View.controllers.get('dashDefWizard').navigateToTab('page3');
	},
	loadImages: function(){
		var images = document.getElementsByName("layout_image");
		for (var i=0;i<images.length;i++){
				images[i].src = View.contextPath + '/schema/ab-core/system-administration/dashboard-definition/thumbnails/' + images[i].id;
		}
	},			
	restoreSelection: function(){
		this.layout = this.tabs.wizard.getDashboardLayout();
		this.image = this.tabs.wizard.getDashboardImage();
		var layoutObj = document.getElementsByName("viewPattern");
		for(var i=0;i<layoutObj.length;i++){
			layoutObj[i].checked = false;
			if(this.layout == layoutObj[i].value){
				layoutObj[i].checked = true;
				break;
			}
		}
	},
	saveData: function(){
		if(this.image != null){
			this.tabs.wizard.setDashboardLayout(this.layout);
			this.tabs.wizard.setDashboardImage(this.image);
		}
	}
})

function setViewPattern(){
	var layouts = document.getElementsByName("viewPattern");
	for(var i=0;i<layouts.length;i++){
		if (layouts[i].checked) {
			dashDefLayoutController.layout = layouts[i].value;
			var crtimage = layouts[i].value.substr(0, layouts[i].value.length-4);
			crtimage = 'ab-'+crtimage +'gif';
			crtimage = 'thumbnails/'+crtimage;
			dashDefLayoutController.image = crtimage;
			break;
		}
	}
}
