<?xml version="1.0"?>
<!-- xslt called by Java to handle XML data:ab-wr-request.axvw -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">	
	<!-- importing xsl files -->
	<!-- constants.xsl which contains constant XSLT variables -->
	<xsl:import href="../../../ab-system/xsl/constants.xsl" />
	<xsl:variable name="activity_graphic" translatable="true">Activity Graphic</xsl:variable>

	<!-- top template  -->
	<xsl:template match="/">
		<html>	
		<title>
			<xsl:value-of select="/*/title"/><xsl:value-of select="$whiteSpace"/>
		</title>
		<head>	
			<!-- template: Html-Head-Setting in common.xsl -->
			<xsl:call-template name="Html-Head-Setting"/>
			<!-- css and javascript files  -->
			<!-- linking path must be related to the folder in which xml is being processed -->
			<!-- calling template LinkingCSS in common.xsl -->
			<xsl:call-template name="LinkingCSS"/>
			<!-- don't remove whitespace, otherwise, Xalan XSLT processor will generate <script .../> instead of <script ...></script> -->
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common.js"><xsl:value-of select="$whiteSpace"/></script>
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/locale.js"><xsl:value-of select="$whiteSpace"/></script>
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common-edit-report.js"><xsl:value-of select="$whiteSpace"/></script>
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/date-time.js"><xsl:value-of select="$whiteSpace"/></script>
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/inputs-validation.js"><xsl:value-of select="$whiteSpace"/></script>
			<script language="JavaScript" src="#Attribute%//@relativeFileDirectory%/ab-wr-request.js"><xsl:value-of select="$whiteSpace"/></script>
			<!-- calling template SetUpLocales which is in locale.xsl to set up locale javascript variables -->
			<xsl:call-template name="SetUpLocales"/>
		</head>

		<body class="body" leftmargin="0" rightmargin="0" topmargin="0" bottomMargin="0"> 
			<!-- calling template table-group-title which is in common.xsl to set up tgrp's title in the top of html page -->
			<xsl:call-template name="table-group-title">
				<xsl:with-param name="title" select="/*/afmTableGroup/title"/>
			</xsl:call-template>	
			<xsl:variable name="wr_tgrp" select="/*/afmTableGroup"/>
			<!-- calling template SetUpFieldsInformArray in inputs-validation.xsl to use its template SetUpFieldsInformArray -->
			<xsl:call-template name="SetUpFieldsInformArray">
				<xsl:with-param name="fieldNodes" select="$wr_tgrp/dataSource/data/fields"/>
			</xsl:call-template>
			
			<table align="left" valign="top" width="100%">
				<tr><td>
					<table align="left" valign="top" >
						<tr>
							<td align="left" valign="top" >
								<img alt="{$activity_graphic}" src="{$abSchemaSystemGraphicsFolder}/ab-form-work-request.gif"/>
							</td>
							<td >
								<table style="margin-left:10"><tr><td  style="font-size:14;font-family:arial,geneva,helvetica,sans-serif;">
									<p><xsl:value-of select="/*/message[@name='top_message']"/></p>
								</td></tr></table>
							</td>
						</tr>
					</table>
				</td></tr>
				<tr><td>
					<table  valign="top">
						<form name="{$afmInputsForm}">
							<tr>
								<td class="inputFieldLabel_validated" align="left" nowrap="1">
									<xsl:value-of select="$wr_tgrp/dataSource/data/fields/field[@name='requestor']/@singleLineHeading"/>:<font face="Arial" size="-1" color="red">*</font>
								</td>
								<td>
									<input class="inputField" maxlength="{$wr_tgrp/dataSource/data/fields/field[@name='requestor']/@size}" type="text" name="wr.requestor" value="" onchange='validationInputs("{$afmInputsForm}", "wr.requestor")' onblur='validationInputs("{$afmInputsForm}", "wr.requestor")'/>
									<xsl:call-template name="SelectValue">
										<xsl:with-param name="afmTableGroup" select="$wr_tgrp"/>
										<xsl:with-param name="formName" select="$afmInputsForm"/>
										<xsl:with-param name="recordName" select="'wr.requestor'"/>
										<xsl:with-param name="actionTitle" select="'...'"/>
									</xsl:call-template>
								</td>
								<td class="inputFieldLabel_validated" align="left" >
									<xsl:value-of select="$wr_tgrp/dataSource/data/fields/field[@name='bl_id']/@singleLineHeading"/>:<font face="Arial" size="-1" color="red">*</font>
								</td>
								<td>
									<input class="inputField" maxlength="{$wr_tgrp/dataSource/data/fields/field[@name='bl_id']/@size}" type="text" name="wr.bl_id" value="" onchange='validationInputs("{$afmInputsForm}", "wr.bl_id")' onblur='validationInputs("{$afmInputsForm}", "wr.bl_id")'/>
									<xsl:call-template name="SelectValue">
										<xsl:with-param name="afmTableGroup" select="$wr_tgrp"/>
										<xsl:with-param name="formName" select="$afmInputsForm"/>
										<xsl:with-param name="recordName" select="'wr.bl_id'"/>
										<xsl:with-param name="actionTitle" select="'...'"/>
									</xsl:call-template>
								</td>
							</tr>
							<tr>
								<td  class="inputFieldLabel" align="left" >
									<xsl:value-of select="$wr_tgrp/dataSource/data/fields/field[@name='phone']/@singleLineHeading"/>:<font face="Arial" size="-1" color="red">*</font>
								</td>
								<td>
									<input class="inputField" maxlength="{$wr_tgrp/dataSource/data/fields/field[@name='phone']/@size}" type="text" name="wr.phone" value="" onchange='validationInputs("{$afmInputsForm}", "wr.phone")' onblur='validationInputs("{$afmInputsForm}", "wr.phone")'/>
									<!--xsl:call-template name="SelectValue">
										<xsl:with-param name="afmTableGroup" select="$wr_tgrp"/>
										<xsl:with-param name="formName" select="$afmInputsForm"/>
										<xsl:with-param name="recordName" select="'wr.phone'"/>
										<xsl:with-param name="actionTitle" select="'...'"/>
									</xsl:call-template-->
								</td>
								<td  class="inputFieldLabel_validated" align="left" >
									<xsl:value-of select="$wr_tgrp/dataSource/data/fields/field[@name='fl_id']/@singleLineHeading"/>:
								</td>
								<td>
									<input class="inputField" maxlength="{$wr_tgrp/dataSource/data/fields/field[@name='fl_id']/@size}" type="text" name="wr.fl_id" value="" onchange='validationInputs("{$afmInputsForm}", "wr.fl_id")' onblur='validationInputs("{$afmInputsForm}", "wr.fl_id")'/>
									<xsl:call-template name="SelectValue">
										<xsl:with-param name="afmTableGroup" select="$wr_tgrp"/>
										<xsl:with-param name="formName" select="$afmInputsForm"/>
										<xsl:with-param name="recordName" select="'wr.fl_id'"/>
										<xsl:with-param name="actionTitle" select="'...'"/>
									</xsl:call-template>
								</td>
							</tr>
							<tr>
								<td  class="inputFieldLabel_validated" align="left" >
									<xsl:value-of select="$wr_tgrp/dataSource/data/fields/field[@name='prob_type']/@singleLineHeading"/>:<font face="Arial" size="-1" color="red">*</font>
								</td>
								<td>
									<input class="inputField" maxlength="{$wr_tgrp/dataSource/data/fields/field[@name='prob_type']/@size}" type="text" name="wr.prob_type" value="" onchange='validationInputs("{$afmInputsForm}", "wr.prob_type")' onblur='validationInputs("{$afmInputsForm}", "wr.prob_type")'/>
									<xsl:call-template name="SelectValue">
										<xsl:with-param name="afmTableGroup" select="$wr_tgrp"/>
										<xsl:with-param name="formName" select="$afmInputsForm"/>
										<xsl:with-param name="recordName" select="'wr.prob_type'"/>
										<xsl:with-param name="actionTitle" select="'...'"/>
									</xsl:call-template>
								</td>
								<td  class="inputFieldLabel_validated"  align="left" >
									<xsl:value-of select="$wr_tgrp/dataSource/data/fields/field[@name='rm_id']/@singleLineHeading"/>:
								</td>
								<td>
									<input class="inputField" maxlength="{$wr_tgrp/dataSource/data/fields/field[@name='rm_id']/@size}" type="text" name="wr.rm_id" value="" onchange='validationInputs("{$afmInputsForm}", "wr.rm_id")' onblur='validationInputs("{$afmInputsForm}", "wr.rm_id")'/>
									<xsl:call-template name="SelectValue">
										<xsl:with-param name="afmTableGroup" select="$wr_tgrp"/>
										<xsl:with-param name="formName" select="$afmInputsForm"/>
										<xsl:with-param name="recordName" select="'wr.rm_id'"/>
										<xsl:with-param name="actionTitle" select="'...'"/>
									</xsl:call-template>
									<input  class="selectValue_AbActionButtonFormStdWidth" type="button" value="{/*/message[@name='highlight']}" onclick='showHighlightRooms("{$afmInputsForm}", "wr.bl_id", "wr.fl_id");selectedValueInputFormName="{$afmInputsForm}" ; selectValueInputFieldID="wr.rm_id";'/>
								</td>
							</tr>
							<tr>
								<td  class="inputFieldLabel_validated" align="left" >
									<xsl:value-of select="$wr_tgrp/dataSource/data/fields/field[@name='eq_id']/@singleLineHeading"/>:<font face="Arial" size="-1" color="red">*</font>
								</td>
								<td>
									<input class="inputField" maxlength="{$wr_tgrp/dataSource/data/fields/field[@name='eq_id']/@size}" type="text" name="wr.eq_id" value="" onchange='validationInputs("{$afmInputsForm}", "wr.eq_id")' onblur='validationInputs("{$afmInputsForm}", "wr.eq_id")'/>
									<xsl:call-template name="SelectValue">
										<xsl:with-param name="afmTableGroup" select="$wr_tgrp"/>
										<xsl:with-param name="formName" select="$afmInputsForm"/>
										<xsl:with-param name="recordName" select="'wr.eq_id'"/>
										<xsl:with-param name="actionTitle" select="'...'"/>
									</xsl:call-template>
									
								</td>
								<td  class="inputFieldLabel"  align="left" >	
									<xsl:value-of select="$wr_tgrp/dataSource/data/fields/field[@name='location']/@singleLineHeading"/>:
								</td>
								<td  class="instruction"  align="left" >
									<input class="inputField" maxlength="{$wr_tgrp/dataSource/data/fields/field[@name='location']/@size}" type="text" name="wr.location" value="" onchange='validationInputs("{$afmInputsForm}", "wr.location")' onblur='validationInputs("{$afmInputsForm}", "wr.location")'/>
								</td>
							</tr>
							<tr>
								<td   class="inputFieldLabel" align="left" >
									<span  translatable="true">Urgency:</span>
								</td>
								<td colspan="3">
									<input type="radio" name="wr.priority" value="99"/><span translatable="true" class="inputFieldLabel">Emergency</span><xsl:value-of select="$whiteSpace"/><input type="radio" name="wr.priority" value="75"/><span translatable="true" class="inputFieldLabel">One Day</span><xsl:value-of select="$whiteSpace"/><input type="radio" name="wr.priority" value="50"/><span translatable="true" class="inputFieldLabel">One Week</span><xsl:value-of select="$whiteSpace"/><input type="radio" checked="1" name="wr.priority" value="25"/><span translatable="true" class="inputFieldLabel">One Month</span><xsl:value-of select="$whiteSpace"/><input type="radio" name="wr.priority" value="0"/><span translatable="true" class="inputFieldLabel">No Urgency</span>
								</td>
							</tr>
							<tr>
								<td valign="middle"  class="inputFieldLabel" align="left">
									<xsl:value-of select="$wr_tgrp/dataSource/data/fields/field[@name='description']/@singleLineHeading"/>:
								</td>
								<td colspan="3" rowspan="2">
									<textarea class="textareaABData" name="wr.description" cols="60" rows="4" wrap="PHYSICAL">
										<xsl:value-of select="$whiteSpace"/>
									</textarea>
								</td>
							</tr>
							<tr>
								<td valign="middle">
									<xsl:variable name="selectDPAction" select="$wr_tgrp/forFields/field/afmAction[@type='selectValue']"/>
									<input class="selectValue_AbActionButtonFormStdWidth" type="button" title="{/*/message[@name='description']}" value="{/*/message[@name='description']}" onclick='onSelectV("{$selectDPAction/@serialized}","pd.pd_description", "{$afmInputsForm}"); selectedValueInputFormName="{$afmInputsForm}" ; selectValueInputFieldID="wr.description" ;'/>
									
								</td>
							</tr>
							<tr>
								<td  class="inputFieldLabel" align="left">
									<input type="checkbox" name="bSendEmail"/>
									<span  translatable="true">Send email to:</span>
								</td>
								<td colspan="3" class="inputFieldLabel">
									<xsl:variable name="toEmailAddress" select="//preferences/mail/addresses/address[@name='maintmgrEMail']/@value"/>
									<input type="hidden" name="toEmailAddress" value="{$toEmailAddress}"/>
									<xsl:value-of select="$toEmailAddress"/>
								</td>
							</tr>
							<!--tr>
								<td  class="inputFieldLabel" align="left">
											<span  translatable="true">Email from:</span>
								</td>
								<td colspan="3">
									<input class="inputField" type="text" name="fromEmailAddress" value="your_email_address@yourcompany.com " size="60" onFocus="Clear();"/>
								</td>
							</tr-->
							<tr>
								<td  class="inputFieldLabel" align="left">
									<span  translatable="true">Copy to:</span>
								</td>
								<td colspan="3">
									<xsl:variable name="ccEmailAddress" select="//preferences/mail/addresses/address[@name='wrCCEmail']/@value"/>
									<input class="inputField_box" type="text" name="copyEmailAddress" value="{$ccEmailAddress}" size="60" />
									<input class="inputField_box" type="hidden" name="fromEmailAddress" value="your_email_address@yourcompany.com "/>
								</td>
							</tr>
							<tr>
								<td><xsl:value-of select="$whiteSpace"/></td>
								<td align="left" >
									<xsl:variable name="SQLAction" select="//afmAction[@type='executeTransaction']"/>
									<!--xsl:variable name="renderAction" select="//afmAction[@name='response']"/-->
									<xsl:variable name="warning_message" select="//message[@name='warning_message']"/>
									<!-- constraintViolation_message -->
									<xsl:variable name="constraintViolation_message" select="//message[@name='constraintViolation_message']"/>
									<input class="AbActionButtonFormStdWidth" type="button" value="{$SQLAction/title}" onclick='onSubmitWorkRequest("{$afmInputsForm}", "{$SQLAction/@serialized}","{$warning_message}","{$constraintViolation_message}")'/>
								</td>
								<td align="left"  colspan="2" >
									<input  class="AbActionButtonFormStdWidth" type="RESET" value="{/*/message[@name='reset']}"/>
								</td>
							</tr>
						</form>
					</table>
				</td></tr>
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