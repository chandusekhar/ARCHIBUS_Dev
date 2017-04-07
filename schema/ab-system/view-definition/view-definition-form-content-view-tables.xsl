<?xml version="1.0" encoding="UTF-8"?>
<!-- top xsl called by Java to handle view's new table form -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">	
	<!-- importing constants.xsl which contains constant XSLT variables -->
	<xsl:import href="../xsl/constants.xsl" />
	<!-- special xslt variables used in this xslt -->
	<xsl:variable name="tables" select="tables"/>
	<xsl:template match="/">
		<html>
		<title>
			<xsl:value-of select="/*/title"/><xsl:value-of select="$whiteSpace"/>
		</title>
		<head>	
			<!-- css and javascript files  -->
			<!-- linking path must be related to the folder in which xml is being processed -->
			<xsl:call-template name="LinkingCSS"/>
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common.js"><xsl:value-of select="$whiteSpace"/></script>
			<script language="JavaScript" src="#Attribute%//@relativeFileDirectory%/view-definition-form-content-view-tables.js"><xsl:value-of select="$whiteSpace"/></script>		
		</head>
		<body class="body" onselectstart="return false;" oncontextmenu="return false;"  leftmargin="0" rightmargin="0" topmargin="0" bottommargin="0">
			<!-- calling common.xsl -->
			<xsl:call-template name="common">
				<xsl:with-param name="title" select="/*/title"/>
				<xsl:with-param name="debug" select="//@debug"/>
				<xsl:with-param name="afmHiddenForm" select="$afmHiddenForm"/>
				<xsl:with-param name="xml" select="$xml"/>
			</xsl:call-template>
			<script language="javascript">
				<xsl:text>//set up javascript variables</xsl:text>
				tablesName='<xsl:value-of select="$tables"/>';
			</script>
			<Form name="{$afmInputsForm}">
				<xsl:call-template name="AfmTableGroup">
					<xsl:with-param name="afmTableGroup" select="//afmTableGroup"/>
				</xsl:call-template>
			</Form>
		</body>
		</html>
	</xsl:template>

	<!-- xsl template: AfmTableGroup -->
	<xsl:template name="AfmTableGroup">
		<xsl:param name="afmTableGroup"/>
		<FIELDSET>
			<LEGEND align="center" style="color:navy; size:-1;" nowrap="1" translatable="true">Add Table-Group</LEGEND>
				<table width="100%" align="center">
				<tr><td>
					<table align="left">
						<tr><td align="left" style="color:navy; size:-1;">
							<span  translatable="true">Select table:</span>
						</td></tr>
						<tr><td align="left">
							<select id="{$tables}" name="{$tables}" onchange='setSelectedTable(this)'>
								<xsl:for-each select="$afmTableGroup/dataSource/data/records/record">
									<option value="{@table}"><xsl:value-of select="@title"/></option>
								</xsl:for-each>
							</select>
						</td></tr>
					</table>
				</td></tr>
				<tr><td>
					<!-- template: ok-and-cancel is in ab-actions-bar.xsl -->
					<!-- parameter TYPE:1=> html form button action; 0=> customized html link action-->
					<xsl:variable name="OK" select="//afmTableGroup/afmAction[@type='addTableGroup']"/>
					<xsl:variable name="CANCEL" select="//afmTableGroup/afmAction[@type='cancel']"/>
					<xsl:variable name="TYPE" select="1"/>
					<xsl:call-template name="ok-and-cancel">
						<xsl:with-param name="OK" select="$OK"/>
						<xsl:with-param name="CANCEL" select="$CANCEL"/>
						<xsl:with-param name="TYPE" select="$TYPE"/>
					</xsl:call-template>
				</td></tr></table>
			</FIELDSET>
	</xsl:template>
	<!-- including template model XSLT files called in XSLT -->
	<xsl:include href="../xsl/common.xsl" />
	<xsl:include href="../xsl/ab-actions-bar.xsl"/>
</xsl:stylesheet>


