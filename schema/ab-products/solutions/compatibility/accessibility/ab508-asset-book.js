/*********************************************************************
 JavaScript File: ab-asset-book.js
 Constantine Kriezis
 Modified: Cristina Moldovan 10.28.2009 for view conversion to 2.0
 *********************************************************************/

function updateEqstdRecord(form)
{
	updateRecord(form.getFieldValue('eqstd.image_file').toLowerCase());
}

function updateFnstdRecord(form)
{
	updateRecord(form.getFieldValue('fnstd.image_file').toLowerCase());
}

function updateRecord(imageFile)
{
	var img	= document.getElementById("img1");

	if (imageFile != "")
	{
		img.src = View.project.projectGraphicsFolder + '/' + imageFile;
		img.alt = imageFile;
	}
	else
	{
		img.src = "";
		img.alt = getMessage('noimage');
	}
}