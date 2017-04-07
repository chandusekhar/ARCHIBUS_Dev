/**
 * Created by Meyer on 5/15/2015.
 */

var PageNavReportingConfig = {
    /**
     * capturedCount is the total number of runtime buckets, and pages of buckets, that have been rendered
     * since the last menu trigger event. Must be a global because its incremented in asynchronous callbacks.
     */
    capturedCount: 0,

    /**
     * Flag for whether to include GIS buckets in PPT report.
     * False for Bali4. Truer when fully debugged and verified as robust, particularly in IE.
     */
    includeMapBuckets: false,

    /**
     * Relates bucketId - map object, for accessing a Leaflet bucket's map object.
     * Necessary for LeafletImage reporting plugin.
     */
    bucketMapHash: null
};

/**
 * Menu event handler to Write the app-specific buckets to a report.
 * Capture a screen image of the app-specific buckets and
 * send them as a single array of image strings to the server for being included in a PPT report.
 *
 * @param elem Menu element selected triggering this action.
 * @param event Event triggering this action.
 */
function writeAppSpecificBucketReport(elem, event) {
    var spinner = $('#presentation_job_spinner');
    $(spinner).show();
    var isLeafletImageSafeBrowser = true; // isLeafletImageEnabledBrowser();
    var imagesContainer = {};
    var appSpecificBuckets = $('div.app-specific-bucket');
    var totalImageCount = appSpecificBuckets.length;
    var showMapBuckets = false;
    PageNavReportingConfig.capturedCount = 0;

    // collect all app-specific buckets' properties
    $(appSpecificBuckets).each(function (n) {
        var bucketElement = $(this).parent('.bucket-process');
        var bucketId = $(bucketElement).attr('id');
        var bucketTitle = $(bucketElement).children('h2')[0].innerHTML;
        var isMap = false;

        if ($(bucketElement).find('.pgnav-map').length > 0) {
            showMapBuckets = true;
            isMap = true;
        }

        imagesContainer[bucketId] = {
            index: n,
            title: bucketTitle,
            isMapBucket: isMap,
            images: {}
        };
    });

    // open the app-specific buckets in a dialog if
    // 1) the collection includes a map bucket;
    // 2) the browser is IE > 10, or FF/Chrome/Safari
    if (showMapBuckets && isLeafletImageSafeBrowser && PageNavReportingConfig.includeMapBuckets) {
        $(spinner).hide();
        openAppSpecificReportDialog();
    }
    // else capture all non-map buckets
    else {
        captureReportImages(imagesContainer, totalImageCount);
    }
}

/**
 * Render each app-specific bucket into an image string and add the string(s) to the imagesContainer array.
 *
 * @param imagesContainer
 * @param length
 */
function captureReportImages(imagesContainer, length) {
    var totalImageCount = length;
    for (var bucketIdentifier in imagesContainer) {
        // skip map buckets
        if (imagesContainer[bucketIdentifier].isMapBucket) {
            totalImageCount -= 1;
            continue;
        }

        // test whether bucket has multiple pages and if so add them to the total count.
        var bucketElement = $('#' + bucketIdentifier);
        var pagingControl = $(bucketElement).find('.navi');
        if (pagingControl.length > 0) {
            var pageCount = $(pagingControl).children('a').length;
            totalImageCount = totalImageCount + pageCount - 1;
        }

        captureBucketImage(bucketIdentifier, 0, imagesContainer, totalImageCount);
    }
}

/**
 * Convert the bucket HTML to a canvas using the html2canvas plugin,
 * then convert the canvas to an image string.
 * Append the image string for the bucket, or bucket page, to the provided container.
 *
 * @param bucketId Id property of the bucket being imaged.
 * @param pageIndex Index for the page of the current bucket currently being captured.
 * @param imagesContainer Object holding each bucket's properties including title and image array.
 * @param totalImageCount Number of total pages to be captured.
 */
function captureBucketImage(bucketId, pageIndex, imagesContainer, totalImageCount) {
    try {
        html2canvas($('#' + bucketId), {
            allowTaint: true,
            useCORS: true,
            onrendered: function (canvas) {
                addAdditionalPagesIfNeeded(bucketId, pageIndex, imagesContainer, totalImageCount);
                processCanvasToImageContainer(canvas, bucketId, pageIndex, imagesContainer, totalImageCount);
            }
        });
    }
    catch (e) {
        console.log("Error in call to html2canvas for bucket " + bucketId);
    }
}

/**
 * Test whether bucket has multiple pages and capture the additional page, if needed.
 *
 * @param bucketId Id property of the bucket being imaged.
 * @param pageIndex Index for the page of the current bucket currently being captured.
 * @param imagesContainer Object holding each bucket's properties including title and image array.
 * @param totalImageCount Number of total pages to be captured.
 */
function addAdditionalPagesIfNeeded(bucketId, pageIndex, imagesContainer, totalImageCount) {
    var bucketElement = $('#' + bucketId);
    var pagingControl = $(bucketElement).find('.navi');
    if (pagingControl.length > 0) {
        var pageCount = $(pagingControl).children('a').length;
        if (pageIndex + 1 < pageCount) {
            var api = $(bucketElement).find(".scrollable-root").data("scrollable");
            api.move(1);
            setTimeout(function(){captureBucketImage(bucketId, pageIndex + 1, imagesContainer, totalImageCount)}, 2000);
        }
    }
}

/**
 * Convert the map to a canvas using the leafletImage plugin,
 * then convert the canvas to an image string.
 * Append the image string for the bucket to the provided container.
 *
 * @param mapObject Leaflet map object of the current bucket being captured.
 * @param bucketId Id property of the bucket being imaged.
 * @param imagesContainer Object holding each bucket's properties including title and image array.
 * @param totalImageCount Number of total pages to be captured.
 */
function captureMapBucketImage(mapObject, bucketId, imagesContainer, totalImageCount) {
    leafletImage(mapObject, function(err, canvas){
        // here you can use img for drawing to canvas and handling
        ///var testString = canvas.toDataURL();
        processCanvasToImageContainer(canvas, bucketId, 0, imagesContainer, totalImageCount);
    });
}

/**
 * Append the image string for the canvas to the provided container.
 * When all the buckets have been converted, send them to the server to become a report.
 *
 * @param canvas Canvas object for the graph/map/etc. of the app-specific bucket.
 * @param bucketId String Identifier for the bucket. A key into the imagesContainer hash.
 * @param pageIndex Index for the page of the bucket whose canvas is passed in.
 * @param imagesContainer Object holding the image string array for all the app-specific buckets.
 * @param totalImageCount Integer count of app-specific buckets including all pages.
 */
function processCanvasToImageContainer(canvas, bucketId, pageIndex, imagesContainer, totalImageCount) {
    var encodingPrefix = "base64,";

    try {
        var myImage = canvas.toDataURL();
        var contentStartIndex = myImage.indexOf(encodingPrefix) + encodingPrefix.length;
        imagesContainer[bucketId].images[pageIndex] =  myImage.substring(contentStartIndex);
        PageNavReportingConfig.capturedCount += 1;
        $('#presentation_job_spinner').hide();

        if (totalImageCount === PageNavReportingConfig.capturedCount) {
            generatePPTX(formSlidesCollectionFromImagesContainer(imagesContainer));
        }
    }
    catch (e) {
        // Permissions denied error when frame contents not in server domain, such as when showing Help.
        console.log("Exception taking canvas to image string for bucket " + bucketId + " : " + pageIndex);
        console.log(e);
    }
}

/**
 * Return an array of slides.
 * Each array element is an object holding a title string and an array of image strings.
 *
 * @param imagesContainer Object enumerating the app-specific buckets. Each object holds index, title, images object.
 * @returns {Array}
 */
function formSlidesCollectionFromImagesContainer(imagesContainer) {
    var slides = [];
    for (var bucketIdentifier in imagesContainer) {
        // transfer image strings from each bucket's object container to its array
        imagesContainer[bucketIdentifier].imageArray = [];
        var imageCount = Object.keys(imagesContainer[bucketIdentifier].images).length;
        for (var k = 0; k < imageCount; k++) {
            imagesContainer[bucketIdentifier].imageArray.push(imagesContainer[bucketIdentifier].images[k]);
        }

        if (k > 0) {
            slides.push({
                title: imagesContainer[bucketIdentifier].title,
                images: imagesContainer[bucketIdentifier].imageArray
            });
        }
    }

    return slides;
}

/**
 * Generate Paginated report from app-specific buckets' image strings
 * @param slides
 */
function generatePPTX(slides){
    var jobId = Ab.workflow.Workflow.startJob('AbSystemAdministration-generatePaginatedReport-generatePpt', slides, {fileName: 'my-presentation.pptx'});

    var jobStatus =  Ab.workflow.Workflow.getJobStatus(jobId);
    //XXX: finished or failed
    while (jobStatus.jobFinished != true && jobStatus.jobStatusCode != 8) {
        jobStatus = Ab.workflow.Workflow.getJobStatus(jobId);
    }

    if (jobStatus.jobFinished) {
        window.location = jobStatus.jobFile.url;
    }
    $('#presentation_job_spinner').hide();
}

/**
 * Open a dialog window containing the app-specific buckets.
 * This allows the map to be loaded with the L_PREFER_CANVAS property set to true to facilitate rendering to a string;
 * and the script in the dialog HTML to capture images and send them to WFR.
 */
function openAppSpecificReportDialog() {
    var dialogHeight = 870;
    var dialogWidth = 1150;
    var frameSource = PageNavUserInfo.webAppContextPath + PageNavUserInfo.homeTabHtmlFragment.replace('.html', '-rpt.html');

    var dialogElement = $('#reportingDialog');
    dialogElement.attr('title','Graphics Sectors Report');
    dialogElement.attr('style','padding: 0');
    dialogElement.html('<iframe id="asb-report-frame" src="' + frameSource + '" width="99%" height="99%"></iframe>');

    dialogElement.dialog({ modal: true, autoOpen: false, draggable: false, width: 500 });
    var uiDialogTitle = $('.ui-dialog-title');
    $(uiDialogTitle).css('width', '75%');
    // TODO localize buttonlabel
    $(uiDialogTitle).after('<button class="ui-widget" id="reportButton" type="button" onClick="onReportButtonClick(event);" ' +
        'style="float:right;margin-right:30px;">'  + 'Run Report' + '</button>' );
    dialogElement.dialog( 'option', "position", {my:"right top", at:"right-10 top"} );
    dialogElement.dialog( 'option', "height", dialogHeight );
    dialogElement.dialog( 'option', "width", dialogWidth );
    dialogElement.dialog('open');
}

function closeAppSpecificReportDialog() {
    $('#reportingDialog').dialog('close');
}

/**
 * True when browser is not IE
 * OR is IE >= 11.
 *
 * @returns {boolean}
 *
function isLeafletImageEnabledBrowser() {
    var isSafe = true;
    //
    var testMe = bowser;
    var testYou = parseInt(bowser.version);
    var testThemBr = BrowserDetect.browser;
    var testThemVs = BrowserDetect.version;
    var testThemOs = BrowserDetect.OS;
    var test = testThemVs < 11

    if (bowser.msie && bowser.version < 11) {
        isSafe = false;
    }
    //
    return isSafe;
}

*/

/**
 * Initiate the bucket image capture and report WFR.
 * @param evt
 */
function onReportButtonClick(evt) {
    var imagesContainer = {};
    PageNavReportingConfig.capturedCount = 0;

    // collect all app-specific buckets' properties
    var appSpecificBuckets = $('div.app-specific-bucket');
    $(appSpecificBuckets).each(function (n) {
        var bucketElement = $(this).parent('.bucket-process');
        var bucketId = $(bucketElement).attr('id');
        var bucketTitle = $(bucketElement).children('h2')[0].innerHTML;

        imagesContainer[bucketId] = {
            index: n,
            title: bucketTitle,
            images: {}
        };
    });

    captureReportImages(imagesContainer, appSpecificBuckets.length);
}