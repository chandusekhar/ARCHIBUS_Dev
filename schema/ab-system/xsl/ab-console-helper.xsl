<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

	<!-- Default parameter values for console templates -->
	<xsl:param name="activityGraphic" select="/*/record/@console.activityGraphic" />
	<xsl:param name="instructionText" select="//message[@name='instructionText']" />

	<xsl:param name="tableGroupNode" select="/*/afmTableGroup[position()=1]" />
	<xsl:param name="consoleFieldsNode" select="/*/fields" />

	<xsl:param name="labelStyle">
		<xsl:choose>
			<xsl:when test="/*/record/@console.labelStyle"><xsl:value-of select="/*/record/@console.labelStyle" /></xsl:when>
			<xsl:otherwise>top</xsl:otherwise>
		</xsl:choose>
	</xsl:param>

	<xsl:param name="iColumns">
		<xsl:choose>
			<xsl:when test="/*/record/@console.columns"><xsl:value-of select="/*/record/@console.columns" /></xsl:when>
			<xsl:otherwise>3</xsl:otherwise>
		</xsl:choose>
	</xsl:param>

	<!-- ConsoleContent
	 	Creates the entire restriction console
	-->
	<xsl:template name="ConsoleContent">
		<html lang="EN">

			<xsl:call-template name="ConsoleHeader" />

			<xsl:call-template name="ConsoleBody" />

		</html>
	</xsl:template>

	<!-- ConsoleHeader
	 HTML header for the page
	-->
	<xsl:template name="ConsoleHeader">
		<head>

			<title><xsl:value-of select="/*/title" /><xsl:text> </xsl:text></title>

			<!-- template: LinkingCSS is in common.xsl -->
			<xsl:call-template name="LinkingCSS" />

			<!-- Insert console javascript  -->
			<xsl:call-template name="ConsoleJavascript" />

			<!-- template: SetUpLocales is in locale.xsl -->
			<xsl:call-template name="SetUpLocales" />

		</head>
	</xsl:template>

	<!-- ConsoleBody
		Console page body
	-->
	<xsl:template name="ConsoleBody">
		<body class="body">

			<xsl:call-template name="SetUpFieldsInformArray">
				<xsl:with-param name="fieldNodes" select="$tableGroupNode/dataSource/data/availableFields" />
			</xsl:call-template>

			<xsl:call-template name="ConsoleFieldInfoArray" />

			<xsl:call-template name="ConsolePermRestArray" />

			<xsl:call-template name="ConsoleTitle" />

			<xsl:call-template name="ConsoleBodyTable" />

			<!-- calling common.xsl -->
			<xsl:call-template name="common">
				<xsl:with-param name="title" select="/*/title" />
				<xsl:with-param name="debug" select="//@debug" />
				<xsl:with-param name="afmHiddenForm" select="$afmHiddenForm" />
				<xsl:with-param name="xml" select="$xml" />
				<xsl:with-param name="afmInputsForm" select="$afmInputsForm" />
			</xsl:call-template>
		</body>
	</xsl:template>


	<!-- ConsoleTitle
		Console Title Bar
	-->
	<xsl:template name="ConsoleTitle">
		<table class="topTitleBarTable" cellspacing="0" cellpadding="0">
			<tr><td nowrap="1" class="topTitleBarTableTitle"><xsl:value-of select="$tableGroupNode/title" /></td></tr>
		</table>
	</xsl:template>


	<!-- ConsoleBodyTable
		Console body table
	-->
	<xsl:template name="ConsoleBodyTable">
			<table>
				<tr>
					<td>
						<xsl:if test="$activityGraphic">
                            <xsl:variable name="activity_graphic" translatable="true">Activity Graphic</xsl:variable>
							<img alt="{$activity_graphic}" src="{$abSchemaSystemGraphicsFolder}/{$activityGraphic}">
							<xsl:text> </xsl:text></img>
						</xsl:if>
					</td>
					<td>
						<xsl:call-template name="ConsoleForm" />
					</td>
				</tr>
			</table>
	</xsl:template>


	<!-- ConsoleBody
		Console restriction form
	-->
	<xsl:template name="ConsoleForm">

		<xsl:variable name="OKAfmAction" select="$tableGroupNode/afmAction[@type='applyRestriction1']" />

		<form name="{$afmInputsForm}">
			<table cellspacing="0" cellpadding="0" class="AbDataTable">

				<tr>
					<xsl:variable name="instColspan">
						<xsl:choose>
							<xsl:when test="$labelStyle='top'"><xsl:value-of select="$iColumns * 2" /></xsl:when>
							<xsl:otherwise><xsl:value-of select="$iColumns * 4" /></xsl:otherwise>
						</xsl:choose>
					</xsl:variable>
					<td class="instruction" style="vertical-align:top;" colspan="{$instColspan}">
						<span style="padding-right:20px;"><xsl:value-of select="$instructionText" /><xsl:text> </xsl:text></span>
						<input type="button" value="{$OKAfmAction/title}" title="{$OKAfmAction/title}" onclick='ValidateAndSubmitForm("{$OKAfmAction/@serialized}","{$OKAfmAction/@frame}","{$OKAfmAction/subFrame/@name}")' />
					</td>
				</tr>

				<xsl:apply-templates select="$consoleFieldsNode/field[position() mod $iColumns = 1 or $iColumns = 1]" mode="row-start" />

			</table>
		</form>
	</xsl:template>


	<xsl:template match="field" mode="row-start">
		<tr>
			<xsl:apply-templates select=". | following-sibling::field[position() &lt; $iColumns]" />
		</tr>
	</xsl:template>

	<xsl:template match="field">
		<td>
			<xsl:call-template name="ConsoleLabelAndField">
				<xsl:with-param name="tableName" select="./@table" />
				<xsl:with-param name="fieldName" select="./@name" />
			</xsl:call-template>
		</td>
	</xsl:template>

	<!-- ConsoleFieldInfoArray
		Save the restriction options for the list of console fields in a js array.
		ab-console-helper.js uses this to construct the parsed restriction
	-->
	<xsl:template name="ConsoleFieldInfoArray">

		<script language="javascript">
			<!-- Console field information used by ab-console-helper.js -->
			var arrConsoleFieldInfo = new Array();

			<xsl:for-each select="$consoleFieldsNode/field">

				<!-- Create our console field array used to build the parsed restriction -->
				<xsl:variable name="op">
					<xsl:choose>
						<xsl:when test="clause/@op"><xsl:value-of select="clause/@op" /></xsl:when>
						<xsl:otherwise>=</xsl:otherwise>
					</xsl:choose>
				</xsl:variable>

				<xsl:variable name="relop">
					<xsl:choose>
						<xsl:when test="clause/@relop"><xsl:value-of select="clause/@relop" /></xsl:when>
						<xsl:otherwise>AND</xsl:otherwise>
					</xsl:choose>
				</xsl:variable>

				var arrInformationList = new Array();
				arrInformationList['op']='<xsl:value-of select="$op" />';
				arrInformationList['relop']='<xsl:value-of select="$relop" />';
				arrInformationList['value']='<xsl:value-of select="clause/@value" />';
				arrInformationList['required']='<xsl:value-of select="@required" />';

				<!-- Add field info to console fieldinfo array -->
				arrConsoleFieldInfo['<xsl:value-of select="concat(@table,'.',@name)"/>'] = arrInformationList;
			</xsl:for-each>
		</script>
	</xsl:template>

	<!-- ConsolePermRestArray
		Preserves any existing SQL restrictions with a title like 'Permanent'
		into a js array.  ab-console-helper.js reapplies these restrictions
	-->
	<xsl:template name="ConsolePermRestArray">
		<script language="javascript">
			var arrPermanentRestrictions = new Array();
			<xsl:for-each select="$tableGroupNode/dataSource/data/restrictions/restriction[@type='sql'][starts-with(title, 'Permanent')]">
				var arrRestriction = new Array();
				arrRestriction["sql"]="<xsl:value-of select="@sql" />";
				arrRestriction["table"]="<xsl:value-of select="field/@table" />";
				arrPermanentRestrictions.push(arrRestriction);
			</xsl:for-each>
		</script>
	</xsl:template>

	<!-- ConsoleJavascript
		Includes standard console javascript files
	-->
	<xsl:template name="ConsoleJavascript">
		<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common.js"><xsl:value-of select="$whiteSpace"/></script>
		<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/locale.js"><xsl:value-of select="$whiteSpace"/></script>
		<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/date-time.js"><xsl:value-of select="$whiteSpace"/></script>
		<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/inputs-validation.js"><xsl:value-of select="$whiteSpace"/></script>
		<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/ab-console-helper.js"><xsl:value-of select="$whiteSpace"/></script>
	</xsl:template>


	<xsl:template name="ConsoleLabel">
		<xsl:param name="tableName" />
		<xsl:param name="fieldName" />
		<xsl:param name="labelName" />

		<xsl:variable name="fieldNode" select="$tableGroupNode/dataSource/data/availableFields/field[@name=$fieldName and @table=$tableName]" />
		<xsl:variable name="consoleFieldNode" select="$consoleFieldsNode/field[@name=$fieldName and @table=$tableName]" />
		<xsl:variable name="fieldRequired" select="$consoleFieldNode/@required='true'" />
                <xsl:variable name="primaryKey" select="$fieldNode/@primaryKey='true'" />

                <xsl:choose>
			<xsl:when test="$labelName"><xsl:value-of select="$labelName" /></xsl:when>
			<xsl:when test="$fieldNode and $consoleFieldNode/@singleLineHeading"><xsl:value-of select="$consoleFieldNode/@singleLineHeading" /></xsl:when>
			<xsl:when test="$fieldNode and $fieldNode/@singleLineHeading">
				<xsl:value-of select="$fieldNode/@singleLineHeading" />
				<xsl:text>: </xsl:text>
			</xsl:when>
			<xsl:when test="$fieldNode">
				<xsl:for-each select="$fieldNode/multiLineHeadings/multiLineHeading">
					<xsl:value-of select="@multiLineHeading"/><xsl:if test="position()!=last()"><xsl:text> </xsl:text></xsl:if>
				</xsl:for-each>
				<xsl:text>: </xsl:text>
			</xsl:when>
		</xsl:choose>

                <xsl:if test="$fieldRequired or $primaryKey">
                  <span style="font-size:10;font-family:Verdana,Geneva,Arial,Helvetica, sans-serif;color:red">*</span>
		</xsl:if>
	</xsl:template>

	<xsl:template name="ConsoleField">
		<xsl:param name="tableName" />
		<xsl:param name="fieldName" />

		<xsl:variable name="tableFieldName" select="concat($tableName,'.',$fieldName)" />
		<xsl:variable name="fieldNode" select="$tableGroupNode/dataSource/data/availableFields/field[@name=$fieldName and @table=$tableName]" />

		<xsl:variable name="fieldRestNode" select="$tableGroupNode/dataSource/data/restrictions/restriction[@type='parsed']/clause[field/@name=$fieldName and field/@table=$tableName]" />
		<xsl:variable name="previousValue" select="translate($fieldRestNode/@value,'%','')" />

		<xsl:call-template name="ConsoleFieldHelper">
			<xsl:with-param name="fieldNode" select="$fieldNode" />
			<xsl:with-param name="tableFieldName" select="$tableFieldName" />
			<xsl:with-param name="previousValue" select="$previousValue" />
		</xsl:call-template>

	</xsl:template>

	<xsl:template name="ConsoleFieldHelper">
		<xsl:param name="fieldNode" />
		<xsl:param name="tableFieldName" />
		<xsl:param name="previousValue" />

		<xsl:variable name="selectVAfmAction" select="//afmAction[@type='selectValue']"/>
		<xsl:choose>
			<xsl:when test="$fieldNode/enumeration/item">
				<select class="inputField" style="width:140" name="{$tableFieldName}">
					<option value=""><xsl:value-of select="' '" /></option>
					<xsl:for-each select="$fieldNode/enumeration/item">
						<xsl:choose>
							<xsl:when test="$previousValue=@value">
								<option value="{@value}" selected="1"><xsl:value-of select="@displayValue" /></option>
							</xsl:when>
							<xsl:otherwise>
								<option value="{@value}"><xsl:value-of select="@displayValue" /></option>
							</xsl:otherwise>
						</xsl:choose>
					</xsl:for-each>
				</select>
			</xsl:when>
			<xsl:when test="$fieldNode/@type = 'java.sql.Date'">
				<input class="inputField" style="width:120" type="text" value="{$previousValue}" name="{$tableFieldName}" title="{$tableFieldName}" id="{$tableFieldName}" size="12" onblur='validationAndConvertionDateInput(this, "{$tableFieldName}", null, "false",true, true)' />
				<input class="selectValue_AbActionButtonFormStdWidth" type="button" title="{$selectVAfmAction/title}" value="{$selectVAfmAction/title}" onclick='onSelectV("{$selectVAfmAction/@serialized}","{$tableFieldName}","{$afmInputsForm}"); selectedValueInputFormName="{$afmInputsForm}"; selectValueInputFieldID="{$tableFieldName}";'/>
			</xsl:when>
			<xsl:when test="$fieldNode/@type = 'java.sql.Time'">
				<input class="inputField" style="width:120" type="text" value="{$previousValue}" name="{$tableFieldName}" title="{$tableFieldName}" id="{$tableFieldName}" size="12" onblur='validationAndConvertionDateInput(this, "{$tableFieldName}", null, "false",true, true)' />
				<input class="selectValue_AbActionButtonFormStdWidth" type="button" title="{$selectVAfmAction/title}" value="{$selectVAfmAction/title}" onclick='onSelectV("{$selectVAfmAction/@serialized}","{$tableFieldName}","{$afmInputsForm}"); selectedValueInputFormName="{$afmInputsForm}"; selectValueInputFieldID="{$tableFieldName}";'/>
				<input type="hidden" value="{$previousValue}" name="Stored{$tableFieldName}" id="Stored{$tableFieldName}" />
			</xsl:when>
			<xsl:when test="$fieldNode">
				<input class="inputField" style="width:120" type="text" value="{$previousValue}" name="{$tableFieldName}" title="{$tableFieldName}" id="{$tableFieldName}" size="12" onblur='validationInputs("{$afmInputsForm}", "{$tableFieldName}")' />
				<input class="selectValue_AbActionButtonFormStdWidth" type="button" title="{$selectVAfmAction/title}" value="{$selectVAfmAction/title}" onclick='onSelectV("{$selectVAfmAction/@serialized}","{$tableFieldName}","{$afmInputsForm}"); selectedValueInputFormName="{$afmInputsForm}"; selectValueInputFieldID="{$tableFieldName}";'/>
			</xsl:when>
		</xsl:choose>

	</xsl:template>


	<xsl:template name="ConsoleLabelAndField">
		<xsl:param name="tableName" />
		<xsl:param name="fieldName" />
		<xsl:param name="labelName" />

		<xsl:choose>
			<xsl:when test="$labelStyle='left'">
				<xsl:call-template name="ConsoleLabelAndFieldCells" >
					<xsl:with-param name="tableName" select="$tableName" />
					<xsl:with-param name="fieldName" select="$fieldName" />
					<xsl:with-param name="labelName" select="$labelName" />
				</xsl:call-template>
			</xsl:when>
			<xsl:when test="$labelStyle='top'">
				<xsl:call-template name="ConsoleLabelAndFieldStack" >
					<xsl:with-param name="tableName" select="$tableName" />
					<xsl:with-param name="fieldName" select="$fieldName" />
					<xsl:with-param name="labelName" select="$labelName" />
				</xsl:call-template>
			</xsl:when>
			<xsl:otherwise>
				<xsl:call-template name="ConsoleLabelAndFieldStack" >
					<xsl:with-param name="tableName" select="$tableName" />
					<xsl:with-param name="fieldName" select="$fieldName" />
					<xsl:with-param name="labelName" select="$labelName" />
				</xsl:call-template>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>

	<xsl:template name="ConsoleLabelAndFieldStack">
		<xsl:param name="tableName" />
		<xsl:param name="fieldName" />
		<xsl:param name="labelName" />

		<td class="inputFieldLabel">
			<xsl:call-template name="ConsoleLabel" >
				<xsl:with-param name="tableName" select="$tableName" />
				<xsl:with-param name="fieldName" select="$fieldName" />
				<xsl:with-param name="labelName" select="$labelName" />
			</xsl:call-template>
		<br />
			<xsl:call-template name="ConsoleField" >
				<xsl:with-param name="tableName" select="$tableName" />
				<xsl:with-param name="fieldName" select="$fieldName" />
				<xsl:with-param name="labelName" select="$labelName" />
			</xsl:call-template>
		</td>
	</xsl:template>

	<xsl:template name="ConsoleLabelAndFieldCells">
		<xsl:param name="tableName" />
		<xsl:param name="fieldName" />
		<xsl:param name="labelName" />

		<td class="inputFieldLabel" style="align:right;">
			<xsl:call-template name="ConsoleLabel">
				<xsl:with-param name="tableName" select="$tableName" />
				<xsl:with-param name="fieldName" select="$fieldName" />
				<xsl:with-param name="labelName" select="$labelName" />
			</xsl:call-template>
		</td>
		<td>
			<xsl:call-template name="ConsoleField">
				<xsl:with-param name="tableName" select="$tableName" />
				<xsl:with-param name="fieldName" select="$fieldName" />
				<xsl:with-param name="labelName" select="$labelName" />
			</xsl:call-template>
		</td>
	</xsl:template>


	<!-- DoMainFieldArrayEntry
		Similar to inputs-validation.xsl
		Saves field information for a field node.  Used to save consoleField information.
	-->
	<!--
	<xsl:template name="DoMainFieldArrayEntry">
		<xsl:param name="fieldNode"/>

		var arrInformationList = new Array();
		arrInformationList['type']='<xsl:value-of select="$fieldNode/@type"/>';
		arrInformationList['afmType']='<xsl:value-of select="$fieldNode/@afmType"/>';
		arrInformationList['readOnly']='<xsl:value-of select="$fieldNode/@readOnly"/>';
		arrInformationList['format']='<xsl:value-of select="$fieldNode/@format"/>';
		arrInformationList['primaryKey']='<xsl:value-of select="$fieldNode/@primaryKey"/>';
		arrInformationList['foreignKey']='<xsl:value-of select="$fieldNode/@foreignKey"/>';
		arrInformationList['size']='<xsl:value-of select="$fieldNode/@size"/>';
		arrInformationList['decimal']='<xsl:value-of select="$fieldNode/@decimals"/>';
		arrInformationList['required']='<xsl:value-of select="$fieldNode/@required"/>';
		arrInformationList['displaySizeHeading']='<xsl:value-of select="$fieldNode/@displaySizeHeading"/>';
		<xsl:variable name="isEnum">
			<xsl:choose>
				<xsl:when test="count($fieldNode/enumeration/item) &gt; 0">true</xsl:when>
				<xsl:otherwise>false</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		arrInformationList['isEnum']=<xsl:value-of select="$isEnum"/>;

		setupArrFieldsInformation('<xsl:value-of select="concat($fieldNode/@table,'.',$fieldNode/@name)"/>',arrInformationList);
	</xsl:template>
	-->

	<!--
	<xsl:template name="ConsoleBetweenLabelAndField">
		<xsl:param name="tableName" />
		<xsl:param name="fieldName" />
		<xsl:param name="labelName" />

		<xsl:variable name="tableFieldName" select="concat($tableName,'.',$fieldName)" />
		<xsl:variable name="fieldNode" select="$tableGroupNode/dataSource/data/availableFields/field[@name=$fieldName and @table=$tableName]" />

		<xsl:variable name="fieldRestNodeGT" select="$tableGroupNode/dataSource/data/restrictions/restriction[@type='parsed']/clause[@op='&gt;' and field/@name=$fieldName]" />
		<xsl:variable name="fieldRestNodeLT" select="$tableGroupNode/dataSource/data/restrictions/restriction[@type='parsed']/clause[@op='&lt;' and field/@name=$fieldName]" />

		<xsl:variable name="previousValueGT" select="$fieldRestNodeGT/@value" />
		<xsl:variable name="previousValueLT" select="$fieldRestNodeLT/@value" />

		<xsl:choose>
			<xsl:when test="$labelStyle='left'">
				<xsl:call-template name="ConsoleLabelAndFieldCells" >
					<xsl:with-param name="tableName" select="$tableName" />
					<xsl:with-param name="fieldName" select="$fieldName" />
					<xsl:with-param name="labelName" select="$labelName" />
				</xsl:call-template>
			</xsl:when>
			<xsl:otherwise>

				<xsl:call-template name="ConsoleFieldHelper">
					<xsl:with-param name="fieldNode" select="$fieldNode" />
					<xsl:with-param name="tableFieldName" select="$tableFieldName" />
					<xsl:with-param name="previousValue" select="$previousValue" />
				</xsl:call-template>

				<xsl:call-template name="ConsoleFieldHelper">
					<xsl:with-param name="fieldNode" select="$fieldNode" />
					<xsl:with-param name="tableFieldName" select="$tableFieldName" />
					<xsl:with-param name="previousValue" select="$previousValue" />
				</xsl:call-template>

			</xsl:otherwise>
		</xsl:choose>

	</xsl:template>
	-->

</xsl:stylesheet>
