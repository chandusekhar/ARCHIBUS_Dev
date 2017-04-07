<?xml version="1.0"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<!-- importing xsl files -->
	<!-- constants.xsl which contains constant XSLT variables -->
	<xsl:import href="constants.xsl"/>
	<!-- top template  -->
	<xsl:template match="/">
		<html>
			<title>
				<!-- since browser cannot handle <title />, using a XSL whitespace avoids XSL processor -->
				<!-- to generate <title /> if there is no title in source XML -->
				<xsl:value-of select="/*/title"/>
				<xsl:value-of select="$whiteSpace"/>
			</title>
			<head>
				<!-- template: Html-Head-Setting in common.xsl -->
				<!-- css and javascript files  -->
				<!-- linking path must be related to the folder in which xml is being processed -->
				<!-- calling template LinkingCSS in common.xsl -->
				<xsl:call-template name="LinkingCSS"/>
				<!--link rel="stylesheet" type="text/css" href="../style/abCascadingStyleSheet-slate.css"/-->
				<!-- don't remove whitespace, otherwise, Xalan XSLT processor will generate <script .../> instead of <script ...></script> -->
				<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common.js">
					<xsl:value-of select="$whiteSpace"/>
				</script>
				<script language="JavaScript" src="#Attribute%//@relativeFileDirectory%/brg-proj-variances-design-to-baseline-mdx.js">
					<xsl:value-of select="$whiteSpace"/>
				</script>
				<xsl:for-each select="//afmTableGroup/dataSource/data/charts/chart">
					<xsl:copy-of select="map"/>
				</xsl:for-each>
			</head>
			<body class="body" leftmargin="0" rightmargin="0" topmargin="0" bottomMargin="0">
				<xsl:call-template name="common">
					<xsl:with-param name="title" select="/*/title"/>
					<xsl:with-param name="debug" select="//@debug"/>
					<xsl:with-param name="afmHiddenForm" select="$afmHiddenForm"/>
					<xsl:with-param name="xml" select="$xml"/>
				</xsl:call-template>
				<xsl:call-template name="Mdx">
					<xsl:with-param name="afmTableGroup" select="/*/afmTableGroup"/>
					<xsl:with-param name="margin-left" select="0"/>
					<xsl:with-param name="level" select="1"/>
				</xsl:call-template>
			</body>
		</html>
	</xsl:template>
	<xsl:template name="Mdx">
		<xsl:param name="afmTableGroup"/>
		<xsl:param name="margin-left"/>
		<xsl:param name="level"/>
		<xsl:param name="format"/>
		<xsl:variable name="showGrid">
			<xsl:choose>
				<!-- check if there is showGrid in axvw -->
				<xsl:when test="$afmTableGroup/@showGrid">
					<xsl:value-of select="$afmTableGroup/@showGrid"/>
				</xsl:when>
				<!-- there is no showGrid in axvw, false is used as default -->
				<xsl:otherwise>false</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<table class="panelReportHeader">
			<tr><td width="100%"><xsl:text/><xsl:value-of select="/*/afmTableGroup[position()=1]/title"/></td>
				<td style="text-align: right; padding-right: 8px">
					<span class="panelButton_input" style="cursor: default" translatable="true" onclick="window.location.reload()">Refresh</span>	
				</td>
				<xsl:variable name="firstTgrpNode" select="/*/afmTableGroup[position()=1]"/>
				<xsl:variable name="pdfAction" select="$firstTgrpNode/afmAction[@eventName='renderShowPrintablePdf']" />
		<xsl:variable name="logoPDF">
			<xsl:choose>
				<xsl:when test="//preferences/@logoPDF"><xsl:value-of select="//preferences/@logoPDF"/></xsl:when>
				<xsl:otherwise><xsl:if test="$pdfAction!=''"><xsl:value-of select="$pdfAction[@id='export2Pdf']/icon/@request"/></xsl:if></xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<xsl:variable name="logoEXCEL">
			<xsl:choose>
				<xsl:when test="//preferences/@logoEXCEL"><xsl:value-of select="//preferences/@logoEXCEL"/></xsl:when>
				<xsl:otherwise><xsl:if test="$pdfAction!=''"><xsl:value-of select="$pdfAction[@id='export2Excel' or @id='exportMdx2Excel']/icon/@request"/></xsl:if></xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
					<xsl:if test="$pdfAction != ''">
						<td style="text-align: right; padding-right: 6px">
							<xsl:for-each select="$pdfAction">
								<xsl:choose>
									<xsl:when test="@id='export2Pdf'">
										<input class="AbActionButtonFormStdWidth"  src="{$logoPDF}" type="image" onclick='openPdfGeneratingView("{@serialized}")' alt="{title}" title="{title}"/>
									</xsl:when>
									<xsl:otherwise>
										<input class="AbActionButtonFormStdWidth"  src="{$logoEXCEL}" type="image" onclick='openExcelGeneratingView("{@serialized}")' alt="{title}" title="{title}"/>
									</xsl:otherwise>
								</xsl:choose>
							</xsl:for-each>
						</td>
					</xsl:if>
			</tr>
		</table>
		<table width="100%" valign="top">
			<tr>
				<td>
					<xsl:variable name="chart" select="$afmTableGroup/dataSource/data/charts/chart[position()=1]"/>
					<xsl:if test="count($chart) &gt; 0">
						<xsl:for-each select="$afmTableGroup/dataSource/data/charts/chart">
							<img USEMAP="#{map/@name}" src="{@name}"/>
						</xsl:for-each>
					</xsl:if>
					<xsl:if test="count($chart) &lt;= 0">
						<xsl:if test="$afmTableGroup/dataSource/mdx/preferences/@dimensions = '1'">
							<table>
								<xsl:attribute name="border"><xsl:choose><xsl:when test="$showGrid='true'">1</xsl:when><xsl:otherwise>0</xsl:otherwise></xsl:choose></xsl:attribute>
								<!-- headings -->
								<tr>
                                    <td class="AbMdx_DimensionNames">
                                        <xsl:call-template name="getTitle">
                                            <xsl:with-param name="element" select="$afmTableGroup/dataSource/data/rowDimension"/>
                                        </xsl:call-template>
                                    </td>
                                    <xsl:for-each select="$afmTableGroup/dataSource/mdx/preferences/measures/measure">
                                        <td class="AbMdx_DimensionColumnHeader">
                                            <xsl:call-template name="getTitle">
                                                <xsl:with-param name="element" select="."/>
                                            </xsl:call-template>
                                        </td>
                                    </xsl:for-each>
								</tr>
								<!-- values -->
								<xsl:for-each select="$afmTableGroup/dataSource/data/recordIndices/recordIndex">
									<xsl:variable name="rowDimensionName" select="@rowDimensionName"/>
									<xsl:variable name="rowHeadAction" select="//rowDimension/member[@name=$rowDimensionName]/afmAction"/>
									<tr>
										<td>
											<xsl:attribute name="class"><xsl:choose><xsl:when test="//rowDimension/member[@name=$rowDimensionName]/@isAll='true'">AbMdx_TotalCellHeader</xsl:when><xsl:otherwise>AbMdx_DimensionRowHeader</xsl:otherwise></xsl:choose></xsl:attribute>
											<xsl:call-template name="showingResult">
												<xsl:with-param name="value" select="$rowDimensionName"/>
												<xsl:with-param name="afmAction" select="$rowHeadAction"/>
												<xsl:with-param name="editable" select="false"/>
												<xsl:with-param name="project_id" select="$rowDimensionName"/>
											</xsl:call-template>
										</td>
										<xsl:variable name="index" select="@recordIndex"/>
										<xsl:for-each select="$afmTableGroup/dataSource/data/records/record[position()=$index]/@*">
											<td>
												<xsl:attribute name="class"><xsl:choose><xsl:when test="//rowDimension/member[@name=$rowDimensionName]/@isAll='true'">AbMdx_SubTotalRowData</xsl:when><xsl:otherwise>AbMdx_MeasureCellData</xsl:otherwise></xsl:choose></xsl:attribute>
												<xsl:call-template name="showingResult">
													<xsl:with-param name="value" select="."/>
													<xsl:with-param name="afmAction" select="$rowHeadAction"/>
													<xsl:with-param name="editable" select="false"/>
													<xsl:with-param name="project_id" select="$rowDimensionName"/>
												</xsl:call-template>
											</td>
										</xsl:for-each>
									</tr>
								</xsl:for-each>
							</table>
							<xsl:if test="not (count($afmTableGroup/dataSource/data/records/record) &gt; 0)">
								<div style="margin-left:5pt;">
									<table>
										<tr>
											<td class="instruction" align="center" valign="top">
												<p>
													<span translatable="true">No Items.</span>
												</p>
											</td>
										</tr>
									</table>
								</div>
							</xsl:if>
						</xsl:if>
						<xsl:if test="$afmTableGroup/dataSource/mdx/preferences/@dimensions = '2'">
							<xsl:call-template name="Format2d_h">
								<xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
								<xsl:with-param name="showGrid" select="$showGrid"/>
							</xsl:call-template>
						</xsl:if>
					</xsl:if>
				</td>
			</tr>
		</table>
	</xsl:template>
	<xsl:template name="Format2d_h">
		<xsl:param name="afmTableGroup"/>
		<xsl:param name="showGrid"/>
		<xsl:variable name="rowDimension_counter" select="count($afmTableGroup/dataSource/data/rowDimension/member)"/>
		<table>
			<xsl:attribute name="border"><xsl:choose><xsl:when test="$showGrid='true'">1</xsl:when><xsl:otherwise>0</xsl:otherwise></xsl:choose></xsl:attribute>
			<tr>
				<td colspan="2" class="AbMdx_DimensionNames">
					<br/>
				</td>
				<td colspan="{$rowDimension_counter}" class="AbMdx_DimensionNames">
                    <xsl:call-template name="getTitle">
                        <xsl:with-param name="element" select="$afmTableGroup/dataSource/data/rowDimension"/>
                    </xsl:call-template>
				</td>
			</tr>
			<tr>
				<td class="AbMdx_DimensionNames">
                    <xsl:call-template name="getTitle">
                        <xsl:with-param name="element" select="$afmTableGroup/dataSource/data/columnDimension"/>
                    </xsl:call-template>
				</td>
				<td class="AbMdx_DimensionNames">
					<br/>
				</td>
				<xsl:for-each select="$afmTableGroup/dataSource/data/rowDimension/member">
					<td>
						<xsl:attribute name="class"><xsl:choose><xsl:when test="@isAll='true'">AbMdx_TotalCellHeader</xsl:when><xsl:otherwise>AbMdx_DimensionColumnHeader</xsl:otherwise></xsl:choose></xsl:attribute>
						<xsl:call-template name="showingResult">
							<xsl:with-param name="value" select="@name"/>
							<xsl:with-param name="afmAction" select="afmAction"/>
							<xsl:with-param name="editable" select="false"/>
						</xsl:call-template>
					</td>
				</xsl:for-each>
			</tr>
			<xsl:variable name="fields_counter" select="count($afmTableGroup/dataSource/data/fields/field)"/>
			<xsl:for-each select="$afmTableGroup/dataSource/data/columnDimension/member">
				<xsl:variable name="columnDimensionName" select="@name"/>
				<xsl:variable name="columnAction" select="afmAction"/>
				<xsl:variable name="classForMeasure">
					<xsl:choose>
						<xsl:when test="@isAll='true'">AbMdx_MeasureName</xsl:when>
						<xsl:otherwise>AbMdx_MeasureColumn</xsl:otherwise>
					</xsl:choose>
				</xsl:variable>
				<tr>
					<td rowspan="{$fields_counter}">
						<xsl:attribute name="class"><xsl:choose><xsl:when test="@isAll='true'">AbMdx_TotalCellHeader</xsl:when><xsl:otherwise>AbMdx_DimensionRowHeader</xsl:otherwise></xsl:choose></xsl:attribute>
						<xsl:call-template name="showingResult">
							<xsl:with-param name="value" select="@name"/>
							<xsl:with-param name="afmAction" select="afmAction"/>
							<xsl:with-param name="editable" select="false"/>
						</xsl:call-template>
					</td>
					<td class="{$classForMeasure}">
						<xsl:value-of select="$afmTableGroup/dataSource/data/fields/field[position()=1]/@singleLineHeading"/>
					</td>
					<xsl:for-each select="$afmTableGroup/dataSource/data/rowDimension/member">
						<xsl:variable name="rowDimensionName" select="@name"/>
						<xsl:variable name="recordIndex" select="$afmTableGroup/dataSource/data/recordIndices/recordIndex[@columnDimensionName=$columnDimensionName and @rowDimensionName=$rowDimensionName]/@recordIndex"/>
						<xsl:variable name="rowDimensionIsAll" select="$afmTableGroup/dataSource/data/recordIndices/recordIndex[@columnDimensionName=$columnDimensionName and @rowDimensionName=$rowDimensionName]/@rowDimensionIsAll"/>
						<xsl:variable name="columnDimensionIsAll" select="$afmTableGroup/dataSource/data/recordIndices/recordIndex[@columnDimensionName=$columnDimensionName and @rowDimensionName=$rowDimensionName]/@columnDimensionIsAll"/>
						<xsl:for-each select="$afmTableGroup/dataSource/data/records/record[position()=$recordIndex]/@*">
							<xsl:if test="position()=1">
								<td>
									<xsl:attribute name="class"><xsl:choose><xsl:when test="$rowDimensionIsAll='true' and $columnDimensionIsAll='true'">AbMdx_TotalCellData</xsl:when><xsl:when test="$rowDimensionIsAll='true' and $columnDimensionIsAll='false'">AbMdx_SubTotalRowData</xsl:when><xsl:when test="$rowDimensionIsAll='false' and $columnDimensionIsAll='true'">AbMdx_SubTotalColumnData</xsl:when><xsl:otherwise>AbMdx_MeasureCellData</xsl:otherwise></xsl:choose></xsl:attribute>
									<xsl:variable name="editable">
										<xsl:choose>
											<xsl:when test="$rowDimensionIsAll='true' or $columnDimensionIsAll='true'">false</xsl:when>
											<xsl:otherwise>true</xsl:otherwise>
										</xsl:choose>
									</xsl:variable>
									<xsl:call-template name="showingResult">
										<xsl:with-param name="value" select="."/>
										<xsl:with-param name="afmAction" select="$afmTableGroup/dataSource/data/records/record[position()=$recordIndex]/afmAction"/>
										<xsl:with-param name="editable" select="$editable"/>
									</xsl:call-template>
								</td>
							</xsl:if>
						</xsl:for-each>
					</xsl:for-each>
				</tr>
				<xsl:for-each select="$afmTableGroup/dataSource/data/fields/field[position() &gt; 1]">
					<xsl:variable name="fieldName" select="concat(@table, '.', @name)"/>
					<tr>
						<td class="{$classForMeasure}">
							<xsl:value-of select="@singleLineHeading"/>
						</td>
						<xsl:for-each select="$afmTableGroup/dataSource/data/rowDimension/member">
							<xsl:variable name="rowDimensionName" select="@name"/>
							<xsl:variable name="recordIndices" select="$afmTableGroup/dataSource/data/recordIndices/recordIndex[@columnDimensionName=$columnDimensionName and @rowDimensionName=$rowDimensionName]/@recordIndex"/>
							<xsl:variable name="rowDimensionIsAll" select="$afmTableGroup/dataSource/data/recordIndices/recordIndex[@columnDimensionName=$columnDimensionName and @rowDimensionName=$rowDimensionName]/@rowDimensionIsAll"/>
							<xsl:variable name="columnDimensionIsAll" select="$afmTableGroup/dataSource/data/recordIndices/recordIndex[@columnDimensionName=$columnDimensionName and @rowDimensionName=$rowDimensionName]/@columnDimensionIsAll"/>
							<xsl:for-each select="$afmTableGroup/dataSource/data/records/record[position()=$recordIndices]/@*">
								<xsl:if test="name(.)=$fieldName">
									<td>
										<xsl:attribute name="class"><xsl:choose><xsl:when test="$rowDimensionIsAll='true' and $columnDimensionIsAll='true'">AbMdx_TotalCellData</xsl:when><xsl:when test="$rowDimensionIsAll='true' and $columnDimensionIsAll='false'">AbMdx_SubTotalRowData</xsl:when><xsl:when test="$rowDimensionIsAll='false' and $columnDimensionIsAll='true'">AbMdx_SubTotalColumnData</xsl:when><xsl:otherwise>AbMdx_MeasureCellData</xsl:otherwise></xsl:choose></xsl:attribute>
										<xsl:variable name="editable">
											<xsl:choose>
												<xsl:when test="$rowDimensionIsAll='true' or $columnDimensionIsAll='true'">false</xsl:when>
												<xsl:otherwise>true</xsl:otherwise>
											</xsl:choose>
										</xsl:variable>
										<xsl:call-template name="showingResult">
											<xsl:with-param name="value" select="."/>
											<xsl:with-param name="afmAction" select="$afmTableGroup/dataSource/data/records/record[position()=$recordIndices]/afmAction"/>
											<xsl:with-param name="editable" select="$editable"/>
										</xsl:call-template>
									</td>
								</xsl:if>
							</xsl:for-each>
						</xsl:for-each>
					</tr>
				</xsl:for-each>
			</xsl:for-each>
		</table>
	</xsl:template>
	<xsl:template name="showingResult">
		<xsl:param name="value"/>
		<xsl:param name="afmAction"/>
		<xsl:param name="editable"/>
		<xsl:param name="project_id"/>
		<xsl:variable name="actionTip" select="$afmAction/title"/>
		<xsl:variable name="actionSerialized" select="$afmAction/@serialized"/>
		<xsl:variable name="isNewWindow" select="$afmAction/@newWindow"/>
		<xsl:variable name="actionTarget">
			<xsl:choose>
				<xsl:when test="$isNewWindow='true'">_blank</xsl:when>
				<xsl:otherwise>_self</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<xsl:choose>
			<xsl:when test="$value=' ' or $value=''">
				<br/>
			</xsl:when>
			<xsl:when test="$value='null'">
				<xsl:choose>
					<xsl:when test="count($afmAction) &lt;= 0">
						N/A
					</xsl:when>
					<xsl:otherwise>
						<a href="#" title="{$actionTip}" onclick='settingValues("{$project_id}","{$actionSerialized}","{$actionTarget}")'>N/A</a>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<xsl:choose>
					<xsl:when test="count($afmAction) &lt;= 0">
						<xsl:value-of select="$value"/>
					</xsl:when>
					<xsl:otherwise>
						<xsl:choose>
							<xsl:when test="$editable='false'">
								<xsl:value-of select="$value"/>
							</xsl:when>
							<xsl:otherwise>
								<a href="#" title="{$actionTip}" onclick='settingValues("{$project_id}","{$actionSerialized}","{$actionTarget}")'>
									<xsl:value-of select="$value"/>
								</a>
							</xsl:otherwise>
						</xsl:choose>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>
    
    <xsl:template name="getTitle">
        <xsl:param name="element"/>
        <xsl:choose>
            <xsl:when test="$element/title">
                <xsl:value-of select="$element/title/text()"/>
            </xsl:when>
            <xsl:otherwise>
                <xsl:value-of select="$element/@name"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>

	<!-- including template model XSLT files called in XSLT -->
	<xsl:include href="common.xsl"/>
</xsl:stylesheet>
