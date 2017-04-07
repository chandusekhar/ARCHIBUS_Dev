<?xml version="1.0" encoding="UTF-8"?>
<!-- top xsl called by Java to handle any common filter form -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<!-- importing constants.xsl which contains constant XSLT variables -->
	<xsl:import href="../../../ab-system/xsl/constants.xsl" />
	<!-- specified XSLT variables for this XSLT file -->
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
			<!--script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/calendar.js"><xsl:value-of select="$whiteSpace"/></script-->
			<script language="JavaScript" src="#Attribute%//@relativeFileDirectory%/ab-eq-locate-filter.js"><xsl:value-of select="$whiteSpace"/></script>
			<!-- template: SetUpLocales is in locale.xsl-->
			<xsl:call-template name="SetUpLocales"/>
		</head>
		<!-- date_start, time_start, date_end, time_end, and duration have been saved in restriction's title????? -->
<!--
		<xsl:variable name="strDateTime" select="/*/afmTableGroup[position()=1]/dataSource/data/restrictions/restriction[@type='sql']/title"/>
		<body onload='setupDateTimeValues("{$strDateTime}")' class="body" leftmargin="0" rightmargin="0" topmargin="0" bottomMargin ="0">
-->
		<body onload="restoreSavedValues()" class="body" leftmargin="0" rightmargin="0" topmargin="0" bottomMargin ="0">
			<!-- calling template table-group-title in common.xsl to set up tgrp's title in the top of html page -->
			<!--xsl:call-template name="table-group-title">
				<xsl:with-param name="title" select="/*/afmTableGroup/title"/>
			</xsl:call-template-->
			<!-- calling inputs-validation.xsl to use its template SetUpFieldsInformArray -->
			<!-- ?????????available fields are missed in XML??????????? -->
			<xsl:call-template name="SetUpFieldsInformArray">
				<xsl:with-param name="fieldNodes" select="/*/afmTableGroup/dataSource/data/availableFields"/>
			</xsl:call-template>

<!--
			<script language="javascript">
				<xsl:text>////set up enum fields and their lists</xsl:text>
				<xsl:for-each select="//afmTableGroup/dataSource/data/availableFields/field">
					<xsl:variable name="FieldName" select="concat(@table,'.',@name)"/>
					<xsl:if test="count(enumeration) &gt; 0">
						var arrEnumValuesList = new Array();
						<xsl:for-each select="enumeration/item">
							arrEnumValuesList['<xsl:value-of select="@value"/>']='<xsl:value-of select="@displayValue"/>';
						</xsl:for-each>
						setupArrEnumFieldsAndLists('<xsl:value-of select="$FieldName"/>',arrEnumValuesList);
					</xsl:if>
				</xsl:for-each>
			</script>
-->
			<table width="100%" valign="top" align="center">
				<form name="{$afmInputsForm}" style="margin:0">
					<tr align="center"><td valign="top" align="center">
						<xsl:call-template name="AfmTableGroup">
							<xsl:with-param name="afmTableGroup" select="//afmTableGroup"/>
						</xsl:call-template>
					</td></tr>
				</form>
			</table>
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

	<!-- xsl template: AfmTableGroup -->
	<xsl:template name="AfmTableGroup">
		<xsl:param name="afmTableGroup"/>
		<xsl:variable name="selectVAfmAction" select="//afmAction[@type='selectValue']"/>
		<table align="center">
			<tr><td>
				<table>
					<tr>
						<td>
							<FIELDSET>
								<LEGEND  class="legendTitle" translatable="true">Equipment:</LEGEND>
								<table width="100%" style="white-space:nowrap">
									<tr>
										<td class="inputFieldLabel">
											<span translatable="true" >Equipment ID:</span>
										</td>
										<td>
											<xsl:variable name="equipment_value">
												<xsl:for-each select="$afmTableGroup/dataSource/data/restrictions/restriction[@type='parsed']/clause">
													<xsl:if test="field/@name='eq_id'">
														<xsl:value-of select="@value"/>
													</xsl:if>
												</xsl:for-each>
											</xsl:variable>
											<input class="inputField"  style="width:120" type="text" value="{$equipment_value}" name="eq.eq_id" id="eq.eq_id" size="12" onchange='validationInputs("eq.eq_id")'  onblur='validationInputs("eq.eq_id", false)'/><input class="selectValue_AbActionButtonFormStdWidth" type="button" title="{$selectVAfmAction/tip}" value="{$selectVAfmAction/title}" onclick='onSelectV("{$selectVAfmAction/@serialized}","eq.eq_id",""); selectValueInputFieldID="eq.eq_id";'/>
										</td>
									</tr>
									<tr>
										<td class="inputFieldLabel">
											<span translatable="true" >Equipment Std:</span>
										</td>
										<td>
											<xsl:variable name="equipstd_value">
												<xsl:for-each select="$afmTableGroup/dataSource/data/restrictions/restriction[@type='parsed']/clause">
													<xsl:if test="field/@name='eq_std'">
														<xsl:value-of select="@value"/>
													</xsl:if>
												</xsl:for-each>
											</xsl:variable>
											<input class="inputField"  style="width:120" type="text" value="{$equipstd_value}" name="eq.eq_std" id="eq.eq_std" size="16" onchange='validationInputs("eq.eq_std")'  onblur='validationInputs("eq.eq_std", false)'/><input class="selectValue_AbActionButtonFormStdWidth" type="button" title="{$selectVAfmAction/tip}" value="{$selectVAfmAction/title}" onclick='onSelectV("{$selectVAfmAction/@serialized}","eq.eq_std",""); selectValueInputFieldID="eq.eq_std";'/>
										</td>
									</tr>
									<tr>
										<td class="inputFieldLabel">
											<span translatable="true">Employee:</span>
										</td>
										<td>
											<xsl:variable name="employee_value">
												<xsl:for-each select="$afmTableGroup/dataSource/data/restrictions/restriction[@type='parsed']/clause">
													<xsl:if test="field/@name='em_id'">
														<xsl:value-of select="@value"/>
													</xsl:if>
												</xsl:for-each>
											</xsl:variable>
											<input class="inputField"  style="width:120" type="text" value="{$employee_value}" name="eq.em_id" id="eq.em_id" size="35" onchange='validationInputs("eq.em_id")'  onblur='validationInputs("eq.em_id", false)'/><input class="selectValue_AbActionButtonFormStdWidth" type="button" title="{$selectVAfmAction/tip}" value="{$selectVAfmAction/title}" onclick='onSelectV("{$selectVAfmAction/@serialized}","eq.em_id",""); selectValueInputFieldID="eq.em_id";'/>
										</td>
									</tr>
								</table>
							</FIELDSET>
						</td>
						<td>
							<FIELDSET>
								<LEGEND  class="legendTitle" translatable="true">Location:</LEGEND>
								<table width="100%" style="white-space:nowrap">
									<tr>
										<td class="inputFieldLabel">
											<span translatable="true">Building:</span>
										</td>
										<td>
											<xsl:variable name="building_value">
												<xsl:for-each select="$afmTableGroup/dataSource/data/restrictions/restriction[@type='parsed']/clause">
													<xsl:if test="field/@name='bl_id'">
														<xsl:value-of select="@value"/>
													</xsl:if>
												</xsl:for-each>
											</xsl:variable>
											<input class="inputField"  style="width:120" type="text" value="{$building_value}" name="rm.bl_id" id="rm.bl_id" size="20" onchange='validationInputs("rm.bl_id")'  onblur='validationInputs("rm.bl_id", false)'/><input class="selectValue_AbActionButtonFormStdWidth" type="button" title="{$selectVAfmAction/tip}" value="{$selectVAfmAction/title}" onclick='onSelectV("{$selectVAfmAction/@serialized}","rm.bl_id",""); selectValueInputFieldID="rm.bl_id";'/>
										</td>
									</tr>
									<tr>
										<td class="inputFieldLabel">
											<span translatable="true">Floor:</span>
										</td>
										<td>	<xsl:variable name="floor_value">
												<xsl:for-each select="$afmTableGroup/dataSource/data/restrictions/restriction[@type='parsed']/clause">
													<xsl:if test="field/@name='fl_id'">
														<xsl:value-of select="@value"/>
													</xsl:if>
												</xsl:for-each>
											</xsl:variable>

											<input class="inputField"  style="width:120" type="text" value="{$floor_value}" name="rm.fl_id" id="rm.fl_id" size="20" onchange='validationInputs("rm.fl_id")'  onblur='validationInputs("rm.fl_id", false)'/><input class="selectValue_AbActionButtonFormStdWidth" type="button" title="{$selectVAfmAction/tip}" value="{$selectVAfmAction/title}" onclick='onSelectV("{$selectVAfmAction/@serialized}","rm.fl_id",""); selectValueInputFieldID="rm.fl_id";'/>
										</td>
									</tr>
									<tr>
										<td class="inputFieldLabel">
											<span translatable="true">Room:</span>
										</td>
										<td >
											<xsl:variable name="room_value">
												<xsl:for-each select="$afmTableGroup/dataSource/data/restrictions/restriction[@type='parsed']/clause">
													<xsl:if test="field/@name='rm_id'">
														<xsl:value-of select="@value"/>
													</xsl:if>
												</xsl:for-each>
											</xsl:variable>
											<input class="inputField"  style="width:120" type="text" value="{$room_value}" name="rm.rm_id" id="rm.rm_id" size="20" onchange='validationInputs("rm.rm_id")'  onblur='validationInputs("rm.rm_id", false)'/><input class="selectValue_AbActionButtonFormStdWidth" type="button" title="{$selectVAfmAction/tip}" value="{$selectVAfmAction/title}" onclick='onSelectV("{$selectVAfmAction/@serialized}","rm.rm_id",""); selectValueInputFieldID="rm.rm_id";'/>
										</td>
									</tr>
								</table>
							</FIELDSET>
						</td>
						<td>
							<FIELDSET>
								<LEGEND  class="legendTitle" translatable="true">Telecom:</LEGEND>
								<table width="100%" style="white-space:nowrap">
									<tr>
										<td class="inputFieldLabel">
											<span translatable="true">Telecom Area Level:</span>
										</td>
										<td>
											<select class="inputField_box" id="tc_area_level_value" name="eq.tc_area_level">
												<option value="" selected="1"><span translatable="false"></span></option>
												<option value="N/A"><span translatable="true">N/A</span></option>
												<option value="WA"><span translatable="true">Work Area</span></option>
												<option value="TA"><span translatable="true">Telecom Area</span></option>
											</select>
											<!--xsl:variable name="tc_area_level_value">
												<xsl:for-each select="$afmTableGroup/dataSource/data/restrictions/restriction[@type='parsed']/clause">
													<xsl:if test="field/@name='tc_area_level'">
														<xsl:value-of select="@value"/>
													</xsl:if>
												</xsl:for-each>
											</xsl:variable>
											<input class="inputField"  style="width:120" type="text" value="{$tc_area_level_value}" name="eq.tc_area_level" id="eq.tc_area_level" size="16" onchange='validationInputs("eq.tc_area_level")'  onblur='validationInputs("eq.tc_area_level", false)'/><input class="selectValue_AbActionButtonFormStdWidth" type="button" title="{$selectVAfmAction/tip}" value="{$selectVAfmAction/title}" onclick='onSelectV("{$selectVAfmAction/@serialized}","eq.tc_area_level",""); selectValueInputFieldID="eq.tc_area_level";'/-->
										</td>
									</tr>
									<tr>
										<td class="inputFieldLabel">
											<span translatable="true">Telecom Service Type:</span>
										</td>
										<td>
											<select class="inputField_box" id="tc_service_value" name="eq.tc_service">
												<option value="" selected="1"><span translatable="false"></span></option>
												<option value="N/A"><span translatable="true">N/A</span></option>
												<option value="D"><span translatable="true">Data</span></option>
												<option value="E"><span translatable="true">Environmental</span></option>
												<option value="H"><span translatable="true">HVAC</span></option>
												<option value="O"><span translatable="true">Other</span></option>
												<option value="S"><span translatable="true">Security</span></option>
												<option value="VI"><span translatable="true">Video</span></option>
												<option value="V"><span translatable="true">Voice</span></option>
											</select>
											<!--xsl:variable name="tc_service_value">
												<xsl:for-each select="$afmTableGroup/dataSource/data/restrictions/restriction[@type='parsed']/clause">
													<xsl:if test="field/@name='tc_service'">
														<xsl:value-of select="@value"/>
													</xsl:if>
												</xsl:for-each>
											</xsl:variable>
											<input class="inputField"  style="width:120" type="text" value="{$tc_service_value}" name="eq.tc_service" id="eq.tc_service" size="3" onchange='validationInputs("eq.tc_service")'  onblur='validationInputs("eq.tc_service", false)'/><input class="selectValue_AbActionButtonFormStdWidth" type="button" title="{$selectVAfmAction/tip}" value="{$selectVAfmAction/title}" onclick='onSelectV("{$selectVAfmAction/@serialized}","eq.tc_service",""); selectValueInputFieldID="eq.tc_service";'/-->
										</td>
									</tr>
								</table>
							</FIELDSET>
							<table>
								<tr><td align="center">
									<xsl:variable name="OKAfmAction" select="//afmAction[@type='applyRestriction1']"/>
									<input  class="AbActionButtonFormStdWidth" type="button" value="{$OKAfmAction/title}" title="{$OKAfmAction/tip}" onclick='sendingDataFromHiddenForm("","{$OKAfmAction/@serialized}","_parent","{$OKAfmAction/subFrame/@name}",true,"")'/>
								</td></tr>
							</table>
						</td>
					</tr>
				</table>
			</td></tr>
		</table>
	</xsl:template>

	<!-- including xsl which are called -->
	<xsl:include href="../../../ab-system/xsl/common.xsl" />
	<xsl:include href="../../../ab-system/xsl/inputs-validation.xsl" />
	<xsl:include href="../../../ab-system/xsl/locale.xsl" />
</xsl:stylesheet>


