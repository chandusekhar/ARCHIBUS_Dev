<?xml version="1.0" encoding="UTF-8"?>
<!-- processing any statistics information in reports -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:template name="ReportTable_statistics">
		<xsl:param name="afmTableGroup"/>

		<!-- setting up variables which will be used in xsl-->
		<xsl:variable name="showGrid" select="$afmTableGroup/@showGrid"/>
		<xsl:variable name="printable" select="$afmTableGroup/afmReport/@printable"/>
		<table cellspacing="0" cellpadding="0">
			<xsl:attribute name="border"><xsl:choose><xsl:when test="$showGrid='true'">1</xsl:when><xsl:otherwise>0</xsl:otherwise></xsl:choose></xsl:attribute>
			<xsl:variable name="HeadClass">
				<xsl:choose>
					<xsl:when test="$printable='false'">AbHeaderRecord</xsl:when>
					<xsl:otherwise>AbHeaderRecord_print</xsl:otherwise>
				</xsl:choose>
			</xsl:variable>
			<xsl:variable name="DataClass">
				<xsl:choose>
					<xsl:when test="$printable='false'">AbStatisticData</xsl:when>
					<xsl:otherwise>AbStatisticData_print</xsl:otherwise>
				</xsl:choose>
			</xsl:variable>
			<xsl:variable name="DataStringClass">
				<xsl:choose>
					<xsl:when test="$printable='false'">AbDataRecord</xsl:when>
					<xsl:otherwise>AbDataRecord_print</xsl:otherwise>
				</xsl:choose>
			</xsl:variable>

			<!-- the row to show All Restrictions Applied  -->
			<tr><td></td><td></td><td class="{$HeadClass}"><span translatable="true">All Restrictions Applied</span></td></tr>
			<xsl:for-each select="$afmTableGroup/dataSource/statistics/*">
				<tr>
					<td class="{$HeadClass}">
						<xsl:value-of select="$whiteSpace"/>
						<xsl:value-of select="./title"/>
						<xsl:text>:</xsl:text><xsl:value-of select="$whiteSpace"/>
					</td>
					<td class="{$DataClass}">
						<xsl:value-of select="$whiteSpace"/>
						<xsl:value-of select="@value"/>
					</td>
					<td class="{$DataStringClass}">
						<xsl:value-of select="$whiteSpace"/>
						<xsl:choose>
							<xsl:when test="@applyAllRestrictions=''">
								<span translatable="true">No</span>
							</xsl:when>
							<xsl:otherwise>
								<xsl:choose>
								<xsl:when test="@applyAllRestrictions='true'">
									<span translatable="true">Yes</span>
								</xsl:when>
								<xsl:otherwise>
									<span translatable="true">No</span>
								</xsl:otherwise>
								</xsl:choose>
							</xsl:otherwise>
						</xsl:choose>
					</td>
				</tr>
			</xsl:for-each>
		</table>
	</xsl:template>
</xsl:stylesheet>