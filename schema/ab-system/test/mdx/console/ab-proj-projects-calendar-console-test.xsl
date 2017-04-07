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
				<script language="JavaScript" src="#Attribute%//@relativeFileDirectory%/ab-proj-projects-calendar-console-test.js">
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

				<xsl:variable name="OKAfmAction" select="//afmTableGroup/afmAction[@type='applyParameters1']"/>
<!--				<xsl:variable name="OKAfmAction" select="//afmAction[@type='render']"/> -->
<!-- 				<xsl:variable name="OKAfmAction" select="//afmTableGroup/afmAction[@type='applyParameters1']"/> -->
 				<xsl:variable name="selectVAfmAction" select="//afmAction[@type='selectValue']"/>

				<form name="{$afmInputsForm}" style="margin:0">
					<input id="table" type="hidden"/>
					<input id="field" type="hidden"/>
					<table valign="top" align="left" border="0" width="100%" cellpadding="0" cellspacing="0">
						<tr>

							<td>
								<table border="0" width="100%" cellpadding="0" cellspacing="0">
									<tr>
										<td class="inputFieldLabel_validated">
											<div align="right">State:</div>
										</td>
										<td>
											<input class="inputField" type="text" value="" name="state_id" id="state_id" size="20" onchange='validationInputs("state_id")' onblur=""/>
											<input class="selectValue_AbActionButtonFormStdWidth" type="button" title="{$selectVAfmAction/tip}" value="{$selectVAfmAction/title}" onclick='SelvalsCustom("state_id","state");'/>
										</td>
										<td class="inputFieldLabel_validated">
											<div align="right">Division:</div>
										</td>
										<td>
											<input class="inputField" type="text" value="" name="dv_id" id="dv_id" size="20" onchange='validationInputs("dv_id")' onblur=""/>
											<input class="selectValue_AbActionButtonFormStdWidth" type="button" title="{$selectVAfmAction/tip}" value="{$selectVAfmAction/title}" onclick='SelvalsCustom("dv_id","dv");'/>
										</td>
										<td class="inputFieldLabel_validated">
											<div align="right">Activity Type:</div>
										</td>
										<td>
											<input class="inputField" type="text" value="" name="activity_type" id="activity_type" size="20" onchange='validationInputs("activity_type")' onblur=""/>
											<input class="selectValue_AbActionButtonFormStdWidth" id="activity_type.button" type="button" title="{$selectVAfmAction/tip}" value="{$selectVAfmAction/title}" onclick='SelvalsCustom("activity_type","activitytype");'/>
										</td>
									</tr>
									<tr>
										<td class="inputFieldLabel_validated">
											<div align="right">City:</div>
										</td>
										<td>
											<input class="inputField" type="text" value="" name="city_id" id="city_id" size="20" onchange='validationInputs("city_id")' onblur=""/>
											<input class="selectValue_AbActionButtonFormStdWidth" type="button" title="{$selectVAfmAction/tip}" value="{$selectVAfmAction/title}" onclick='SelvalsCustom("city_id","city");'/>
										</td>
										<td class="inputFieldLabel_validated">
											<div align="right">Department:</div>
										</td>
										<td>
											<input class="inputField" type="text" value="" name="dp_id" id="dp_id" size="20" onchange='validationInputs("dp_id")' onblur=""/>
											<input class="selectValue_AbActionButtonFormStdWidth" type="button" title="{$selectVAfmAction/tip}" value="{$selectVAfmAction/title}" onclick='SelvalsCustom("dp_id","dp");'/>
										</td>
										<td class="inputFieldLabel_validated">
											<div align="right">Project Manager:</div>
										</td>
										<td>
											<input class="inputField" type="text" value="" name="apprv_mgr1" id="apprv_mgr1" size="20" onchange='validationInputs("apprv_mgr1")' onblur=""/>
											<input class="selectValue_AbActionButtonFormStdWidth" type="button" title="{$selectVAfmAction/tip}" value="{$selectVAfmAction/title}"  onclick='SelvalsCustom("em_id","em");'/>
										</td>
										<td/>
									</tr>
									<tr>

    <td class="inputFieldLabel_validated"><div align="right">Site:</div></td>
    <td>
		<input class="inputField" type="text" value="" name="site_id" id="site_id" size="20" onchange='validationInputs("site_id")' onblur=""/>
		<input class="selectValue_AbActionButtonFormStdWidth" type="button" title="{$selectVAfmAction/tip}" value="{$selectVAfmAction/title}" onclick='SelvalsCustom("site_id","site");'/>
	</td>
										<td class="inputFieldLabel_validated">
											<div align="right">Program:</div>
										</td>
										<td>
											<input class="inputField" type="text" value="" name="program_id" id="program_id" size="20" onchange='validationInputs("program_id")' onblur=""/>
											<input class="selectValue_AbActionButtonFormStdWidth" type="button" title="{$selectVAfmAction/tip}" value="{$selectVAfmAction/title}" onclick='SelvalsCustom("program_id","program");'/>
										</td>
										<td class="inputFieldLabel_validated">
											<div align="right">Project:</div>
										</td>
										<td>
											<input class="inputField" type="text" value="" name="project_id" id="project_id" size="20" onchange='validationInputs("project_id")'/>
											<input class="selectValue_AbActionButtonFormStdWidth" type="button" title="{$selectVAfmAction/tip}" value="{$selectVAfmAction/title}" onclick='SelvalsCustom("project_id","project");'/>
										</td>
									</tr>
									<tr>
										<td class="inputFieldLabel_validated">
											<div align="right">Building:</div>
										</td>
										<td>
											<input class="inputField" type="text" value="" name="bl_id" id="bl_id" size="20" onchange='validationInputs("bl_id")' onblur=""/>
											<input class="selectValue_AbActionButtonFormStdWidth" type="button" title="{$selectVAfmAction/tip}" value="{$selectVAfmAction/title}" onclick='SelvalsCustom("bl_id","bl");'/>
										</td>
										<td class="inputFieldLabel_validated"></td><td></td>
										<td class="inputFieldLabel_validated">
											<div align="right">Project Type:</div>
										</td>
										<td>
											<input class="inputField" type="text" value="" name="project_type" id="project_type" size="20" onchange='validationInputs("project_type")' onblur=""/>
											<input class="selectValue_AbActionButtonFormStdWidth" type="button" title="{$selectVAfmAction/tip}" value="{$selectVAfmAction/title}" onclick='SelvalsCustom("project_type","projecttype");'/>
										</td>
									</tr>
									<tr>
										<td colspan="10"/>
									</tr>
									<tr>
<td class="inputFieldLabel_validated">
											<div align="right">Year:</div>
										</td>
										<td class="inputFieldLabel_validated">
											<script language="javascript">
												fBuildYear ()
											</script>
										</td>
										<td class="inputFieldLabel_validated">
											<div align="right">Display:</div>
										</td>
										<td>
											<select class="inputField_box"  id="Display" name="Display" onfocus="fProjectLogic();">
												<option value="1" selected="1">
													<span translatable="false">Projects</span>
												</option>
												<!--<option value="2"><span translatable="false">Work Packages</span></option>
			<option value="3"><span translatable="false">Actions</span></option>-->
											</select>
										</td>



									</tr>
									<tr>
									<td class="inputFieldLabel_validated">
											<div align="right">Months:</div>
										</td>
										<td class="inputFieldLabel_validated">
											<script language="javascript">
												fBuildMonth ()
											</script>
										</td>

										<td class="inputFieldLabel_validated">
											<div align="right">View:</div>
										</td>
										<td>
											<select class="inputField_box" onchange="fViewOnchangeLogic()" id="View" name="View">
												<option value="1">
													<span translatable="false">Months by Year</span>
												</option>
												<option value="2" selected="2">
													<span translatable="false">Days by Month</span>
												</option>
												<option value="3">
													<span translatable="false">Days by Week</span>
												</option>
											</select>
										</td>
										<td/>
										<td/>
									</tr>
									<tr>


									</tr>
								</table>
							</td>
							<td>
								<table>
									<tr>
										<td>
											<input class="AbActionButtonFormStdWidth" type="button" value="{$OKAfmAction/title}" title="{$OKAfmAction/tip}" onclick='gettingRecordsData("{$OKAfmAction/@serialized}");'/>
										</td>
									</tr>
								</table>
							</td>
						</tr>
					</table>
				</form>
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
