<?xml version="1.0" encoding="UTF-8"?>
<!-- processing edit form's data content  -->
<!-- used javascript functions by this XSLT are defined in common.js, date-time.js, edit-forms.js, common-edit-report.js, and inputs-validation.js -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<!-- variables for memo fields -->
	<!--xsl:variable name="memoFieldWidth" select="'70'"/>
	<xsl:variable name="memoFieldHeight" select="'5'"/-->
	<xsl:template name="EditForm_data">
		<xsl:param name="afmTableGroup"/>
		<xsl:param name="afmTableGroupID"/>

		<!--table  border="0" cellspacing="0" cellpadding="0" align="center"  valign="top" style="margin-left:2;"-->
			<!-- a list of normal fields  -->
			<xsl:call-template name="ListNormalFields">
				<xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
				<xsl:with-param name="afmTableGroupID" select="$afmTableGroupID"/>
			</xsl:call-template>
			<!-- a list of memo fields  -->
			<xsl:call-template name="ListMemoFields">
				<xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
				<xsl:with-param name="afmTableGroupID" select="$afmTableGroupID"/>
			</xsl:call-template>
		<!--/table-->
	</xsl:template>

	<!-- lables control -->
	<xsl:template name="Labels">
		<xsl:param name="fieldNode"/>
		<xsl:choose>
			<xsl:when test="$fieldNode/@required='true'">
				<!--xsl:for-each select="$fieldNode/multiLineHeadings/multiLineHeading">
					<xsl:value-of select="@multiLineHeading"/>
					<xsl:if test="position()!=last()">
						<xsl:value-of select="$whiteSpace"/>
					</xsl:if>
				</xsl:for-each-->
				<xsl:value-of select="$fieldNode/@singleLineHeading"/>
				<span style="font-size:10;font-family:Verdana,Geneva,Arial,Helvetica, sans-serif;color:red">*</span>:
			</xsl:when>
			<xsl:otherwise>
				<xsl:for-each select="$fieldNode/multiLineHeadings/multiLineHeading">
					<xsl:value-of select="@multiLineHeading"/>
					<xsl:if test="position()!=last()">
						<xsl:value-of select="$whiteSpace"/>
					</xsl:if>
				</xsl:for-each>
				<xsl:text>:</xsl:text>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>

	<!-- list of normal fields -->
	<xsl:template name="ListNormalFields">
		<xsl:param name="afmTableGroup"/>
		<xsl:param name="afmTableGroupID"/>

		<xsl:variable name="fields" select="$afmTableGroup/dataSource/data/fields/field[@format!='Memo']"/>
		<!-- if there are some fields  -->
		<xsl:if test="count($fields) &gt; 0">
			<!-- total number of fields except for memo fields -->
			<xsl:variable name="iTotalNormalFields">
				<xsl:for-each select="$fields">
					<xsl:if test="position()=last()">
						<xsl:value-of select="last()"/>
					</xsl:if>
				</xsl:for-each>
			</xsl:variable>
			<!-- divide all normal fields into two columns -->
			<xsl:variable name="iDividedNumber">
				<xsl:choose>
					<xsl:when test="($iTotalNormalFields mod 2)=0">
						<xsl:value-of select="($iTotalNormalFields div 2)"/>
					</xsl:when>
					<xsl:otherwise>
						<xsl:value-of select="ceiling($iTotalNormalFields div 2)"/>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:variable>

			<xsl:for-each select="$fields">
				<xsl:variable name="index" select="position()"/>
				<xsl:if test="$index &lt;= $iDividedNumber">
					<tr>
					<td>
						<!-- first column -->
						<xsl:call-template name="normalFields">
							<xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
							<xsl:with-param name="fieldNode" select="."/>
							<xsl:with-param name="recordName" select="concat(@table,'.',@name)"/>
							<xsl:with-param name="afmTableGroupID" select="$afmTableGroupID"/>
						</xsl:call-template>
					</td>
					<xsl:choose>
						<xsl:when test="$index &lt; last()">
							<!-- there is a field left for sencod column-->
							<xsl:for-each select="$fields[position()=($index+$iDividedNumber)]">
								<td>
									<!-- second column  -->
									<xsl:call-template name="normalFields">
										<xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
										<xsl:with-param name="fieldNode" select="."/>
										<xsl:with-param name="recordName" select="concat(@table,'.',@name)"/>
										<xsl:with-param name="afmTableGroupID" select="$afmTableGroupID"/>
									</xsl:call-template>
								</td>
							</xsl:for-each>
						</xsl:when>
						<xsl:otherwise>
							<!-- there is no field left for sencod column-->
							<td><xsl:value-of select="$whiteSpace"/></td>
						</xsl:otherwise>
					</xsl:choose>
					</tr>
				</xsl:if>
			</xsl:for-each>
		</xsl:if>
	</xsl:template>

	<!-- write labels and inputs for normal fields -->
	<xsl:template name="normalFields">
		<xsl:param name="afmTableGroup"/>
		<xsl:param name="fieldNode"/>
		<xsl:param name="recordName"/>
		<xsl:param name="afmTableGroupID"/>

		<xsl:variable name="foreignKey">
			<xsl:choose>
				<xsl:when test="$fieldNode/@foreignKey"><xsl:value-of select="$fieldNode/@foreignKey"/></xsl:when>
				<xsl:otherwise>false</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
                <xsl:variable name="validate_data">
			<xsl:choose>
				<xsl:when test="$fieldNode/@validate_data"><xsl:value-of select="$fieldNode/@validate_data"/></xsl:when>
				<xsl:otherwise>false</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<xsl:variable name="inputFieldLabelCSS">
			<xsl:choose>
				<xsl:when test="$foreignKey='true' and $validate_data='true'">inputFieldLabel_validated</xsl:when>
				<xsl:otherwise>inputFieldLabel</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<table border="0" cellpadding="0" cellspacing="0">
			<!-- label -->
			<tr>
				<td class="{$inputFieldLabelCSS}" align="left">
					<xsl:call-template name="Labels">
						<xsl:with-param name="fieldNode" select="$fieldNode"/>
					</xsl:call-template>
				</td>
			</tr>
			<!-- input field -->
			<tr>
				<td align="left" nowrap="1">
					<!-- field which type is not date or time -->
					<xsl:call-template name="NotDataAndTimeField">
						<xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
						<xsl:with-param name="fieldNode" select="$fieldNode"/>
						<xsl:with-param name="recordName" select="$recordName"/>
						<xsl:with-param name="afmTableGroupID" select="$afmTableGroupID"/>
					</xsl:call-template>
					<!-- field which type is date  -->
					<xsl:call-template name="DateField">
						<xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
						<xsl:with-param name="fieldNode" select="$fieldNode"/>
						<xsl:with-param name="recordName" select="$recordName"/>
						<xsl:with-param name="afmTableGroupID" select="$afmTableGroupID"/>
					</xsl:call-template>
					<!-- field which type is time  -->
					<xsl:call-template name="TimeField">
						<xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
						<xsl:with-param name="fieldNode" select="$fieldNode"/>
						<xsl:with-param name="recordName" select="$recordName"/>
						<xsl:with-param name="afmTableGroupID" select="$afmTableGroupID"/>
					</xsl:call-template>
				</td>
			</tr>
		</table>
	</xsl:template>
	<!-- normal field if its datatype is not date and time -->
	<xsl:template name="NotDataAndTimeField">
		<xsl:param name="afmTableGroup"/>
		<xsl:param name="fieldNode"/>
		<xsl:param name="recordName"/>
		<xsl:param name="afmTableGroupID"/>
		<xsl:variable name="type" select="$fieldNode/@type"/>
		<xsl:variable name="readOnly">
			<xsl:choose>
				<xsl:when test="$fieldNode/@readOnly"><xsl:value-of select="$fieldNode/@readOnly"/></xsl:when>
				<xsl:otherwise>false</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<!-- java.sql.Date and java.sql.Time are the keywords in source XML -->
		<xsl:if test="$type!='java.sql.Date' and $type!='java.sql.Time'">
			<xsl:choose>
				<xsl:when test="count($fieldNode/enumeration/item) &gt; 0">
					<!-- enumeration -->
					<xsl:choose>
						<xsl:when test="$readOnly='false'">
							<select   class="inputField_box" name="{$recordName}" id="{$recordName}">
								<xsl:for-each select="$fieldNode/enumeration/item">
									<xsl:variable name="temp_record_value" select="$afmTableGroup/dataSource/data/records/record[position()=1]/@*[name()=$recordName]"/>
									<xsl:choose>
										<!-- must impose [position()=1] in record since there may be more than one record in XML -->
										<xsl:when test="$temp_record_value=@value">
											<option selected="1" value="{@value}"><xsl:value-of select="@displayValue"/></option>
										</xsl:when>
										<xsl:otherwise>
											<option value="{@value}"><xsl:value-of select="@displayValue"/></option>
										</xsl:otherwise>
									</xsl:choose>
								</xsl:for-each>
							</select>
						</xsl:when>
						<xsl:otherwise>
							<select  disabled="1" class="inputField_box" name="{$recordName}" id="{$recordName}">
								<xsl:for-each select="$fieldNode/enumeration/item">
									<xsl:variable name="temp_record_value" select="$afmTableGroup/dataSource/data/records/record[position()=1]/@*[name()=$recordName]"/>
									<xsl:choose>
										<!-- must impose [position()=1] in record since there may be more than one record in XML -->
										<xsl:when test="$temp_record_value=@value">
											<option selected="1" value="{@value}"><xsl:value-of select="@displayValue"/></option>
										</xsl:when>
										<xsl:otherwise>
											<option value="{@value}"><xsl:value-of select="@displayValue"/></option>
										</xsl:otherwise>
									</xsl:choose>
								</xsl:for-each>
							</select>
						</xsl:otherwise>
					</xsl:choose>
				</xsl:when>
				<xsl:otherwise>
					<!-- normal  -->
					<xsl:variable name="record-value" select="$afmTableGroup/dataSource/data/records/record/@*[name()=$recordName]"/>
					<xsl:variable name="maxlength" select="$fieldNode/@size"/>
					<!-- record data in XML for edit-form are in US formats -->
					<!-- if data type is numeric, replace decimal separator by the one in locale -->
					<xsl:choose>
						<xsl:when test="$type='java.lang.Double' or $type='java.lang.Float' or $type='java.lang.Integer'">
							<xsl:variable name="locale-decimal-separator" select="//locale/@decimalSeparator"/>
							<xsl:variable name="temp-record-value" select="translate($record-value,'.',$locale-decimal-separator)"/>
							<xsl:choose>
								<xsl:when test="$readOnly='false'">
									<input  class="inputField" name="{$recordName}" id="{$recordName}" type="text" size="20"  value="{$temp-record-value}"  onblur='validationInputs("{$afmTableGroupID}", "{$recordName}")'/><!-- onfocus='validationInputs("{$afmTableGroupID}", "{$recordName}")'/-->
									<!-- select value action button  -->
									<!--xsl:if test="$readOnly='false'"-->
									<xsl:call-template name="SelectValue">
										<xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
										<xsl:with-param name="fieldNode" select="$fieldNode"/>
										<xsl:with-param name="recordName" select="$recordName"/>
										<xsl:with-param name="afmTableGroupID" select="$afmTableGroupID"/>
										<xsl:with-param name="disabled" select="$readOnly"/>
									</xsl:call-template>
									<!--/xsl:if-->
								</xsl:when>
								<xsl:otherwise>
									<input  class="inputField"  name="{$recordName}" id="{$recordName}" type="hidden" size="20"  value="{$temp-record-value}"/><!-- onKeyUp='validationInputs("{$afmTableGroupID}", "{$recordName}")' onfocus='validationInputs("{$afmTableGroupID}", "{$recordName}")'/-->
									<span  class="inputField" id="Show{$recordName}_numeric" name="Show{$recordName}_numeric"><xsl:value-of select="$temp-record-value"/></span>
								</xsl:otherwise>
							</xsl:choose>

						</xsl:when>
						<xsl:otherwise>
							<xsl:choose>
								<xsl:when test="$readOnly='false'">
									<input maxlength="{$maxlength}" class="inputField"  name="{$recordName}" id="{$recordName}" type="text" size="20"  value="{$record-value}"  onblur='validationInputs("{$afmTableGroupID}", "{$recordName}")'/><!-- onfocus='validationInputs("{$afmTableGroupID}", "{$recordName}")'/-->

									<xsl:call-template name="SelectValue">
										<xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
										<xsl:with-param name="fieldNode" select="$fieldNode"/>
										<xsl:with-param name="recordName" select="$recordName"/>
										<xsl:with-param name="afmTableGroupID" select="$afmTableGroupID"/>
										<xsl:with-param name="disabled" select="$readOnly"/>
									</xsl:call-template>
								</xsl:when>
								<xsl:otherwise>
									<input  class="inputField"  name="{$recordName}" id="{$recordName}" type="hidden" size="20"  value="{$record-value}"/><!-- onKeyUp='validationInputs("{$afmTableGroupID}", "{$recordName}")' onfocus='validationInputs("{$afmTableGroupID}", "{$recordName}")'/-->
									<span class="inputField"><xsl:value-of select="$record-value"/></span>
								</xsl:otherwise>
							</xsl:choose>
						</xsl:otherwise>
					</xsl:choose>
				</xsl:otherwise>
			</xsl:choose>
		</xsl:if>
	</xsl:template>
	<!-- date field -->
	<xsl:template name="DateField">
		<xsl:param name="afmTableGroup"/>
		<xsl:param name="fieldNode"/>
		<xsl:param name="recordName"/>
		<xsl:param name="afmTableGroupID"/>

		<xsl:variable name="type" select="$fieldNode/@type"/>
		<xsl:variable name="required" select="$fieldNode/@required"/>
		<xsl:variable name="readOnly">
			<xsl:choose>
				<xsl:when test="$fieldNode/@readOnly"><xsl:value-of select="$fieldNode/@readOnly"/></xsl:when>
				<xsl:otherwise>false</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<xsl:if test="$type='java.sql.Date'">
			<!-- input -->
			<xsl:choose>
				<xsl:when test="$readOnly='false'">
					<INPUT   class="inputField"  type="text" size="20" NAME="{$recordName}"  VALUE="{$afmTableGroup/dataSource/data/records/record/@*[name()=$recordName]}" onchange='validationAndConvertionDateInput(this, "{$recordName}", null, "false",true, true)' onblur='validationAndConvertionDateInput(this, "{$recordName}", null,"false", true,true)'/>
					<!-- select date from calendar -->
					<!--xsl:if test="$readOnly='false'"-->
					<xsl:call-template name="SelectValue">
						<xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
						<xsl:with-param name="fieldNode" select="$fieldNode"/>
						<xsl:with-param name="recordName" select="$recordName"/>
						<xsl:with-param name="afmTableGroupID" select="$afmTableGroupID"/>
						<xsl:with-param name="disabled" select="$readOnly"/>
					</xsl:call-template>
					<!--/xsl:if-->
				</xsl:when>
				<xsl:otherwise>
					<INPUT   class="inputField"  type="hidden" size="20" NAME="{$recordName}"  VALUE="{$afmTableGroup/dataSource/data/records/record/@*[name()=$recordName]}"/><!-- onKeyUp='validationAndConvertionDateInput(this, "{$recordName}", null, "{$required}",true, false)' onblur='validationAndConvertionDateInput(this, "{$recordName}", null,"{$required}", true,true)'/-->
					<span  class="inputField" id="Show{$recordName}_short" name="Show{$recordName}_short"><xsl:value-of select="$afmTableGroup/dataSource/data/records/record/@*[name()=$recordName]"/></span>
				</xsl:otherwise>
			</xsl:choose>

			<!-- new line -->
			<br />
			<!-- show date in its long format: id and name must be fixed pattern which will be used in javascript -->
			<span id="Show{$recordName}" name="Show{$recordName}" class="showingDateAndTimeLongFormat"></span>
		</xsl:if>
	</xsl:template>

	<!-- time field -->
	<xsl:template name="TimeField">
		<xsl:param name="afmTableGroup"/>
		<xsl:param name="fieldNode"/>
		<xsl:param name="recordName"/>
		<xsl:param name="afmTableGroupID"/>
		<xsl:variable name="type" select="$fieldNode/@type"/>
		<xsl:variable name="required" select="$fieldNode/@required"/>
		<xsl:variable name="readOnly">
			<xsl:choose>
				<xsl:when test="$fieldNode/@readOnly"><xsl:value-of select="$fieldNode/@readOnly"/></xsl:when>
				<xsl:otherwise>false</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<xsl:if test="$type='java.sql.Time'">
			<!-- trucate time value to only get HH:MM -->
			<xsl:variable name="original_time_value" select="$afmTableGroup/dataSource/data/records/record/@*[name()=$recordName]"/>
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

			<!-- input -->
			<xsl:choose>
				<xsl:when test="$readOnly='false'">
					<INPUT   class="inputField" type="text" size="20" NAME="{$recordName}" VALUE="{$trucated_time_value}" onchange='validationAndConvertionTimeInput(this, "{$recordName}",null,"false",true, false)' onblur='validationAndConvertionTimeInput(this, "{$recordName}", null,"false",true,true)'/>
				</xsl:when>
				<xsl:otherwise>
					<INPUT   class="inputField" type="hidden" size="20" NAME="{$recordName}" VALUE="{$trucated_time_value}"/><!-- onKeyUp='validationAndConvertionTimeInput(this, "{$recordName}",null,"{$required}",true, false)' onblur='validationAndConvertionTimeInput(this, "{$recordName}", null,"{$required}",true,true)'/-->
					<span class="inputField" id="Show{$recordName}_short" name="Show{$recordName}_short"><xsl:value-of select="$trucated_time_value"/></span>
				</xsl:otherwise>
			</xsl:choose>
			<!-- Hidden field to store time in 24 hour format -->
			<INPUT type="hidden" size="20" id="Stored{$recordName}" name="Stored{$recordName}" VALUE="{$original_time_value}"/>
			<!-- new line -->
			<br />
			<!-- show time with AM/PM:  id and name must be fixed pattern which will be used in javascript -->
			<span id="Show{$recordName}" name="Show{$recordName}"  class="showingDateAndTimeLongFormat"></span>
		</xsl:if>
	</xsl:template>

	<!-- list of memo fields -->
	<xsl:template name="ListMemoFields">
		<xsl:param name="afmTableGroup"/>
		<xsl:param name="afmTableGroupID"/>
		<!-- Memo is keyword in source XML -->
		<xsl:variable name="fields" select="$afmTableGroup/dataSource/data/fields/field[@format='Memo']"/>
		<xsl:if test="count($fields) &gt; 0">
			<!--tr><td align="left" valign="top">
				<table  align="left" valign="top" border="0" cellspacing="0" cellpadding="0"-->
				<xsl:for-each select="$fields">
					<xsl:variable name="readOnly">
						<xsl:choose>
							<xsl:when test="@readOnly"><xsl:value-of select="@readOnly"/></xsl:when>
							<xsl:otherwise>false</xsl:otherwise>
						</xsl:choose>
					</xsl:variable>
					<xsl:variable name="recordName" select="concat(@table,'.',@name)"/>
					<tr id="span_{$recordName}_title">
						<td align="left" valign="top"  class="inputFieldLabel" colspan="2">
							<!-- label -->
							<xsl:call-template name="Labels">
								<xsl:with-param name="fieldNode" select="."/>
							</xsl:call-template>
							<xsl:value-of select="$whiteSpace"/>
							<!-- select value button -->
							<xsl:if test="$readOnly='false'">
								<xsl:call-template name="SelectValue">
									<xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
									<xsl:with-param name="fieldNode" select="."/>
									<xsl:with-param name="recordName" select="$recordName"/>
									<xsl:with-param name="afmTableGroupID" select="$afmTableGroupID"/>
									<xsl:with-param name="disabled" select="$readOnly"/>
								</xsl:call-template>
							</xsl:if>
						</td>
					</tr>
					<tr id="span_{$recordName}_data">
						<td colspan="2">
							<!-- memo input -->
							<xsl:choose>
								<xsl:when test="$readOnly='false'">
									<textarea class="defaultEditForm_textareaABData" id="{$recordName}" name="{$recordName}" wrap="PHYSICAL"><!-- cols="{$memoFieldWidth}" rows="{$memoFieldHeight}" wrap="PHYSICAL"-->
										<xsl:value-of select="$afmTableGroup/dataSource/data/records/record/@*[name()=$recordName]"/><xsl:value-of select="$whiteSpace"/>
									</textarea>
								</xsl:when>
								<xsl:otherwise>
									<textarea class="defaultEditForm_textareaABData" id="{$recordName}" name="{$recordName}" wrap="PHYSICAL"><!-- cols="{$memoFieldWidth}" rows="{$memoFieldHeight}" wrap="PHYSICAL"-->
										<xsl:value-of select="$afmTableGroup/dataSource/data/records/record/@*[name()=$recordName]"/><xsl:value-of select="$whiteSpace"/>
									</textarea>
								</xsl:otherwise>
							</xsl:choose>

						</td>
					</tr>
				</xsl:for-each>
				<!--/table>
			</td></tr-->
		</xsl:if>
	</xsl:template>

	<!-- Select Value Action-->
	<xsl:template name="SelectValue">
		<xsl:param name="afmTableGroup"/>
		<xsl:param name="afmTableGroupID"/>
		<xsl:param name="recordName"/>
		<xsl:param name="disabled"/>
		<xsl:variable name="afmAction" select="$afmTableGroup/forFields/field/afmAction[@type='selectValue']"/>
		<xsl:if test="count($afmAction) &gt; 0">
			<!-- must be like onclick='onSelectV("{...}"...) ...  ', cannot be like onclick="onSelectV('{...}'...) ... "  -->
			<!-- this is a trick between XSL processor and browser javascript engine -->
			<!-- XSL: ' transformed into &apos; " transformed into &quot; || Javascript: JSFunctionName(&quot;parameter&quot;) is working but JSFunctionName(&apos;parameter&apos;) is error -->
			<xsl:choose>
				<xsl:when test="$disabled='false'">
					<input class="selectValue_AbActionButtonFormStdWidth" type="button" title="{$afmAction/tip}" value="{$afmAction/title}" onclick='onSelectV("{$afmAction/@serialized}","{$recordName}","{$afmTableGroupID}"); selectedValueInputFormName="{$afmTableGroupID}" ; selectValueInputFieldID="{$recordName}" ;'/>
				</xsl:when>
				<xsl:otherwise>
					<input disabled="1" class="selectValue_AbActionButtonFormStdWidth" type="button" title="{$afmAction/tip}" value="{$afmAction/title}" onclick='onSelectV("{$afmAction/@serialized}","{$recordName}","{$afmTableGroupID}"); selectedValueInputFormName="{$afmTableGroupID}" ; selectValueInputFieldID="{$recordName}" ;'/>
				</xsl:otherwise>
			</xsl:choose>
		</xsl:if>
	</xsl:template>
</xsl:stylesheet>
