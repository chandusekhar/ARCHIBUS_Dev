<?xml version="1.0"?>

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:import href="../../../ab-system/xsl/constants.xsl" />

<!-- The template element contains the rules to apply to the matching
nodes.  The "/" XSL pattern matches the root of the XML file and
therefore its entire contents This template applies the statments in
the HTML body to the entire XML file -->

<xsl:template match="/">

<html lang="en">
	<title>
		<xsl:value-of select="/*/title"/><xsl:value-of select="$whiteSpace"/>
	</title>
<head>
	<xsl:call-template name="LinkingCSS"/>
</head>

<body bgcolor="#FFF6D0">
<xsl:variable name="record" select="//afmXmlView/afmTableGroup/dataSource/data/records/record" />
<xsl:variable name="fields" select="//afmXmlView/afmTableGroup/dataSource/data/fields" />

<table class="panelReportHeader">
<tr><td valign="top">
		<img alt="ARCHIBUS" border="0" src="{$projectGraphicsFolder}/archibus-20x20-trans.gif"/>
	</td>
	<td valign="top">
		<h1>Software Inventory</h1>
	</td>
</tr>
</table>

<table class="AbDataTable">
	<colgroup span="2">
		<col class="AbHeaderRecord" />
		<col class="AbDataRecord" />
		<tr><td scope="row">
				<xsl:variable name="heading" select="$fields/field[@name='soft_std']/@singleLineHeading" />
				<xsl:value-of select="concat($heading, ': ')" />
			</td>
			<td><xsl:value-of select="$record/@softstd.soft_std" /></td>
		</tr>
		<tr><td scope="row">
				<xsl:variable name="heading" select="$fields/field[@name='description']/@singleLineHeading" />
				<xsl:value-of select="concat($heading, ': ')" />
			</td>
			<td><xsl:value-of select="$record/@softstd.description" /></td>
		</tr>
		<tr><td scope="row">
				<xsl:variable name="heading" select="$fields/field[@name='version']/@singleLineHeading" />
				<xsl:value-of select="concat($heading, ': ')" />
			</td>
			<td><xsl:value-of select="$record/@softstd.version" /></td>
		</tr>
		<tr><td scope="row">
				<xsl:variable name="heading" select="$fields/field[@name='mfr']/@singleLineHeading" />
				<xsl:value-of select="concat($heading, ': ')" />
			</td>
			<td><xsl:value-of select="$record/@softstd.mfr" /></td>
		</tr>
		<tr><td scope="row">
			<span translatable="true">Total Licenses:</span></td>
			<td><xsl:value-of select="sum(/*/afmTableGroup[2]/dataSource/data/records/record/@softinv.num_licences)" /></td>
		</tr>
	</colgroup>
</table>

<table style="width: 800px; margin-top: 12px">
	<tr class="AbHeaderRecord" >
		<xsl:for-each select="/*/afmTableGroup[2]/dataSource/data/fields/field">
			<th scope="col"><xsl:value-of select="@singleLineHeading"/></th>
		</xsl:for-each>
	</tr>
	<!-- Display the Field Data -->
	<xsl:for-each select="/*/afmTableGroup[2]/dataSource/data/records/record"> <!-- for each record -->
		<tr class="AbDataTable" >
			<xsl:for-each select="@*"> <!-- for each field -->
				<xsl:choose>
					<xsl:when test="(position( )) = 1"><td scope="row"><xsl:value-of select="."/></td></xsl:when>
					<xsl:otherwise><td><xsl:value-of select="."/></td></xsl:otherwise>
				</xsl:choose>					
			</xsl:for-each>
		</tr>
	</xsl:for-each>
</table>
</body>
</html>

</xsl:template>
	<xsl:include href="../../../ab-system/xsl/common.xsl" />
</xsl:stylesheet>
