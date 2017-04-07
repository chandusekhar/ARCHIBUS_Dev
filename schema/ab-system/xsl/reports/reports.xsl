<?xml version="1.0" encoding="UTF-8"?>
<!-- processing report -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:template name="Report">
		<xsl:param name="afmTableGroup"/>
		<xsl:param name="margin-left"/>
		<xsl:param name="level"/>
		<xsl:param name="format"/>

		<!-- variable holding the format of processing afmTableGroup: table or column -->
		<!--xsl:variable name="format" select="$afmTableGroup/@format"/-->	
		<xsl:choose>
			<!-- handling the afmTableGroup for server-side error messages -->
			<xsl:when test="$afmTableGroup/@separateWindow='true'">
				<xsl:call-template name="ErrorMessage">
					<xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
				</xsl:call-template>
			</xsl:when>
			<!-- handling normal afmTableGroups for data report -->
			<xsl:otherwise>
				<xsl:choose>
					<!-- showing the data in table -->
					<xsl:when test="$format='table'">
						<xsl:if test="count($afmTableGroup/dataSource/mdx) &lt;= 0 or count($afmTableGroup/dataSource/mdx/preferences[@format='off']) &gt; 0">
							<xsl:call-template name="ReportTableFormat">
								<xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
								<xsl:with-param name="margin-left" select="$margin-left"/>
								<xsl:with-param name="level" select="$level"/>
							</xsl:call-template>
						</xsl:if>
						<xsl:if test="count($afmTableGroup/dataSource/mdx/preferences[@format!='off']) &gt; 0">
							<xsl:call-template name="Mdx">
								<xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
								<xsl:with-param name="margin-left" select="$margin-left"/>
								<xsl:with-param name="level" select="$level"/>
							</xsl:call-template>
						</xsl:if>
					</xsl:when>
					<!-- showing the data in column -->
					<xsl:when test="$format='column'">
						<xsl:call-template name="ReportColumnFormat">
							<xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
							<xsl:with-param name="margin-left" select="$margin-left"/>
							<xsl:with-param name="level" select="$level"/>
						</xsl:call-template>		
					</xsl:when>
				</xsl:choose>
			</xsl:otherwise>
		</xsl:choose>
		
	</xsl:template>

	<!-- include separating xsl files-->
	<xsl:include href="report-table-format.xsl"/>
	<xsl:include href="report-column-format.xsl"/>
	<xsl:include href="error-message-window.xsl"/>
	<xsl:include href="report-memo-field-value-handler.xsl"/>
	<xsl:include href="ab-view-analysis-template.xsl"/>
</xsl:stylesheet>


