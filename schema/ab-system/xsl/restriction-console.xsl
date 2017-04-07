<?xml version="1.0"?>
<!-- top xsl called by Java to handle filter form -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">	
	<!-- importing constants.xsl which contains constant XSLT variables -->
	<xsl:import href="constants.xsl" />
	<!-- specified XSLT variables for this XSLT file -->
	<xsl:variable name="valueInputDivID" select="'hidden_values'"/>
	<xsl:variable name="totalRowsForFilter" select="6"/>
	<xsl:template match="/">
		<html lang="EN">
		<title>
			<xsl:value-of select="/*/title"/><xsl:value-of select="$whiteSpace"/>
		</title>
		<head>	
			<xsl:call-template name="LinkingCSS"/>
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common.js"><xsl:value-of select="$whiteSpace"/></script>
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/locale.js"><xsl:value-of select="$whiteSpace"/></script>
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/date-time.js"><xsl:value-of select="$whiteSpace"/></script>
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/inputs-validation.js"><xsl:value-of select="$whiteSpace"/></script>
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/view-definition-form-content-table-filter.js"><xsl:value-of select="$whiteSpace"/></script>		
			<!-- following template in locale.xsl-->
			<xsl:call-template name="SetUpLocales"/>
		</head>
		<body onload='onInitialLoad("{$afmInputsForm}")' class="body" leftmargin="0" rightmargin="0" topmargin="0" bottomMargin ="0">
			<!-- calling template table-group-title in common.xsl to set up tgrp's title in the top of html page -->
			<xsl:call-template name="table-group-title">
				<xsl:with-param name="title" select="/*/afmTableGroup/title"/>
			</xsl:call-template>	
			<!-- calling inputs-validation.xsl to use its template SetUpFieldsInformArray -->
			<xsl:call-template name="SetUpFieldsInformArray">
				<xsl:with-param name="fieldNodes" select="//afmTableGroup/dataSource/data/availableFields"/>
			</xsl:call-template>

			<script language="javascript">
				<xsl:text>////overwrite javascript variables</xsl:text>
				iTotalRowsForFilter=<xsl:value-of select="$totalRowsForFilter"/>;
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
			<table width="100%" valign="top">
				<Form name="{$afmInputsForm}">
				<tr><td>
					<xsl:call-template name="AfmTableGroup">
						<xsl:with-param name="afmTableGroup" select="//afmTableGroup"/>
					</xsl:call-template>
				</td></tr>
				<tr><td>
					<table  class="bottomActionsTable">
						<tr><td>
							<table>
								<tr>
									<!-- actions -->
									<xsl:for-each select="//afmTableGroup/afmAction">
										<xsl:choose>
											<xsl:when test="title != ''">
												<td><input class="AbActionButtonFormStdWidth" type="button" value="{title}" title="{title}" onclick='sendingDataFromHiddenForm("","{@serialized}","{@frame}","{subFrame/@name}",true,"")'/></td>
											</xsl:when>
											<xsl:otherwise>
												<td><input class="AbActionButtonFormStdWidth" type="button" value="???" title="{title}" onclick='sendingDataFromHiddenForm("","{@serialized}","{@frame}","{subFrame/@name}",true,"")'/></td>
											</xsl:otherwise>
										</xsl:choose>
									</xsl:for-each>
								</tr>
							</table>
						</td></tr>
					</table>
				</td></tr>
				</Form>
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
		<table align="center">
			<tr><td>
				<table>
					<tr class="legendTitle">
						<!-- titles -->
						<td align="center" translatable="true">Conjunction:</td>
						<td align="center" translatable="true">Field:</td>
						<td align="center" translatable="true">Operator:</td>
						<td align="center" translatable="true">Values:</td>
					</tr>
					<!-- the content of filter form -->
					<xsl:call-template name="afmFilterFormContent">
						<xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
						<xsl:with-param name="iCounter" select="1"/>
					</xsl:call-template>
				</table>
			</td></tr>
		</table>
		
	</xsl:template>

	<!-- xsl template: afmFilterFormContent -->
	<xsl:template name="afmFilterFormContent">
		<xsl:param name="afmTableGroup"/>
		<xsl:param name="iCounter"/>
		<!-- rows for filter is up to variable totalRowsForFilter -->
		<xsl:if test="$iCounter &lt;= $totalRowsForFilter">
			
			<xsl:variable name="clauseNode" select="$afmTableGroup/dataSource/data/restrictions/restriction[@type='parsed']/clause[position()=$iCounter]"/>
			<tr align="left"  style="color:navy; size:-1;">
				<td>
					<xsl:call-template name="Conjunction">
						<xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
						<xsl:with-param name="clauseNode" select="$clauseNode"/>
						<xsl:with-param name="iCounter" select="$iCounter"/>
					</xsl:call-template>
				</td>
				<td>
					<xsl:call-template name="Field">
						<xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
						<xsl:with-param name="clauseNode" select="$clauseNode"/>
						<xsl:with-param name="iCounter" select="$iCounter"/>
					</xsl:call-template>
				</td>
				<td>
					<xsl:call-template name="Operator">
						<xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
						<xsl:with-param name="clauseNode" select="$clauseNode"/>
						<xsl:with-param name="iCounter" select="$iCounter"/>
					</xsl:call-template>
				</td>
				<td>
					<xsl:call-template name="Value">
						<xsl:with-param name="clauseNode" select="$clauseNode"/>
						<xsl:with-param name="iCounter" select="$iCounter"/>
					</xsl:call-template>
				</td>
				<td>
					<xsl:variable name="SelectV" select="$afmTableGroup/dataSource/data/forFields/field/afmAction[@type='selectValue']"/>
					<xsl:call-template name="SelectValue">
						<xsl:with-param name="afmAction" select="$SelectV"/>
						<xsl:with-param name="iCounter" select="$iCounter"/>
					</xsl:call-template>
				</td>
			</tr>
			<!-- recursive until row number reachs totalRowsForFilter -->
			<xsl:call-template name="afmFilterFormContent">
				<xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
				<xsl:with-param name="iCounter" select="$iCounter+1"/>
			</xsl:call-template>
		</xsl:if>
	</xsl:template>
	<!-- conjunction -->
	<xsl:template name="Conjunction">
		<xsl:param name="afmTableGroup"/>
		<xsl:param name="clauseNode"/>
		<xsl:param name="iCounter"/>
		<xsl:if test="$iCounter!=1">
			<xsl:variable name="relop" select="$clauseNode/@relop"/>
			<SELECT class="inputField_box" sytle="width:75" name="conjunction{$iCounter}" title="conjunction{$iCounter}" onchange="onSelectConjunction({$iCounter})">
				<xsl:for-each select="$afmTableGroup/filter/conjunctions/conjunction">
					<xsl:choose>
						<xsl:when test="@value=$relop">
							<option value="{@value}" selected="1"><xsl:value-of select="."/></option>
						</xsl:when>
						<xsl:otherwise>
							<option value="{@value}"><xsl:value-of select="."/></option>
						</xsl:otherwise>
					</xsl:choose>
				</xsl:for-each>
				<!-- default -->
				<xsl:choose>
					<xsl:when test="count($clauseNode)=0">
						<option value="" selected="1"></option>
					</xsl:when>
					<xsl:otherwise>
						<option value=""></option>
					</xsl:otherwise>
				</xsl:choose>
			</SELECT>
		</xsl:if>		
	</xsl:template>
	<!-- Field  -->
	<xsl:template name="Field">
		<xsl:param name="afmTableGroup"/>
		<xsl:param name="clauseNode"/>
		<xsl:param name="iCounter"/>
		<SELECT class="inputField_box" style="width:245" NAME="field{$iCounter}" title="field{$iCounter}" onchange="onSelectField({$iCounter})">
			<xsl:variable name="restrictionField" select="concat($clauseNode/field/@table,'.',$clauseNode/field/@name)"/>
			<xsl:for-each select="$afmTableGroup/dataSource/data/availableFields/field">
				<xsl:variable name="temp" select="concat(@table,'.',@name)"/>
				<xsl:choose>
					<xsl:when test="$restrictionField=$temp">
						<option	 selected="1" value="{@table}.{@name}"><xsl:value-of select="@singleLineHeading"/></option>
					</xsl:when>
					<xsl:otherwise>
						<option	 value="{@table}.{@name}"><xsl:value-of select="@singleLineHeading"/></option>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:for-each>
			<xsl:choose>
				<!-- there is no table and field specified like SQL case -->
				<xsl:when test="$restrictionField='.'">
					<OPTION VALUE="" selected="1"></OPTION>
				</xsl:when>
				<xsl:otherwise>
					<OPTION VALUE=""></OPTION>
				</xsl:otherwise>
			</xsl:choose>
		</SELECT>
	</xsl:template>
	<!-- Operator  -->
	<xsl:template name="Operator">
		<xsl:param name="afmTableGroup"/>
		<xsl:param name="clauseNode"/>
		<xsl:param name="iCounter"/>
		<xsl:variable name="operator" select="$clauseNode/@op"/>
		<SELECT class="inputField_box" style="width:100" name="operator{$iCounter}" title="operator{$iCounter}" onchange="onSelectOperator({$iCounter})">
			<xsl:for-each select="$afmTableGroup/filter/operators/operator">
				<xsl:choose>
					<xsl:when test="@value=$operator">
						<option value="{@value}" selected="1"><xsl:value-of select="."/></option>
					</xsl:when>
					<xsl:otherwise>
						<option value="{@value}"><xsl:value-of select="."/></option>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:for-each>
			<!-- default -->
			<xsl:choose>
				<xsl:when test="count($clauseNode)=0">
					<option value="" selected="1"></option>
				</xsl:when>
				<xsl:otherwise>
					<option value=""></option>
				</xsl:otherwise>
			</xsl:choose>

		</SELECT>
	</xsl:template>
	<!-- Value -->
	<xsl:template name="Value">
		<xsl:param name="clauseNode"/>
		<xsl:param name="iCounter"/>		
		<div id="{$valueInputDivID}{$iCounter}">
			<!-- enum -->
			<select class="inputField_box" id="enumValues{$iCounter}" name="enumValues{$iCounter}" title="enumValues{$iCounter}" style="display:none;width:153" onchange='setupSelectedEunmValue({$iCounter})'>
			</select>
			<!-- regular -->
			<input class="inputField" id="values{$iCounter}" name="values{$iCounter}" title="values{$iCounter}" type="text" value="{$clauseNode/@value}"  onblur="validationInputs({$iCounter});validationAndConvertionDateAndTime({$iCounter}, false)"/>
		</div>
	</xsl:template>

	<!-- Select Value Action-->
	<xsl:template name="SelectValue">
		<xsl:param name="afmAction"/>
		<xsl:param name="iCounter"/>
		<xsl:if test="count($afmAction) &gt; 0">
			<input class="selectValue_AbActionButtonFormStdWidth" name="selectV{$iCounter}" title="selectV{$iCounter}" type="button" value="{$afmAction/title}" onclick='onSelectV("{$afmAction/@serialized}",{$iCounter}); selectValueInputFieldID="values{$iCounter}";'/>	
		</xsl:if>
	</xsl:template>
	
	<!-- including xsl which are called -->
	<xsl:include href="common.xsl" />
	<xsl:include href="inputs-validation.xsl" />
	<xsl:include href="locale.xsl" />
</xsl:stylesheet>


