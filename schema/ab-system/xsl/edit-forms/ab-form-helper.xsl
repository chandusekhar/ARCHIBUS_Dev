<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

	<xsl:template name="DisplayLabelAndFieldRow">
		<xsl:param name="afmTableGroup" select="/*/afmTableGroup[position()=1]" />
		<xsl:param name="formName" select="$afmInputsForm" />
		<xsl:param name="fieldName" />
		<xsl:param name="displayType" select="'form'" />
		<xsl:param name="fieldClass" /> <!-- CSS class for field -->
		<xsl:param name="fieldStyle" /> <!-- CSS style for field -->

		<xsl:variable name="fieldNode" select="$afmTableGroup/dataSource/data/fields/field[concat(@table,'.',@name)=$fieldName]" />

		<xsl:call-template name="DisplayLabelCell">
			<xsl:with-param name="afmTableGroup" select="$afmTableGroup" />
			<xsl:with-param name="formName" select="$formName" />
			<xsl:with-param name="fieldName" select="$fieldName" />
			<xsl:with-param name="displayType" select="$displayType" />
			<xsl:with-param name="fieldClass" select="$fieldClass" />
			<xsl:with-param name="fieldStyle" select="$fieldStyle" />
		</xsl:call-template>
		<td>
			<xsl:call-template name="DisplayField">
				<xsl:with-param name="afmTableGroup" select="$afmTableGroup" />
				<xsl:with-param name="formName" select="$formName" />
				<xsl:with-param name="fieldName" select="$fieldName" />
				<xsl:with-param name="displayType" select="$displayType" />
				<xsl:with-param name="fieldClass" select="$fieldClass" />
				<xsl:with-param name="fieldStyle" select="$fieldStyle" />
			</xsl:call-template>
		</td>

	</xsl:template>

	<xsl:template name="DisplayField">
		<xsl:param name="afmTableGroup" select="/*/afmTableGroup[position()=1]" />
		<xsl:param name="formName" select="$afmInputsForm" />
		<xsl:param name="fieldName" />
		<xsl:param name="displayType" select="'form'" /> <!-- form or report -->
		<xsl:param name="simpleDisplay" select="'false'" /> <!-- true to show input with no select value -->
		<xsl:param name="fieldClass" /> <!-- CSS class for field -->
		<xsl:param name="fieldStyle" /> <!-- CSS style for field -->

		<xsl:variable name="fieldNode" select="$afmTableGroup/dataSource/data/fields/field[concat(@table,'.',@name)=$fieldName]" />
		<xsl:variable name="fieldType" select="$fieldNode/@type"/>
		<xsl:variable name="fieldFormat" select="$fieldNode/@format"/>
		<xsl:variable name="fieldValue" select="$afmTableGroup/dataSource/data/records/record/@*[name()=$fieldName]"/>
		<xsl:variable name="readOnly" select="$fieldNode/@readOnly" />

		<xsl:choose>
			<!-- Display nothing if field node is empty. -->
			<xsl:when test="not(boolean($fieldNode))">
			</xsl:when>
			<xsl:when test="$displayType='form' and not(contains($readOnly,'true'))">
				<xsl:choose>
					<xsl:when test="$fieldFormat!='Memo' and contains($simpleDisplay,'true')">
						<xsl:variable name="useFieldClass">
							<xsl:choose>
								<xsl:when test="string-length($fieldClass) &gt; 0"><xsl:value-of select="$fieldClass"/></xsl:when>
								<xsl:otherwise>inputField</xsl:otherwise>
							</xsl:choose>
						</xsl:variable>
						<xsl:choose>
							<xsl:when test="$fieldType='java.lang.Double' or $fieldType='java.lang.Float' or $fieldType='java.lang.Integer'">
								<xsl:variable name="locale-decimal-separator" select="//locale/@decimalSeparator"/>
								<xsl:variable name="temp-record-value" select="translate($fieldValue,'.',$locale-decimal-separator)"/>
								<input class="{$useFieldClass}" style="{$fieldStyle}" type="text" name="{$fieldName}" title="{$fieldName}" id="{$fieldName}" value="{$temp-record-value}" onblur="validationInputs('{$afmInputsForm}','{$fieldName}',false);" />
							</xsl:when>
							<xsl:otherwise>
								<input class="{$useFieldClass}" style="{$fieldStyle}" type="text" maxlength="{$fieldNode/@size}" name="{$fieldName}" title="{$fieldName}" id="{$fieldName}" value="{$fieldValue}" onblur="validationInputs('{$afmInputsForm}','{$fieldName}',false);" />
							</xsl:otherwise>
						</xsl:choose>
					</xsl:when>
					<xsl:when test="$fieldFormat!='Memo'">
						<xsl:call-template name="NotDataAndTimeField">
							<xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
							<xsl:with-param name="fieldNode" select="$fieldNode"/>
							<xsl:with-param name="recordName" select="$fieldName"/>
							<xsl:with-param name="afmTableGroupID" select="$formName"/>
							<xsl:with-param name="fieldClass" select="$fieldClass" />
							<xsl:with-param name="fieldStyle" select="$fieldStyle" />
						</xsl:call-template>
						<!-- field which type is date -->
						<xsl:call-template name="DateField">
							<xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
							<xsl:with-param name="fieldNode" select="$fieldNode"/>
							<xsl:with-param name="recordName" select="$fieldName"/>
							<xsl:with-param name="afmTableGroupID" select="$formName"/>
							<xsl:with-param name="fieldClass" select="$fieldClass" />
							<xsl:with-param name="fieldStyle" select="$fieldStyle" />
						</xsl:call-template>
						<!-- field which type is time -->
						<xsl:call-template name="TimeField">
							<xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
							<xsl:with-param name="fieldNode" select="$fieldNode"/>
							<xsl:with-param name="recordName" select="$fieldName"/>
							<xsl:with-param name="afmTableGroupID" select="$formName"/>
							<xsl:with-param name="fieldClass" select="$fieldClass" />
							<xsl:with-param name="fieldStyle" select="$fieldStyle" />
						</xsl:call-template>
					</xsl:when>
					<xsl:otherwise>
						<xsl:variable name="useFieldClass">
							<xsl:choose>
								<xsl:when test="string-length($fieldClass) &gt; 0"><xsl:value-of select="$fieldClass"/></xsl:when>
								<xsl:otherwise>textareaABData</xsl:otherwise>
							</xsl:choose>
						</xsl:variable>
						<xsl:variable name="useFieldStyle">
							<xsl:choose>
								<xsl:when test="string-length($fieldStyle) &gt; 0"><xsl:value-of select="$fieldStyle"/></xsl:when>
								<xsl:otherwise>width:480px;height:64px;</xsl:otherwise>
							</xsl:choose>
						</xsl:variable>
						<textarea class="{$useFieldClass}" style="{$useFieldStyle}" name="{$fieldName}" id="{$fieldName}" wrap="physical">
							<xsl:value-of select="$fieldValue" /><xsl:value-of select="$whiteSpace"/>
						</textarea>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise><!-- Report or readOnly field -->
				<xsl:call-template name="DisplayReportField">
					<xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
					<xsl:with-param name="fieldName" select="$fieldName"/>
				</xsl:call-template>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>

	<xsl:template name="HiddenField">
		<xsl:param name="afmTableGroup" select="/*/afmTableGroup[position()=1]" />
		<xsl:param name="fieldName" />
		<xsl:param name="displayType" />

		<xsl:variable name="fieldValue" select="$afmTableGroup/dataSource/data/records/record/@*[name()=$fieldName]"/>
		<xsl:variable name="fieldNode" select="$afmTableGroup/dataSource/data/fields/field[concat(@table,'.',@name)=$fieldName]" />
                <xsl:choose>
                <xsl:when test="$fieldNode/@type='java.lang.Double' or $fieldNode/@type='java.lang.Float' or $fieldNode/@type='java.lang.Integer'">
                        <xsl:variable name="locale-decimal-separator" select="//locale/@decimalSeparator"/>
                        <xsl:variable name="temp-record-value" select="translate($fieldValue,'.',$locale-decimal-separator)"/>
                        <input type="hidden" name="{$fieldName}" id="{$fieldName}" value="{$temp-record-value}" />
                </xsl:when>
		<xsl:otherwise>
		<input type="hidden" name="{$fieldName}" id="{$fieldName}" value="{$fieldValue}" />
                </xsl:otherwise>
                </xsl:choose>
		<!-- Time fields need a Stored field as well. -->
		<xsl:if test="$fieldNode/@type='java.sql.Time'">
			<input type="hidden" name="Stored{$fieldName}" id="Stored{$fieldName}" value="{$fieldValue}" />
		</xsl:if>
	</xsl:template>

	<xsl:template name="DisplaySimpleField">
		<xsl:param name="afmTableGroup" select="/*/afmTableGroup[position()=1]" />
		<xsl:param name="formName" select="$afmInputsForm" />
		<xsl:param name="fieldName" />
		<xsl:param name="displayType" select="'form'" />
		<xsl:param name="fieldClass" /> <!-- CSS class for field -->
		<xsl:param name="fieldStyle" /> <!-- CSS style for field -->
		<xsl:call-template name="DisplayField">
			<xsl:with-param name="afmTableGroup" select="$afmTableGroup" />
			<xsl:with-param name="formName" select="$formName" />
			<xsl:with-param name="fieldName" select="$fieldName" />
			<xsl:with-param name="displayType" select="$displayType" />
			<xsl:with-param name="simpleDisplay" select="'true'" />
			<xsl:with-param name="fieldClass" select="$fieldClass" />
			<xsl:with-param name="fieldStyle" select="$fieldStyle" />
		</xsl:call-template>
	</xsl:template>


	<xsl:template name="DisplayLabel">
		<xsl:param name="afmTableGroup" select="/*/afmTableGroup[position()=1]" />
		<xsl:param name="fieldName" />

		<xsl:variable name="fieldNode" select="$afmTableGroup/dataSource/data/fields/field[concat(@table,'.',@name)=$fieldName]"/>

		<xsl:call-template name="Labels">
			<xsl:with-param name="fieldNode" select="$fieldNode"/>
		</xsl:call-template>
	</xsl:template>

	<xsl:template name="DisplayLabelCell">
		<xsl:param name="afmTableGroup" select="/*/afmTableGroup[position()=1]" />
		<xsl:param name="fieldName" />
		<xsl:param name="displayType" select="'form'" />
		<xsl:param name="fieldClass" /> <!-- CSS class for field -->
		<xsl:param name="fieldStyle" /> <!-- CSS style for field -->

		<xsl:variable name="fieldNode" select="$afmTableGroup/dataSource/data/fields/field[concat(@table,'.',@name)=$fieldName]"/>
		<xsl:variable name="readOnly" select="$fieldNode/@readOnly" />

		<xsl:variable name="foreignKey">
			<xsl:choose>
				<xsl:when test="$fieldNode/@foreignKey"><xsl:value-of select="$fieldNode/@foreignKey"/></xsl:when>
				<xsl:otherwise>false</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>

		<!-- Select the default class based on foreignKey status and display type -->
		<xsl:variable name="inputFieldLabelCSS">
			<xsl:choose>
				<xsl:when test="$displayType='form' and not(contains($readOnly,'true'))">
					<xsl:choose>
						<xsl:when test="$foreignKey='true'">inputFieldLabel_validated</xsl:when>
						<xsl:otherwise>inputFieldLabel</xsl:otherwise>
					</xsl:choose>
				</xsl:when>
				<xsl:otherwise>inputFieldLabel</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>

		<xsl:variable name="useFieldClass">
			<xsl:choose>
				<xsl:when test="string-length($fieldClass) &gt; 0"><xsl:value-of select="$fieldClass"/></xsl:when>
				<xsl:otherwise><xsl:value-of select="$inputFieldLabelCSS"/></xsl:otherwise>
			</xsl:choose>
		</xsl:variable>

		<td class="{$useFieldClass}" style="{$fieldStyle}">
			<xsl:call-template name="DisplayLabel">
				<xsl:with-param name="afmTableGroup" select="$afmTableGroup" />
				<xsl:with-param name="fieldName" select="$fieldName" />
			</xsl:call-template>
		</td>
	</xsl:template>


	<xsl:template name="DisplayReportField">
		<xsl:param name="afmTableGroup" select="/*/afmTableGroup[position()=1]" />
		<xsl:param name="fieldName" />

		<xsl:call-template name="HiddenField">
			<xsl:with-param name="afmTableGroup" select="$afmTableGroup" />
			<xsl:with-param name="fieldName" select="$fieldName" />
		</xsl:call-template>

		<xsl:variable name="fieldNode" select="$afmTableGroup/dataSource/data/fields/field[concat(@table,'.',@name)=$fieldName]" />
		<xsl:variable name="fieldValue" select="$afmTableGroup/dataSource/data/records/record/@*[name()=$fieldName]"/>

		<xsl:variable name="fieldEnum" select="$fieldNode/enumeration"/>
		<xsl:variable name="showFieldValue">
			<xsl:choose>
				<xsl:when test="count($fieldEnum) &gt; 0">
					<xsl:for-each select="$fieldEnum/item">
						<xsl:if test="@value=$fieldValue"><xsl:value-of select="@displayValue"/></xsl:if>
					</xsl:for-each>
				</xsl:when>
				<xsl:otherwise><xsl:value-of select="$fieldValue"/></xsl:otherwise>
			</xsl:choose>
		</xsl:variable>

		<xsl:choose>
			<xsl:when test="$fieldNode/@format='Memo'">
				<xsl:call-template name="memo_field_value_handler">
					<xsl:with-param name="memo_value" select="$fieldValue" />
				</xsl:call-template>
			</xsl:when>
			<xsl:otherwise>
				<!-- TODO: Display Show Document action for document fields. -->
				<xsl:choose>
					<xsl:when test="$fieldNode/@type='java.sql.Date' or $fieldNode/@type='java.sql.Time'">
						<span id="Show{$fieldName}_long" name="Show{$fieldName}_long"></span>
					</xsl:when>
					<xsl:when test="$fieldNode/@type='java.lang.Double' or $fieldNode/@type='java.lang.Float' or $fieldNode/@type='java.lang.Integer'">
						<xsl:variable name="locale-decimal-separator" select="//locale/@decimalSeparator"/>
						<xsl:variable name="temp-record-value" select="translate($fieldValue,'.',$locale-decimal-separator)"/>
						<span id="Show{$fieldName}_numeric" name="Show{$fieldName}_numeric"><xsl:value-of select="$temp-record-value"/></span>
					</xsl:when>
					<xsl:otherwise>
						<xsl:value-of select="$showFieldValue"/>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:otherwise>
		</xsl:choose>

	</xsl:template>

	<xsl:template name="ActionButtons" >
		<xsl:param name="afmTableGroup" select="/*/afmTableGroup[position()=1]" />
		<xsl:param name="formName" select="$afmInputsForm" />
		<xsl:call-template name="EditForm_actions">
			<xsl:with-param name="afmTableGroup" select="$afmTableGroup" />
			<xsl:with-param name="afmTableGroupID" select="$formName" />
		</xsl:call-template>
	</xsl:template>

	<xsl:include href="edit-form-data.xsl" />
	<xsl:include href="edit-form-actions.xsl" />
</xsl:stylesheet>
