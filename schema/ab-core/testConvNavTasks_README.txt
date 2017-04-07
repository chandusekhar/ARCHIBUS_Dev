README for com.archibus.devtools.viewconverter.TestConvNavigatorViews


The test utility, com.archibus.devtools.viewconverter.TestConvNavigatorViews, simulates the conversion of all the view listed as task_files in afm_ptasks and afm_psubtasks.

It tries to convert each view in memory, but doesn't write any conversions to disk. It does write a report to C:\Yalta\apps\archibus\WEB-INF\log\nav_task_conversion.log that tells you whether a conversion would suceed or fail. If the conversion does not suceed, the report contains one or more lines stating the reason the conversion would fail. 

The conversion process writes an in-memory report containing three types of lines: passing steps, warnings and failures. TestConvNavigatorViews is set to only write the warnings and failure lines for each view plus the summary line. Each line contains the status (FAIL, WARN, PASS), the date and time, the stage in the conversion process at which the message was written, and a brief explanation of the issue. The warnings and failure notics are brief so that they fit on a single line, so a more verbose description is listed below. 

Warning
--------
Warnings are those issues that do not prevent a view from being converted, but the converter makes certain assumptions or ignores certain elements and attributes that may make the covnerted view slightly different from the original view.

WARN -- 12/12/07 3:52 PM -- stage: walking_tableGroup, Processing an unknown element: : title
The <title> foo </title> element as a direct child of the <afmTableGroup> element rather than as an element within a <panel> element is ambiguous since the tableGroup can have more than panel. In the future this element may be moved into the first panel automatically by the converter.

WARN -- 12/12/07 4:26 PM -- stage: deprecated_sort, edit form: forms should use a restriction rather than a sort to select record
A form uses the first record returned from the data source's recordset, but it is better to use a restriction to filter down the recordset to a single record than using a sort to try to order the recordset to get that one record at the top.


Failure
--------
Failures are those issues that prevent the view from being converted. The prime reason for a conversion failure is that the view relies on XSL for its rendering. XSL cannot be converted.

FAIL -- 12/14/07 2:30 PM -- stage: conversion_failed, viewFile: ab-ex-report-grid-export.axvw
A summary line saying the overall conversion has failed. this line will always be accompanied by a previous, more detailed, failure line.

FAIL -- 12/13/07 7:19 PM -- stage: processed_afmTableGroup, no panel or tabs in afmTableGroup: is this a legacy view?
All 16.3 views must use a panel or tabs element to declare how the data should be presented. Often adding a panels and panel element corresponding to the type of the afttableGroup will solve this issue. In the future this may be done automatically by the converter.

FAIL -- 12/13/07 7:19 PM -- stage: import_xsl, legacy view: C:\Yalta\apps\archibus\schema\ab-products\workplace\real-property\ab-su-highlt-vacant-drawing.axvw
XSL-based views can not be converted automatically. These tyoes of views will have to be converted into Yalta 5 views by hand.

FAIL -- 12/14/07 10:34 AM -- stage: processed_panel_field, panel field showing verbatim HTML cannot use attribute: name: image_file
FAIL -- 12/14/07 10:34 AM -- stage: processed_panel_field, panel field showing verbatim HTML cannot use attribute: table: eqstd
The inclusion of verbatim HTML cannot be mixed with the injection of data source table.field values.

FAIL -- 12/12/07 5:12 PM -- stage: convert_macros, This macro is not supported.: #{preferences.projectGraphicsFolder}
The listed macro cannot be converted into a Yalta 5 data binding expressions.

FAIL -- 12/14/07 10:34 AM -- stage: walking_tableGroup, Views with nested afmTableGroups not convertable: type: form, frame: primaryKeyFrame
Nested afmTableGroup elmeents are not allowed in Yalta views and cannot be converted into Yalta 5 views.

