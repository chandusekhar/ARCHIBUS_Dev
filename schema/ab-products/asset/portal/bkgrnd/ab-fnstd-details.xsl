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

	<!--table class="showingTgrpTitleTableWithLogo"><tr><td valign="top"><img border="0" src="{$projectGraphicsFolder}/archibus-20x20-trans.gif"/></td><td valign="top">Equipment Standards Book </td></tr></table-->

	<br />
	<table border="0" cellpadding="5" cellspacing="0"><tr><td>
	<B><span translatable="true">Furniture Standards Book</span></B>
	<table>
		<tr>
			<td colspan="2">
				<table>
					<tr>
						<td align="left">
							<xsl:variable name="imagefile" select="$record/@fnstd.image_file" />
							<!-- If there is no photo for this furniture standard in the database, provide corresponding message-->
							<xsl:choose>
								<xsl:when test="$imagefile !=''">
									<img alt="{$imagefile}" src="{$projectGraphicsFolder}/{$imagefile}">
										<!--xsl:attribute name="width">300</xsl:attribute>
										<xsl:attribute name="height">180</xsl:attribute-->
										<xsl:attribute name="align">left</xsl:attribute>
										<xsl:attribute name="alt"><xsl:value-of select="$imagefile"/></xsl:attribute>
									</img>
								</xsl:when>
								<xsl:otherwise>
									<table><tr><td>
									<xsl:attribute name="width">300</xsl:attribute>
									<xsl:attribute name="height">180</xsl:attribute>
									<xsl:attribute name="style">text-align: center; vertical-align: middle; border: thin solid #000;</xsl:attribute>
									<xsl:value-of select="//message[@name='NoImage']" />
									</td>
									<td><xsl:value-of select="$whiteSpace" /></td>
									</tr></table>
								</xsl:otherwise>
							</xsl:choose>
						</td>
					</tr>
				</table>
			</td>
		</tr>

		<tr>
			<td style="vertical-align:top">
			<table class="AbDataTable">
				<colgroup span="2">
					<col class="AbHeaderRecord" />
					<col class="AbDataRecord" />
					<tr>
						<td>
							<xsl:variable name="heading" select="$fields/field[@name='fn_std']/@singleLineHeading" />
												<xsl:value-of select="concat($heading, ': ')" />
						</td>
						<td>
							<xsl:value-of select="$record/@fnstd.fn_std" />
						</td>
					</tr>
					<tr>
						<td>
							<xsl:variable name="heading" select="$fields/field[@name='mfr_id']/@singleLineHeading" />
												<xsl:value-of select="concat($heading, ': ')" />
						</td>
						<td>
							<xsl:value-of select="$record/@fnstd.mfr_id" />
						</td>
					</tr>
					<tr>
						<td>
							<xsl:variable name="heading" select="$fields/field[@name='catalog_id']/@singleLineHeading" />
												<xsl:value-of select="concat($heading, ': ')" />
						</td>
						<td>
							<xsl:value-of select="$record/@fnstd.catalog_id" />
						</td>
					</tr>
					<tr>
						<td>
							<xsl:variable name="heading" select="$fields/field[@name='product_line']/@singleLineHeading" />
												<xsl:value-of select="concat($heading, ': ')" />
						</td>
						<td>
							<xsl:value-of select="$record/@fnstd.product_line" />
						</td>
					</tr>
					<tr>
						<td>
							<xsl:variable name="heading" select="$fields/field[@name='color']/@singleLineHeading" />
												<xsl:value-of select="concat($heading, ': ')" />
						</td>
						<td>
							<xsl:value-of select="$record/@fnstd.color" />
						</td>
					</tr>
					<tr>
						<td>
							<xsl:variable name="heading" select="$fields/field[@name='finish']/@singleLineHeading" />
												<xsl:value-of select="concat($heading, ': ')" />
						</td>
						<td>
							<xsl:value-of select="$record/@fnstd.finish" />
						</td>
					</tr>
					<tr>
						<td>
							<xsl:variable name="heading" select="$fields/field[@name='image_of_block']/@singleLineHeading" />
												<xsl:value-of select="concat($heading, ': ')" />
						</td>
						<td>
							<xsl:value-of select="$record/@fnstd.image_of_block" />
						</td>
					</tr>
					<tr>
						<td>
							<xsl:variable name="heading" select="$fields/field[@name='depth']/@singleLineHeading" />
												<xsl:value-of select="concat($heading, ': ')" />
						</td>
						<td>
							<xsl:value-of select="$record/@fnstd.depth" />
						</td>
					</tr>
					<tr>
						<td>
							<xsl:variable name="heading" select="$fields/field[@name='width']/@singleLineHeading" />
												<xsl:value-of select="concat($heading, ': ')" />
						</td>
						<td>
							<xsl:value-of select="$record/@fnstd.width" />
						</td>
					</tr>
					<tr>
						<td>
							<xsl:variable name="heading" select="$fields/field[@name='height']/@singleLineHeading" />
												<xsl:value-of select="concat($heading, ': ')" />
						</td>
						<td>
							<xsl:value-of select="$record/@fnstd.height" />
						</td>
					</tr>
					<tr>
						<td>
							<xsl:variable name="heading" select="$fields/field[@name='weight']/@singleLineHeading" />
												<xsl:value-of select="concat($heading, ': ')" />
						</td>
						<td>
							<xsl:value-of select="$record/@fnstd.weight" />
						</td>
					</tr>
					<tr>
						<td>
							<xsl:variable name="heading" select="$fields/field[@name='image_file']/@singleLineHeading" />
												<xsl:value-of select="concat($heading, ': ')" />
						</td>
						<td>
							<xsl:value-of select="$record/@fnstd.image_file" />
						</td>
					</tr>
					<tr>
						<td>
							<xsl:variable name="heading" select="$fields/field[@name='category']/@singleLineHeading" />
												<xsl:value-of select="concat($heading, ': ')" />
						</td>
						<td>
							<xsl:value-of select="$record/@fnstd.category" />
						</td>
					</tr>
					<tr>
						<td>
							<xsl:variable name="heading" select="$fields/field[@name='price']/@singleLineHeading" />
												<xsl:value-of select="concat($heading, ': ')" />
						</td>
						<td>
							<xsl:value-of select="$record/@fnstd.price" />
						</td>
					</tr>
					<tr>
						<td>
							<xsl:variable name="heading" select="$fields/field[@name='cost_moving']/@singleLineHeading" />
												<xsl:value-of select="concat($heading, ': ')" />
						</td>
						<td>
							<xsl:value-of select="$record/@fnstd.cost_moving" />
						</td>
					</tr>
					<tr>
						<td>
							<xsl:variable name="heading" select="$fields/field[@name='is_ergo_comp']/@singleLineHeading" />
												<xsl:value-of select="concat($heading, ': ')" />
						</td>
						<td>
							<xsl:value-of select="$record/@fnstd.is_ergo_comp" />
						</td>
					</tr>
					<tr>
						<td>
							<xsl:variable name="heading" select="$fields/field[@name='description']/@singleLineHeading" />
												<xsl:value-of select="concat($heading, ': ')" />
						</td>
						<td>
							<xsl:value-of select="$record/@fnstd.description" />
						</td>
					</tr>

				</colgroup>
			</table></td>
		</tr>
		<!--tr class="AbDataTable">
			<td class="AbHeaderRecord"><B>Employee Status</B></td>
			<td class="AbHeaderRecord"><B>Total Number</B></td>
		</tr>
		<tr class="AbDataTable">
			<td class="">No Status:</td>
			<td class=""><xsl:value-of select="/*/afmTableGroup/dataSource/data/records/record[@em.recovery_status='No Status'])"/></td>
		</tr-->
	</table>

	</td></tr></table>


  </body>
  </html>


</xsl:template>
	<xsl:include href="../../../ab-system/xsl/common.xsl" />
</xsl:stylesheet>
