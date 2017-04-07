<?xml version="1.0" encoding="UTF-8"?>
<!-- top xsl called by Java to handle select value XML data-->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<!-- importing constants.xsl which contains constant XSLT variables -->
	<xsl:import href="constants.xsl" />
	<!-- specified XSLT variables for this XSLT file -->
	<xsl:variable name="prefix" select="'prefix'"/>
	<xsl:variable name="selectV_form" select="'selectV_form'"/>
	<xsl:template match="/">
		<html lang="EN">
		<title>
			<xsl:text/><xsl:value-of select="/*/title"/><xsl:value-of select="$whiteSpace"/>
		</title>
		<head>
			<!-- linking path must be related to the folder in which xml is being processed -->
			<xsl:call-template name="LinkingCSS"/>
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common.js"><xsl:value-of select="$whiteSpace"/></script>  
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/select-value.js"><xsl:value-of select="$whiteSpace"/></script>
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/ab-trigger-close-dialog.js"><xsl:value-of select="$whiteSpace"/></script>
		</head>
		<body class="body" leftmargin="0" rightmargin="0" topmargin="0">
			<xsl:variable name="selectedFieldName" select="//afmAction[@type='selectValue']/fields/field/@name"/>
			<xsl:variable name="selectedFieldSingleLineHeading_temp" select="//afmTableGroup/dataSource/data/fields/field[@name=$selectedFieldName]/@singleLineHeading"/>
			<xsl:variable name="selectedFieldSingleLineHeading">
				<xsl:choose>
					<xsl:when test="$selectedFieldSingleLineHeading_temp!=''"><xsl:value-of select="$selectedFieldSingleLineHeading_temp"/></xsl:when>
					<xsl:otherwise><xsl:value-of select="//afmTableGroup/dataSource/data/fields/field[position()=1]/@singleLineHeading"/></xsl:otherwise>
				</xsl:choose>
			</xsl:variable>
			<xsl:variable name="closeButton" translatable="true">Close</xsl:variable>
			<table class="topTitleBarTable">
				<tr><td valign="top" align="left">
					<table style="margin-left:2">
						<tr>
							<td class="topTitleBarTableTitle">
								<xsl:value-of select="/*/title"/>:<xsl:value-of select="$whiteSpace"/><xsl:value-of select="$selectedFieldSingleLineHeading"/>
							</td>
						</tr>
					</table>
				</td>
				<td>
					<table align="right">
						<tr>
							<td aligh="right">
								<input type="button" class="AbActionButtonFormStdWidth" onclick="javascript:self.close();" value="{$closeButton}" title="{$closeButton}"/>
							</td>
						</tr>
					</table>
				</td>
				</tr>
			</table>
			
			<table width="100%" valign="top" align="left">
				<xsl:if test="count(/*/afmAction[@type='selectValue']) &gt; 0">
					<tr><td valign="top" align="left">
						<form name="{$afmInputsForm}">
							<!-- prefix control  -->
							<xsl:call-template name="prefix">
								<xsl:with-param name="afmAction" select="//afmAction"/>
							</xsl:call-template>
						</form>
					</td></tr>
				</xsl:if>
				<tr><td valign="top" align="left">
					<form name="{$selectV_form}">
						<!-- going through each afmTableGroup -->
						<xsl:for-each select="/*/afmTableGroup">
							<xsl:variable name="positionIndex" select="position()"/>
							<xsl:variable name="afmTableGroupNode" select="."/>
							<!-- passing only field name like bl_id without table name like bl -->
							<xsl:variable name="fieldID" select="$afmTableGroupNode/dataSource/data/fields/field[position()=1]/@name"/>
							<xsl:call-template name="tree-model">
								<xsl:with-param name="afmTableGroupNodes" select="."/>
								<xsl:with-param name="margin-left" select="0"/>
								<xsl:with-param name="hasChildren" select="'false'"/>
								<xsl:with-param name="nodeID" select="generate-id()"/>
								<xsl:with-param name="parentFieldID" select="$fieldID"/>
								<xsl:with-param name="parentValue" select="$afmTableGroupNode/dataSource/data/records/record/@*[position()=1]"/>
							</xsl:call-template>
						</xsl:for-each>
					</form>
				</td></tr>
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
	<!-- xsl template: prefix -->
	<xsl:template name="prefix">
		<xsl:param name="afmAction"/>		
		<FIELDSET>
			<LEGEND class="legendTitle" translatable="true">Filter</LEGEND>
			<table width="80%" align="left" valign="top">
				<tr><td style="font-family: arial,geneva,helvetica,sans-serif; font-size: 12px"><label for="{$prefix}">Enter a Prefix</label></td></tr>
				<tr><td>
						<input class="inputField" name="{$prefix}" title="Enter the first few characters of the code" id="{$prefix}" type="text" value="{$afmAction/target/parameters/parameter/@prefix}" size="40" onkeypress="return disableInputEnterKeyEvent( event);"/>
						<input class="AbActionButtonFormStdWidth" type="button" title="{$afmAction/title}" value="{$afmAction/title}" onclick='onRequery("{$afmAction/@serialized}","{$prefix}","{$afmInputsForm}");'/>	
					</td>
				</tr>
			</table>
		</FIELDSET>
	</xsl:template>
		
	<!-- xsl template: tree-model -->
	<xsl:template name="tree-model">
		<xsl:param name="afmTableGroupNodes"/>
		<xsl:param name="margin-left"/>
		<xsl:param name="hasChildren"/>
		<xsl:param name="nodeID"/>
		<xsl:param name="parentFieldID"/>
		<xsl:param name="parentValue"/>
		<xsl:choose>
			<!-- there are subnodes under currently-processing node-->
			<xsl:when test="count($afmTableGroupNodes/afmTableGroup)>0">
				<!-- processing the individual afmTableGroup -->
				<xsl:call-template name="detailedContent">
					<xsl:with-param name="afmTableGroupPath" select="$afmTableGroupNodes"/>
					<xsl:with-param name="margin-left" select="$margin-left"/>
					<xsl:with-param name="hasChildren" select="'true'"/>
					<xsl:with-param name="nodeID" select="$nodeID"/>
					<xsl:with-param name="parentFieldID" select="$parentFieldID"/>
					<xsl:with-param name="parentValue" select="$parentValue"/>
				</xsl:call-template>
				<div ID='{$nodeID}'>
					<!-- going through each afmTableGroup under currently-processing afmTableGroup  -->
					<xsl:for-each select="$afmTableGroupNodes/afmTableGroup">
						<xsl:variable name="afmTableGroupNode" select="."/>
						<!-- passing only field name like bl_id without table name like bl -->
						<xsl:variable name="fieldID" select="$afmTableGroupNode/dataSource/data/fields/field[position()=1]/@name"/>
						<xsl:variable name="finalParentValue" select="$afmTableGroupNode/dataSource/data/records/record/@*[position()=1]"/>
						<xsl:call-template name="tree-model">
							<xsl:with-param name="afmTableGroupNodes" select="."/>
							<xsl:with-param name="margin-left" select="$margin-left+1"/>
							<xsl:with-param name="hasChildren" select="'false'"/>
							<xsl:with-param name="nodeID" select="concat($nodeID,'_',generate-id())"/>
							<!-- ";" is like a reserved key string to make javascript be able to get individual values in select-value.js-->
							<xsl:with-param name="parentFieldID" select="concat($parentFieldID,';',$fieldID)"/>
							<xsl:with-param name="parentValue" select="concat($parentValue,';',$finalParentValue)"/>
						</xsl:call-template>
					</xsl:for-each>
				</div>
			</xsl:when>
			<xsl:otherwise>
				<xsl:call-template name="detailedContent">
					<xsl:with-param name="afmTableGroupPath" select="$afmTableGroupNodes"/>
					<xsl:with-param name="margin-left" select="$margin-left"/>
					<xsl:with-param name="hasChildren" select="$hasChildren"/>
					<xsl:with-param name="nodeID" select="$nodeID"/>
					<xsl:with-param name="parentFieldID" select="$parentFieldID"/>
					<xsl:with-param name="parentValue" select="$parentValue"/>
				</xsl:call-template>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>

	<!-- xsl template: detailedContent -->
	<xsl:template name="detailedContent">
	<xsl:param name="afmTableGroupPath"/>
	<xsl:param name="hasChildren"/>
	<xsl:param name="margin-left"/>
	<xsl:param name="nodeID"/>
	<xsl:param name="parentFieldID"/>
	<xsl:param name="parentValue"/>
		<table  style='margin-left:{$margin-left*50}pt'>
			<tr nowrap="1">
				<xsl:for-each select="$afmTableGroupPath/dataSource/data/fields/field">
					<!-- just show user's select field and its description  or standard  -->
					<!-- their field orders are enforced in XML -->
					<th scope="col" class="treeParentNodeTitles" nowrap="1">
						<xsl:value-of select="@singleLineHeading"/>
						<hr />
					</th>					
				</xsl:for-each>
			</tr>
			<script language="javascript">
				strExtraFieldsTableName=<xsl:text>'</xsl:text><xsl:value-of select="$afmTableGroupPath/dataSource/data/fields/field[@extra='true']/@table"/><xsl:text>'</xsl:text>;
			</script>
			<!--xsl:choose-->
			<xsl:if test="count($afmTableGroupPath/dataSource/data/records/record) &gt; 0">
				<xsl:for-each select="$afmTableGroupPath/dataSource/data/records/record">
					<xsl:variable name="record_position" select="position()"/>
					<!-- mainValue: user's select field value -->
					<xsl:variable name="mainValue" select="@*[position()=1]"/>
					<!-- extra fields which may be set up in afm-config.xml -->
					<!-- their field orders are enforced in XML byu following selected field or/and its description field -->
					<xsl:variable name="extraFields">
						<xsl:for-each select="$afmTableGroupPath/dataSource/data/fields/field[@extra='true']">
								<xsl:value-of select="@name"/>;
						</xsl:for-each>
					</xsl:variable>
					<!--xsl:variable name="finalParentIDs" select="concat($parentFieldID,';',$extraFields)"/-->
					<!-- the order of field's values in record are same as that of fields -->
					<xsl:variable name="extraFieldsValue">
						<xsl:for-each select="@*">
							<xsl:variable name="indexPos" select="position()"/>
							<xsl:if test="$afmTableGroupPath/dataSource/data/fields/field[position()=$indexPos]/@extra='true'"><xsl:value-of select="."/>;</xsl:if>
						</xsl:for-each>
					</xsl:variable>
					<xsl:if test="$mainValue != ''">
						<tr nowrap="1">
							<xsl:for-each select="@*">
								<xsl:variable name="hidden_input_name" select="concat($nodeID,'_',$record_position,'_',position())"/>
								<xsl:variable name="hidden_extraInput_name" select="concat('extraFieldsValue','_',$record_position,'_',position())"/>
								<xsl:choose>
									<xsl:when test="$hasChildren='false'">
										<td nowrap="1" class="treeLeafNodeTitles">
											
											<!-- added for 508 accessibility -->
											<xsl:attribute name="scope">
												<xsl:if test="(position( )) = 1">row</xsl:if>
											</xsl:attribute>
									
											<!-- cannot directly pass complicated string(quote or single quote) as javascript parameters  -->
											<!-- html form and hidden inputs have to be used -->
											<input type="hidden" name="{$hidden_input_name}" id="{$hidden_input_name}" value="{$parentValue}"/>
											<input type="hidden" name="{$hidden_extraInput_name}" id="{$hidden_extraInput_name}" value="{$extraFieldsValue}"/>
											<input type="hidden" name="{$hidden_input_name}_mainValue" id="{$hidden_input_name}_mainValue" value="{$mainValue}"/>
											<A href='javascript:setupSelectV("{$selectV_form}", "{$hidden_input_name}_mainValue","{$parentFieldID}","{$hidden_input_name}", "{$extraFields}", "{$hidden_extraInput_name}")' title="">
												<xsl:value-of select="."/>
											</A>
										</td>
									</xsl:when>
									<xsl:otherwise>
										<td nowrap="1" class="treeParentNodeTitles">
																						
											<!-- added for 508 accessibility -->
											<xsl:attribute name="scope">
												<xsl:if test="(position( )) = 1">row</xsl:if>
											</xsl:attribute>
											
											<xsl:value-of select="."/>
										</td>
									</xsl:otherwise>
									</xsl:choose>								
							</xsl:for-each>
						</tr>
					</xsl:if>
				</xsl:for-each>
			</xsl:if>

			<xsl:if test="not (count($afmTableGroupPath/dataSource/data/records/record) &gt; 0)">
				<tr><td>
					<table style='margin-left:10pt;' align="left">
						<tr><td class="instruction">
							<p><xsl:value-of select="/*/afmTableGroup/message[@name='instruction']"/></p>
						</td></tr>
					</table>
				</td></tr>
			</xsl:if>
		</table>		
		<div>
		<!-- check if there is a report records max limitaion -->
		<xsl:variable name="moreRecords" select="$afmTableGroupPath/dataSource/data/records/@moreRecords"/>
		<xsl:if test="$moreRecords='true'">
			<table><tr>
				<td  class="instruction" align="center" valign="top">
					<p><span translatable="true">Not all records can be shown. Please use another view or another restriction to see the remaining data</span></p>
				</td>	
			</tr></table>
		</xsl:if>
		</div>
	</xsl:template>
	<!-- including template model XSLT files called in XSLT -->
	<xsl:include href="common.xsl" />
</xsl:stylesheet>