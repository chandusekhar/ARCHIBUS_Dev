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
			<script language="JavaScript" src="#Attribute%//@relativeFileDirectory%/ab-wr-cf-assign.js"><xsl:value-of select="$whiteSpace"/></script>
			<!-- calling template SetUpLocales which is in locale.xsl to set up locale javascript variables -->
			<xsl:call-template name="SetUpLocales"/>
		</head>
		<xsl:variable name="record_PK" select="/*/afmTableGroup/dataSource/data/records/record/@wrcf.wr_id"/>
		<xsl:variable name="record_PKCF" select="/*/afmTableGroup/dataSource/data/records/record/@wrcf.cf_id"/>

		<body class="body"  onload='prepareLoad("{$afmInputsForm}","{$record_PK}")' leftmargin="0" rightmargin="0" topmargin="0" bottomMargin="0">

			<!-- calling template table-group-title which is in common.xsl to set up tgrp's title in the top of html page -->
			<xsl:variable name="str_wr_id" select="/*/afmTableGroup/dataSource/data/records/record/@wrcf.wr_id"/>
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
				  <xsl:if test="$record_PKCF!=''">
					<tr><td>
					<table  valign="top" style="topmargin:0">
						<form name="{$afmInputsForm}">
						<tr><td>

							<table width="100%" valign="top" style="topmargin:0">
								<colgroup span="2">
								<col  width="30%" />
								<col  width="70%" />
								<tr>
									<td  nowrap="1" class="AbHeaderRecord">
										<span  translatable="true">Problem Type:</span>
									</td>
									<td class="AbDataRecord">
										<xsl:variable name="str_prob_type" select="/*/afmTableGroup/dataSource/data/records/record/@wr.prob_type"/>
										<span ID="show_wr.prob_type"><xsl:value-of select="$str_prob_type"/></span>
									</td>
								</tr>
								<tr>
									<td  nowrap="1" class="AbHeaderRecord">
										<span  translatable="true">Work Location:</span>
									</td>
									<td class="AbDataRecord">
										<xsl:variable name="str_bl_id" select="/*/afmTableGroup/dataSource/data/records/record/@wr.bl_id"/>
										<xsl:variable name="str_fl_id" select="/*/afmTableGroup/dataSource/data/records/record/@wr.fl_id"/>
										<xsl:variable name="str_rm_id" select="/*/afmTableGroup/dataSource/data/records/record/@wr.rm_id"/>
										<span ID="location"><xsl:value-of select="concat($str_bl_id,'-',$str_fl_id,'-',$str_rm_id)"/></span>
									</td>
								</tr>
								<tr>
									<td  nowrap="1" class="AbHeaderRecord">
										<span  translatable="true">Equipment Code:</span>
									</td>
									<td class="AbDataRecord">
										<xsl:variable name="str_eq_id" select="/*/afmTableGroup/dataSource/data/records/record/@wr.eq_id"/>
										<span ID="show_wr.eq_id"><xsl:value-of select="$str_eq_id"/></span>
									</td>
								</tr>
								<tr>
									<td  nowrap="1" class="AbHeaderRecord">
										<span  translatable="true">Date Work Requested:</span>
									</td>
									<td class="AbDataRecord">
										<xsl:variable name="str_date_requested" select="/*/afmTableGroup/dataSource/data/records/record/@wr.date_requested"/>
										<input type="hidden" name="wr.date_requested" value="{$str_date_requested}"/>
										<span   ID="show_wr.date_requested"><xsl:value-of select="$str_date_requested"/></span>
									</td>
								</tr>
								<tr>
									<td nowrap="0" class="AbHeaderRecord">
										<span  translatable="true">Work Description:</span>
									</td>
									<td colspan="3" class="AbDataRecord">
										<xsl:variable name="str_description" select="/*/afmTableGroup/dataSource/data/records/record/@wr.description"/>
										<textarea style="background:#EEE;" class="textareaABData" name="wr.description" cols="50" rows="3" wrap="PHYSICAL" readonly="readonly">
											<xsl:value-of select="$str_description"/><xsl:value-of select="$whiteSpace"/>
										</textarea>
									</td>
								</tr>

								</colgroup>
								<!--tr><td colspan="4"><hr></hr></td></tr-->
							<!-- edit part -->
								<tr>
									<td>
										<xsl:variable name="str_wrcf_wr_id" select="/*/afmTableGroup/dataSource/data/records/record/@wrcf.wr_id"/>
										<input type="hidden" size="20" id="wrcf.wr_id" name="wrcf.wr_id" VALUE="{$str_wrcf_wr_id}"/>

										<xsl:variable name="str_wrcf_cf_id" select="/*/afmTableGroup/dataSource/data/records/record/@wrcf.cf_id"/>
										<input type="hidden" size="20" id="wrcf.cf_id" name="wrcf.cf_id" VALUE="{$str_wrcf_cf_id}"/>

										<xsl:variable name="str_date_assigned" select="/*/afmTableGroup/dataSource/data/records/record/@wrcf.date_assigned"/>
										<input type="hidden" size="20" name="wrcf.hdate_assigned" VALUE="{$str_date_assigned}"/>

										<xsl:variable name="str_time_assigned" select="/*/afmTableGroup/dataSource/data/records/record/@wrcf.time_assigned"/>
										<INPUT type="hidden" size="20" id="wrcf.htime_assigned" name="wrcf.time_assigned" VALUE="{$str_time_assigned}"/>
									</td>
								</tr>
								<tr>
									<td  class="inputFieldLabel" align="left">
										<span  translatable="true">Craftsperson:</span>
									</td>
									<td class="inputFieldLabel">
										<xsl:value-of select="/*/afmTableGroup/dataSource/data/records/record/@wrcf.cf_id"/>
									</td>
								</tr>
								<tr>
									<td  class="inputFieldLabel" align="left">
										<span  translatable="true">Straight Hours:</span>
									</td>
									<td>
										<xsl:variable name="str_hours_straight" select="/*/afmTableGroup/dataSource/data/records/record/@wrcf.hours_straight"/>

										<input class="inputField" type="text" name="wrcf.hours_straight" SIZE="20"  VALUE="{$str_hours_straight}"  onblur='validationInputs("{$afmInputsForm}", "wrcf.hours_straight")'/>

									</td>
								</tr>
								<tr>
									<td  class="inputFieldLabel" align="left" >
										<span  translatable="true">Overtime Hours:</span>
									</td>
									<td>
										<xsl:variable name="str_hours_over" select="/*/afmTableGroup/dataSource/data/records/record/@wrcf.hours_over"/>

										<input class="inputField" type="text" name="wrcf.hours_over" SIZE="20"  VALUE="{$str_hours_over}"  onblur='validationInputs("{$afmInputsForm}", "wrcf.hours_straight")'/>

									</td>
								</tr>
								<tr>
									<td  class="inputFieldLabel" align="left" >
										<span  translatable="true">Work Type:</span>
									</td>
									<td>
										<xsl:variable name="str_work_type" select="/*/afmTableGroup/dataSource/data/records/record/@wrcf.work_type"/>
										<select  class="inputField_box" id="wrcf.work_type" name="wrcf.work_type">
											<xsl:for-each select="/*/afmTableGroup/dataSource/data/fields/field[@name='work_type']/enumeration/item">
												<xsl:if test="@value=$str_work_type">
													<xsl:variable name="display_value_work_type" select="@displayValue"/>
													<option value="{@value}" selected="1"><xsl:value-of select="$display_value_work_type"/></option>
												</xsl:if>
												<xsl:if test="@value!=$str_work_type">
													<xsl:variable name="display_value_work_type" select="@displayValue"/>
													<xsl:variable name="store_value_work_type" select="@value"/>
													<option value="{@value}"><xsl:value-of select="$display_value_work_type"/></option>
												</xsl:if>
											</xsl:for-each>
										</select>
									</td>
								</tr>
								<tr>
									<td  class="inputFieldLabel" align="left" nowrap="nowrap">
										<span  translatable="true">Work Request Status:</span>
									</td>
									<td>
										<xsl:variable name="str_status" select="/*/afmTableGroup/dataSource/data/records/record/@wr.status"/>
										<select  class="inputField_box" id="wr.status" name="wr.status">
											<xsl:for-each select="/*/afmTableGroup/dataSource/data/fields/field[@name='status']/enumeration/item">
												<xsl:if test="@value=$str_status">
													<!--xsl:variable name="display_value_status" select="@displayValue"/>
													<option value="{@value}" selected="1"><xsl:value-of select="$display_value_status"/></option-->
													<option value="{@value}" selected="1"><xsl:value-of select="./@displayValue"/></option>
												</xsl:if>
												<xsl:if test="@value!=$str_status">
												   <xsl:if test="@value='I' or @value='HP' or @value='HA' or @value='HL' or @value='Com' or @value='S'">
													<xsl:variable name="display_value_status" select="@displayValue"/>
													<option value="{@value}"><xsl:value-of select="$display_value_status"/></option>
												   </xsl:if>
												</xsl:if>
											</xsl:for-each>
										</select>
									</td>
								</tr>
								<tr>
									<td  class="inputFieldLabel">
										<span  translatable="true">Comments:</span>

									</td>
									<td colspan="2">
										<xsl:variable name="str_comments" select="/*/afmTableGroup/dataSource/data/records/record/@wrcf.comments"/>
										<textarea class="textareaABData" name="wrcf.comments" cols="50" rows="3" wrap="PHYSICAL">
											<xsl:value-of select="$str_comments"/><xsl:value-of select="$whiteSpace"/>
										</textarea>
									</td>
								</tr>
								<tr>
									<td></td>
									<td colspan="2" align="left">
										<xsl:variable name="actionSerialized" select="//afmAction[@type='executeTransaction']/@serialized"/>
										<input  class="AbActionButtonFormStdWidth" type="button" value="{//message[@name='save']}" onclick='onSaveCraftspersonUpdate("{$actionSerialized}","{$afmInputsForm}")'/>
										<input  class="AbActionButtonFormStdWidth" type="button" value="{//message[@name='cancel']}" onclick='onCancel("{$actionSerialized}","{$afmInputsForm}")'/>
									</td>

								</tr>
								<tr></tr>
								<tr>
									<td></td>
									<td colspan="2" align="left">
										<xsl:variable name="actionSerialized" select="//afmAction[@type='executeTransaction']/@serialized"/>
										<input  class="AbActionButtonFormStdWidth" type="button" value="{//message[@name='assignadd']}" onclick='onClickSetAssignForm("{$actionSerialized}","{$afmInputsForm}")'/>
									</td>
								</tr>
							</table>
						</td></tr>
						</form>
					</table>
					</td></tr>
					</xsl:if>
					</td></tr>

					<tr><td>
					<xsl:if test="$record_PKCF=''">
						<table  valign="top" style="topmargin:0">
						<form name="{$afmInputsForm}">
						<tr><td>
							<table width="100%" valign="top" style="topmargin:0">
								<colgroup span="2">
								<col  width="30%" />
								<col  width="70%" />
								<tr>
									<xsl:variable name="str_wrcf_wr_id" select="/*/afmTableGroup/dataSource/data/records/record/@wrcf.wr_id"/>
									<input type="hidden" size="20" id="wrcf.wr_id" name="wrcf.wr_id" VALUE="{$str_wrcf_wr_id}"/>
                                                                        <xsl:variable name="fieldNode" select="/*/afmTableGroup/dataSource/data/fields/field[@name='cf_id']"/>
                                                                        <xsl:variable name="validate_data">
                                                                          <xsl:choose>
                                                                            <xsl:when test="$fieldNode/@validate_data"><xsl:value-of select="$fieldNode/@validate_data"/></xsl:when>
                                                                            <xsl:otherwise>false</xsl:otherwise>
                                                                          </xsl:choose>
                                                                        </xsl:variable>
                                                                        <xsl:variable name="inputFieldLabelCSS">
                                                                          <xsl:choose>
                                                                            <xsl:when test="$fieldNode/@foreignKey='true' and $validate_data='true'">inputFieldLabel_validated</xsl:when>
                                                                            <xsl:otherwise>inputFieldLabel</xsl:otherwise>
                                                                          </xsl:choose>
                                                                        </xsl:variable>

									<td  class="{$inputFieldLabelCSS}" align="left">
										<span  translatable="true">Craftsperson:</span>
									</td>
									<td>
									<xsl:variable name="str_cf_id" select="/*/afmTableGroup/dataSource/data/records/record/@wrcf.cf_id"/>
									<input class="inputField" maxlength="{/*/afmTableGroup/dataSource/data/fields/field[@name='cf_id']/@size}" type="text" name="wrcf.cf_id" value="{$str_cf_id}" onchange='validationInputs("{$afmInputsForm}", "wrcf.cf_id")' onblur='validationInputs("{$afmInputsForm}", "wrcf.cf_id")'/>
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
									<td></td>
									<td colspan="2" align="left">
										<xsl:variable name="actionSerialized" select="//afmAction[@type='executeTransaction']/@serialized"/>
										<input  class="AbActionButtonFormStdWidth" type="button" value="{//message[@name='assign']}" onclick='onSaveCraftspersonAssign("{$actionSerialized}","{$afmInputsForm}")'/>
									</td>

								</tr>
								</colgroup>
							</table>
						</td></tr>
						</form>
						</table>
					</xsl:if>
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
