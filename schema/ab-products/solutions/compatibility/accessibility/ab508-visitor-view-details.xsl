<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:output method="html" indent="yes" />
	<xsl:include href="../../../ab-system/xsl/constants.xsl" />
	<xsl:template match="/">
		<html lang="en">
		<head>
			<title>
				<!-- since browser cannot handle <title />, using a XSL whitespace avoids XSL processor -->
				<!-- to generate <title /> if there is no title in source XML -->
				<xsl:value-of select="/*/title"/><xsl:value-of select="$whiteSpace"/>
			</title>
			<!-- template: Html-Head-Setting in common.xsl -->
			<xsl:call-template name="Html-Head-Setting"/>
			<!-- css and javascript files  -->
			<!-- linking path must be related to the folder in which xml is being processed -->
			<!-- calling template LinkingCSS in common.xsl -->
			<xsl:call-template name="LinkingCSS"/>
		</head>
		<body class="body">
			<xsl:variable name="record" select="//afmXmlView/afmTableGroup/dataSource/data/records/record" />
			<xsl:variable name="fields" select="//afmXmlView/afmTableGroup/dataSource/data/fields" />
			<table class="panelReportHeader">
				<tr><td><h1>Visitor or Parking Pass Information</h1></td></tr>
			</table>
			<table class="AbDataTable">
				<!-- First row contains photo -->
				<tr>
					<td>
						<xsl:variable name="imagefile" select="$record/@visitors.image_file" />

						<!-- If there is no photo for this property in the database, provide corresponding message-->
						<xsl:choose>
							<xsl:when test="$imagefile !=''">
								<img alt="{$imagefile}" src="{$projectGraphicsFolder}/{$imagefile}">
									<xsl:attribute name="align">left</xsl:attribute>
									<xsl:attribute name="alt"><xsl:value-of select="$imagefile"/></xsl:attribute>
								</img>
							</xsl:when>
							<xsl:otherwise>
								<table><tr><td>
									<xsl:attribute name="width">120</xsl:attribute>
									<xsl:attribute name="height">80</xsl:attribute>
									<xsl:attribute name="style">text-align: center; vertical-align: middle; border: thin solid #000;</xsl:attribute>
									<xsl:value-of select="//message[@name='NoPhoto']" />
									</td>
									<td><xsl:value-of select="$whiteSpace" /></td>
								</tr></table>
							</xsl:otherwise>
						</xsl:choose>
					</td>
					<td><xsl:value-of select="$whiteSpace" /></td>
				</tr>
				<!-- Second row contains Description and Contact tables -->
				<tr>
					<td style="vertical-align:top">
					<table class="AbDataTable" style="width: 360px">
					<colgroup span="2">
						<col class="AbHeaderRecord" />
						<col class="AbDataRecord" />
							<tr>
								<td class="AbDataTableAutocolor" colspan="2" style="font-weight: bold">
									<xsl:value-of select="//message[@name='description']" />
								</td>
							</tr>
							<tr>
								<td scope="row" style="width: 50%">
									<xsl:variable name="heading" select="$fields/field[@name='honorific']/@singleLineHeading" />
									<xsl:value-of select="concat($heading, ': ')" />
								</td>
								<td style="width: 50%">
									<xsl:value-of select="$record/@visitors.honorific" />
								</td>
							</tr>
							<tr>
								<td scope="row">
									<xsl:variable name="heading" select="$fields/field[@name='name_first']/@singleLineHeading" />
									<xsl:value-of select="concat($heading, ': ')" />
								</td>
								<td>
									<xsl:value-of select="$record/@visitors.name_first" />
								</td>
							</tr>
							<tr>
								<td scope="row">
									<xsl:variable name="heading" select="$fields/field[@name='name_last']/@singleLineHeading" />
									<xsl:value-of select="concat($heading, ': ')" />
								</td>
								<td>
									<xsl:value-of select="$record/@visitors.name_last" />
								</td>
							</tr>
							<tr>
								<td scope="row">
									<xsl:variable name="heading" select="$fields/field[@name='is_authorized']/@singleLineHeading" />
									<xsl:value-of select="concat($heading, ': ')" />
								</td>
								<td>
									<xsl:value-of select="$record/@visitors.is_authorized" />
								</td>
							</tr>
							<tr>
								<td scope="row">
									<xsl:variable name="heading" select="$fields/field[@name='authorized_by']/@singleLineHeading" />
									<xsl:value-of select="concat($heading, ': ')" />
								</td>
								<td>
									<xsl:value-of select="$record/@visitors.authorized_by" />
								</td>
							</tr>
							<tr>
								<td scope="row">
									<xsl:variable name="heading" select="$fields/field[@name='security_type']/@singleLineHeading" />
									<xsl:value-of select="concat($heading, ': ')" />
								</td>
								<td>
									<xsl:value-of select="$record/@visitors.security_type" />
								</td>
							</tr>
						</colgroup>
					</table>
				</td><td style="vertical-align:top">
					<table class="AbDataTable" style="width: 360px">
						<colgroup span="2">
							<col class="AbHeaderRecord" />
							<col class="AbDataRecord" />
							<tr>
								<td class="AbDataTableAutocolor" colspan="2" style="font-weight: bold">
									<xsl:value-of select="//message[@name='contact']" />
								</td>
							</tr>
							<tr>
								<td scope="row" style="width: 50%">
									<xsl:variable name="heading" select="$fields/field[@name='date_start']/@singleLineHeading" />
									<xsl:value-of select="concat($heading, ': ')" />
								</td>
								<td style="width: 50%">
									<xsl:value-of select="$record/@visitors.date_start" />
								</td>
							</tr>
							<tr>
								<td scope="row">
									<xsl:variable name="heading" select="$fields/field[@name='date_end']/@singleLineHeading" />
									<xsl:value-of select="concat($heading, ': ')" />
								</td>
								<td>
									<xsl:value-of select="$record/@visitors.date_end" />
								</td>
							</tr>
							<tr>
								<td scope="row">
									<xsl:variable name="heading" select="$fields/field[@name='contact']/@singleLineHeading" />
									<xsl:value-of select="concat($heading, ': ')" />
								</td>
								<td>
									<xsl:value-of select="$record/@visitors.contact" />
								</td>
							</tr>
							<tr>
								<td scope="row">
									<xsl:variable name="heading" select="$fields/field[@name='contact_phone']/@singleLineHeading" />
									<xsl:value-of select="concat($heading, ': ')" />
								</td>
								<td>
									<xsl:value-of select="$record/@visitors.contact_phone" />
								</td>
							</tr>
							<tr>
								<td scope="row">
									<xsl:variable name="heading" select="$fields/field[@name='contact_relation']/@singleLineHeading" />
									<xsl:value-of select="concat($heading, ': ')" />
								</td>
								<td>
									<xsl:value-of select="$record/@visitors.contact_relation" />
								</td>
							</tr>
							<tr>
								<td scope="row">
									<xsl:variable name="heading" select="$fields/field[@name='email']/@singleLineHeading" />
									<xsl:value-of select="concat($heading, ': ')" />
								</td>
								<td>
									<xsl:value-of select="$record/@visitors.email" />
								</td>
							</tr>
						</colgroup>
					</table>
				</td></tr>
				<!-- Third row contains Location and Vehicle tables -->
				<tr><td style="vertical-align:top">
					<table class="AbDataTable" style="width: 360px">
						<colgroup span="2">
							<col class="AbHeaderRecord" />
							<col class="AbDataRecord" />
							<tr>
								<td class="AbDataTableAutocolor" colspan="2" style="font-weight: bold">
									<xsl:value-of select="//message[@name='location']" />
								</td>
							</tr>
							<tr>
								<td scope="row" style="width: 50%">
									<xsl:variable name="heading" select="$fields/field[@name='bl_id']/@singleLineHeading" />
									<xsl:value-of select="concat($heading, ': ')" />
								</td>
								<td style="width: 50%">
									<xsl:value-of select="$record/@visitors.bl_id" />
								</td>
							</tr>
							<tr>
								<td scope="row">
									<xsl:variable name="heading" select="$fields/field[@name='fl_id']/@singleLineHeading" />
									<xsl:value-of select="concat($heading, ': ')" />
								</td>
								<td>
									<xsl:value-of select="$record/@visitors.fl_id" />
								</td>
							</tr>
							<tr>
								<td scope="row">
									<xsl:variable name="heading" select="$fields/field[@name='rm_id']/@singleLineHeading" />
									<xsl:value-of select="concat($heading, ': ')" />
								</td>
								<td>
									<xsl:value-of select="$record/@visitors.rm_id" />
								</td>
							</tr>
							<tr>
								<td scope="row">
									<xsl:variable name="heading" select="$fields/field[@name='rm_name']/@singleLineHeading" />
									<xsl:value-of select="concat($heading, ': ')" />
								</td>
								<td>
									<xsl:value-of select="$record/@visitors.rm_name" />
								</td>
							</tr>
							<tr>
								<td scope="row">
									<xsl:variable name="heading" select="$fields/field[@name='company']/@singleLineHeading" />
									<xsl:value-of select="concat($heading, ': ')" />
								</td>
								<td>
									<xsl:value-of select="$record/@visitors.company" />
								</td>
							</tr>
						</colgroup>
					</table>
				</td><td style="vertical-align:top">
					<table class="AbDataTable" style="width: 360px">
						<colgroup span="2">
							<col class="AbHeaderRecord" />
							<col class="AbDataRecord" />
							<tr>
								<td class="AbDataTableAutocolor" colspan="2" style="font-weight: bold">
									<xsl:value-of select="//message[@name='vehicle']" />
								</td>
							</tr>
							<tr>
								<td scope="row" style="width: 50%">
									<xsl:variable name="heading" select="$fields/field[@name='car_make']/@singleLineHeading" />
									<xsl:value-of select="concat($heading, ': ')" />
								</td>
								<td style="width: 50%">
									<xsl:value-of select="$record/@visitors.car_make" />
								</td>
							</tr>
							<tr>
								<td scope="row">
									<xsl:variable name="heading" select="$fields/field[@name='car_registration']/@singleLineHeading" />
									<xsl:value-of select="concat($heading, ': ')" />
								</td>
								<td>
									<xsl:value-of select="$record/@visitors.car_registration" />
								</td>
							</tr>
							<tr>
								<td scope="row">
									<xsl:variable name="heading" select="$fields/field[@name='has_parking']/@singleLineHeading" />
									<xsl:value-of select="concat($heading, ': ')" />
								</td>
								<td>
									<xsl:value-of select="$record/@visitors.has_parking" />
								</td>
							</tr>
						</colgroup>
					</table>
				</td></tr>
				</table>
			</body>
		</html>
	</xsl:template>
	<!-- Must be included for definition of "topTitleBarTable" -->
	<xsl:include href="../../../ab-system/xsl/common.xsl" />
</xsl:stylesheet>
