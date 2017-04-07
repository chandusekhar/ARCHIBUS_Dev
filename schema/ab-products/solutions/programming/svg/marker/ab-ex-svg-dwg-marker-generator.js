var markerGenerator = View.createController('generator', {
		
	generate: function(){
		
		var previewEl = document.getElementById('preview');
		var fileEl = document.getElementById('inLocalFileBrow');
		
		// check file extension
		var fileName = fileEl.value;
		var filePath = fileEl.value.toLowerCase();
		var	fileExt = filePath.substr(filePath.lastIndexOf('.') + 1);
		
		if(fileExt!='svg'){
			alert(getMessage('invalidFormat')); 
			return;
		}
		
		// read image
		var file = document.getElementById('inLocalFileBrow').files[0];
		var reader  = new FileReader();
		
		reader.onloadend = function () {
			previewEl.src = reader.result;
			document.getElementById('markerValue').value = reader.result;
			document.getElementById('fileSize').innerHTML = file.size;
		}
		
		// preview
		if (file) {
			console.log(file)
			reader.readAsDataURL(file);
		} else {
			previewEl.src = "";
		}		
	}
});




