<?xml version="1.0" encoding="UTF-8"?>
<!-- Yong Shao -->
<!-- 9-26-2006 -->
<xsl:stylesheet version="1.0" 
  xmlns="urn:schemas-microsoft-com:office:spreadsheet" 
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
  xmlns:fo="http://www.w3.org/1999/XSL/Format" 
  xmlns:msxsl="urn:schemas-microsoft-com:xslt" 
  xmlns:user="urn:my-scripts" 
  xmlns:o="urn:schemas-microsoft-com:office:office" 
  xmlns:x="urn:schemas-microsoft-com:office:excel" 
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <xsl:template match="/">
      <xsl:variable name="reportTablegroup" select="/*/afmTableGroup[1]"/>
      <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" 
      xmlns:o="urn:schemas-microsoft-com:office:office" 
      xmlns:x="urn:schemas-microsoft-com:office:excel" 
      xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" 
      xmlns:html="http://www.w3.org/TR/REC-html40">
      <Styles>
	<Style ss:ID="Default" ss:Name="Normal">
		<Alignment ss:Vertical="Bottom"/>
		<Borders/>
		<Font/>
		<Interior/>
		<NumberFormat/>
		<Protection/>
	</Style>
      
        <Style ss:ID="Title">
		<Alignment ss:Horizontal="Left" ss:Vertical="Bottom"/>
		<Font x:Family="Swiss" ss:Bold="1"/>
		<NumberFormat ss:Format="@"/>
        </Style>

        <Style ss:ID="Headers">
		<Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
		<Font x:Family="Swiss" ss:Bold="1"/>
		<Interior ss:Color="#99CCFF" ss:Pattern="Solid"/>
		<NumberFormat ss:Format="@"/>
		<Borders>
			<Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>
			<Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>
			<Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>
			<Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>
		</Borders>
        </Style>
	<Style ss:ID="warning">
		<Alignment ss:Horizontal="Left" ss:Vertical="Bottom" ss:WrapText="1"/>
		<Font x:Family="Swiss"  ss:Bold="1" ss:Color="#FF0000" />
		<NumberFormat ss:Format="@"/>
        </Style>
	<xsl:for-each select="$reportTablegroup/dataSource/data/fields/field">
		<Style ss:ID="{concat(@table,'.',@name)}">
			<xsl:choose>
				<xsl:when test="enumeration">
					 <Alignment ss:Horizontal="Left" ss:Vertical="Bottom"/>
					 <NumberFormat ss:Format="@"/>
				</xsl:when>
				<xsl:otherwise>
					<xsl:choose>
						<xsl:when test="@type='java.lang.Float' or @type='java.lang.Double' or @type='java.lang.Integer'">
							<Alignment ss:Horizontal="Right" ss:Vertical="Bottom"/>
							<xsl:choose>
								<xsl:when test="@decimals=0">
									 <NumberFormat ss:Format="0"/>
								</xsl:when>
								<xsl:otherwise>
									<xsl:variable name="n_format">
										<xsl:call-template name="numberFormat">
											<xsl:with-param name="counter" select="@decimals"/>
											<xsl:with-param name="format" select="'0.'"/>
										</xsl:call-template>
									</xsl:variable>
									 <NumberFormat ss:Format="{$n_format}"/>
								 </xsl:otherwise>
							 </xsl:choose>
						</xsl:when>
						<xsl:otherwise>
							 <Alignment ss:Horizontal="Left" ss:Vertical="Bottom"/>
							 <NumberFormat ss:Format="@"/>
						</xsl:otherwise>
					</xsl:choose>
				</xsl:otherwise>
			</xsl:choose>
		</Style>
	</xsl:for-each>
      </Styles>
      <xsl:call-template name="ExcelWorkSheet">
		<xsl:with-param name="reportTablegroup" select="$reportTablegroup"/>
      </xsl:call-template>
    </Workbook>
  </xsl:template>
  
  <!-- worksheet -->
  <xsl:template name="ExcelWorkSheet">
     <xsl:param name="reportTablegroup"/>
    <Worksheet ss:Name="Excel">
      <Table x:FullColumns="1" x:FullRows="1">
        <xsl:attribute name="ss:ExpandedColumnCount"><xsl:value-of select="count($reportTablegroup/dataSource/data/fields/field)"/></xsl:attribute>
	<xsl:attribute name="ss:ExpandedRowCount"><xsl:value-of select="count($reportTablegroup/dataSource/data/records/record) + 4"/></xsl:attribute>
	<xsl:for-each select="$reportTablegroup/dataSource/data/fields/field">
		<xsl:if test="@hidden and @hidden='false'">
			<xsl:choose>
				<xsl:when test="@type='java.lang.String' and @format = 'Memo'">
					<Column  ss:AutoFitWidth="0" ss:Width="250"/>
				</xsl:when>
				<xsl:when test="@type='java.lang.String' and @format != 'Memo'">
					<Column  ss:AutoFitWidth="0" ss:Width="180"/>
				</xsl:when>
				<xsl:otherwise>
					<Column  ss:AutoFitWidth="0" ss:Width="80"/>
				</xsl:otherwise>
			</xsl:choose>
		</xsl:if>
	</xsl:for-each>
	<Row>
		<Cell ss:StyleID="Title">
			<Data ss:Type="String">This is customized Excel report test!!!</Data>
		</Cell>
	</Row>
	<Row>
		<Cell ss:StyleID="Title">
			<Data ss:Type="String"/>
		</Cell>
	</Row>
	<Row ss:Height="25.5">
		<xsl:for-each select="$reportTablegroup/dataSource/data/fields/field">
			<xsl:if test="@hidden and @hidden='false'">
				<Cell ss:StyleID="Headers">
					<Data ss:Type="String">
						<xsl:value-of select="@singleLineHeading"/>
					</Data>
				</Cell>
			</xsl:if>
		</xsl:for-each>
	</Row>
	<xsl:for-each select="$reportTablegroup/dataSource/data/records/record">
		<Row>
			<xsl:call-template name="RecordData">
				<xsl:with-param name="record" select="."/>
				<xsl:with-param name="reportTablegroup" select="$reportTablegroup"/>
			</xsl:call-template>
		</Row>
	</xsl:for-each>
	<xsl:if test="not (count($reportTablegroup/dataSource/data/records/record) &gt; 0)">
		<xsl:variable name="warningString" translatable="true">No Items.</xsl:variable>
		<Row ss:Height="18"><Cell ss:StyleID="warning"><Data ss:Type="String"><xsl:value-of select="$warningString"/></Data></Cell></Row>
	</xsl:if>
	<xsl:variable name="moreRecords" select="$reportTablegroup/dataSource/data/records/@moreRecords"/>
	<xsl:if test="$moreRecords='true'">
		<xsl:variable name="warningString2" translatable="true">Not all records can be shown. Please use another view or another restriction to see the remaining data.</xsl:variable>
		<Row ss:Height="18"><Cell ss:StyleID="warning"><Data ss:Type="String"><xsl:value-of select="$warningString2"/></Data></Cell></Row>
	</xsl:if>
      </Table>
    </Worksheet>
  </xsl:template>
  <!-- records -->
  <xsl:template name="RecordData">
	<xsl:param name="record"/>
	<xsl:param name="reportTablegroup"/>
	<xsl:variable name="fieldNodes" select="$reportTablegroup/dataSource/data/fields/field"/>
	<xsl:for-each select="$record/@*">
		<xsl:variable name="recordValue" select="."/>
		<xsl:variable name="index" select="position()"/>
		<xsl:variable name="currentField" select="$fieldNodes[position()=$index]"/>
		<xsl:if test="$currentField/@hidden and $currentField/@hidden='false'">
			<xsl:variable name="fullName" select="concat($currentField/@table, '.', $currentField/@name)"/>
			<Cell ss:StyleID="{$fullName}">
				<xsl:choose>
					<xsl:when test="$currentField/enumeration">
						<Data ss:Type="String"><xsl:value-of select="."/></Data>
					</xsl:when>
					<xsl:otherwise>
						<xsl:choose>
							<xsl:when test="$currentField/@type='java.lang.Float' or $currentField/@type='java.lang.Double' or $currentField/@type='java.lang.Integer'">
								<Data ss:Type="Number"><xsl:value-of select="."/></Data>
							</xsl:when>
							<xsl:otherwise>
								<Data ss:Type="String"><xsl:value-of select="."/></Data>
							</xsl:otherwise>
						</xsl:choose>
					</xsl:otherwise>
				</xsl:choose>
			</Cell>
		</xsl:if>
	</xsl:for-each>
  </xsl:template>
  <!-- helper -->
  <xsl:template name="numberFormat">
	<xsl:param name="counter"/>
	<xsl:param name="format"/>
	<xsl:choose>
		<xsl:when test="$counter &gt; 0">
			<xsl:variable name="temp_format" select="concat($format,'0')"/>
			<xsl:call-template name="numberFormat">
				<xsl:with-param name="counter" select="$counter - 1"/>
				<xsl:with-param name="format" select="$temp_format"/>
			</xsl:call-template>
		</xsl:when>
		<xsl:otherwise><xsl:value-of select="$format"/></xsl:otherwise>
	</xsl:choose>
 </xsl:template>
 
</xsl:stylesheet>

