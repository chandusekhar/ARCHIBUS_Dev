<?xml version="1.0"?>
<!-- xslt called by Java to handle XML data: report and edit form-->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">	
	<!-- importing xsl files -->
	<!-- constants.xsl which contains constant XSLT variables -->
	<xsl:import href="ab-system/xsl/constants.xsl" />

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
			<script language="JavaScript" src="#Attribute%//@relativeFileDirectory%/ab508-em-setup-or-move-edit.js"><xsl:value-of select="$whiteSpace"/></script>
			<!-- calling template SetUpLocales which is in locale.xsl to set up locale javascript variables -->
			<xsl:call-template name="SetUpLocales"/>
		</head>

		<body class="body"  onload='onLoadPage("{$afmInputsForm}")'>
			<xsl:variable name="em_tgrp" select="/*/afmTableGroup[@name='em']"/>
			<xsl:variable name="mo_tgrp" select="/*/afmTableGroup[@name='mo']"/>
			<xsl:variable name="em_name" select="$em_tgrp/dataSource/data/records/record/@em.em_id"/>
			

			<!-- calling template SetUpFieldsInformArray in inputs-validation.xsl to use its template SetUpFieldsInformArray -->
			<xsl:call-template name="SetUpFieldsInformArray">
				<xsl:with-param name="fieldNodes" select="$mo_tgrp/dataSource/data/fields"/>
			</xsl:call-template>

			<!-- pk is empty ==> create new  -->
			<xsl:if test="$mo_tgrp/dataSource/data/records/record/@mo.mo_id=''">
				<xsl:call-template name="table-group-title">
					<xsl:with-param name="title" select="concat($mo_tgrp/message[@name='new'],' ',$em_name)" /> 
				</xsl:call-template>
				<xsl:call-template name="create_mo">
					<xsl:with-param name="em_tgrp" select="$em_tgrp" />
					<xsl:with-param name="mo_tgrp" select="$mo_tgrp" />
					<xsl:with-param name="em_name" select="$em_name" />
				</xsl:call-template>
			</xsl:if>

			<!-- pk is not empty but date_issued and time_issued are empty==> update or cancel-->
			<xsl:if test="$mo_tgrp/dataSource/data/records/record/@mo.mo_id!='' and $mo_tgrp/dataSource/data/records/record/@mo.date_issued='' and $mo_tgrp/dataSource/data/records/record/@mo.time_issued=''">
				<xsl:call-template name="table-group-title">
					<xsl:with-param name="title" select="concat($mo_tgrp/message[@name='update'],' ',$em_name)" />  
				</xsl:call-template>
				<xsl:call-template name="update_mo">
					<xsl:with-param name="em_tgrp" select="$em_tgrp" />
					<xsl:with-param name="mo_tgrp" select="$mo_tgrp" />
					<xsl:with-param name="em_name" select="$em_name" />
				</xsl:call-template>
			</xsl:if>

			<!-- pk is not empty and date_issued and time_issued are not empty==> Close or Cancel-->
			<xsl:if test="$mo_tgrp/dataSource/data/records/record/@mo.mo_id!='' and ($mo_tgrp/dataSource/data/records/record/@mo.date_issued!='' or $mo_tgrp/dataSource/data/records/record/@mo.time_issued!='')">
				<xsl:call-template name="table-group-title">
					<xsl:with-param name="title" select="concat($mo_tgrp/message[@name='issued'],' ',$em_name)" />  
				</xsl:call-template>
				<xsl:call-template name="close_cancel_mo">
					<xsl:with-param name="em_tgrp" select="$em_tgrp" />
					<xsl:with-param name="mo_tgrp" select="$mo_tgrp" />
					<xsl:with-param name="em_name" select="$em_name" />
				</xsl:call-template>
			</xsl:if>

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
			<input class="selectValue_AbActionButtonFormStdWidth" type="button" title="Click to Display Select Value List" value="{$actionTitle}" onclick='onSelectV("{$afmAction/@serialized}","{$recordName}","{$formName}"); selectedValueInputFormName="{$formName}" ; selectValueInputFieldID="{$recordName}" ;'/>		
		</xsl:if>
	</xsl:template>
	
	<!-- calling template: create_mo -->
	<xsl:template name="create_mo">
		<xsl:param name="em_tgrp"/>
		<xsl:param name="mo_tgrp"/>
		<xsl:param name="em_name"/>
		<table  valign="top">
			<form name="{$afmInputsForm}">
				<xsl:call-template name="common_create_update_mo">
					<xsl:with-param name="em_tgrp" select="$em_tgrp" />
					<xsl:with-param name="mo_tgrp" select="$mo_tgrp" />
					<xsl:with-param name="em_name" select="$em_name" />
				</xsl:call-template>
				<tr>
					<xsl:variable name="SQLAction" select="//afmAction[@type='executeTransaction']"/>
					<xsl:variable name="renderAction" select="//afmAction[@name='response']"/>
					<xsl:variable name="warning_message" select="//message[@name='warning_message']"/>
					<td colspan="4">
						<table align="left" valign="top"><tr>
							<td  class="inputFieldLabel">
								<input id="bIssued" type="checkbox" title="Check This Box if Move Request is to Automatically be Issued" name="bIssued"/>
								<label for="bIssued"><span translatable="true">Issue</span></label>
							</td>
							<td>
								<!-- new -->
								<input class="AbActionButtonFormStdWidth" type="button" value="{$mo_tgrp/message[@name='create']}" title="{$mo_tgrp/message[@name='create']}" onclick='onCreateMoveRequest("{$afmInputsForm}", "{$SQLAction/@serialized}","{$renderAction/@serialized}","{$warning_message}")'/>
							</td>
							<td>
								<!-- reset -->
								<input class="AbActionButtonFormStdWidth" title="Reset This Form" type="RESET" value="{/*/message[@name='reset']}"/>
							</td>
						</tr></table>
					</td>
				</tr>
			</form>
		</table>
	</xsl:template>
	<!-- calling template: update_mo -->
	<xsl:template name="update_mo">
		<xsl:param name="em_tgrp"/>
		<xsl:param name="mo_tgrp"/>
		<xsl:param name="em_name"/>
		<table  valign="top">
			<form name="{$afmInputsForm}">
				<xsl:call-template name="common_create_update_mo">
					<xsl:with-param name="em_tgrp" select="$em_tgrp" />
					<xsl:with-param name="mo_tgrp" select="$mo_tgrp" />
					<xsl:with-param name="em_name" select="$em_name" />
				</xsl:call-template>
				<tr>
					<xsl:variable name="SQLAction" select="//afmAction[@type='executeTransaction']"/>
					<xsl:variable name="renderAction" select="//afmAction[@name='response']"/>
					<xsl:variable name="warning_message" select="//message[@name='warning_message']"/>
					<td colspan="4">
						<table align="left" valign="top"><tr>
							<td class="inputFieldLabel">
								<input id="bIssued2" type="checkbox" title="Check This Box if Move Request is to Automatically be Issued" name="bIssued"/>
								<label for="bIssued2"><span translatable="true">Issue</span></label>
							</td>
							<td>
								<!-- update -->
								<input class="AbActionButtonFormStdWidth" title="Update This Move Request" type="button" value="{$mo_tgrp/message[@name='modify']}" onclick='onUpdateMoveRequest("{$afmInputsForm}", "{$SQLAction/@serialized}","{$renderAction/@serialized}","{$warning_message}")'/>
							</td>
							
							<td>
								<!-- cancel action -->
								<input class="AbActionButtonFormStdWidth" title="Cancel This Move Request" type="button" value="{$mo_tgrp/message[@name='cancel']}" onclick='onCancelMoveRequest("{$afmInputsForm}", "{$SQLAction/@serialized}","{$renderAction/@serialized}","{$warning_message}")'/>
							</td>
							<td>
								<!-- reset -->
								<input  class="AbActionButtonFormStdWidth" title="Reset This Form" type="RESET" value="{/*/message[@name='reset']}"/>
							</td>
						</tr></table>
					</td>
				</tr>
			</form>
		</table>
	</xsl:template>
	<!-- calling template: close_cancel_mo -->
	<xsl:template name="close_cancel_mo">
		<xsl:param name="em_tgrp"/>
		<xsl:param name="mo_tgrp"/>
		<xsl:param name="em_name"/>
		<table  valign="top" border="1">
			<form name="{$afmInputsForm}">
				<tr>
					<td class="AbHeaderRecord">
						<input type="hidden" name="mo.mo_id" value="{$mo_tgrp/dataSource/data/records/record/@mo.mo_id}"/>
						<input type="hidden" name="mo.em_id" value="{$em_name}"/>
						<input type="hidden" name="mo.to_bl_id" value="{$mo_tgrp/dataSource/data/records/record/@mo.to_bl_id}"/>
						<input type="hidden" name="mo.to_fl_id" value="{$mo_tgrp/dataSource/data/records/record/@mo.to_fl_id}"/>
						<input type="hidden" name="mo.to_rm_id" value="{$mo_tgrp/dataSource/data/records/record/@mo.to_rm_id}"/>
						<xsl:value-of select="$mo_tgrp/dataSource/data/fields/field[@name='em_id']/@singleLineHeading"/>:
					</td>
					<td class="AbDataRecord">
						<xsl:value-of select="$mo_tgrp/dataSource/data/records/record/@mo.em_id"/><br/>
					</td>	
					<td class="AbHeaderRecord">
						<xsl:value-of select="$mo_tgrp/dataSource/data/fields/field[@name='mo_id']/@singleLineHeading"/>:
					</td>
					<td class="AbDataRecord">
						<xsl:value-of select="$mo_tgrp/dataSource/data/records/record/@mo.mo_id"/><br/>
					</td>	
				</tr>	
				<tr>
					<td class="AbHeaderRecord">
						<span>From Building:</span>
					</td>
					<td class="AbDataRecord">
						<xsl:value-of select="$em_tgrp/dataSource/data/records/record/@em.bl_id"/><br/>
					</td>	
					<td class="AbHeaderRecord">
						<xsl:value-of select="$mo_tgrp/dataSource/data/fields/field[@name='to_bl_id']/@singleLineHeading"/>:
					</td>
					<td class="AbDataRecord">
						<xsl:value-of select="$mo_tgrp/dataSource/data/records/record/@mo.to_bl_id"/><br/>
					</td>	
				</tr>
				<tr>
					<td class="AbHeaderRecord">
						<span>From Floor:</span>
					</td>
					<td class="AbDataRecord">
						<xsl:value-of select="$em_tgrp/dataSource/data/records/record/@em.fl_id"/><br/>
					</td>	
					<td class="AbHeaderRecord">
						<xsl:value-of select="$mo_tgrp/dataSource/data/fields/field[@name='to_fl_id']/@singleLineHeading"/>:
					</td>
					<td class="AbDataRecord">
						<xsl:value-of select="$mo_tgrp/dataSource/data/records/record/@mo.to_fl_id"/><br/>
					</td>	
				</tr>
				<tr>
					<td class="AbHeaderRecord">
						<span>From Room:</span>
					</td>
					<td class="AbDataRecord">
						<xsl:value-of select="$em_tgrp/dataSource/data/records/record/@em.rm_id"/><br/>
					</td>	
					<td class="AbHeaderRecord">
						<xsl:value-of select="$mo_tgrp/dataSource/data/fields/field[@name='to_rm_id']/@singleLineHeading"/>:
					</td>
					<td class="AbDataRecord">
						<xsl:value-of select="$mo_tgrp/dataSource/data/records/record/@mo.to_rm_id"/><br/>
					</td>	
				</tr>
				<tr>
					<td class="AbHeaderRecord">
						<xsl:value-of select="$mo_tgrp/dataSource/data/fields/field[@name='requestor']/@singleLineHeading"/>:
					</td>
					<td class="AbDataRecord">
						<xsl:value-of select="$mo_tgrp/dataSource/data/records/record/@mo.requestor"/><br/>
					</td>	
					<td class="AbHeaderRecord">
						<xsl:value-of select="$mo_tgrp/dataSource/data/fields/field[@name='phone']/@singleLineHeading"/>:
					</td>
					<td class="AbDataRecord">
						<xsl:value-of select="$mo_tgrp/dataSource/data/records/record/@mo.phone"/><br/>
					</td>	
				</tr>
				<tr>
					<td class="AbHeaderRecord">
						<xsl:value-of select="$mo_tgrp/dataSource/data/fields/field[@name='date_requested']/@singleLineHeading"/>:
					</td>
					<td   class="AbDataRecord">
						<INPUT   class="inputField"  type="hidden" size="20" id="mo.date_requested" name="mo.date_requested"  VALUE="{$mo_tgrp/dataSource/data/records/record/@mo.date_requested}"/>
						<span id="Showmo.date_requested_short" name="Showmo.date_requested_short"><xsl:value-of select="$mo_tgrp/dataSource/data/records/record/@mo.date_requested"/><br/></span>
					</td>	
					<td class="AbHeaderRecord">
						<xsl:value-of select="$mo_tgrp/dataSource/data/fields/field[@name='time_requested']/@singleLineHeading"/>:
					</td>
					<td class="AbDataRecord">
						<xsl:variable name="time_requested" select="$mo_tgrp/dataSource/data/records/record/@mo.time_requested"/>
						<xsl:variable name="trucated_time_requested">
							<xsl:choose>
								<xsl:when test="$time_requested=''">
									<xsl:value-of select="$time_requested"/>
								</xsl:when>
								<xsl:otherwise>
									<xsl:value-of select="substring($time_requested,1,5)"/>
								</xsl:otherwise>
							</xsl:choose>
						</xsl:variable>
						<INPUT   class="inputField" type="hidden" size="20" name="mo.time_requested" id="mo.time_requested" VALUE="{$trucated_time_requested}"/>
						<INPUT   class="inputField" type="hidden" size="20" name="Storedmo.time_requested" id="Storedmo.time_requested" VALUE="{$time_requested}"/>
						<span  id="Showmo.time_requested" name="Showmo.time_requested"><xsl:value-of select="$trucated_time_requested"/><br/></span>
					</td>	
				</tr>
				<tr>
					<td class="AbHeaderRecord">
						<xsl:value-of select="$mo_tgrp/dataSource/data/fields/field[@name='date_to_perform']/@singleLineHeading"/>:
					</td>
					<td class="AbDataRecord">
						<input class="inputField" type="hidden" size="20" id="mo.date_to_perform" name="mo.date_to_perform"  VALUE="{$mo_tgrp/dataSource/data/records/record/@mo.date_to_perform}"/>
						<span id="Showmo.date_to_perform_short" name="Showmo.date_to_perform_short"><xsl:value-of select="$mo_tgrp/dataSource/data/records/record/@mo.date_to_perform"/><br/></span>
					</td>	
					<td class="AbHeaderRecord">
						<xsl:value-of select="$mo_tgrp/dataSource/data/fields/field[@name='time_to_perform']/@singleLineHeading"/>:
					</td>
					<td class="AbDataRecord">
						<xsl:variable name="time_to_perform" select="$mo_tgrp/dataSource/data/records/record/@mo.time_to_perform"/>
						<xsl:variable name="trucated_time_to_perform">
							<xsl:choose>
								<xsl:when test="$time_to_perform=''">
									<xsl:value-of select="$time_to_perform"/>
								</xsl:when>
								<xsl:otherwise>
									<xsl:value-of select="substring($time_to_perform,1,5)"/>
								</xsl:otherwise>
							</xsl:choose>
						</xsl:variable>
						<input class="inputField" type="hidden" size="20" name="mo.time_to_perform" id="mo.time_to_perform" VALUE="{$trucated_time_to_perform}"/>
						<input class="inputField" type="hidden" size="20" name="Storemo.time_to_perform" id="Storemo.time_to_perform" VALUE="{$time_to_perform}"/>
						<xsl:if test="$trucated_time_to_perform!=''">
							<span  id="Showmo.time_to_perform" name="Showmo.time_to_perform"><xsl:value-of select="$trucated_time_to_perform"/><br/></span>
						</xsl:if>
						<xsl:if test="$trucated_time_to_perform=''">
							<br />
						</xsl:if>
					</td>	
				</tr>
				<tr>
					<td class="AbHeaderRecord">
						<xsl:value-of select="$mo_tgrp/dataSource/data/fields/field[@name='date_issued']/@singleLineHeading"/>:
					</td>
					<td class="AbDataRecord">
						<input class="inputField"  type="hidden" size="20" id="mo.date_issued" name="mo.date_issued"  VALUE="{$mo_tgrp/dataSource/data/records/record/@mo.date_issued}"/>
						<span id="Showmo.date_issued_short" name="Showmo.date_issued_short"><xsl:value-of select="$mo_tgrp/dataSource/data/records/record/@mo.date_issued"/><br/></span>
					</td>	
					<td class="AbHeaderRecord">
						<xsl:value-of select="$mo_tgrp/dataSource/data/fields/field[@name='time_issued']/@singleLineHeading"/>:
					</td>
					<td class="AbDataRecord">
						<xsl:variable name="time_issued" select="$mo_tgrp/dataSource/data/records/record/@mo.time_issued"/>
						<xsl:variable name="trucated_time_issued">
							<xsl:choose>
								<xsl:when test="$time_issued=''">
									<xsl:value-of select="$time_issued"/>
								</xsl:when>
								<xsl:otherwise>
									<xsl:value-of select="substring($time_issued,1,5)"/>
								</xsl:otherwise>
							</xsl:choose>
						</xsl:variable>
						<input class="inputField" type="hidden" size="20" name="mo.time_issued" id="mo.time_issued" VALUE="{$trucated_time_issued}"/>
						<input class="inputField" type="hidden" size="20" name="Storemo.time_issued" id="Storemo.time_issued" VALUE="{$time_issued}"/>
						<span id="Showmo.time_issued" name="Showmo.time_issued"><xsl:value-of select="$trucated_time_issued"/><br/></span>
					</td>	
				</tr>
				
				<tr>
					<td class="AbHeaderRecord">
						<xsl:value-of select="$mo_tgrp/dataSource/data/fields/field[@name='description']/@singleLineHeading"/>:
					</td>
					<td COLSPAN="3" class="AbDataRecord">
						<xsl:call-template name="memo_field_value_handler">
							<xsl:with-param name="memo_value" select="$mo_tgrp/dataSource/data/records/record/@mo.description"/>
						</xsl:call-template>
						<br />
					</td>	
				</tr>
				<tr>
					<xsl:variable name="SQLAction" select="//afmAction[@type='executeTransaction']"/>
					<xsl:variable name="renderAction" select="//afmAction[@name='response']"/>
					<xsl:variable name="warning_message" select="//message[@name='warning_message']"/>
					<td COLSPAN="4">
						<table align="center">
							<tr>
								<td>
									<!-- close action -->
									<input class="AbActionButtonFormStdWidth" type="button" title="{$mo_tgrp/message[@name='close']}" value="{$mo_tgrp/message[@name='close']}" onclick='onCloseMoveRequest("{$afmInputsForm}", "{$SQLAction/@serialized}","{$renderAction/@serialized}","{$warning_message}")'/>
								</td>
								<td>
									<!-- cancel action -->
									<input class="AbActionButtonFormStdWidth" type="button" title="{$mo_tgrp/message[@name='cancel']}" value="{$mo_tgrp/message[@name='cancel']}" onclick='onCancelMoveRequest("{$afmInputsForm}", "{$SQLAction/@serialized}","{$renderAction/@serialized}","{$warning_message}")'/>
								</td>
							</tr>
						</table>
					</td>
					
				</tr>
			</form>
		</table>
	</xsl:template>
	<!-- calling template: common_create_update_mo -->
	<xsl:template name="common_create_update_mo">
		<xsl:param name="em_tgrp"/>
		<xsl:param name="mo_tgrp"/>
		<xsl:param name="em_name"/>
		<tr>
			<td class="inputFieldLabel_validated" nowrap="1">
				<label for="contact"><span translatable="true">Contact:</span></label>
			</td>
			<td nowrap="1">
				<input type="hidden" name="mo.mo_id" value="{$mo_tgrp/dataSource/data/records/record/@mo.mo_id}"/>
				<input type="hidden" name="mo.em_id" value="{$em_name}"/>
				<input id="contact" class="inputField" title="Select or Enter Contact ID" maxlength="{$mo_tgrp/dataSource/data/fields/field[@name='requestor']/@size}" type="text" name="mo.requestor" value="{$mo_tgrp/dataSource/data/records/record/@mo.requestor}" onchange='validationInputs("{$afmInputsForm}", "mo.requestor")' onblur='validationInputs("{$afmInputsForm}", "mo.requestor")'/>
				<xsl:call-template name="SelectValue">
					<xsl:with-param name="afmTableGroup" select="$mo_tgrp"/>
					<xsl:with-param name="formName" select="$afmInputsForm"/>
					<xsl:with-param name="recordName" select="'mo.requestor'"/>
					<xsl:with-param name="actionTitle" select="'...'"/>
				</xsl:call-template>
			</td>
			<td class="inputFieldLabel_validated"  nowrap="1">
				<label for="mo.mp_id"><span translatable="true">Move Project:</span></label>
			</td>
			<td nowrap="1">
				<input id="mo.mp_id" class="inputField" title="Select or Enter Move Project ID" type="text"  maxlength="{$mo_tgrp/dataSource/data/fields/field[@name='mp_id']/@size}" name="mo.mp_id" value="{$mo_tgrp/dataSource/data/records/record/@mo.mp_id}"  onchange='validationInputs("{$afmInputsForm}", "mo.mp_id")' onblur='validationInputs("{$afmInputsForm}", "mo.mp_id")'/>
				<xsl:call-template name="SelectValue">
					<xsl:with-param name="afmTableGroup" select="$mo_tgrp"/>
					<xsl:with-param name="formName" select="$afmInputsForm"/>
					<xsl:with-param name="recordName" select="'mo.mp_id'"/>
					<xsl:with-param name="actionTitle" select="'...'"/>
				</xsl:call-template>
			</td>
		</tr>
		<tr>
			<td class="inputFieldLabel" nowrap="1">
				<label for="mo.date_to_perform"><span  translatable="true">Date to Move:</span></label>
			</td>
			<td nowrap="1">
				<input id="mo.date_to_perform" class="inputField" title="Select or Enter Move Date" type="text" name="mo.date_to_perform" SIZE="20" MAXLENGTH="10" VALUE="{$mo_tgrp/dataSource/data/records/record/@mo.date_to_perform}" onchange='validationAndConvertionDateInput(this, "mo.date_to_perform", null, "false",true, true)' onblur='validationAndConvertionDateInput(this, "mo.date_to_perform", null,"false", true,true)'/>
				<xsl:call-template name="SelectValue">
					<xsl:with-param name="afmTableGroup" select="$mo_tgrp"/>
					<xsl:with-param name="formName" select="$afmInputsForm"/>
					<xsl:with-param name="recordName" select="'mo.date_to_perform'"/>
					<xsl:with-param name="actionTitle" select="'...'"/>
				</xsl:call-template>
				<br />
				<!-- show date in its long format: id and name must be fixed pattern which will be used in javascript -->
				<span id="Showmo.date_to_perform" name="Showmo.date_to_perform" class="showingDateAndTimeLongFormat"></span>		
			</td>
			<td class="inputFieldLabel" nowrap="1">
				<label for="mo.time_to_perform"><span  translatable="true">Time to Move:</span></label>
			</td>
			<td>
				<!-- trucate time value to only get HH:MM -->
				<xsl:variable name="original_time_value" select="$mo_tgrp/dataSource/data/records/record/@mo.time_to_perform"/>
				<xsl:variable name="trucated_time_value">
					<xsl:choose>
						<xsl:when test="$original_time_value=''">
							<xsl:value-of select="$original_time_value"/>
						</xsl:when>
						<xsl:otherwise>
							<xsl:value-of select="substring($original_time_value,1,5)"/>
						</xsl:otherwise>
					</xsl:choose>
				</xsl:variable>
				<input id="mo.time_to_perform" class="inputField" title="Enter Move Time" type="text" name="mo.time_to_perform" SIZE="20" MAXLENGTH="10" VALUE="{$trucated_time_value}" onchange='validationAndConvertionTimeInput(this, "mo.time_to_perform",null,"false",true, false)' onblur='validationAndConvertionTimeInput(this, "mo.time_to_perform", null,"false",true,true)'/>
				<!-- Hidden field to store time in 24 hour format -->			
				<INPUT type="hidden" size="20" id="Storedmo.time_to_perform" name="Storedmo.time_to_perform" VALUE="{$original_time_value}"/> 
				<!-- new line -->
				<br />
				<!-- show time with AM/PM:  id and name must be fixed pattern which will be used in javascript -->
				<span id="Showmo.time_to_perform" name="Showmo.time_to_perform"  class="showingDateAndTimeLongFormat"></span>
			</td>
		</tr>
		<tr>
			<td class="inputFieldLabel"  nowrap="1">
				<span translatable="true">From Location:</span>
			</td>
			<td  colspan="5" class="inputFieldLabel"  nowrap="1">
				<input type="hidden" name="mo.from_bl_id" value="{$em_tgrp/dataSource/data/records/record/@em.bl_id}"/>
				<input type="hidden" name="mo.from_fl_id" value="{$em_tgrp/dataSource/data/records/record/@em.fl_id}"/>
				<input type="hidden" name="mo.from_rm_id" value="{$em_tgrp/dataSource/data/records/record/@em.rm_id}"/>
				<span translatable="true">Building:</span><xsl:value-of select="$em_tgrp/dataSource/data/records/record/@em.bl_id"/><xsl:value-of select="$whiteSpace"/>
				<span translatable="true">Floor:</span><xsl:value-of select="$em_tgrp/dataSource/data/records/record/@em.fl_id"/><xsl:value-of select="$whiteSpace"/>
				<span translatable="true">Room:</span><xsl:value-of select="$em_tgrp/dataSource/data/records/record/@em.rm_id"/>
			</td>
		</tr>
		<tr>
			<xsl:variable name="validate_data_to_bl_id">
				<xsl:choose>
					<xsl:when test="$mo_tgrp/dataSource/data/fields/field[@name='to_bl_id']/@validate_data"><xsl:value-of select="$mo_tgrp/dataSource/data/fields/field[@name='to_bl_id']//@validate_data"/></xsl:when>
					<xsl:otherwise>false</xsl:otherwise>
				</xsl:choose>
			</xsl:variable>
			<xsl:variable name="inputFieldLabelCSS_to_bl_id">
				<xsl:choose>
					<xsl:when test="$validate_data_to_bl_id='true'">inputFieldLabel_validated</xsl:when>
					<xsl:otherwise>inputFieldLabel</xsl:otherwise>
				</xsl:choose>
			</xsl:variable>
			<td class="{$inputFieldLabelCSS_to_bl_id}" nowrap="1">
				<label for="mo.to_bl_id"><span  translatable="true">To Building:</span></label><font face="Arial" size="-1" color="red">*</font>
			</td>
			<td nowrap="1">
				<input id="mo.to_bl_id" class="inputField" title="Select or Enter To Building ID" maxlength="{$mo_tgrp/dataSource/data/fields/field[@name='to_bl_id']/@size}"  type="text" name="mo.to_bl_id" value="{$mo_tgrp/dataSource/data/records/record/@mo.to_bl_id}" onchange='validationInputs("{$afmInputsForm}", "mo.to_bl_id")' onblur='validationInputs("{$afmInputsForm}", "mo.to_bl_id")'/>
				<xsl:call-template name="SelectValue">
					<xsl:with-param name="afmTableGroup" select="$mo_tgrp"/>
					<xsl:with-param name="formName" select="$afmInputsForm"/>
					<xsl:with-param name="recordName" select="'mo.to_bl_id'"/>
					<xsl:with-param name="actionTitle" select="'...'"/>
				</xsl:call-template>
			</td>
			<td class="instruction" colspan="2"   nowrap="1">
				<xsl:value-of select="$whiteSpace"/>
			</td>
		</tr>
		<tr>
			<xsl:variable name="validate_data_to_fl_id">
				<xsl:choose>
					<xsl:when test="$mo_tgrp/dataSource/data/fields/field[@name='to_fl_id']/@validate_data"><xsl:value-of select="$mo_tgrp/dataSource/data/fields/field[@name='to_fl_id']//@validate_data"/></xsl:when>
					<xsl:otherwise>false</xsl:otherwise>
				</xsl:choose>
			</xsl:variable>
			<xsl:variable name="inputFieldLabelCSS_to_fl_id">
				<xsl:choose>
					<xsl:when test="$validate_data_to_fl_id='true'">inputFieldLabel_validated</xsl:when>
					<xsl:otherwise>inputFieldLabel</xsl:otherwise>
				</xsl:choose>
			</xsl:variable>
			<td  class="{$inputFieldLabelCSS_to_fl_id}"  nowrap="1">
				<label for="mo.to_fl_id"><span translatable="true">To Floor:</span></label><font face="Arial" size="-1" color="red">*</font>
			</td>
			<td nowrap="1">
				<input id="mo.to_fl_id" class="inputField" title="Select or Enter To Floor ID" maxlength="{$mo_tgrp/dataSource/data/fields/field[@name='to_fl_id']/@size}" type="text" name="mo.to_fl_id" value="{$mo_tgrp/dataSource/data/records/record/@mo.to_fl_id}" onchange='validationInputs("{$afmInputsForm}", "mo.to_fl_id")' onblur='validationInputs("{$afmInputsForm}", "mo.to_fl_id")'/>
				<xsl:call-template name="SelectValue">
					<xsl:with-param name="afmTableGroup" select="$mo_tgrp"/>
					<xsl:with-param name="formName" select="$afmInputsForm"/>
					<xsl:with-param name="recordName" select="'mo.to_fl_id'"/>
					<xsl:with-param name="actionTitle" select="'...'"/>
				</xsl:call-template>
			</td>
			<td class="instruction" colspan="2"   nowrap="1">	
				<!--xsl:value-of select="/*/message[@name='selectVacantRoomsInstruction']" /--> 
				<xsl:value-of select="$whiteSpace"/>
			</td>
		</tr>
		<tr>
			<xsl:variable name="validate_data_to_rm_id">
				<xsl:choose>
					<xsl:when test="$mo_tgrp/dataSource/data/fields/field[@name='to_rm_id']/@validate_data"><xsl:value-of select="$mo_tgrp/dataSource/data/fields/field[@name='to_rm_id']//@validate_data"/></xsl:when>
					<xsl:otherwise>false</xsl:otherwise>
				</xsl:choose>
			</xsl:variable>
			<xsl:variable name="inputFieldLabelCSS_to_rm_id">
				<xsl:choose>
					<xsl:when test="$validate_data_to_rm_id='true'">inputFieldLabel_validated</xsl:when>
					<xsl:otherwise>inputFieldLabel</xsl:otherwise>
				</xsl:choose>
			</xsl:variable>
			<td class="{$inputFieldLabelCSS_to_rm_id}" nowrap="1">
				<label for="mo.to_rm_id"><span  translatable="true">To Room:</span></label><font face="Arial" size="-1" color="red">*</font>
			</td>
			<td nowrap="1">
				<input id="mo.to_rm_id" class="inputField" title="Select or Enter To Room ID" maxlength="{$mo_tgrp/dataSource/data/fields/field[@name='to_rm_id']/@size}" type="text" name="mo.to_rm_id" value="{$mo_tgrp/dataSource/data/records/record/@mo.to_rm_id}" onchange='validationInputs("{$afmInputsForm}", "mo.to_rm_id")' onblur='validationInputs("{$afmInputsForm}", "mo.to_rm_id")'/>
				<xsl:call-template name="SelectValue">
					<xsl:with-param name="afmTableGroup" select="$mo_tgrp"/>
					<xsl:with-param name="formName" select="$afmInputsForm"/>
					<xsl:with-param name="recordName" select="'mo.to_rm_id'"/>
					<xsl:with-param name="actionTitle" select="'...'"/>
				</xsl:call-template>
			</td>
			<!-- Removed for Accessibility 508 Standards compliance
			<td  colspan="2"  class="inputFieldLabel"  nowrap="1">
				<input  disabled="1" name="vacanyRoomsButton" id="vacanyRoomsButton" class="AbActionButtonFormStdWidth" type="button" value="{/*/message[@name='vacancies']}" onclick='showOnlyVacantRooms("{$afmInputsForm}", "mo.to_bl_id", "mo.to_fl_id");selectedValueInputFormName="{$afmInputsForm}" ; selectValueInputFieldID="mo.to_rm_id";'/>
			</td>
			-->
		</tr>
		<tr>
			<td valign="top"  class="inputFieldLabel"  >
				<label for="mo.description"><span  translatable="true">Move Description:</span></label>
			</td>
			<td colspan="3" rowspan="2" >
				<textarea id="mo.description" class="textareaABData" title="Enter a Description of this Move" name="mo.description" cols="60" rows="4" wrap="PHYSICAL">
					<xsl:value-of select="$mo_tgrp/dataSource/data/records/record/@mo.description"/><xsl:value-of select="$whiteSpace"/>
				</textarea>
			</td>
		</tr>
		<tr>
			<td>
				<xsl:call-template name="SelectValue">
					<xsl:with-param name="afmTableGroup" select="$mo_tgrp"/>
					<xsl:with-param name="formName" select="$afmInputsForm"/>
					<xsl:with-param name="recordName" select="'mo.description'"/>
					<xsl:with-param name="actionTitle" select="/*/message[@name='description']"/>
				</xsl:call-template>
			</td>
		</tr>
		<tr>
			<td class="inputFieldLabel"  nowrap="1">
				<input id="bSendEmail" type="checkbox" title="Check This Box if email is to be Automatically Sent" name="bSendEmail" onclick='EnableCopyTo("{$afmInputsForm}")'/>
				<label for="bSendEmail"><span translatable="true">Send email to:</span></label>
			</td>
			<td colspan="3" class="inputFieldLabel">
				<xsl:variable name="toEmailAddress" select="//preferences/mail/addresses/address[@name='moveAdministratorEMail']/@value"/>
				<input type="hidden" name="toEmailAddress" value="{$toEmailAddress}"/>
				<xsl:value-of select="$toEmailAddress"/>
			</td>
		</tr>
		<!--tr>
			<td  class="inputFieldLabel" align="left"  >
				<span  translatable="true">Email from:</span>
			</td>
			<td colspan="3">
				<input class="inputField" type="text" name="fromEmailAddress" value="your_email_address@yourcompany.com " size="60" onFocus="Clear();"/>
			</td>
		</tr-->
		<tr>
			<td  class="inputFieldLabel" >
				<span translatable="true">Copy to:</span>
			</td>
			<td colspan="3">
				<xsl:variable name="ccEmailAddress" select="//preferences/mail/addresses/address[@name='moveCCEmail']/@value"/>
				<input id="mo.requestor" class="inputField_box" title="CC Email Address" type="text" name="copyEmailAddress" value="{$ccEmailAddress}" size="60" disabled="disabled"/>
				<input type="hidden" name="fromEmailAddress" value="your_email_address@yourcompany.com "/>
			</td>
		</tr>
	</xsl:template>
	<!-- including template model XSLT files called in XSLT -->
	<xsl:include href="ab-system/xsl/common.xsl" />
	<xsl:include href="ab-system/xsl/locale.xsl" />
	<xsl:include href="ab-system/xsl/inputs-validation.xsl" />
	<xsl:include href="ab-system/xsl/reports/report-memo-field-value-handler.xsl" />
</xsl:stylesheet>