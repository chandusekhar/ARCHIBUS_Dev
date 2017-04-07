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
			<script language="JavaScript" src="#Attribute%//@relativeFileDirectory%/ab-rm-reserve-filter.js"><xsl:value-of select="$whiteSpace"/></script>
			<!-- template: SetUpLocales is in locale.xsl-->
			<xsl:call-template name="SetUpLocales"/>
		</head>
		<!-- date_start, time_start, date_end, time_end, and duration have been saved in restriction's title????? -->
		<xsl:variable name="strDateTime" select="/*/afmTableGroup[position()=1]/dataSource/data/restrictions/restriction[@type='sql']/title"/>
		<body onload='setupDateTimeValues("{$strDateTime}")' class="body" leftmargin="0" rightmargin="0" topmargin="0" bottomMargin ="0">

			<!-- Localization messages -->
			<span translatable="true" id="start_date" name="start_date" style="display:none">The start date for a reserved room can not be earlier than today.</span>
			<span translatable="true" id="start_date_and_time" name="start_date_and_time" style="display:none">The start date and time for a reserved room can not be earlier than today and current time.</span>

			<!-- calling template table-group-title in common.xsl to set up tgrp's title in the top of html page -->
			<!--xsl:call-template name="table-group-title">
				<xsl:with-param name="title" select="/*/afmTableGroup/title"/>
			</xsl:call-template-->	
			<!-- calling inputs-validation.xsl to use its template SetUpFieldsInformArray -->
			<!-- ?????????available fields are missed in XML??????????? -->
			<xsl:call-template name="SetUpFieldsInformArray">
				<xsl:with-param name="fieldNodes" select="/*/afmTableGroup/dataSource/data/availableFields"/>
			</xsl:call-template>
			
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
				var arrInformationList = new Array();
				arrInformationList['type']='java.sql.Date';
				arrInformationList['format']='AnyChar';
				arrInformationList['primaryKey']='false';
				arrInformationList['foreignKey']='false';
				arrInformationList['size']='8';
				arrInformationList['decimal']='0';
				arrInformationList['required']='false';
				arrInformationList['displaySizeHeading']='5';
				
				arrInformationList['isEnum']=false;
				
				setupArrFieldsInformation('rm_reserve.date_start',arrInformationList);
		
			</script>
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
								<LEGEND  class="legendTitle" translatable="true">Time Room Needed:</LEGEND>
								<table width="100%" style="white-space:nowrap">
									<tr>
										<td class="inputFieldLabel">
											<span translatable="true" >Date:</span> 
											<span  style="display:none"  id="ab_rm_reservation_startdate_message" name="ab_rm_reservation_startdate_message" translatable="true" >The start date for a reserved room can not be earlier than today.</span> 
										</td>
										<td>
											<input class="inputField" style="width:100" type="text" value="" name="rm_reserve.date_start" id="rm_reserve.date_start" size="20"  onchange='validationInputs("rm_reserve.date_start")' onblur='validationAndConvertionDateAndTime("rm_reserve.date_start", false);checkStartDateInput(this)' /><input class="selectValue_AbActionButtonFormStdWidth" type="button" title="{$selectVAfmAction/tip}" value="{$selectVAfmAction/title}" onclick='onSelectV("{$selectVAfmAction/@serialized}","rm_reserve.date_start",""); selectValueInputFieldID="rm_reserve.date_start";'/>	
										</td>
									</tr>
									<tr>
										<td class="inputFieldLabel">
											<span translatable="true" >Time:</span> 
											<span  style="display:none"  id="ab_rm_reservation_starttime_message" name="ab_rm_reservation_starttime_message" translatable="true" >The start date and time for a reserved room can not be earlier than today and current time.</span> 
										</td>
										<td>
											<select class="rm_reserve_select_field" name="startTime" id="startTime" style="width:120">
												<xsl:for-each select="$afmTableGroup/time-options/time">
													<xsl:choose>
														<xsl:when test="@value='08:00'">
															<option value="{@value}" selected="1"><xsl:value-of select="@value"/></option>
														</xsl:when>
														<xsl:otherwise>
															<option value="{@value}"><xsl:value-of select="@value"/></option>
														</xsl:otherwise>
													</xsl:choose>
												</xsl:for-each>
											</select>
										</td>
									</tr>
									<tr>
										<td class="inputFieldLabel">
											<span translatable="true">Duration:</span>
										</td>
										<td>
											<select class="rm_reserve_select_field" name="duration" id="duration" style="width:120">
												<xsl:for-each select="$afmTableGroup/time-durations/duration">
													<xsl:choose>
														<xsl:when test="@value='4.0'">
															<option value="{@value}" selected="1"><xsl:value-of select="."/></option>	
														</xsl:when>
														<xsl:otherwise>
															<option value="{@value}"><xsl:value-of select="."/></option>	
														</xsl:otherwise>
													</xsl:choose>
													
												</xsl:for-each>
											</select>
										</td>
									</tr>
								</table>
							</FIELDSET>
						</td>
						<td>
							<FIELDSET>
								<LEGEND  class="legendTitle" translatable="true">Location Desired:</LEGEND>
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
											<input class="inputField"  style="width:120" type="text" value="{$building_value}" name="rm.bl_id" id="rm.bl_id" size="20" onchange='validationInputs("rm.bl_id")'  onblur='validationAndConvertionDateAndTime("rm.bl_id", false)'/><input class="selectValue_AbActionButtonFormStdWidth" type="button" title="{$selectVAfmAction/tip}" value="{$selectVAfmAction/title}" onclick='onSelectV("{$selectVAfmAction/@serialized}","rm.bl_id",""); selectValueInputFieldID="rm.bl_id";'/>
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
											
											<input class="inputField"  style="width:120" type="text" value="{$floor_value}" name="rm.fl_id" id="rm.fl_id" size="20" onchange='validationInputs("rm.fl_id")'  onblur='validationAndConvertionDateAndTime("rm.fl_id", false)'/><input class="selectValue_AbActionButtonFormStdWidth" type="button" title="{$selectVAfmAction/tip}" value="{$selectVAfmAction/title}" onclick='onSelectV("{$selectVAfmAction/@serialized}","rm.fl_id",""); selectValueInputFieldID="rm.fl_id";'/>
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
											<input class="inputField"  style="width:120" type="text" value="{$room_value}" name="rm.rm_id" id="rm.rm_id" size="20" onchange='validationInputs("rm.rm_id")'  onblur='validationAndConvertionDateAndTime("rm.rm_id", false)'/><input class="selectValue_AbActionButtonFormStdWidth" type="button" title="{$selectVAfmAction/tip}" value="{$selectVAfmAction/title}" onclick='onSelectV("{$selectVAfmAction/@serialized}","rm.rm_id",""); selectValueInputFieldID="rm.rm_id";'/>
										</td>
									</tr>
								</table>
							</FIELDSET>
						</td>
						<td>
							<FIELDSET>
								<LEGEND  class="legendTitle" translatable="true">Use:</LEGEND>
								<table width="100%" style="white-space:nowrap">
									<tr>
										<td class="inputFieldLabel">
											<span translatable="true">Standard:</span>
										</td>
										<td>
											<xsl:variable name="standard_value">
												<xsl:for-each select="$afmTableGroup/dataSource/data/restrictions/restriction[@type='parsed']/clause">
													<xsl:if test="field/@name='rm_std'">
														<xsl:value-of select="@value"/>
													</xsl:if>
												</xsl:for-each>
											</xsl:variable>
											<input class="inputField"  style="width:120" type="text" value="{$standard_value}" name="rm.rm_std" id="rm.rm_std" size="20" onchange='validationInputs("rm.rm_std")'  onblur='validationAndConvertionDateAndTime("rm.rm_std", false)'/><input class="selectValue_AbActionButtonFormStdWidth" type="button" title="{$selectVAfmAction/tip}" value="{$selectVAfmAction/title}" onclick='onSelectV("{$selectVAfmAction/@serialized}","rm.rm_std",""); selectValueInputFieldID="rm.rm_std";'/>
										</td>
									</tr>
									<tr>
										<td class="inputFieldLabel">
											<span translatable="true">Category:</span> 
										</td>
										<td>	<xsl:variable name="category_value">
												<xsl:for-each select="$afmTableGroup/dataSource/data/restrictions/restriction[@type='parsed']/clause">
													<xsl:if test="field/@name='rm_cat'">
														<xsl:value-of select="@value"/>
													</xsl:if>
												</xsl:for-each>
											</xsl:variable>
											
											<input class="inputField"  style="width:120" type="text" value="{$category_value}" name="rm.rm_cat" id="rm.rm_cat" size="20" onchange='validationInputs("rm.rm_cat")'  onblur='validationAndConvertionDateAndTime("rm.rm_cat", false)'/><input class="selectValue_AbActionButtonFormStdWidth" type="button" title="{$selectVAfmAction/tip}" value="{$selectVAfmAction/title}" onclick='onSelectV("{$selectVAfmAction/@serialized}","rm.rm_cat",""); selectValueInputFieldID="rm.rm_cat";'/>
										</td>
									</tr>
									<tr>
										<td class="inputFieldLabel">
											<span translatable="true">Type:</span>
										</td>
										<td >
											<xsl:variable name="type_value">
												<xsl:for-each select="$afmTableGroup/dataSource/data/restrictions/restriction[@type='parsed']/clause">
													<xsl:if test="field/@name='rm_type'">
														<xsl:value-of select="@value"/>
													</xsl:if>
												</xsl:for-each>
											</xsl:variable>
											<input class="inputField"  style="width:120" type="text" value="{$type_value}" name="rm.rm_type" id="rm.rm_type" size="20" onchange='validationInputs("rm.rm_type")'  onblur='validationAndConvertionDateAndTime("rm.rm_type", false)'/><input class="selectValue_AbActionButtonFormStdWidth" type="button" title="{$selectVAfmAction/tip}" value="{$selectVAfmAction/title}" onclick='onSelectV("{$selectVAfmAction/@serialized}","rm.rm_type",""); selectValueInputFieldID="rm.rm_type";'/>
										</td>
									</tr>
								</table>
							</FIELDSET>
						</td>
						<td align="center" valign="middle">
							<table>
								<tr><td>
									<xsl:variable name="OKAfmAction" select="//afmAction[@type='applyRestriction1']"/>
									<input  class="AbActionButtonFormStdWidth" type="button" value="{$OKAfmAction/title}" title="{$OKAfmAction/tip}" onclick='onShow("","{$OKAfmAction/@serialized}","{$OKAfmAction/@frame}","{$OKAfmAction/subFrame/@name}",true,"")'/>
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


