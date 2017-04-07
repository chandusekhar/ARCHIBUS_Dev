<?xml version="1.0"?>
<!-- xslt called by Java to handle XML data: report and edit form-->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<!-- importing xsl files -->
	<!-- constants.xsl which contains constant XSLT variables -->
	<xsl:import href="../xsl/constants.xsl" />

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
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/edit-forms.js"><xsl:value-of select="$whiteSpace"/></script>
			<script language="JavaScript" src="#Attribute%//@relativeFileDirectory%/ab-wf-rules-edit.js"><xsl:value-of select="$whiteSpace"/></script>
			<!-- calling template SetUpLocales which is in locale.xsl to set up locale javascript variables -->
			<xsl:call-template name="SetUpLocales"/>
			<script language="JavaScript">
				var orig_activity_id = "<xsl:value-of select="/*/afmTableGroup/dataSource/data/records/record/@afm_wf_rules.activity_id"/>";
				var orig_rule_id     = "<xsl:value-of select="/*/afmTableGroup/dataSource/data/records/record/@afm_wf_rules.rule_id"/>";
				var is_active        = "<xsl:value-of select="/*/afmTableGroup/dataSource/data/records/record/@afm_wf_rules.is_active"/>";
				var rule_type        = "<xsl:value-of select="/*/afmTableGroup/dataSource/data/records/record/@afm_wf_rules.rule_type"/>";
			</script>
		</head>

		<body onload='setupTabPages("{$afmInputsForm}", false)' class="body" leftmargin="5" rightmargin="5" topmargin="5">
			<xsl:variable name="wf_tgrp" select="/*/afmTableGroup"/>
			<xsl:call-template name="SetUpFieldsInformArray">
				<xsl:with-param name="fieldNodes" select="$wf_tgrp/dataSource/data/fields" />
			</xsl:call-template>
			<!-- calling template table-group-title which is in common.xsl to set up tgrp's title in the top of html page -->
			<xsl:call-template name="table-group-title">
				<xsl:with-param name="title" select="$wf_tgrp/title"/>
			</xsl:call-template>
			<table width="100%" valign="top">
				<form name="{$afmInputsForm}">
				<tr>
					<td>
						<table>
							<tr>
								<td class="inputFieldLabel">
									<xsl:value-of select="$wf_tgrp/dataSource/data/fields/field[@name='activity_id']/@singleLineHeading"/>:
								</td>
								<td>
									<input class="login_inputField" maxlength="{$wf_tgrp/dataSource/data/fields/field[@name='activity_id']/@size}" type="text" name="afm_wf_rules.activity_id" value="{$wf_tgrp/dataSource/data/records/record/@afm_wf_rules.activity_id}" onchange='validationInputs("{$afmInputsForm}", "afm_wf_rules.activity_id")'/>
									<xsl:call-template name="SelectValue">
										<xsl:with-param name="afmTableGroup" select="$wf_tgrp"/>
										<xsl:with-param name="formName" select="$afmInputsForm"/>
										<xsl:with-param name="recordName" select="'afm_wf_rules.activity_id'"/>
										<xsl:with-param name="actionTitle" select="'...'"/>
									</xsl:call-template>
								</td>
							</tr>
							<tr>
								<td class="inputFieldLabel">
									<xsl:value-of select="$wf_tgrp/dataSource/data/fields/field[@name='rule_id']/@singleLineHeading"/>:
								</td>
								<td>
									<input class="login_inputField" maxlength="{$wf_tgrp/dataSource/data/fields/field[@name='rule_id']/@size}" type="text" name="afm_wf_rules.rule_id" value="{$wf_tgrp/dataSource/data/records/record/@afm_wf_rules.rule_id}" onchange='validationInputs("{$afmInputsForm}", "afm_wf_rules.rule_id")'/>
									<xsl:call-template name="SelectValue">
										<xsl:with-param name="afmTableGroup" select="$wf_tgrp"/>
										<xsl:with-param name="formName" select="$afmInputsForm"/>
										<xsl:with-param name="recordName" select="'afm_wf_rules.rule_id'"/>
										<xsl:with-param name="actionTitle" select="'...'"/>
									</xsl:call-template>
								</td>
							</tr>
							<tr>
								<td class="inputFieldLabel">
									<xsl:value-of select="$wf_tgrp/message[@name='description']"/>:
								</td>
								<td>
									<input class="login_inputField" maxlength="{$wf_tgrp/dataSource/data/fields/field[@name='description']/@size}" type="text" name="afm_wf_rules.description" value=""/>
								</td>
							</tr>
							<tr>
								<td class="inputFieldLabel">
									<xsl:value-of select="$wf_tgrp/dataSource/data/fields/field[@name='group_name']/@singleLineHeading"/>:
								</td>
								<td>
									<input class="login_inputField" maxlength="{$wf_tgrp/dataSource/data/fields/field[@name='group_name']/@size}" type="text" name="afm_wf_rules.group_name" value="{$wf_tgrp/dataSource/data/records/record/@afm_wf_rules.group_name}" onchange='validationInputs("{$afmInputsForm}", "afm_wf_rules.group_name")'/>
									<xsl:call-template name="SelectValue">
										<xsl:with-param name="afmTableGroup" select="$wf_tgrp"/>
										<xsl:with-param name="formName" select="$afmInputsForm"/>
										<xsl:with-param name="recordName" select="'afm_wf_rules.group_name'"/>
										<xsl:with-param name="actionTitle" select="'...'"/>
									</xsl:call-template>
								</td>
							</tr>
							<tr>
								<td class="inputFieldLabel">
									<xsl:value-of select="$wf_tgrp/dataSource/data/fields/field[@name='rule_type']/@singleLineHeading"/>:
								</td>
								<td class="inputFieldLabel">
									<input type="radio" name="afm_wf_rules.rule_type" value="Notification" onclick='ruleClick(0, "{$afmInputsForm}");'/><span translatable="true">Notification</span>
									<input type="radio" name="afm_wf_rules.rule_type" value="Scheduled" onclick='ruleClick(1, "{$afmInputsForm}");'/><span translatable="true">Scheduled</span>
									<input type="radio" name="afm_wf_rules.rule_type" value="Message" onclick='ruleClick(2, "{$afmInputsForm}");'/><span translatable="true">Message</span>
								</td>
							</tr>
							<tr>
								<td class="inputFieldLabel">
									<xsl:value-of select="$wf_tgrp/dataSource/data/fields/field[@name='is_active']/@singleLineHeading"/>:
								</td>
								<td class="inputFieldLabel">
									<input type="radio" name="afm_wf_rules.is_active" value="1" onclick='isActiveClick("1", "{$afmInputsForm}");'/><span translatable="true">Yes</span>
									<input type="radio" name="afm_wf_rules.is_active" value="0" onclick='isActiveClick("0", "{$afmInputsForm}");'/><span translatable="true">No</span>
								</td>
							</tr>
						</table>
					</td>
				</tr>
				<tr>
					<td>
						<br/>
						<table cellspacing="0" cellpadding="0" width="600" height="420">
							<tr height="2">
								<td rowspan="5" bgcolor="#000000" width="2"/>
								<td bgcolor="#000000" width="98" id="tab0Horizon"/>
								<td rowspan="3" bgcolor="#000000" width="2" id="tab0Vertical"/>
								<td bgcolor="#000000" width="98" id="tab1Horizon"/>
								<td rowspan="3" bgcolor="#000000" width="2" id="tab1Vertical"/>
								<td bgcolor="#000000" width="98" id="tab2Horizon"/>
								<td rowspan="3" bgcolor="#000000" width="2" id="tab2Vertical"/>
								<td bgcolor="#000000" width="98" id="tab3Horizon"/>
								<td rowspan="3" bgcolor="#000000" width="2" id="tab3Vertical"/>
								<td width="196"/>
								<td width="2"/>
							</tr>
							<tr height="20">
								<td class="inputFieldLabel" id="tab0"><a href="#" onclick="tabClick(0);"><center><span translatable="true">Event</span></center></a></td>
								<td class="inputFieldLabel" id="tab1"><a href="#" onclick="tabClick(1);"><center><span translatable="true">Notification</span></center></a></td>
								<td class="inputFieldLabel" id="tab2"><a href="#" onclick="tabClick(2);"><center><span translatable="true">Scheduled</span></center></a></td>
								<td class="inputFieldLabel" id="tab3"><a href="#" onclick="tabClick(3);"><center><span translatable="true">Message</span></center></a></td>
							</tr>
							<tr height="2">
								<td bgcolor="#000000" id="tabLine0"> </td>
								<td bgcolor="#000000" id="tabLine1"> </td>
								<td bgcolor="#000000" id="tabLine2"> </td>
								<td bgcolor="#000000" id="tabLine3"> </td>
								<td bgcolor="#000000"> </td>
								<td rowspan = "3" bgcolor="#000000"> </td>
							</tr>
							<tr height="394">
								<td colspan="9" valign="top">
									<center><table cellpadding="4" cellspacing="0" width="596" height="384"><tr><td class="inputFieldLabel" valign="top">
										<span id="scheduleData" style="display:none;">
											<b><span translatable="true">Invoke Rule Every:</span></b><br/>
											<table cellpadding="1" cellspacing="0">
												<tr>
													<td class="inputFieldLabel">
														<input type="radio" name="repeatInterval" value="60" onClick='arbIntToggle("{$afmInputsForm}");' /><span translatable="true">Minute</span>
													</td>
													<td class="inputFieldLabel">
														<input type="radio" name="repeatInterval" value="900" onClick='arbIntToggle("{$afmInputsForm}");' /><span translatable="true">Quarter-hour</span>
													</td>
													<td class="inputFieldLabel">
														<input type="radio" name="repeatInterval" value="3600" onClick='arbIntToggle("{$afmInputsForm}");' /><span translatable="true">Hour</span>
													</td>
												</tr>
												<tr>
													<td class="inputFieldLabel">
														<input type="radio" name="repeatInterval" value="86400" onClick='arbIntToggle("{$afmInputsForm}");' /><span translatable="true">Day</span>
													</td>
													<td class="inputFieldLabel">
														<input type="radio" name="repeatInterval" value="604800" onClick='arbIntToggle("{$afmInputsForm}");' /><span translatable="true">Week</span>
													</td>
													<td class="inputFieldLabel">
														<input type="radio" name="repeatInterval" value="2592000" onClick='arbIntToggle("{$afmInputsForm}");' /><span translatable="true">Month</span>
													</td>
												</tr>
												<tr>
													<td class="inputFieldLabel" colspan="3">
														<input type="radio" name="repeatInterval" value="0" onClick='arbIntToggle("{$afmInputsForm}");' /><span translatable="true">Arbitrary Interval</span>
													</td>
												</tr>
												<tr>
													<td class="inputFieldLabel">
														<span translatable="true">Interval Expression:</span>
													</td>
													<td colspan="2">
														<input class="login_inputField" type="text" name="cron" value="" />
													</td>
												</tr>
												<tr>
													<td class="inputFieldLabel" colspan="3">
														<br/>
														<b><span translatable="true">Start and End Dates:</span></b>
													</td>
												</tr>
												<tr>
													<td class="inputFieldLabel">
														<span translatable="true">Start date and time:</span>
													</td>
													<td>
														<input class="inputField" type="text" name="startDate" value="MM-DD-YYYY" maxlength="10" onblur='validationAndConvertionDateAndTime("{$afmInputsForm}","startDate",false,"JAVA.SQL.DATE");'/>
														<input class="AbActionButtonFormStdWidth" type="button" value="..." onclick='selectNonDBValue("{$afmInputsForm}","startDate")'/>
													</td>
													<td>
														<input class="inputField" type="text" name="startTime" value="00:00:00" maxlength="8" onblur='validationAndConvertionDateAndTime("{$afmInputsForm}","startTime",true,"JAVA.SQL.TIME");'/>
													</td>
												</tr>
												<tr>
													<td class="inputFieldLabel" colspan="3">
														<input type="checkbox" name="repeatUntilEnd" onClick='repeatToggle("{$afmInputsForm}");' /> <span translatable="true">Repeat until end date and time?</span>
													</td>
												</tr>
												<tr>
													<td class="inputFieldLabel">
														<span translatable="true">End date and time:</span>
													</td>
													<td>
														<input class="inputField" type="text" name="endDate" value="YYYY-MM-DD" maxlength="10" onblur='validationAndConvertionDateAndTime("{$afmInputsForm}","endDate",false,"JAVA.SQL.DATE");'/>
														<input class="AbActionButtonFormStdWidth" type="button" name="endDateSValue" value="..." onclick='selectNonDBValue("{$afmInputsForm}","endDate")' />
													</td>
													<td>
														<input class="inputField" type="text" name="endTime" value="00:00:00" maxlength="8" onblur='validationAndConvertionDateAndTime("{$afmInputsForm}","endTime",true,"JAVA.SQL.TIME");'/>
													</td>
												</tr>
											</table>
											<br/>
											<b><span translatable="true">Startup:</span></b><br/>
											<input type="checkbox" name="runOnStartup"/> <span translatable="true">Run on Startup?</span><br/>
											<br/>
										</span>
										<span id="eventData" style="display:none;">
											<table cellpadding="1" cellspacing="0">
												<tr>
													<td class="inputFieldLabel">
														<span translatable="true">Event Handler Class:</span>
													</td>
													<td>
														<input class="login_inputField" type="text" name="eventHandlerClass" value=""/>
													</td>
												</tr>
												<tr>
													<td class="inputFieldLabel">
														<span translatable="true">Event Handler Method:</span>
													</td>
													<td>
														<input class="login_inputField" type="text" name="eventHandlerMethod" value=""/>
													</td>
												</tr>
											</table>
										</span>
										<span id="notificationData" style="display:none;">
											<b><span translatable="true">Notification view:</span></b><br/>
											<input class="login_inputField" type="text" name="notificationView" value=""/><br/>
										</span>
										<span id="inputsData" style="display:none;">
											<b><span translatable="true">Inputs:</span></b><br/>
											<textarea name="inputs" cols="70" rows="20"><xsl:value-of select="$whiteSpace"/></textarea>
										</span>

										<span id="hiddenFields" style="display:none;">
											Number of times to repeat: <input type="text" name="repeatCount" value="-1"/><br/>
											<textarea name="afm_wf_rules.xml_rule_props"><xsl:value-of disable-output-escaping="yes" select="/*/afmTableGroup/dataSource/data/records/record/@afm_wf_rules.xml_rule_props"/></textarea><br/>
											<textarea name="afm_wf_rules.xml_sched_props"><xsl:value-of disable-output-escaping="yes" select="/*/afmTableGroup/dataSource/data/records/record/@afm_wf_rules.xml_sched_props"/></textarea>
										</span>
									</td></tr></table></center>
								</td>
							</tr>
							<tr height="2">
								<td colspan="9" bgcolor="#000000"/>
							</tr>
						</table>
					</td>
				</tr>
				<tr align="center">
					<td colspan="2" align="center">
						<br/>
						<table class="bottomActionsTable">
							<!-- holding all action buttons on the form -->
							<tr><td>
								<xsl:variable name="SQLAction" select="//afmAction[@type='executeTransaction']"/>
								<input class="AbActionButtonFormStdWidth" type="button" value="{$SQLAction/title}" onclick='return saveData("{$afmInputsForm}","{$SQLAction/@serialized}","_self",true)'/>
								<xsl:variable name="addnew_message" select="//message[@name='addNew']"/>
								<input class="AbActionButtonFormStdWidth" type="button" value="{$addnew_message}" onclick='clearForm("{$afmInputsForm}")'/>
								<xsl:variable name="delete_message" select="//message[@name='delete']"/>
								<input class="AbActionButtonFormStdWidth" type="button" value="{$delete_message}" onclick='return onDelete("{$afmInputsForm}","{$SQLAction/@serialized}","_self",true)'/>
								<xsl:variable name="cancel_message" select="//afmAction[@type='render']"/>
								<input class="AbActionButtonFormStdWidth" type="button" value="{$cancel_message/title}" onclick='cancelForm("_self")'/>
							</td>
							<td>
								<xsl:variable name="runrule_action" select="//afmAction[@eventName='AbSystemAdministration-runWorkflowRule']"/>
								<input class="AbActionButtonFormStdWidth" type="button" value="{$runrule_action/title}" onclick='runThisRule("{$afmInputsForm}","{$runrule_action/@serialized}","_self",true)'/>
								<xsl:variable name="reload_action" select="//afmAction[@eventName='AbSystemAdministration-reloadScheduler']"/>
								<input class="AbActionButtonFormStdWidth" type="button" value="{$reload_action/title}" onclick='reloadScheduler("{$afmInputsForm}","{$reload_action/@serialized}","_self",true)'/>
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
	<xsl:include href="../xsl/common.xsl" />
	<xsl:include href="../xsl/locale.xsl" />
	<xsl:include href="../xsl/inputs-validation.xsl" />
</xsl:stylesheet>
