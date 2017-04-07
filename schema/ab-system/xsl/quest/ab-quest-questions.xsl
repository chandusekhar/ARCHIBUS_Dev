<?xml version="1.0"?>
<!-- xslt called by Java to handle XML data: questionnaire report and edit form-->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">	
	<xsl:template name="Questions">
		<xsl:param name="afmTableGroup"/>
		<xsl:param name="questID"/>
		
		<xsl:variable name="fieldNode" select="$afmTableGroup/dataSource/data/fields/field[1]"/>
		<xsl:variable name="readOnly">
			<xsl:choose>
				<xsl:when test="$fieldNode/@readOnly"><xsl:value-of select="$fieldNode/@readOnly"/></xsl:when>
				<xsl:otherwise>false</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>

		<xsl:choose>
			<xsl:when test="$questID=''">
				<xsl:for-each select="$afmTableGroup/dataSource/data/records/record">
					<xsl:variable name="recordRowIndex" select="position()"/>
					<xsl:variable name="recordData" select="."/>
					<xsl:call-template name="Questions_data">
						<xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
						<xsl:with-param name="recordRowIndex" select="$recordRowIndex"/>
						<xsl:with-param name="recordData" select="$recordData"/>
						<xsl:with-param name="readOnly" select="$readOnly"/>
					</xsl:call-template>
				</xsl:for-each>
			</xsl:when>
			<xsl:otherwise>
				<xsl:for-each select="$afmTableGroup/dataSource/data/records/record[@questions.questionnaire_id=$questID]">
					<xsl:variable name="recordRowIndex" select="position()"/>
					<xsl:variable name="recordData" select="."/>
					<xsl:call-template name="Questions_data">
						<xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
						<xsl:with-param name="recordRowIndex" select="$recordRowIndex"/>
						<xsl:with-param name="recordData" select="$recordData"/>
						<xsl:with-param name="readOnly" select="$readOnly"/>
					</xsl:call-template>
				</xsl:for-each>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>
	
	<xsl:template name="Questions_data">
		<xsl:param name="afmTableGroup"/>
		<xsl:param name="recordRowIndex"/>
		<xsl:param name="recordData"/>
		<xsl:param name="readOnly"/>
		
		<xsl:variable name="recordType" select="$recordData/@questions.format_type"/>
		<xsl:variable name="recordName" select="$recordData/@questions.quest_name"/>
		<xsl:variable name="questionnaireID" select="$recordData/@questions.questionnaire_id"/>
		<xsl:variable name="activityType" select="$recordData/@questions.activity_type"/>
		<xsl:variable name="actionResponse" select="$recordData/@questions.action_response"/>
		<xsl:variable name="table_name" select="$recordData/@questionnaire.table_name"/>
		<xsl:variable name="field_name" select="$recordData/@questionnaire.field_name"/>
		<tr>
			<td class="inputFieldLabel">
				<xsl:value-of select="$recordData/@questions.quest_text"/>
			</td>
			<xsl:variable name="dataClass">
				<xsl:choose>
					<xsl:when test="$readOnly='true'">inputFieldLabel</xsl:when>
					<xsl:otherwise></xsl:otherwise>
				</xsl:choose>
			</xsl:variable>
			<td class="{$dataClass}">
				<input type="hidden" name="question{$recordRowIndex}.quest_name" value="{$recordName}"/>
				<input type="hidden" name="question{$recordRowIndex}.format_type" value="{$recordType}"/>
				<input type="hidden" name="question{$recordRowIndex}.questionnaire_id" value="{$questionnaireID}"/>
				<input type="hidden" name="question{$recordRowIndex}.activity_type" value="{$activityType}"/>
				<input type="hidden" name="question{$recordRowIndex}.action_response" value="{$actionResponse}"/>
				<input type="hidden" name="question{$recordRowIndex}.xml_field" value="{$table_name}.{$field_name}"/>
				<input type="hidden" name="question{$recordRowIndex}.readonly" value="{$readOnly}"/>

				<xsl:choose>
					<xsl:when test="$readOnly='true'">
							<xsl:if test="$recordType='Enum'">
								<xsl:variable name="enumList" select="$recordData/@questions.enum_list"/>
								<input type="hidden" name="question{$recordRowIndex}.enum_list" value="{$enumList}"/>
							</xsl:if>
							<input type="hidden" name="question{$recordRowIndex}.answer_field"/>
							<span id="question{$recordRowIndex}.answer_readonly">
								<xsl:value-of select="$whiteSpace"/>
							</span>
					</xsl:when>
					<xsl:otherwise>
				
						<xsl:if test="$recordType='Free'">
							<xsl:variable name="freeWidth" select="$recordData/@questions.freeform_width"/>
							<input class="inputField" type="text" name="question{$recordRowIndex}.answer_field" maxlength="{$freeWidth}"/>
						</xsl:if>

						<xsl:if test="$recordType='Enum'">
							<xsl:variable name="enumList" select="$recordData/@questions.enum_list"/>
							<input type="hidden" name="question{$recordRowIndex}.enum_list" value="{$enumList}"/>
							<select class="inputField" name="question{$recordRowIndex}.answer_field"><xsl:value-of select="$whiteSpace"/>
							</select>
						</xsl:if>

						<xsl:if test="$recordType='Look'">
							<xsl:variable name="lookupTable" select="$recordData/@questions.lookup_table"/>
							<xsl:variable name="lookupField" select="$recordData/@questions.lookup_field"/>
							<input class="inputField" type="text" name="question{$recordRowIndex}.answer_field"/>
							<xsl:variable name="afmAction" select="$afmTableGroup/forFields/field/afmAction[@type='selectValue']"/>
							<input class="selectValue_AbActionButtonFormStdWidth" type="button" title="{$afmAction/tip}" value="..." onclick='lookupSelectV("{$afmAction/@serialized}","{$lookupTable}.{$lookupField}","{$afmInputsForm}"); selectedValueInputFormName="{$afmInputsForm}"; selectValueInputFieldID="question{$recordRowIndex}.answer_field";'/>
						</xsl:if>

					</xsl:otherwise>
				</xsl:choose>
			</td>
		</tr>
	</xsl:template>
</xsl:stylesheet>
