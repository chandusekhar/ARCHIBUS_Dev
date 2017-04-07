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
			<script language="JavaScript" src="#Attribute%//@relativeFileDirectory%/ab-wr-review-console.js"><xsl:value-of select="$whiteSpace"/></script>
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
				<tr><td>
					<img alt="{$activity_graphic}" src="{$abSchemaSystemGraphicsFolder}/{$activityGraphic}" border="0"/>
				</td>
				<td>
					<table width="550">
						<tr>
							<td class="inputFieldLabel">
								<span  translatable="true">Request Code:</span>
							</td>
							<td >
								<input class="inputField" type="text" value="" name="wr.wr_id" id="wr.wr_id" size="20" onchange='validationInputs("wr.wr_id")'  onblur='validationAndConvertionDateAndTime("wr.wr_id", false)'/>
								<input class="selectValue_AbActionButtonFormStdWidth" type="button" title="{$selectVAfmAction/tip}" value="{$selectVAfmAction/title}" onclick='onSelectV("{$selectVAfmAction/@serialized}","wr.wr_id","", "false"); selectValueInputFieldID="wr.wr_id";'/>
							</td>
							<td class="inputFieldLabel_validated">
								<span  translatable="true">Building:</span>
							</td>
							<td>
								<input class="inputField" type="text" value="" name="wr.bl_id" id="wr.bl_id" size="20" onchange='validationInputs("wr.bl_id")'  onblur='validationAndConvertionDateAndTime("wr.bl_id", false)'/>
								<input class="selectValue_AbActionButtonFormStdWidth" type="button" title="{$selectVAfmAction/tip}" value="{$selectVAfmAction/title}" onclick='onSelectV("{$selectVAfmAction/@serialized}","wr.bl_id",""); selectValueInputFieldID="wr.bl_id";'/>
							</td>
						</tr>
						<tr>
							<td class="inputFieldLabel_validated">
								<span  translatable="true">Requested By:</span>
							</td>
							<td>
								<input class="inputField" type="text" value="" name="wr.requestor" id="wr.requestor" size="20" onchange='validationInputs("wr.requestor")'  onblur='validationAndConvertionDateAndTime("wr.requestor", false)'/>
								<input class="selectValue_AbActionButtonFormStdWidth" type="button" title="{$selectVAfmAction/tip}" value="{$selectVAfmAction/title}" onclick='onSelectV("{$selectVAfmAction/@serialized}","wr.requestor",""); selectValueInputFieldID="wr.requestor";'/>
							</td>
							<td class="inputFieldLabel_validated">
								<span  translatable="true">Equipment:</span>
							</td>
							<td>
								<input class="inputField" type="text" value="" name="wr.eq_id" id="wr.eq_id" size="20" onchange='validationInputs("wr.eq_id")'  onblur='validationAndConvertionDateAndTime("wr.eq_id", false)'/>
								<input class="selectValue_AbActionButtonFormStdWidth" type="button" title="{$selectVAfmAction/tip}" value="{$selectVAfmAction/title}" onclick='onSelectV("{$selectVAfmAction/@serialized}","wr.eq_id",""); selectValueInputFieldID="wr.eq_id";'/>
							</td>
						</tr>
						<tr>
							<td class="inputFieldLabel_validated">
								<span  translatable="true">Problem Type:</span>
							</td>
							<td>
								<input class="inputField" type="text" value="" name="wr.prob_type" id="wr.prob_type" size="20" onchange='validationInputs("wr.prob_type")'  onblur='validationAndConvertionDateAndTime("wr.prob_type", false)'/>
								<input class="selectValue_AbActionButtonFormStdWidth" type="button" title="{$selectVAfmAction/tip}" value="{$selectVAfmAction/title}" onclick='onSelectV("{$selectVAfmAction/@serialized}","wr.prob_type",""); selectValueInputFieldID="wr.prob_type";'/>
							</td>
							<td class="inputFieldLabel">
								<span  translatable="true">Description:</span>
							</td>
							<td>
								<input class="inputField" type="text" value="" name="wr.description" id="wr.description" size="20" onchange='validationInputs("wr.description")'  onblur='validationAndConvertionDateAndTime("wr.description", false)'/>
								<input class="selectValue_AbActionButtonFormStdWidth" type="button" title="{$selectVAfmAction/tip}" value="{$selectVAfmAction/title}" onclick='onSelectV("{$selectVAfmAction/@serialized}","wr.description",""); selectValueInputFieldID="wr.description";'/>
							</td>
						</tr>
						<tr>
							<td class="inputFieldLabel">
								<span  translatable="true">Work Urgency:</span>
							</td>
							<td>
								<select  class="inputField_box" id="Urgency" name="Urgency">
									<option value="All" selected="1"><span  translatable="true">All</span></option>
									<option value="Emergency"><span  translatable="true">Emergency</span></option>
									<option value="One Day"><span  translatable="true">One Day</span></option>
									<option value="One Week"><span  translatable="true">One Week</span></option>
									<option value="One Month"><span  translatable="true">One Month</span></option>
									<option value="Eventually"><span  translatable="true">Eventually</span></option>
								</select>
							</td>
							<td class="inputFieldLabel">
								<span  translatable="true">Requested:</span>
							</td>
							<td>
								<select  class="inputField_box" id="DateRange" name="DateRange" onchange='checkDateRange("DateRange","Date Range","DateRangeArea")'>
									<option value="Today" ><span  translatable="true">Today</span></option>
									<option value="This Week"><span  translatable="true">This Week</span></option>
									<option value="This Month"><span  translatable="true">This Month</span></option>
									<option value="This Year"><span  translatable="true">This Year</span></option>
									<option value="Date Range" selected="1"><span  translatable="true">Date Range</span></option>
								</select>
							</td>
						</tr>
						<tr style="" name="DateRangeArea" id="DateRangeArea">
							<td class="inputFieldLabel">
								<span  translatable="true">From</span><span style="font-size:10;font-family:Verdana,Geneva,Arial,Helvetica, sans-serif;color:red">*</span>:
							</td>
							<td>
								<input class="inputField" type="text" value="" name="wr.date_requested" id="wr.date_requested" size="20"  onchange='validationInputs("wr.date_requested")' onblur='validationAndConvertionDateAndTime("wr.date_requested", false);filledUpDate("wr.date_requested")' />
								<input class="AbActionButtonFormStdWidth" type="button" title="{$selectVAfmAction/tip}" value="{$selectVAfmAction/title}" onclick='onSelectV("{$selectVAfmAction/@serialized}","wr.date_requested",""); selectValueInputFieldID="wr.date_requested";'/>	
							</td>
							<td class="inputFieldLabel">
								<span  translatable="true">To</span><span style="font-size:10;font-family:Verdana,Geneva,Arial,Helvetica, sans-serif;color:red">*</span>:
							</td>
							<td>
								<input class="inputField" type="text" value="" name="wr.date_assigned" id="wr.date_assigned" size="20"  onchange='validationInputs("wr.date_assigned")' onblur='validationAndConvertionDateAndTime("wr.date_assigned", false);filledUpDate("wr.date_assigned")' />
								<input class="AbActionButtonFormStdWidth" type="button" title="{$selectVAfmAction/tip}" value="{$selectVAfmAction/title}" onclick='onSelectV("{$selectVAfmAction/@serialized}","wr.date_assigned",""); selectValueInputFieldID="wr.date_assigned";'/>	
							</td>
						</tr>
					</table>
				</td>
				<td>
					<table>
					<tr><td>
						<input  class="AbActionButtonFormStdWidth" type="button" value="{$OKAfmAction/title}" title="{$OKAfmAction/tip}" onclick='onShow("","{$OKAfmAction/@serialized}","{$OKAfmAction/@frame}","{$OKAfmAction/subFrame/@name}",true,"")'/>
					</td></tr>
					<!--tr><td>
						<input  class="AbActionButtonFormStdWidth" type="reset" value="Reset" onclick='onReset("DateRange","Date Range","DateRangeArea")'/>
					</td></tr-->
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
