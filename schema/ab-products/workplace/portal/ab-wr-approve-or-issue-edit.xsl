<?xml version="1.0"?>
<!-- xslt called by Java to handle XML data:ab-wr-approve-or-issue.axvw: edit tgrp -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">	
	<!-- importing xsl files -->
	<!-- constants.xsl which contains constant XSLT variables -->
	<xsl:import href="../../../ab-system/xsl/constants.xsl" />

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
			<script language="JavaScript" src="#Attribute%//@relativeFileDirectory%/ab-wr-approve-or-issue-edit.js"><xsl:value-of select="$whiteSpace"/></script>
			<!-- calling template SetUpLocales which is in locale.xsl to set up locale javascript variables -->
			<xsl:call-template name="SetUpLocales"/>
		</head>
		<xsl:variable name="record_PK" select="/*/afmTableGroup/dataSource/data/records/record/@wr.wr_id"/>
			
		<body class="body"  onload='prepareLoad("{$afmInputsForm}","{$record_PK}")' leftmargin="0" rightmargin="0" topmargin="0" bottomMargin="0"> 
			
			<!-- calling template table-group-title which is in common.xsl to set up tgrp's title in the top of html page -->
			<xsl:variable name="str_wr_id" select="/*/afmTableGroup/dataSource/data/records/record/@wr.wr_id"/>
			<xsl:call-template name="table-group-title">
				<xsl:with-param name="title" select="concat(/*/afmTableGroup/title,': ',$str_wr_id)"/>
			</xsl:call-template>	
			
			<!-- calling template SetUpFieldsInformArray in inputs-validation.xsl to use its template SetUpFieldsInformArray -->
			<xsl:call-template name="SetUpFieldsInformArray">
				<xsl:with-param name="fieldNodes" select="/*/afmTableGroup/dataSource/data/fields"/>
			</xsl:call-template>
			
			<table align="left" valign="top" width="100%" style="topmargin:0">
				<xsl:if test="$record_PK=''">
					<tr><td style="font-size:14;font-family:arial,geneva,helvetica,sans-serif;color:red">
						<p><xsl:value-of select="//message[@name='error']"/></p>
					</td></tr>
				</xsl:if>
				<xsl:if test="$record_PK!=''">
				<tr><td>
					<table  valign="top" style="topmargin:0">
						<form name="{$afmInputsForm}">
						<tr><td>
							<!-- report part -->
							<table width="100%" valign="top" style="topmargin:0">
								<colgroup span="2">
								<col  width="25%" class="AbHeaderRecord"/>
								<col  width="75%" class="AbDataRecord"/>
								<tr>
									<td nowrap="1">
										<span  translatable="true">Requested By:</span>
									</td>
									<td>
										<input  type="hidden" name="wr.wr_id" value="{$str_wr_id}"/>
										<xsl:variable name="str_requestor" select="/*/afmTableGroup/dataSource/data/records/record/@wr.requestor"/>
										<input  type="hidden" name="wr.requestor" value="{$str_requestor}"/>
										<span  ID="show_wr.requestor"><xsl:value-of select="$str_requestor"/></span>
									</td>
								</tr>

								<tr>
									<td  nowrap="1">
										<span  translatable="true">Work Request Status:</span>
									</td>
									<td>
										<xsl:variable name="str_status" select="/*/afmTableGroup/dataSource/data/records/record/@wr.status"/>
										<input type="hidden" name="wr.status" value="{$str_status}"/>
										<xsl:variable name="display_value_status">
										<xsl:for-each select="/*/afmTableGroup/dataSource/data/fields/field[@name='status']/enumeration/item">
											<xsl:if test="@value=$str_status">
												<xsl:value-of select="@displayValue"/>
											</xsl:if>
										</xsl:for-each>
										</xsl:variable>
										<span class="inputFieldLabel" ID="show_wr.status"><xsl:value-of select="$display_value_status"/></span>
									</td>
								</tr>
							
								<tr>
									<td  nowrap="1">
										<span  translatable="true">Phone of Requestor:</span>
									</td>
									<td>
										<xsl:variable name="str_phone" select="/*/afmTableGroup/dataSource/data/records/record/@wr.phone"/>
										<input type="hidden" name="wr.phone" value="{$str_phone}"/>
										<span  ID="show_wr.phone"><xsl:value-of select="$str_phone"/></span>
									</td>
								</tr>
								<tr>
									<td  nowrap="1">
										<span  translatable="true">Date Work Requested:</span>
									</td>
									<td>
										<xsl:variable name="str_date_requested" select="/*/afmTableGroup/dataSource/data/records/record/@wr.date_requested"/>
										<input type="hidden" name="wr.date_requested" value="{$str_date_requested}"/>
										<span   ID="show_wr.date_requested"><xsl:value-of select="$str_date_requested"/></span>
									</td>
								</tr>
								<tr>
									<td  nowrap="1">
										<span  translatable="true">Work Location:</span>
									</td>
									<td>
										<xsl:variable name="str_bl_id" select="/*/afmTableGroup/dataSource/data/records/record/@wr.bl_id"/>
										<input name="wr.bl_id" type="hidden" value="{$str_bl_id}"/>
										<xsl:variable name="str_fl_id" select="/*/afmTableGroup/dataSource/data/records/record/@wr.fl_id"/>
										<input name="wr.fl_id" type="hidden" value="{$str_fl_id}"/>
										<xsl:variable name="str_rm_id" select="/*/afmTableGroup/dataSource/data/records/record/@wr.rm_id"/>
										<input name="wr.rm_id" type="hidden" value="{$str_rm_id}"/>
										<span ID="location"><xsl:value-of select="concat($str_bl_id,'-',$str_fl_id,'-',$str_rm_id)"/></span>
									</td>
								</tr>
								<tr>
									<td  nowrap="1">
										<span  translatable="true">Time Work Requested:</span>
									</td>
									<td>
										<xsl:variable name="str_time_requested" select="/*/afmTableGroup/dataSource/data/records/record/@wr.time_requested"/>
										<input  type="hidden" name="wr.time_requested" value="{$str_time_requested}"/>
										<span ID="show_wr.time_requested"><xsl:value-of select="$str_time_requested"/></span>
									</td>
								</tr>
							
								<tr>
									<td  nowrap="1">
										<span  translatable="true">Equipment Code:</span>
									</td>
									<td>
										<xsl:variable name="str_eq_id" select="/*/afmTableGroup/dataSource/data/records/record/@wr.eq_id"/>
										<input type="hidden" name="wr.eq_id" value="{$str_eq_id}" />
										<span ID="show_wr.eq_id"><xsl:value-of select="$str_eq_id"/></span>
									</td>
								</tr>
								<tr>
									<td  nowrap="1">	
										<span  translatable="true">Date Status Last Changed:</span> 
									</td>
									<td  >
										<xsl:variable name="str_date_stat_chg" select="/*/afmTableGroup/dataSource/data/records/record/@wr.date_stat_chg"/>
										<input type="hidden" name="wr.date_stat_chg" value="{$str_date_stat_chg}" />
										<span  ID="show_wr.date_stat_chg"><xsl:value-of select="$str_date_stat_chg"/></span>
									</td>
								</tr>
								<tr>
									<td   nowrap="1" >	
										<span  translatable="true">Time Status Last Changed:</span> 
									</td>
									<td  >
										<xsl:variable name="str_time_stat_chg" select="/*/afmTableGroup/dataSource/data/records/record/@wr.time_stat_chg"/>
										<input type="hidden" name="wr.time_stat_chg" value="{$str_time_stat_chg}" />
										<span  ID="show_wr.time_stat_chg"><xsl:value-of select="$str_time_stat_chg"/></span>
									</td>
								</tr>
								</colgroup>
							</table>
						</td></tr>
						<tr><td>
							<!-- edit part -->
							<table style="topmargin:0">
								<tr>	
									<td  class="inputFieldLabel_validated" align="left" >
										<span  translatable="true">Problem Type:</span>
									</td>
									<td  class="inputFieldLabel_validated" align="left" >
										<span  translatable="true">Primary Trade:</span>
									</td>
									
								</tr>
								<tr>
									<td>
										<!-- hidden inputs to hold fields' values -->
										<input  type="hidden" name="wr.act_labor_hours" id="wr.act_labor_hours" value="{/*/afmTableGroup/dataSource/data/records/record/@wr.act_labor_hours}"/>
										<input  type="hidden" name="wr.cause_type" id="wr.cause_type" value="{/*/afmTableGroup/dataSource/data/records/record/@wr.cause_type}"/>
										<input  type="hidden" name="wr.cf_notes" id="wr.cf_notes" value="{/*/afmTableGroup/dataSource/data/records/record/@wr.cf_notes}"/>
										<input  type="hidden" name="wr.completed_by" id="wr.completed_by" value="{/*/afmTableGroup/dataSource/data/records/record/@wr.completed_by}"/>
										<input  type="hidden" name="wr.cost_est_labor" id="wr.cost_est_labor" value="{/*/afmTableGroup/dataSource/data/records/record/@wr.cost_est_labor}"/>
										<input  type="hidden" name="wr.cost_est_other" id="wr.cost_est_other" value="{/*/afmTableGroup/dataSource/data/records/record/@wr.cost_est_other}"/>
										<input  type="hidden" name="wr.cost_est_parts" id="wr.cost_est_parts" value="{/*/afmTableGroup/dataSource/data/records/record/@wr.cost_est_parts}"/>
										<input  type="hidden" name="wr.cost_est_tools" id="wr.cost_est_tools" value="{/*/afmTableGroup/dataSource/data/records/record/@wr.cost_est_tools}"/>
										<input  type="hidden" name="wr.cost_est_total" id="wr.cost_est_total" value="{/*/afmTableGroup/dataSource/data/records/record/@wr.cost_est_total}"/>
										<input  type="hidden" name="wr.cost_labor" id="wr.cost_labor" value="{/*/afmTableGroup/dataSource/data/records/record/@wr.cost_labor}"/>
										<input  type="hidden" name="wr.cost_other" id="wr.cost_other" value="{/*/afmTableGroup/dataSource/data/records/record/@wr.cost_other}"/>
										<input  type="hidden" name="wr.cost_parts" id="wr.cost_parts" value="{/*/afmTableGroup/dataSource/data/records/record/@wr.cost_parts}"/>

										<input  type="hidden" name="wr.cost_tools" id="wr.cost_tools" value="{/*/afmTableGroup/dataSource/data/records/record/@wr.cost_tools}"/>
										<input  type="hidden" name="wr.cost_total" id="wr.cost_total" value="{/*/afmTableGroup/dataSource/data/records/record/@wr.cost_total}"/>
										<input  type="hidden" name="wr.curr_meter_val" id="wr.curr_meter_val" value="{/*/afmTableGroup/dataSource/data/records/record/@wr.curr_meter_val}"/>
										<input  type="hidden" name="wr.date_completed" id="wr.date_completed" value="{/*/afmTableGroup/dataSource/data/records/record/@wr.date_completed}"/>
										<input  type="hidden" name="wr.date_est_completion" id="wr.date_est_completion" value="{/*/afmTableGroup/dataSource/data/records/record/@wr.date_est_completion}"/>
										<input  type="hidden" name="wr.desc_other_costs" id="wr.desc_other_costs" value="{/*/afmTableGroup/dataSource/data/records/record/@wr.desc_other_costs}"/>
										<input  type="hidden" name="wr.down_time" id="wr.down_time" value="{/*/afmTableGroup/dataSource/data/records/record/@wr.down_time}"/>
										<input  type="hidden" name="wr.dp_id" id="wr.dp_id" value="{/*/afmTableGroup/dataSource/data/records/record/@wr.dp_id}"/>
										<input  type="hidden" name="wr.dv_id" id="wr.dv_id" value="{/*/afmTableGroup/dataSource/data/records/record/@wr.dv_id}"/>
										<input  type="hidden" name="wr.est_labor_hours" id="wr.est_labor_hours" value="{/*/afmTableGroup/dataSource/data/records/record/@wr.est_labor_hours}"/>
										<input  type="hidden" name="wr.location" id="wr.location" value="{/*/afmTableGroup/dataSource/data/records/record/@wr.location}"/>
										<input  type="hidden" name="wr.option1" id="wr.option1" value="{/*/afmTableGroup/dataSource/data/records/record/@wr.option1}"/>
										

										<input  type="hidden" name="wr.option2" id="wr.option2" value="{/*/afmTableGroup/dataSource/data/records/record/@wr.option2}"/>
										<input  type="hidden" name="wr.pmp_id" id="wr.pmp_id" value="{/*/afmTableGroup/dataSource/data/records/record/@wr.pmp_id}"/>
										<input  type="hidden" name="wr.pms_id" id="wr.pms_id" value="{/*/afmTableGroup/dataSource/data/records/record/@wr.pms_id}"/>
										<input  type="hidden" name="wr.repair_type" id="wr.repair_type" value="{/*/afmTableGroup/dataSource/data/records/record/@wr.repair_type}"/>
										<input  type="hidden" name="wr.time_completed" id="wr.time_completed" value="{/*/afmTableGroup/dataSource/data/records/record/@wr.time_completed}"/>
										<input  type="hidden" name="wr.wo_id" id="wr.wo_id" value="{/*/afmTableGroup/dataSource/data/records/record/@wr.wo_id}"/>

										<xsl:variable name="str_prob_type" select="/*/afmTableGroup/dataSource/data/records/record/@wr.prob_type"/>
										<input class="inputField" maxlength="{/*/afmTableGroup/dataSource/data/fields/field[@name='prob_type']/@size}" type="text" name="wr.prob_type" value="{$str_prob_type}" onchange='validationInputs("{$afmInputsForm}", "wr.prob_type")' onblur='validationInputs("{$afmInputsForm}", "wr.prob_type")'/>
										<xsl:call-template name="SelectValue">
											<xsl:with-param name="afmTableGroup" select="/*/afmTableGroup"/>
											<xsl:with-param name="formName" select="$afmInputsForm"/>
											<xsl:with-param name="recordName" select="'wr.prob_type'"/>
											<xsl:with-param name="actionTitle" select="'...'"/>
										</xsl:call-template>
									</td>
									<td>
										<xsl:variable name="str_tr_id" select="/*/afmTableGroup/dataSource/data/records/record/@wr.tr_id"/>
										<input class="inputField" maxlength="{/*/afmTableGroup/dataSource/data/fields/field[@name='tr_id']/@size}" type="text" name="wr.tr_id" value="{$str_tr_id}" onchange='validationInputs("{$afmInputsForm}", "wr.tr_id")' onblur='validationInputs("{$afmInputsForm}", "wr.tr_id")'/>
										<xsl:call-template name="SelectValue">
											<xsl:with-param name="afmTableGroup" select="/*/afmTableGroup"/>
											<xsl:with-param name="formName" select="$afmInputsForm"/>
											<xsl:with-param name="recordName" select="'wr.tr_id'"/>
											<xsl:with-param name="actionTitle" select="'...'"/>
										</xsl:call-template>
									</td>
								</tr>
								<tr>
									<td  class="inputFieldLabel"  align="left" >	
										<span  translatable="true">Date to Perform:</span> 
									</td>
									<td  class="inputFieldLabel"  align="left" >	
										<span  translatable="true">Time to Perform:</span> 
									</td>
									
								</tr>
								<tr>
									<td>
										<xsl:variable name="str_date_assigned" select="/*/afmTableGroup/dataSource/data/records/record/@wr.date_assigned"/>
										<input class="inputField" type="text" name="wr.date_assigned" SIZE="20" VALUE="{$str_date_assigned}" onchange='validationAndConvertionDateInput(this, "wr.date_assigned", null, "false",false, false)' onblur='validationAndConvertionDateInput(this, "wr.date_assigned", null,"false", false,true)'/>
										<xsl:call-template name="SelectValue">
											<xsl:with-param name="afmTableGroup" select="/*/afmTableGroup"/>
											<xsl:with-param name="formName" select="$afmInputsForm"/>
											<xsl:with-param name="recordName" select="'wr.date_assigned'"/>
											<xsl:with-param name="actionTitle" select="'...'"/>
										</xsl:call-template>
									</td>
									<td  >
										<!-- trucate time value to only get HH:MM -->
										<xsl:variable name="str_time_assigned" select="/*/afmTableGroup/dataSource/data/records/record/@wr.time_assigned"/>
										<xsl:variable name="trucated_time_value">
											<xsl:choose>
												<xsl:when test="$str_time_assigned=''">
													<xsl:value-of select="$str_time_assigned"/>
												</xsl:when>
												<xsl:otherwise>
													<xsl:value-of select="substring($str_time_assigned,1,5)"/>
												</xsl:otherwise>
											</xsl:choose>
										</xsl:variable>
										<input class="inputField" type="text" name="wr.time_assigned" SIZE="20"  VALUE="{$trucated_time_value}" onchange='validationAndConvertionTimeInput(this, "wr.time_assigned",null,"false",true, false)' onblur='validationAndConvertionTimeInput(this, "wr.time_assigned", null,"false",true,true)'/>
										<INPUT type="hidden" size="20" id="Storedwr.time_assigned" name="Storedwr.time_assigned" VALUE="{$str_time_assigned}"/> 
									</td>
									
								</tr>
								<tr>
									<td  class="inputFieldLabel" align="left" >
										<span  translatable="true">Work Priority:</span>
									</td>
									<td  class="inputFieldLabel_validated" align="left" >
										<span  translatable="true">Account Code:</span>
									</td>
								</tr>
								<tr>
									<td>
										<xsl:variable name="str_priority" select="/*/afmTableGroup/dataSource/data/records/record/@wr.priority"/>
										<input class="inputField" maxlength="{/*/afmTableGroup/dataSource/data/fields/field[@name='priority']/@size}" type="text" name="wr.priority" value="{$str_priority}" onchange='validationInputs("{$afmInputsForm}", "wr.priority")' onblur='validationInputs("{$afmInputsForm}", "wr.priority")'/>
									</td>
									<td>
										<xsl:variable name="str_ac_id" select="/*/afmTableGroup/dataSource/data/records/record/@wr.ac_id"/>
										<input class="inputField" maxlength="{/*/afmTableGroup/dataSource/data/fields/field[@name='ac_id']/@size}" type="text" name="wr.ac_id" value="{$str_ac_id}" onchange='validationInputs("{$afmInputsForm}", "wr.ac_id")' onblur='validationInputs("{$afmInputsForm}", "wr.ac_id")'/>
										<xsl:call-template name="SelectValue">
											<xsl:with-param name="afmTableGroup" select="/*/afmTableGroup"/>
											<xsl:with-param name="formName" select="$afmInputsForm"/>
											<xsl:with-param name="recordName" select="'wr.ac_id'"/>
											<xsl:with-param name="actionTitle" select="'...'"/>
										</xsl:call-template>
									</td>
								</tr>
								<tr>
									<td  class="inputFieldLabel" align="left" colspan="2">
										<span  translatable="true">Problem Description:</span>
										<xsl:call-template name="SelectValue">
											<xsl:with-param name="afmTableGroup" select="/*/afmTableGroup"/>
											<xsl:with-param name="formName" select="$afmInputsForm"/>
											<xsl:with-param name="recordName" select="'wr.description'"/>
											<xsl:with-param name="actionTitle" select="//message[@name='description']"/>
										</xsl:call-template>
									</td>

								</tr>
								<tr>
									<td colspan="2">
										<xsl:variable name="str_description" select="/*/afmTableGroup/dataSource/data/records/record/@wr.description"/>
										<textarea class="textareaABData" name="wr.description" cols="55" rows="4" wrap="PHYSICAL">
											<xsl:value-of select="$str_description"/><xsl:value-of select="$whiteSpace"/>
										</textarea>
									</td>

								</tr>
								<tr>
									<td colspan="2" align="center">
										<xsl:variable name="executeTransaction" select="//afmAction[@type='executeTransaction']/@serialized"/>
										<input  class="AbActionButtonFormStdWidth" type="button" value="{//message[@name='reject']}" onclick='onReject("{$executeTransaction}","{$afmInputsForm}")'/>
										<input  class="AbActionButtonFormStdWidth" type="button" value="{//message[@name='hold']}" onclick='onHold("{$executeTransaction}","{$afmInputsForm}")'/>
										<input  class="AbActionButtonFormStdWidth" type="button" value="{//message[@name='approve']}" onclick='onApproveAndIssue("{$executeTransaction}","{$afmInputsForm}")'/>
									</td>

								</tr>
							</table>
						</td></tr>
						</form>
					</table>
				</td></tr>
				</xsl:if>
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