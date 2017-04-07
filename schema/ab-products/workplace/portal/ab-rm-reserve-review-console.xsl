<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<!-- importing constants.xsl which contains constant XSLT variables -->
	<xsl:import href="../../../ab-system/xsl/constants.xsl" />
	<!-- specified XSLT variables for this XSLT file -->
	<xsl:variable name="activityGraphic">ab-activity-emrelations-mgr.gif</xsl:variable>
	<xsl:variable name="activity_graphic" translatable="true">Activity Graphic</xsl:variable>
	<xsl:template match="/">
		<html>
		<head>	
			<title>
				<xsl:value-of select="/*/title"/><xsl:value-of select="$whiteSpace"/>
			</title>
			<xsl:call-template name="LinkingCSS"/>
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common.js"><xsl:value-of select="$whiteSpace"/></script>
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/locale.js"><xsl:value-of select="$whiteSpace"/></script>
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/date-time.js"><xsl:value-of select="$whiteSpace"/></script>
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/inputs-validation.js"><xsl:value-of select="$whiteSpace"/></script>
			<script language="JavaScript" src="#Attribute%//@relativeFileDirectory%/ab-rm-reserve-review-console.js"><xsl:value-of select="$whiteSpace"/></script>
			<!-- template: SetUpLocales is in locale.xsl-->
			<xsl:call-template name="SetUpLocales"/>
		</head>
		<body onload="onPageLoad()" class="body" leftmargin="0" rightmargin="0" topmargin="0" bottomMargin ="0">
			<!-- calling inputs-validation.xsl to use its template SetUpFieldsInformArray -->
			<!-- ?????????available fields are missed in XML??????????? -->
			<xsl:call-template name="SetUpFieldsInformArray">
				<xsl:with-param name="fieldNodes" select="/*/afmTableGroup/dataSource/data/availableFields"/>
			</xsl:call-template>

			<xsl:variable name="OKAfmAction" select="//afmTableGroup/afmAction[@type='applyRestriction1']"/>
			<xsl:variable name="selectVAfmAction" select="//afmTableGroup/dataSource/data/forFields/field/afmAction[@type='selectValue']"/>
			<form name="{$afmInputsForm}" style="margin:0">
			<table valign="top" align="left"> 
				<tr>
				<td>
					<img alt="{$activity_graphic}" src="{$abSchemaSystemGraphicsFolder}/{$activityGraphic}" border="0"/>
				</td>
				<td>
					<table>
						<!--tr>
							<td colspan="2" class="inputFieldLabel"><xsl:value-of select="/*/title"/></td>
						</tr-->
						<tr>
							<td class="inputFieldLabel_validated">
								<span  translatable="true">Building:</span>
							</td>
							<td >
								<input class="inputField" type="text" value="" name="rm_reserve.bl_id" id="rm_reserve.bl_id" size="20" onchange='validationInputs("rm_reserve.bl_id")'  onblur='validationAndConvertionDateAndTime("rm_reserve.bl_id", false)'/>
								<input class="selectValue_AbActionButtonFormStdWidth" type="button" title="{$selectVAfmAction/tip}" value="{$selectVAfmAction/title}" onclick='onSelectV("{$selectVAfmAction/@serialized}","rm_reserve.bl_id",""); selectValueInputFieldID="rm_reserve.bl_id";'/>
							</td>
							<td class="inputFieldLabel_validated">
								<span  translatable="true">Floor:</span>
							</td>
							<td>
								<input class="inputField" type="text" value="" name="rm_reserve.fl_id" id="rm_reserve.fl_id" size="20" onchange='validationInputs("rm_reserve.fl_id")'  onblur='validationAndConvertionDateAndTime("rm_reserve.fl_id", false)'/>
								<input class="selectValue_AbActionButtonFormStdWidth" type="button" title="{$selectVAfmAction/tip}" value="{$selectVAfmAction/title}" onclick='onSelectV("{$selectVAfmAction/@serialized}","rm_reserve.fl_id",""); selectValueInputFieldID="rm_reserve.fl_id";'/>
							</td>
						</tr>
						<tr>
							<td class="inputFieldLabel">
								<span  translatable="true">Start Date:</span>
							</td>
							<td>
								<input class="inputField" type="text" value="" name="rm_reserve.date_start" id="rm_reserve.date_start" size="20" onchange='validationInputs("rm_reserve.date_start")'  onblur='validationAndConvertionDateAndTime("rm_reserve.date_start", false)'/>
								<input class="selectValue_AbActionButtonFormStdWidth" type="button" title="{$selectVAfmAction/tip}" value="{$selectVAfmAction/title}" onclick='onSelectV("{$selectVAfmAction/@serialized}","rm_reserve.date_start",""); selectValueInputFieldID="rm_reserve.date_start";'/>
							</td>
							<td class="inputFieldLabel">
								<span  translatable="true">End Date:</span>
							</td>
							<td>
								<input class="inputField" type="text" value="" name="rm_reserve.date_end" id="rm_reserve.date_end" size="20" onchange='validationInputs("rm_reserve.date_end")'  onblur='validationAndConvertionDateAndTime("rm_reserve.date_end", false)'/>
								<input class="selectValue_AbActionButtonFormStdWidth" type="button" title="{$selectVAfmAction/tip}" value="{$selectVAfmAction/title}" onclick='onSelectV("{$selectVAfmAction/@serialized}","rm_reserve.date_end",""); selectValueInputFieldID="rm_reserve.date_end";'/>
							</td>
						</tr>
					</table>	
				</td>
				<td>
					<table>
						<tr><td>
							<input  class="AbActionButtonFormStdWidth" type="button" value="{$OKAfmAction/title}" title="{$OKAfmAction/tip}" onclick='sendingDataFromHiddenForm("","{$OKAfmAction/@serialized}","{$OKAfmAction/@frame}","{$OKAfmAction/subFrame/@name}",true,"")'/>
						</td></tr>
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
	<xsl:include href="../../../ab-system/xsl/common.xsl" />
	<xsl:include href="../../../ab-system/xsl/inputs-validation.xsl" />
	<xsl:include href="../../../ab-system/xsl/locale.xsl" />
	<xsl:include href="../../../ab-system/xsl/ab-actions-bar.xsl"/>
</xsl:stylesheet>
