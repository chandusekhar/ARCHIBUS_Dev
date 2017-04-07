<?xml version="1.0"?>

<!-- Following line below is non standard to work in IE 5 -->
<!-- <xsl:stylesheet xmlns:xsl="http://www.w3.org/TR/WD-xsl"> -->

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:import href="../../../ab-system/xsl/constants.xsl" />


<!-- The template element contains the rules to apply to the matching
nodes.  The "/" XSL pattern matches the root of the XML file and
therefore its entire contents This template applies the statments in
the HTML body to the entire XML file -->

<xsl:template match="/">

  <html>
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

	<br />
	<table border="0" cellpadding="5" cellspacing="0"><tr><td>
		<table class="AbDataTable">
				<colgroup span="2">
					<col class="AbHeaderRecord" />
					<col class="AbDataRecord" />
					<tr>
						<td>
							<xsl:variable name="heading" select="$fields/field[@name='soft_std']/@singleLineHeading" />
												<xsl:value-of select="concat($heading, ': ')" />
						</td>
						<td>
							<xsl:value-of select="$record/@softstd.soft_std" />
						</td>
					</tr>
					<tr>
						<td>
							<xsl:variable name="heading" select="$fields/field[@name='description']/@singleLineHeading" />
												<xsl:value-of select="concat($heading, ': ')" />
						</td>
						<td>
							<xsl:value-of select="$record/@softstd.description" />
						</td>
					</tr>
					<tr>
						<td>
							<xsl:variable name="heading" select="$fields/field[@name='version']/@singleLineHeading" />
												<xsl:value-of select="concat($heading, ': ')" />
						</td>
						<td>
							<xsl:value-of select="$record/@softstd.version" />
						</td>
					</tr>
					<tr>
						<td>
							<xsl:variable name="heading" select="$fields/field[@name='mfr']/@singleLineHeading" />
												<xsl:value-of select="concat($heading, ': ')" />
						</td>
						<td>
							<xsl:value-of select="$record/@softstd.mfr" />
						</td>
					</tr>
					<tr>
						<td><span translatable="true">Total Licenses:</span></td>
						<td>
							<xsl:value-of select="sum(/*/afmTableGroup[2]/dataSource/data/records/record/@softinv.num_licences)" />
						</td>
					</tr>

				</colgroup>
		</table>
	</td></tr></table>

	<br />
	<table width="800">

		<tr class="AbHeaderRecord" >
			<xsl:for-each select="/*/afmTableGroup[2]/dataSource/data/fields/field">
				<td><xsl:value-of select="@singleLineHeading"/></td>
			</xsl:for-each>
		</tr>


		<!-- Display the Field Data -->

		<xsl:for-each select="/*/afmTableGroup[2]/dataSource/data/records/record"> <!-- for each record -->

			<tr class="AbDataTable" >
				<xsl:for-each select="@*"> <!-- for each field -->
					<td><xsl:value-of select="."/></td>
				</xsl:for-each>
			</tr>

		</xsl:for-each>

	</table>


  </body>
  </html>


</xsl:template>
	<xsl:include href="../../../ab-system/xsl/common.xsl" />
</xsl:stylesheet>
