<?xml version="1.0"?>
<!-- top xsl called by Java to handle room reservation cross tab report -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">	
	<!-- importing constants.xsl which contains constant XSLT variables -->
	<xsl:import href="constants.xsl" />
	<!-- specified XSLT variables for this XSLT file -->
	
	<xsl:template match="/">
		<html>
		<title>
			<xsl:value-of select="/*/title"/><xsl:value-of select="$whiteSpace"/>
		</title>
		<head>	
			<xsl:call-template name="LinkingCSS"/>
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common.js"><xsl:value-of select="$whiteSpace"/></script>
			<!--script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/ab-room-reservation-cross-tab-table.js"><xsl:value-of select="$whiteSpace"/></script-->		
		</head>
		<body class="body" leftmargin="0" rightmargin="0" topmargin="0" bottomMargin ="0">	
			<table width="100%" valign="top">
				<Form name="{$afmInputsForm}">
				<tr><td>
					<xsl:call-template name="AfmTableGroup">
						<xsl:with-param name="afmTableGroup" select="//afmTableGroup"/>
					</xsl:call-template>
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
		<xsl:variable name="dataNode" select="$afmTableGroup/dataSource/data"/>
	
		<table border="1">
			<!-- test if there is any record to show up -->
			<!-- cross tab report is restricted by the filter form in another frame -->
			<xsl:choose>
			<xsl:when test="count($dataNode/headings/record) &gt; 0">
			<tr>
				<!-- first cell is empty -->
				<td width="2%"></td>
				<!-- room slots -->
				<xsl:for-each select="$dataNode/headings/record">
					<td><xsl:value-of select="name(@rm.rm_id)"/>:<xsl:value-of select="@rm.rm_id"/></td>
				</xsl:for-each>
			</tr>
			<!-- time slots -->
			<xsl:for-each select="$dataNode/records[position()=1]/record">
				<tr>
					<xsl:variable name="index" select="position()"/>
					<td><xsl:value-of select="@title"/></td>
					<!-- room's status -->
					<xsl:for-each select="$dataNode/records">
						<xsl:variable name="field_index" select="position()"/>
						<xsl:variable name="field" select="$dataNode/headings/record[position()=$field_index]"/>
						<td onclick='alert("{$field/@rm.bl_id}-{$field/@rm.fl_id}-{$field/@rm.rm_id}")'>
							<xsl:variable name="bReserved" select="record[position()=$index]/@reserved"/>
							<xsl:if test="$bReserved='true'">Reserved</xsl:if>
							<xsl:if test="$bReserved='false'">Available</xsl:if>
						</td>
					</xsl:for-each>
				</tr>
			</xsl:for-each>
			</xsl:when>
			<xsl:otherwise>
				<tr><td>No Record.</td></tr>
			</xsl:otherwise>
			</xsl:choose>
		</table>
		
	</xsl:template>
	<!-- including xsl which are called -->
	<xsl:include href="common.xsl" />
</xsl:stylesheet>


