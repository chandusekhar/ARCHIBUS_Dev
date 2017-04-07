<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<!-- importing constants.xsl which contains constant XSLT variables -->
	<xsl:import href="../../../ab-system/xsl/constants.xsl"/>
	<!-- specified XSLT variables for this XSLT file -->
	<xsl:variable name="activityGraphic">ab-activity-emrelations-mgr.gif</xsl:variable>
	<xsl:template match="/">
		<html>
			<head>
				<title>
					<xsl:value-of select="/*/title"/>
					<xsl:value-of select="$whiteSpace"/>
				</title>
				<xsl:call-template name="LinkingCSS"/>
				<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common.js">
					<xsl:value-of select="$whiteSpace"/>
				</script>
				<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/locale.js">
					<xsl:value-of select="$whiteSpace"/>
				</script>
				<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/date-time.js">
					<xsl:value-of select="$whiteSpace"/>
				</script>
				<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/inputs-validation.js">
					<xsl:value-of select="$whiteSpace"/>
				</script>
				<script language="JavaScript" src="#Attribute%//@relativeFileDirectory%/ab-proj-adjust-timeline-console.js">
					<xsl:value-of select="$whiteSpace"/>
				</script>

				<!-- template: SetUpLocales is in locale.xsl-->
				<xsl:call-template name="SetUpLocales"/>
			</head>
			<body onload="onPageLoad()" class="body" leftmargin="0" rightmargin="0" topmargin="0" bottomMargin="0">
				<!-- calling inputs-validation.xsl to use its template SetUpFieldsInformArray -->
				<!-- ?????????available fields are missed in XML??????????? -->
				<xsl:call-template name="SetUpFieldsInformArray">
					<xsl:with-param name="fieldNodes" select="/*/afmTableGroup/dataSource/data/availableFields"/>
				</xsl:call-template>

				<span id="alert_select_project" name="alert_select_project" style="display:none" translatable="true">Please Select a Project!</span>
				<span id="alert_select_workpackage" name="alert_select_workpackage" style="display:none" translatable="true">Please Select a Work Package!</span>

				<xsl:variable name="OKAfmAction" select="//afmTableGroup/afmAction[@type='applyParameters1']"/>
				<xsl:variable name="projectWfrAction" select="//afmTableGroup/afmAction[@eventName='AbProjectManagement-calcActivityLogDateSchedEndForProject']"/>
				<xsl:variable name="workPkgWfrAction" select="//afmTableGroup/afmAction[@eventName='AbProjectManagement-calcActivityLogDateSchedEndForWorkPkg']"/>
				<xsl:variable name="selectVAfmAction" select="//afmTableGroup/dataSource/data/forFields/field/afmAction[@type='selectValue']"/>
				<xsl:variable name="project_id" select="/afmXmlView/actionIn/record/keys/@project.project_id"/>
				<xsl:variable name="activity_graphic" translatable="true">Activity Graphic</xsl:variable>
				<form name="{$afmInputsForm}" style="margin:0">
					<table valign="top" align="left">
						<tr>
							<td>
								<img alt="{$activity_graphic}" src="{$abSchemaSystemGraphicsFolder}/{$activityGraphic}" border="0"/>
							</td>
							<td>
								<table width="100%">
									<tr>
										<td>
											<span class="inputFieldLabel_validated" translatable="true">Project:</span><span style="font-size:10;font-family:Verdana,Geneva,Arial,Helvetica, sans-serif;color:red">*</span>
										</td>
										<td>
											<input class="inputField" type="text" value="{$project_id}" name="project.project_id" id="project.project_id" size="20" onblur='validationInputs("project.project_id")' />
											<input class="selectValue_AbActionButtonFormStdWidth" type="button" title="{$selectVAfmAction/tip}" value="{$selectVAfmAction/title}" onclick='onSelectV("{$selectVAfmAction/@serialized}","project.project_id",""); selectValueInputFieldID="project.project_id";'/>
										</td>
										<td>
											<span class="inputFieldLabel_validated" translatable="true">From Date:</span>
										</td>
										<td>
											<input class="inputField" type="text" value="" name="project.date_approved" id="project.date_approved" size="20" onblur='validationAndConvertionDateAndTime("project.date_approved", false)'/>
											<input class="selectValue_AbActionButtonFormStdWidth" type="button" title="{$selectVAfmAction/tip}" value="{$selectVAfmAction/title}" onclick='onSelectV("{$selectVAfmAction/@serialized}","project.date_approved",""); selectValueInputFieldID="project.date_approved";'/>
										</td>
										<td class="inputFieldLabel_validated">
											<div align="right" translatable="true">Display:</div>
										</td>
										<td>
											<select class="inputField_box" id="Display" name="Display" onchange='settingView("{$OKAfmAction/@serialized}")'>
												<option value="1" selected="1">
													<span translatable="true" selected="1">Project</span>
												</option>
												<option value="2">
													<span translatable="true">Work Package</span>
												</option>
											</select>
										</td>
									</tr>
									<tr>
										<td>
											<span class="inputFieldLabel_validated" translatable="true">Work Package:</span>
										</td>
										<td>
											<input class="inputField" type="text" value="" name="work_pkgs.work_pkg_id" id="work_pkgs.work_pkg_id" size="20" onblur='validationInputs("work_pkgs.work_pkg_id")' />
											<input class="selectValue_AbActionButtonFormStdWidth" type="button" title="{$selectVAfmAction/tip}" value="{$selectVAfmAction/title}" onclick='onSelectV("{$selectVAfmAction/@serialized}","work_pkgs.work_pkg_id",""); selectValueInputFieldID="work_pkgs.work_pkg_id";'/>
										</td>
										<td>
											<span class="inputFieldLabel_validated" translatable="true">To Date:</span>
										</td>
										<td>
											<input class="inputField" type="text" value="" name="project.date_accepted" id="project.date_accepted" size="20" onblur='validationAndConvertionDateAndTime("project.date_accepted", false)'/>
											<input class="selectValue_AbActionButtonFormStdWidth" type="button" title="{$selectVAfmAction/tip}" value="{$selectVAfmAction/title}" onclick='onSelectV("{$selectVAfmAction/@serialized}","project.date_accepted",""); selectValueInputFieldID="project.date_accepted";'/>
										</td>
										<td class="inputFieldLabel_validated">
											<div align="right" translatable="true">View:</div>
										</td>
										<td>
											<select class="inputField_box" onchange='settingView("{$OKAfmAction/@serialized}")' id="View" name="View">
												<option value="1" selected="1">
													<span translatable="true">by Day</span>
												</option>
												<option value="2">
													<span translatable="true">by Week</span>
												</option>
											</select>
										</td>
									</tr>
									<tr>
										<td>
											<span class="inputFieldLabel_validated" translatable="true">Activity Type:</span>
										</td>
										<td>
											<input class="inputField" type="text" value="" name="activitytype.activity_type" id="activitytype.activity_type" size="20" onblur='validationInputs("activitytype.activity_type")' />
											<input class="selectValue_AbActionButtonFormStdWidth" type="button" title="{$selectVAfmAction/tip}" value="{$selectVAfmAction/title}" onclick='onSelectV("{$selectVAfmAction/@serialized}","activitytype.activity_type",""); selectValueInputFieldID="activitytype.activity_type";'/>
										</td>
										<td/>
										<td>
											<input name="showButton" class="AbActionButtonFormStdWidth" type="button" value="{$OKAfmAction/title}" title="{$OKAfmAction/tip}" onclick='gettingRecordsData("{$OKAfmAction/@serialized}");'/>
										</td>
										<td id="workpkgTD" class="AbActionButtonForm" colspan="3" style="display:none">
											<input class="AbActionButtonForm" type="button" value="{$workPkgWfrAction/title}" onclick='onCalcEndDates()'/>
											<br /><span class="instruction" translatable="true">Recalculate Scheduled End Dates for Work Package</span>
										</td>
										<td id="projectTD" class="AbActionButtonForm" colspan="3">
											<input class="AbActionButtonForm" type="button" value="{$projectWfrAction/title}" onclick='onCalcEndDates()'/>
											<br /><span class="instruction" translatable="true">Recalculate Scheduled End Dates for Project</span>
										</td>
									</tr>
								</table>
							</td>
						</tr>
					</table>
				</form>

        <iframe src="about:blank" name="hidden_iframe" width="0" height="0" frameborder="0" marginwidth="0" marginheight="0" scrolling="no">
          <xsl:value-of select="$whiteSpace"/>
        </iframe>

				<!-- calling common.xsl -->
				<xsl:call-template name="common">
					<xsl:with-param name="title" select="/*/title"/>
					<xsl:with-param name="debug" select="//@debug"/>
					<xsl:with-param name="afmHiddenForm" select="$afmHiddenForm"/>
					<xsl:with-param name="xml" select="$xml"/>
					<xsl:with-param name="afmInputsForm" select="$afmInputsForm"/>
				</xsl:call-template>
			</body>
		</html>
	</xsl:template>
	<!-- including xsl which are called -->
	<xsl:include href="../../../ab-system/xsl/common.xsl"/>
	<xsl:include href="../../../ab-system/xsl/inputs-validation.xsl"/>
	<xsl:include href="../../../ab-system/xsl/locale.xsl"/>
	<xsl:include href="../../../ab-system/xsl/ab-actions-bar.xsl"/>
</xsl:stylesheet>
