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
			<script language="JavaScript" src="#Attribute%//@relativeFileDirectory%/ab-rm-reserve-detail-ok-cancel.js"><xsl:value-of select="$whiteSpace"/></script>
			<!-- calling template SetUpLocales which is in locale.xsl to set up locale javascript variables -->
			<xsl:call-template name="SetUpLocales"/>
		</head>
		<xsl:variable name="toServerErrorMessage" select="//message[@name='toServerErrorMessage']"/>
		<body onload='setUpContact("{$afmInputsForm}", "{$toServerErrorMessage}")' class="body" leftmargin="0" rightmargin="0" topmargin="0">
			<xsl:variable name="rm_reserve_tgrp" select="/*/afmTableGroup"/>
			  <xsl:call-template name="SetUpFieldsInformArray">
				<xsl:with-param name="fieldNodes" select="$rm_reserve_tgrp/dataSource/data/fields" />
			</xsl:call-template>
			<!-- calling template table-group-title which is in common.xsl to set up tgrp's title in the top of html page -->
			<xsl:call-template name="table-group-title">
				<xsl:with-param name="title" select="$rm_reserve_tgrp/title"/>
			</xsl:call-template>	
			<table  width="100%" valign="top">
				<form name="{$afmInputsForm}">
				<tr>
					<td class="inputFieldLabel_validated" align="left" nowrap="1">
						<xsl:value-of select="$rm_reserve_tgrp/dataSource/data/fields/field[@name='contact']/@singleLineHeading"/>:
					</td>
					<td class="inputFieldLabel" align="left" nowrap="1">
						<xsl:value-of select="$rm_reserve_tgrp/dataSource/data/fields/field[@name='event']/@singleLineHeading"/>:
					</td>
					
				</tr>
				<tr>
					<td>
						<input class="inputField"  maxlength="{$rm_reserve_tgrp/dataSource/data/fields/field[@name='contact']/@size}" type="text" name="rm_reserve.contact" value="" onchange='validationInputs("{$afmInputsForm}", "rm_reserve.contact")' onblur='validationInputs("{$afmInputsForm}", "rm_reserve.contact")'/>
						<xsl:call-template name="SelectValue">
							<xsl:with-param name="afmTableGroup" select="$rm_reserve_tgrp"/>
							<xsl:with-param name="formName" select="$afmInputsForm"/>
							<xsl:with-param name="recordName" select="'rm_reserve.contact'"/>
							<xsl:with-param name="actionTitle" select="'...'"/>
						</xsl:call-template>
					</td>
					<td>
						<input class="inputField"  maxlength="{$rm_reserve_tgrp/dataSource/data/fields/field[@name='event']/@size}" type="text" name="rm_reserve.event" value="" onchange='validationInputs("{$afmInputsForm}", "rm_reserve.event")' onblur='validationInputs("{$afmInputsForm}", "rm_reserve.event")'/>
						<xsl:call-template name="SelectValue">
							<xsl:with-param name="afmTableGroup" select="$rm_reserve_tgrp"/>
							<xsl:with-param name="formName" select="$afmInputsForm"/>
							<xsl:with-param name="recordName" select="'rm_reserve.event'"/>
							<xsl:with-param name="actionTitle" select="'...'"/>
						</xsl:call-template>
					</td>
				</tr>
				<tr>
					<td class="inputFieldLabel_validated" align="left" nowrap="1">
						<xsl:value-of select="$rm_reserve_tgrp/dataSource/data/fields/field[@name='dv_id']/@singleLineHeading"/>:
					</td>
					<td class="inputFieldLabel_validated" align="left" nowrap="1">
						<xsl:value-of select="$rm_reserve_tgrp/dataSource/data/fields/field[@name='dp_id']/@singleLineHeading"/>:
					</td>
					
				</tr>
				<tr>
					<td>
						<input class="inputField"  maxlength="{$rm_reserve_tgrp/dataSource/data/fields/field[@name='dv_id']/@size}" type="text" name="rm_reserve.dv_id" value="" onchange='validationInputs("{$afmInputsForm}", "rm_reserve.dv_id")' onblur='validationInputs("{$afmInputsForm}", "rm_reserve.dv_id")'/>
						<xsl:call-template name="SelectValue">
							<xsl:with-param name="afmTableGroup" select="$rm_reserve_tgrp"/>
							<xsl:with-param name="formName" select="$afmInputsForm"/>
							<xsl:with-param name="recordName" select="'rm_reserve.dv_id'"/>
							<xsl:with-param name="actionTitle" select="'...'"/>
						</xsl:call-template>
					</td>
					<td>
						<input class="inputField"  maxlength="{$rm_reserve_tgrp/dataSource/data/fields/field[@name='dp_id']/@size}" type="text" name="rm_reserve.dp_id" value="" onchange='validationInputs("{$afmInputsForm}", "rm_reserve.dp_id")' onblur='validationInputs("{$afmInputsForm}", "rm_reserve.dp_id")'/>
						<xsl:call-template name="SelectValue">
							<xsl:with-param name="afmTableGroup" select="$rm_reserve_tgrp"/>
							<xsl:with-param name="formName" select="$afmInputsForm"/>
							<xsl:with-param name="recordName" select="'rm_reserve.dp_id'"/>
							<xsl:with-param name="actionTitle" select="'...'"/>
						</xsl:call-template>
					</td>
				</tr>
				<tr>
					<td class="inputFieldLabel" colspan="2" align="left" nowrap="1">
						<xsl:value-of select="$rm_reserve_tgrp/dataSource/data/fields/field[@name='group_size']/@singleLineHeading"/>:
					</td>
				</tr>
				<tr >
					<td  colspan="2">
						<input class="inputField"  maxlength="{$rm_reserve_tgrp/dataSource/data/fields/field[@name='group_size']/@size}" type="text" name="rm_reserve.group_size" value="" onchange='validationInputs("{$afmInputsForm}", "rm_reserve.group_size")' onblur='validationInputs("{$afmInputsForm}", "rm_reserve.group_size")'/>
						<xsl:call-template name="SelectValue">
							<xsl:with-param name="afmTableGroup" select="$rm_reserve_tgrp"/>
							<xsl:with-param name="formName" select="$afmInputsForm"/>
							<xsl:with-param name="recordName" select="'rm_reserve.group_size'"/>
							<xsl:with-param name="actionTitle" select="'...'"/>
						</xsl:call-template>
					</td>
				</tr>
				<tr>
					<td class="inputFieldLabel" align="left" nowrap="1"  colspan="2">
						<xsl:value-of select="$rm_reserve_tgrp/dataSource/data/fields/field[@name='comments']/@singleLineHeading"/>:<xsl:value-of select="$whiteSpace"/>
						<xsl:call-template name="SelectValue">
							<xsl:with-param name="afmTableGroup" select="$rm_reserve_tgrp"/>
							<xsl:with-param name="formName" select="$afmInputsForm"/>
							<xsl:with-param name="recordName" select="'rm_reserve.comments'"/>
							<xsl:with-param name="actionTitle" select="//message[@name='description']"/>
						</xsl:call-template>
					</td>
				</tr>
				<tr >
					<td  colspan="2">
						<textarea class="textareaABData" name="rm_reserve.comments" cols="60" rows="4" wrap="PHYSICAL">
							<xsl:value-of select="$whiteSpace"/>
						</textarea>
					</td>
				</tr>
				<tr align="center">
					<td colspan="2" align="center">
						<table class="bottomActionsTable">
							<!-- holding all action buttons on the form -->
							 <tr><td>
								<xsl:variable name="SQLAction" select="//afmAction[@type='executeTransaction']"/>
								<input class="AbActionButtonFormStdWidth" type="button" value="{$SQLAction/title}" onclick='onReservation("{$afmInputsForm}", "{$SQLAction/@serialized}")'/>
								<xsl:variable name="cancel_message" select="//message[@name='cancel']"/>
								<input class="AbActionButtonFormStdWidth" type="button" value="{$cancel_message}" onclick='window.close()'/>
							</td></tr>
						</table>
					</td>
				</tr>
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