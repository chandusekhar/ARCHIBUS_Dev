<?xml version="1.0"?>
<!-- xslt called by Java to handle XML data: report and edit form-->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">	
	<!-- importing xsl files -->
	<!-- constants.xsl which contains constant XSLT variables -->
	<xsl:import href="../../../ab-system/xsl/constants.xsl" />

	<!-- top template  -->
	<xsl:template match="/">
		<html>	
		<title>
			<!-- since browser cannot handle <title />, using a XSL whitespace avoids XSL processor -->
			<!-- to generate <title /> if there is no title in source XML -->
			<xsl:value-of select="/*/title"/><xsl:value-of select="$whiteSpace"/>
		</title>
		<head>	
			<!-- template: Html-Head-Setting in common.xsl -->
			<xsl:call-template name="Html-Head-Setting"/>
			<!-- calling template LinkingCSS in common.xsl -->
			<xsl:call-template name="LinkingCSS"/>
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common.js"><xsl:value-of select="$whiteSpace"/></script>
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/locale.js"><xsl:value-of select="$whiteSpace"/></script>
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common-edit-report.js"><xsl:value-of select="$whiteSpace"/></script>
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/date-time.js"><xsl:value-of select="$whiteSpace"/></script>
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/inputs-validation.js"><xsl:value-of select="$whiteSpace"/></script>
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/ab-trigger-close-dialog.js"><xsl:value-of select="$whiteSpace"/></script>
			<script language="JavaScript" src="#Attribute%//@relativeFileDirectory%/ab-wr-cf-assign.js"><xsl:value-of select="$whiteSpace"/></script>
			<!-- calling template SetUpLocales which is in locale.xsl to set up locale javascript variables -->
			<xsl:call-template name="SetUpLocales"/>
		</head>
		
		<body onload='setUpPopupWithWorkRequestNumber("{$afmInputsForm}")' class="body" leftmargin="0" rightmargin="0" topmargin="0">
			<xsl:variable name="wrcf_tgrp" select="/*/afmTableGroup"/>
			  <xsl:call-template name="SetUpFieldsInformArray">
				<xsl:with-param name="fieldNodes" select="$wrcf_tgrp/dataSource/data/fields" />
			</xsl:call-template>
			<xsl:call-template name="table-group-title">
				<xsl:with-param name="title" select="$wrcf_tgrp/title"/>
			</xsl:call-template>	
			<table  width="100%" valign="top">
				<form name="{$afmInputsForm}">
						<tr><td>
							<table width="100%" valign="top" style="topmargin:0">
								<colgroup span="2">
								<col  width="30%" />
								<col  width="70%" />
								<tr>
									<xsl:variable name="str_wrcf_wr_id" select="/*/afmTableGroup/dataSource/data/records/record/@wrcf.wr_id"/>
									<input type="hidden" size="20" id="wrcf.wr_id" name="wrcf.wr_id" VALUE="{$str_wrcf_wr_id}"/> 

									<td  class="inputFieldLabel" align="left">
										<span  translatable="true">Craftsperson:</span>
									</td>
									<td>
									<xsl:variable name="str_cf_id" select="/*/afmTableGroup/dataSource/data/records/record/@wrcf.cf_id"/>
									<input class="inputField" maxlength="{/*/afmTableGroup/dataSource/data/fields/field[@name='cf_id']/@size}" type="text" name="wrcf.cf_id" value="" onchange='validationInputs("{$afmInputsForm}", "wrcf.cf_id")' onblur='validationInputs("{$afmInputsForm}", "wrcf.cf_id")'/>
									<xsl:call-template name="SelectValue">
											<xsl:with-param name="afmTableGroup" select="/*/afmTableGroup"/>
											<xsl:with-param name="formName" select="$afmInputsForm"/>
											<xsl:with-param name="recordName" select="'wrcf.cf_id'"/>
											<xsl:with-param name="actionTitle" select="'...'"/>
									</xsl:call-template>
									</td>
								</tr>
								<tr>
									<td  class="inputFieldLabel"  nowrap="1">
										<span  translatable="true">Date Assigned:</span>
									</td>
									<td   nowrap="1">
										<input class="inputField" type="text" name="wrcf.date_assigned" SIZE="20" MAXLENGTH="10" VALUE="" onchange='validationAndConvertionDateInput(this, "wrcf.date_assigned", null, "false",false, false)' onblur='validationAndConvertionDateInput(this, "wrcf.date_assigned", null,"false", false,true)'/>
										<xsl:call-template name="SelectValue">
											<xsl:with-param name="afmTableGroup" select="/*/afmTableGroup"/>
											<xsl:with-param name="formName" select="$afmInputsForm"/>
											<xsl:with-param name="recordName" select="'wrcf.date_assigned'"/>
											<xsl:with-param name="actionTitle" select="'...'"/>
										</xsl:call-template>
									</td>
								</tr>
								<!--tr>
								<td  class="inputFieldLabel" nowrap="1">
									<span  translatable="true">Time Assigned:</span>
								</td>
								<td >
									<input class="inputField" type="text" name="wrcf.time_assigned" SIZE="20" MAXLENGTH="10" VALUE="" onchange='validationAndConvertionTimeInput(this, "wrcf.time_assigned",null,"false",true, false)' onblur='validationAndConvertionTimeInput(this, "wrcf.time_assigned", null,"false",true,true)'/>
								</td>
								</tr-->

								<tr>
									<td colspan="3" align="left">
										<xsl:variable name="actionSerialized" select="//afmAction[@type='executeTransaction']/@serialized"/>
										<input  class="AbActionButtonFormStdWidth" type="button" value="{//message[@name='assign']}" onclick='onSaveCraftspersonAssignRender("{$actionSerialized}","{$afmInputsForm}")'/>
										<input  class="AbActionButtonFormStdWidth" type="button" value="{//message[@name='cancel']}" onclick='onCancelPopup("{$actionSerialized}","{$afmInputsForm}")'/>
									</td>
								</tr>

								</colgroup>
							</table>
						</td></tr>	
				</form>
			</table>
			<!-- calling template common which is in common.xsl -->
			<xsl:call-template name="common">
				<xsl:with-param name="title" select="/*/title"/>
				<xsl:with-param name="debug" select="//@debug"/>
				<xsl:with-param name="afmHiddenForm" select="$afmHiddenForm"/>
				<xsl:with-param name="xml" select="$xml"/>
			</xsl:call-template>
		</body>
		</html>
	</xsl:template>
	<xsl:template name="SelectValue">
		<xsl:param name="afmTableGroup"/>
		<xsl:param name="formName"/>
		<xsl:param name="recordName"/>
		<xsl:param name="actionTitle"/>
		
		<xsl:variable name="afmAction" select="$afmTableGroup/forFields/field/afmAction[@type='selectValue']"/>
		<xsl:if test="count($afmAction) &gt; 0">
			<!-- must be like onclick='onSelectV("{...}"...) ...  ', cannot be like onclick="onSelectV('{...}'...) ... "  -->
			<!-- this is a trick between XSL processor and browser javascript engine -->
			<!-- XSL: ' transformed into &apos; " transformed into &quot; || Javascript: JSFunctionName(&quot;parameter&quot;) is working but JSFunctionName(&apos;parameter&apos;) is error -->
			<input class="selectValue_AbActionButtonFormStdWidth" type="button" title="{$afmAction/tip}" value="{$actionTitle}" onclick='onSelectV("{$afmAction/@serialized}","{$recordName}","{$formName}"); selectedValueInputFormName="{$formName}" ; selectValueInputFieldID="{$recordName}" ;'/>		
		</xsl:if>
	</xsl:template>
	
	<!-- including template model XSLT files called in XSLT -->
	<xsl:include href="../../../ab-system/xsl/common.xsl" />
	<xsl:include href="../../../ab-system/xsl/locale.xsl" />
	<xsl:include href="../../../ab-system/xsl/inputs-validation.xsl" />
</xsl:stylesheet>