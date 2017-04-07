<?xml version="1.0" encoding="UTF-8"?>
<!-- Yong Shao -->
<!-- 10-21-2004 -->
<!-- used to transform XML data to XSL-FO, then converted into pdf report -->
<xsl:stylesheet version="1.1" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:fo="http://www.w3.org/1999/XSL/Format" exclude-result-prefixes="fo">
	<xsl:output method="xml" version="1.0" omit-xml-declaration="no" indent="no"/>
	<xsl:template match="/">
		<xsl:variable name="pdfStyle">
			<xsl:choose>
				<xsl:when test="/*/preferences/pdfButton/@style"><xsl:value-of select="//preferences/pdfButton/@style"/></xsl:when>
				<xsl:otherwise>portrait</xsl:otherwise>
			</xsl:choose>

		</xsl:variable>
		<xsl:variable name="localeName" select="/*/preferences/@locale"/>
		<xsl:variable name="pdfFormat">
			<xsl:choose>
				<xsl:when test="$localeName='en_US' or $localeName='en_CA' or $localeName='es_MX'">US</xsl:when>
				<xsl:otherwise>A4</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<xsl:processing-instruction name="cocoon-format">type="text/xslfo"</xsl:processing-instruction>
		<fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
			<fo:layout-master-set>
				<xsl:choose>
				<xsl:when test="$pdfStyle='portrait'">
					<xsl:if test="$pdfFormat='A4'">
						<fo:simple-page-master margin="1cm" master-name="main-page" page-height="297mm" page-width="210mm">
							<fo:region-before extent="5cm"/>
							<fo:region-after extent="1cm"/>
							<fo:region-body margin-top="2cm"  margin-bottom="1.5cm"/>
						</fo:simple-page-master>
					</xsl:if>
					<xsl:if test="$pdfFormat='US'">
						<fo:simple-page-master margin="1cm" master-name="main-page" page-height="11in" page-width="8.5in">
							<fo:region-before extent="5cm"/>
							<fo:region-after extent="1cm"/>
							<fo:region-body margin-top="2cm"  margin-bottom="1.5cm"/>
						</fo:simple-page-master>
					</xsl:if>
				</xsl:when>
				<xsl:otherwise>
					<xsl:if test="$pdfFormat='A4'">
						<fo:simple-page-master margin="1cm" master-name="main-page" page-height="210mm" page-width="297mm">
							<fo:region-before extent="5cm"/>
							<fo:region-after extent="1cm"/>
							<fo:region-body margin-top="3cm"  margin-bottom="1.5cm"/>
						</fo:simple-page-master>
					</xsl:if>
					<xsl:if test="$pdfFormat='US'">
						<fo:simple-page-master margin="1cm" master-name="main-page" page-height="8.5in" page-width="11in">
							<fo:region-before extent="5cm"/>
							<fo:region-after extent="1cm"/>
							<fo:region-body margin-top="3cm"  margin-bottom="1.5cm"/>
						</fo:simple-page-master>
					</xsl:if>
				</xsl:otherwise>
				</xsl:choose>
			</fo:layout-master-set>

			<fo:page-sequence master-reference="main-page">
				<fo:static-content flow-name="xsl-region-before">
					<fo:block font-size="6pt" font-weight="bold" border-bottom-color="black" border-bottom-style="solid" border-bottom-width="1pt">
						<fo:retrieve-marker retrieve-class-name="page-head"/>
					</fo:block>
				</fo:static-content>
				<fo:static-content flow-name="xsl-region-after">
					<fo:block text-align="left" font-size="6pt" font-weight="bold" padding-top="3pt">
						<fo:inline font-weight="bold" font-size="8pt" color="#119988" >ARCHIBUS</fo:inline>
					</fo:block>
				</fo:static-content>
				<fo:flow flow-name="xsl-region-body">
					<fo:block font-family="Arial, Verdana, Geneva, Helvetica, sans-serif" font-size="6pt">
						<fo:block>
							<fo:marker marker-class-name="page-head">
								<fo:table width="100%" table-layout="fixed">
									<fo:table-column column-width="proportional-column-width(1)"/>
									<fo:table-column column-width="proportional-column-width(10)"/>
									<fo:table-body>
									<fo:table-row>
										<fo:table-cell>
											<fo:block>
												<fo:external-graphic  src="{//preferences/@projectFolder}/graphics/archibus-logo.gif">
												</fo:external-graphic>
											</fo:block>

										</fo:table-cell>
										<fo:table-cell>
											<fo:block text-align="left" font-weight="bold" font-size="8pt" color="#119988">
												<xsl:value-of select="//title"/>
											</fo:block>
											<fo:block text-align="left" font-weight="bold" font-size="8pt" color="#119988">
												<fo:inline translatable="true">Page:</fo:inline><fo:inline>&#160;</fo:inline><fo:page-number/>
											</fo:block>
											<fo:block text-align="left" font-weight="bold" font-size="8pt" color="#119988">
												<xsl:value-of select="//preferences/currentDateAndTime/@currentDate"/>
											</fo:block>
										</fo:table-cell>
									</fo:table-row>
								</fo:table-body>
							</fo:table>
						</fo:marker>
					</fo:block>
					<xsl:for-each select="/*/afmTableGroup">
						<!-- space -->
						<xsl:if test="position() &gt; 1">
							<fo:block font-size="6pt" font-weight="bold" border-bottom-color="black" border-bottom-style="solid" border-bottom-width="3pt"  space-after="0.3cm" space-before="0.3cm"/>
						</xsl:if>
						<fo:block>
							<xsl:call-template name="AfmTableGroups">
								<xsl:with-param name="afmTableGroup" select="."/>
								<xsl:with-param name="level" select="'1'"/>
							</xsl:call-template>
						</fo:block>

					</xsl:for-each>
					</fo:block>
					<fo:block id="EndOfDocument" text-align="center"/>
				</fo:flow>
			</fo:page-sequence>
		</fo:root>
	</xsl:template>

	<!-- AfmTableGroups -->
	<xsl:template name="AfmTableGroups">
		<xsl:param name="afmTableGroup"/>
		<xsl:param name="level"/>
		<xsl:variable name="format" select="$afmTableGroup/@format"/>
		<!-- statistics -->
		<xsl:if test="$afmTableGroup/dataSource/statistics/*">
			<xsl:call-template name="statistics">
				<xsl:with-param name="afmTableGroup" select="."/>
			</xsl:call-template>
		</xsl:if>

		<fo:table table-layout="fixed" width="100%">
			<fo:table-column column-width="proportional-column-width(1)"/>
			<fo:table-body>
				<fo:table-row>
					<fo:table-cell>
						<xsl:choose>
							<xsl:when test="$format='table' or $format='grid'">
								<xsl:call-template name="ReportTableFormat">
									<xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
									<xsl:with-param name="level" select="$level"/>
								</xsl:call-template>
							</xsl:when>
							<!-- showing the data in columns -->
							<xsl:otherwise>
								<xsl:call-template name="ReportColumnFormat">
									<xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
								</xsl:call-template>
							</xsl:otherwise>
						</xsl:choose>
					</fo:table-cell>
				</fo:table-row>

				<!-- looping through child table groups -->
				<xsl:for-each select="$afmTableGroup/afmTableGroup">
					<fo:table-row>
						<fo:table-cell>
							<fo:table table-layout="fixed" width="100%">
								<fo:table-column column-width="1cm"/>
								<fo:table-column/>
								<fo:table-body>
									<fo:table-row>
										<fo:table-cell>
											<fo:block font-size="10pt"  text-align="center" space-after="8pt"/>
										</fo:table-cell>
										<fo:table-cell>
											<fo:block  space-after="2mm"/>
											<xsl:call-template name="AfmTableGroups">
												<xsl:with-param name="afmTableGroup" select="."/>
												<xsl:with-param name="level" select="$level+1"/>
											</xsl:call-template>
										</fo:table-cell>
									</fo:table-row>
								</fo:table-body>
							</fo:table>

						</fo:table-cell>
					</fo:table-row>
				</xsl:for-each>
			</fo:table-body>
		</fo:table>
	</xsl:template>

	<!-- ReportTableFormat -->
	<xsl:template name="ReportTableFormat">
		<xsl:param name="afmTableGroup"/>
		<xsl:param name="level"/>
		<xsl:variable name="showGrid">
			<xsl:choose>
				<xsl:when test="$afmTableGroup/@showGrid">
					<xsl:value-of select="$afmTableGroup/@showGrid"/>
				</xsl:when>
				<xsl:otherwise>false</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>

		<xsl:variable name="totalFields">
			<xsl:for-each select="$afmTableGroup/dataSource/data/fields/field[@hidden!='true']">
				<xsl:if test="position()=last()">
					<xsl:value-of select="last()"/>
				</xsl:if>
			</xsl:for-each>
		</xsl:variable>
		<fo:table table-layout="fixed" width="100%">
			<xsl:for-each select="$afmTableGroup/dataSource/data/fields/field[@hidden!='true']">
				<fo:table-column column-width="proportional-column-width(1)"/>
			</xsl:for-each>
			<fo:table-header>
				<fo:table-row  text-align="left" font-size="8pt">
					<xsl:attribute name="background-color">
						<xsl:if test="$level=1">#91B3D0</xsl:if>
						<xsl:if test="$level=2">#E0E0E8</xsl:if>
						<xsl:if test="$level=3">#BFEFF8</xsl:if>
						<xsl:if test="$level!=1 and $level!=2 and $level!=3">#91B3D0</xsl:if>
					</xsl:attribute>
					<xsl:for-each select="$afmTableGroup/dataSource/data/fields/field[@hidden!='true']">
						<fo:table-cell>
							<xsl:if test="$showGrid='true'">
								<xsl:attribute name="border-width">0.2mm</xsl:attribute>
								<xsl:attribute name="border-style">solid</xsl:attribute>
							</xsl:if>
							<fo:block start-indent="0.1cm" end-indent="0.1cm">
								<xsl:value-of select="@singleLineHeading"/>
							</fo:block>
						</fo:table-cell>
					</xsl:for-each>
				</fo:table-row>
			</fo:table-header>
			<fo:table-body>
				<xsl:for-each select="$afmTableGroup/dataSource/data/records/record">
					<xsl:variable name="recordIndex" select="position()"/>
					<xsl:variable name="Autocolor">
						<xsl:choose>
							<xsl:when test="$recordIndex mod 2 = 0">#FFFFCC</xsl:when>
							<xsl:otherwise>#FFFFFF</xsl:otherwise>
						</xsl:choose>
					</xsl:variable>
					<fo:table-row text-align="left"  font-size="6pt" background-color="{$Autocolor}">
						<!-- all non-memo fields -->
						<xsl:for-each select="$afmTableGroup/dataSource/data/fields/field[@hidden!='true']">
							<xsl:variable name="fullFieldName" select="concat(@table,'.',@name)"/>
							<xsl:variable name="currentFieldType" select="@type"/>
							<xsl:for-each select="$afmTableGroup/dataSource/data/records/record[position()=$recordIndex]/@*">
								<xsl:if test="name(.)=$fullFieldName">
									<fo:table-cell>
										<xsl:if test="$showGrid='true'">
											<xsl:attribute name="border-width">0.2mm</xsl:attribute>
											<xsl:attribute name="border-style">solid</xsl:attribute>
										</xsl:if>
										<fo:block  start-indent="0.5mm"  space-before="0.5mm" space-after="0.5mm">
											<xsl:attribute name="text-align">
												<xsl:choose>
													<xsl:when test="$currentFieldType='java.lang.Float' or $currentFieldType='java.lang.Double' or $currentFieldType='java.lang.Integer'">right</xsl:when>
													<xsl:otherwise>left</xsl:otherwise>
												</xsl:choose>
											</xsl:attribute>
											<xsl:attribute name="end-indent">
												<xsl:choose>
													<xsl:when test="$currentFieldType='java.lang.Float' or $currentFieldType='java.lang.Double' or $currentFieldType='java.lang.Integer'">2.5mm</xsl:when>
													<xsl:otherwise>0.5mm</xsl:otherwise>
												</xsl:choose>
											</xsl:attribute>
											<xsl:value-of select="."/>
										</fo:block>
									</fo:table-cell>
								</xsl:if>
							</xsl:for-each>
						</xsl:for-each>
					</fo:table-row>
				</xsl:for-each>
				<!-- there is no record at all -->
				<xsl:if test="not (count($afmTableGroup/dataSource/data/records/record) &gt; 0)">
					<fo:table-row>
						<fo:table-cell number-columns-spanned="{$totalFields}">
							<fo:block  font-size="8pt" color="red" translatable="true">No items!</fo:block>
						</fo:table-cell>
					</fo:table-row>
				</xsl:if>
				<!-- more records in database -->
				<xsl:if test="$afmTableGroup/dataSource/data/records/@moreRecords='true'">
					<fo:table-row>
						<fo:table-cell number-columns-spanned="{$totalFields}">
							<fo:block  font-size="8pt" color="red"  translatable="true">Not all records can be shown. Please use another view or another restriction to see the remaining data!</fo:block>
						</fo:table-cell>
					</fo:table-row>
				</xsl:if>
			</fo:table-body>
		</fo:table>
	</xsl:template>

	<!-- ReportColumnFormat -->
	<xsl:template name="ReportColumnFormat">
		<xsl:param name="afmTableGroup"/>
		<xsl:variable name="field" select="$afmTableGroup/dataSource/data/fields/field[@hidden!='true']"/>
		<xsl:variable name="record" select="$afmTableGroup/dataSource/data/records/record"/>
		<xsl:variable name="columnNumber">
			<xsl:choose>
				<xsl:when test="$afmTableGroup/@column">
					<xsl:choose>
						<xsl:when test="$afmTableGroup/@column &lt; 1">1</xsl:when>
						<xsl:otherwise>
							<xsl:value-of select="$afmTableGroup/@column"/>
						</xsl:otherwise>
					</xsl:choose>
				</xsl:when>
				<xsl:otherwise>1</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<xsl:variable name="iTotalFields">
				<xsl:for-each select="$field[@format!='Memo'][@hidden!='true']">
					<xsl:if test="position()=last()">
						<xsl:value-of select="last()"/>
					</xsl:if>
				</xsl:for-each>
		</xsl:variable>
		<xsl:variable name="accept_columnNumber">
			<xsl:choose>
				<xsl:when test="$columnNumber &gt; $iTotalFields"><xsl:value-of select="$iTotalFields"/></xsl:when>
				<xsl:otherwise><xsl:value-of select="$columnNumber"/></xsl:otherwise>
			</xsl:choose>
		</xsl:variable>

		<xsl:for-each select="$record">
			<xsl:if test="position() &gt; 1">
				<fo:block font-size="5pt" font-weight="bold" border-bottom-color="black" border-bottom-style="solid" border-bottom-width="3pt"  space-after="1mm" space-before="1mm"/>
			</xsl:if>
			<xsl:variable name="recordIndex" select="position()"/>
			<fo:table table-layout="fixed" width="100%">
				<xsl:call-template name="columns_heads">
					<xsl:with-param name="columnNumber" select="$accept_columnNumber"/>
				</xsl:call-template>

				<fo:table-body>
					<!-- no-memo fields -->
					<fo:table-row keep-together="always">
						<xsl:call-template name="columns">
							<xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
							<xsl:with-param name="field" select="$field"/>
							<xsl:with-param name="record" select="."/>
							<xsl:with-param name="startingIndex" select="1"/>
							<xsl:with-param name="columnNumber" select="$accept_columnNumber"/>
							<xsl:with-param name="iTotalFields" select="$iTotalFields"/>
						</xsl:call-template>
					</fo:table-row>
					<!-- memo fields: always one column format -->
					<fo:table-row>
						<fo:table-cell number-columns-spanned="{$accept_columnNumber}">
							<fo:table table-layout="fixed" width="100%">
								<fo:table-column column-width="proportional-column-width(1)"/>
								<fo:table-column column-width="proportional-column-width(2)"/>
								<fo:table-body>
								<xsl:for-each select="$field[@format='Memo']">
									<xsl:variable name="memoFieldName" select="@singleLineHeading"/>
									<xsl:variable name="memoRecordValueIndex" select="concat(@table,'.',@name)"/>
									<fo:table-row>
										<fo:table-cell  background-color="#91B3D0" text-align="right">
											<fo:block font-size="8pt" end-indent="1mm">
												<xsl:value-of select="$memoFieldName"/>:
											</fo:block>
										</fo:table-cell>
										<fo:table-cell font-size="8pt" start-indent="1mm">
											<xsl:for-each select="$record[position()=$recordIndex]/@*">
												<xsl:if test="name()=$memoRecordValueIndex">
													<xsl:call-template name="memo_field_value_handler">
													    <xsl:with-param name="memo_value" select="."/>
													</xsl:call-template>
												</xsl:if>
											</xsl:for-each>
										</fo:table-cell>
									</fo:table-row>
								</xsl:for-each>
								</fo:table-body>
							</fo:table>
						</fo:table-cell>
					</fo:table-row>
				</fo:table-body>
			</fo:table>
		</xsl:for-each>
	</xsl:template>

	<!-- columns_heads -->
	<xsl:template name="columns_heads">
		<xsl:param name="columnNumber"/>
		<xsl:if test="$columnNumber &gt;= 1">
			<fo:table-column column-width="proportional-column-width(1)"/>
			<xsl:call-template name="columns_heads">
				<xsl:with-param name="columnNumber" select="$columnNumber - 1"/>
			</xsl:call-template>
		</xsl:if>
	</xsl:template>

	<!-- columns -->
	<xsl:template name="columns">
		<xsl:param name="afmTableGroup"/>
		<xsl:param name="field"/>
		<xsl:param name="record"/>
		<xsl:param name="startingIndex"/>
		<xsl:param name="columnNumber"/>
		<xsl:param name="iTotalFields"/>

		<xsl:variable name="iTotalMemoFields">
			<xsl:for-each select="$field[@format='Memo']">
				<xsl:if test="position()=last()">
					<xsl:value-of select="last()"/>
				</xsl:if>
			</xsl:for-each>
		</xsl:variable>

		<xsl:if test="$columnNumber &gt; 0">
			<xsl:variable name="iDividedNumber">
				<xsl:choose>
					<xsl:when test="($iTotalFields mod $columnNumber)=0">
						<xsl:value-of select="($iTotalFields div $columnNumber)"/>
					</xsl:when>
					<xsl:otherwise>
						<xsl:value-of select="ceiling($iTotalFields div $columnNumber)"/>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:variable>

			<fo:table-cell >
				<fo:table table-layout="fixed" width="100%">
					<fo:table-column column-width="proportional-column-width(1)"/>
					<fo:table-column column-width="proportional-column-width(2)"/>
					<fo:table-body>
						<xsl:for-each select="$field[@format!='Memo']">
							<xsl:variable name="positionIndex" select="position()"/>
							<xsl:variable name="FieldName" select="@singleLineHeading"/>
							<xsl:variable name="recordValueIndex" select="concat(@table,'.',@name)"/>
							<xsl:if test="($positionIndex &gt;= $startingIndex) and ($positionIndex &lt; ($startingIndex + $iDividedNumber))">
								<fo:table-row>
									<fo:table-cell  background-color="#91B3D0" text-align="right">
										<fo:block font-size="8pt" end-indent="1mm">
											<xsl:value-of select="$FieldName"/>:
										</fo:block>
									</fo:table-cell>
									<fo:table-cell font-size="8pt" start-indent="1mm">
										<fo:block>
											<xsl:value-of select="$record/@*[name()=$recordValueIndex]"/>
										</fo:block>
									</fo:table-cell>
								</fo:table-row>
							</xsl:if>
						</xsl:for-each>
					</fo:table-body>
				</fo:table>
			</fo:table-cell>
			<xsl:call-template name="columns">
				<xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
				<xsl:with-param name="field" select="$field"/>
				<xsl:with-param name="record" select="$record"/>
				<xsl:with-param name="startingIndex" select="$startingIndex + $iDividedNumber"/>
				<xsl:with-param name="columnNumber" select="$columnNumber - 1"/>
				<xsl:with-param name="iTotalFields" select="$iTotalFields - $iDividedNumber"/>
			</xsl:call-template>
		</xsl:if>
	</xsl:template>

	<!-- memo_field_value_handler -->
	<xsl:template name="memo_field_value_handler">
		<xsl:param name="memo_value"/>
		<xsl:choose>
			<xsl:when test="contains($memo_value,'&#x0D;&#x0A;')">
				<fo:block linefeed-treatment="preserve">
					<xsl:value-of select="substring-before($memo_value,'&#x0D;&#x0A;')"/>
				</fo:block>
				<xsl:call-template name="memo_field_value_handler">
					<xsl:with-param name="memo_value" select="substring-after($memo_value,'&#x0D;&#x0A;')"/>
				</xsl:call-template>
			</xsl:when>
			<xsl:otherwise>
				<fo:block linefeed-treatment="preserve">
					<xsl:value-of select="$memo_value"/>
				</fo:block>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>

	<!-- statistics -->
	<xsl:template name="statistics">
		<xsl:param name="afmTableGroup"/>
		<xsl:variable name="showGrid">
			<xsl:choose>
				<xsl:when test="$afmTableGroup/@showGrid">
					<xsl:value-of select="$afmTableGroup/@showGrid"/>
				</xsl:when>
				<xsl:otherwise>false</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<fo:table table-layout="fixed" width="100%">
			<fo:table-column column-width="proportional-column-width(1)"/>
			<fo:table-column column-width="proportional-column-width(1)"/>
			<fo:table-column column-width="proportional-column-width(2)"/>
			<fo:table-header>
				<fo:table-row font-size="8pt">
					<fo:table-cell>
						<fo:block white-space-collapse="false"></fo:block>
					</fo:table-cell>

					<fo:table-cell>
						<fo:block white-space-collapse="false"></fo:block>
					</fo:table-cell>

					<fo:table-cell text-align="left">
						<xsl:if test="$showGrid='true'">
							<xsl:attribute name="border-width">0.2mm</xsl:attribute>
							<xsl:attribute name="border-style">solid</xsl:attribute>
						</xsl:if>
						<fo:block start-indent="0.5mm" end-indent="0.5mm" space-before="0.5mm" space-after="0.5mm" translatable="true">All Restrictions Applied</fo:block>
					</fo:table-cell>
				</fo:table-row>
			</fo:table-header>
			<fo:table-body>
				<xsl:for-each select="$afmTableGroup/dataSource/statistics/*">
					<fo:table-row>
						<fo:table-cell  text-align="right" font-size="8pt">
							<xsl:if test="$showGrid='true'">
								<xsl:attribute name="border-width">0.2mm</xsl:attribute>
								<xsl:attribute name="border-style">solid</xsl:attribute>
							</xsl:if>
							<fo:block start-indent="0.5mm" end-indent="0.5mm" space-before="0.5mm" space-after="0.5mm">
								<xsl:value-of select="./title"/>:
							</fo:block>
						</fo:table-cell>
						<fo:table-cell text-align="right" font-size="6pt">
							<xsl:if test="$showGrid='true'">
								<xsl:attribute name="border-width">0.2mm</xsl:attribute>
								<xsl:attribute name="border-style">solid</xsl:attribute>
							</xsl:if>
							<fo:block start-indent="0.5mm" end-indent="0.5cm" space-before="0.5mm" space-after="0.5mm">
								<xsl:value-of select="@value"/>
							</fo:block>
						</fo:table-cell>
						<fo:table-cell  text-align="left" font-size="6pt">
							<xsl:if test="$showGrid='true'">
								<xsl:attribute name="border-width">0.2mm</xsl:attribute>
								<xsl:attribute name="border-style">solid</xsl:attribute>
							</xsl:if>
							<fo:block start-indent="0.5mm" end-indent="0.5mm" space-before="0.5mm" space-after="0.5mm">
								<xsl:choose>
									<xsl:when test="@applyAllRestrictions=''"><fo:inline translatable="true">No</fo:inline></xsl:when>
									<xsl:otherwise>
										<xsl:choose>
										<xsl:when test="@applyAllRestrictions='true'"><fo:inline translatable="true">Yes</fo:inline></xsl:when>
										<xsl:otherwise><fo:inline translatable="true">No</fo:inline></xsl:otherwise>
										</xsl:choose>
									</xsl:otherwise>
								</xsl:choose>
							</fo:block>
						</fo:table-cell>
					</fo:table-row>
				</xsl:for-each>
			</fo:table-body>
		</fo:table>
	</xsl:template>
</xsl:stylesheet>
