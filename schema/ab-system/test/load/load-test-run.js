//	This is the current test run.  Do not edit.
var dCurrentTestRun;
var dCurrentRequestTime;

//	Show current pass progress.
function showPassNumber( )
{
	var progTarget = document.getElementById( 'progressPromptForView' );
	progTarget.innerHTML = progTarget.innerHTML + "<BR><BR><B>Pass Number: " + dCurrentTestRun + "  " + Date() + '</B>' ;
	progTarget = null ;
}


//	Show current request time
function showRequestTime( )
{
	var progTarget = document.getElementById( 'progressPromptForView' );
	progTarget.innerHTML = progTarget.innerHTML + "<BR>	Request time: " + dCurrentRequestTime;
	progTarget = null ;
}


//	Show current view within pass number.
function showCurrentViewName( strView )
{
	var progTarget = document.getElementById( 'progressPromptForView' );
	progTarget.innerHTML = progTarget.innerHTML + "<BR>" + dCurrentTestRun + "  " + strView ;
//	document.location=document.location ;
	progTarget = null ;
}



var currentWindow;
var viewIndex = 0;


function loadSeriesOfViews()
{
	// open first window/view
	viewIndex = 0;
	openNextView();
}

function openNextView()
{
	if(viewIndex < strViewNames.length)
	{
		var strView = strUrlRoot + strViewNames[viewIndex];
		showCurrentViewName( strView );

		dCurrentRequestTime = new Date().getTime();

		currentWindow = window.open(strView);
		currentWindow.document.onreadystatechange = onLoadHandler;

		viewIndex++;
	} else {
		if(dCurrentTestRun < dNumberofTestRuns)
		{
			dCurrentTestRun++;
			showPassNumber() ;
			viewIndex = 0;
			openNextView();
		} else {
		}
	}
}

function onLoadHandler()
{
   if (currentWindow.document.readyState=="complete")
   {
	dCurrentRequestTime = new Date().getTime() - dCurrentRequestTime;
	showRequestTime();

	// delay opening next view for 0.2 sec
	setTimeout("currentWindow.close();openNextView();", 200);
   }
}


function runTests()
{
	dCurrentTestRun = 1;
	showPassNumber() ;
	loadSeriesOfViews() ;
}
