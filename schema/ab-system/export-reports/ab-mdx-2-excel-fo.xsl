<?xml version="1.0" encoding="UTF-8"?>
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
	
	<Style ss:ID="AbMdx_DimensionNames">
		<Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="0"/>
		<Font x:Family="Swiss" ss:Bold="1"/>
		<Interior ss:Color="#0066CC" ss:Pattern="Solid"/>
		<NumberFormat ss:Format="@"/>
		<Borders>
			<Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>
			<Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>
			<Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>
			<Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>
		</Borders>
	</Style>

	<Style ss:ID="AbMdx_DimensionColumnHeader">
		<Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="0"/>
		<Font x:Family="Swiss" ss:Bold="1"/>
		<Interior ss:Color="#FFFFCC" ss:Pattern="Solid"/>
		<NumberFormat ss:Format="@"/>
		<Borders>
			<Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>
			<Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>
			<Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>
			<Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>
		</Borders>
	</Style>

	<Style ss:ID="AbMdx_TotalCellHeader">
		<Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="0"/>
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
	<Style ss:ID="AbMdx_DimensionRowHeader">
		<Alignment ss:Horizontal="Left" ss:Vertical="Bottom" ss:WrapText="0"/>
		<Font x:Family="Swiss" ss:Bold="1"/>
		<Interior ss:Color="#FFFFCC" ss:Pattern="Solid"/>
		<NumberFormat ss:Format="@"/>
		<Borders>
			<Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>
			<Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>
			<Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>
			<Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>
		</Borders>
	</Style>

	<Style ss:ID="AbMdx_SubTotalRowData">
		<Alignment ss:Horizontal="Right" ss:Vertical="Bottom" ss:WrapText="0"/>
		<Font x:Family="Swiss" ss:Bold="1"/>
		<Interior ss:Color="#CCFFFF" ss:Pattern="Solid"/>
		<NumberFormat ss:Format="@"/>
		<Borders>
			<Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>
			<Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>
			<Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>
			<Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>
		</Borders>
	</Style>

	<Style ss:ID="AbMdx_MeasureCellData">
		<Alignment ss:Horizontal="Right" ss:Vertical="Bottom"/>
		<NumberFormat ss:Format="@"/>
		<Borders>
			<Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>
			<Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>
			<Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>
			<Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>
		</Borders>
	</Style>

	<Style ss:ID="AbMdx_MeasureName">
		<Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="0"/>
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

	<Style ss:ID="AbMdx_MeasureColumn">
		<Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="0"/>
		<Font x:Family="Swiss" ss:Bold="1"/>
		<Interior ss:Color="#CCFFCC" ss:Pattern="Solid"/>
		<NumberFormat ss:Format="@"/>
		<Borders>
			<Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>
			<Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>
			<Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>
			<Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>
		</Borders>
	</Style>

	<Style ss:ID="AbMdx_SubTotalColumnData">
		<Alignment ss:Horizontal="Right" ss:Vertical="Bottom" ss:WrapText="0"/>
		<Font x:Family="Swiss" ss:Bold="1"/>
		<Interior ss:Color="#CCFFFF" ss:Pattern="Solid"/>
		<NumberFormat ss:Format="@"/>
		<Borders>
			<Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>
			<Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>
			<Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>
			<Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>
		</Borders>
	</Style>

	<Style ss:ID="AbMdx_TotalCellData">
		<Alignment ss:Horizontal="Right" ss:Vertical="Bottom" ss:WrapText="0"/>
		<Font x:Family="Swiss" ss:Bold="1"/>
		<Interior ss:Color="#FF99CC" ss:Pattern="Solid"/>
		<NumberFormat ss:Format="@"/>
		<Borders>
			<Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>
			<Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>
			<Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>
			<Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>
		</Borders>
	</Style>

	<Style ss:ID="AbMdx_MeasureCellData2">
		<Alignment ss:Horizontal="Right" ss:Vertical="Bottom" ss:WrapText="0"/>
		<NumberFormat ss:Format="0.00"/>
		<Borders>
			<Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>
			<Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>
			<Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>
			<Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>
		</Borders>
	</Style>
      </Styles>
      <xsl:apply-templates/>
      </Workbook>
      </xsl:template>
  
	<!-- Populate top level items -->
	<xsl:template match="/afmXmlView">
		<Worksheet ss:Name="MDX Excel">
		<Table x:FullColumns="1" x:FullRows="1">
			<xsl:variable name="afmTableGroup" select="/*/afmTableGroup[1]"/>

			<Column  ss:AutoFitWidth="0" ss:Width="100"/>
			<xsl:for-each select="$afmTableGroup/dataSource/mdx/preferences/measures/measure">
				<Column  ss:AutoFitWidth="0" ss:Width="100"/>
			</xsl:for-each>
			<xsl:for-each select="$afmTableGroup/dataSource/data/rowDimension/member">
				<Column  ss:AutoFitWidth="0" ss:Width="100"/>
			</xsl:for-each>

			<Row>
				<Cell ss:StyleID="Title">
					<Data ss:Type="String"><xsl:value-of select="$afmTableGroup/title"/></Data>
				</Cell>
			</Row>
			<Row>
				<Cell ss:StyleID="Title">
					<Data ss:Type="String"/>
				</Cell>
			</Row>

			<xsl:if test="$afmTableGroup/dataSource/mdx/preferences/@dimensions = '1'">
				<xsl:call-template name="get1DReport">
					<xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
				</xsl:call-template>	
			</xsl:if>

			<xsl:if test="$afmTableGroup/dataSource/mdx/preferences/@dimensions = '2'">
				<xsl:call-template name="get2DReport">
					<xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
				</xsl:call-template>	
			</xsl:if>
		</Table>
		</Worksheet>
	</xsl:template>

	<!-- For One Dimensional Views -->
	<xsl:template name="get1DReport">
		<xsl:param name="afmTableGroup"/>	
		<Row ss:Height="25.5">
			<Cell ss:StyleID="AbMdx_DimensionNames">
				<Data ss:Type="String">
					<xsl:call-template name="getTitle">
						<xsl:with-param name="element" select="$afmTableGroup/dataSource/data/rowDimension"/>
					</xsl:call-template>
				</Data>
			</Cell>
			<xsl:for-each select="$afmTableGroup/dataSource/mdx/preferences/measures/measure">
				<Cell ss:StyleID="AbMdx_DimensionColumnHeader">
					<Data ss:Type="String">
						<xsl:call-template name="getTitle">
							<xsl:with-param name="element" select="."/>
						</xsl:call-template>
					</Data>
				</Cell>
			</xsl:for-each>
		</Row>
		<!-- create rows -->
		<xsl:for-each select="$afmTableGroup/dataSource/data/recordIndices/recordIndex">
			<xsl:variable name="rowDimensionName" select="@rowDimensionName"/>
			<Row>
				<xsl:choose>
					<xsl:when test="//rowDimension/member[@name=$rowDimensionName]/@isAll='true'">
						<Cell ss:StyleID="AbMdx_TotalCellHeader">
							<Data ss:Type="String"><xsl:value-of select="normalize-space($rowDimensionName)"/></Data>
						</Cell>
					</xsl:when>
					<xsl:otherwise>
						<Cell ss:StyleID="AbMdx_DimensionRowHeader">
							<Data ss:Type="String"><xsl:value-of select="normalize-space($rowDimensionName)"/></Data>
						</Cell>
					</xsl:otherwise>
				</xsl:choose>

				<xsl:variable name="index" select="@recordIndex"/>
				<xsl:for-each select="$afmTableGroup/dataSource/data/records/record[position()=$index]/@*">										
					<xsl:variable name="value" select="."/>
					<xsl:choose>
						<xsl:when test="//rowDimension/member[@name=$rowDimensionName]/@isAll='true'">
							<Cell ss:StyleID="AbMdx_SubTotalRowData">
								<Data>
									<xsl:attribute name="ss:Type">
										<xsl:choose>
											<xsl:when test="contains(name(.),'.min') or contains(name(.),'.max') or contains(name(.),'count-percent') or contains(name(.),'sum-percent')">String</xsl:when>
											<xsl:otherwise>Number</xsl:otherwise>
										</xsl:choose>
									</xsl:attribute>
									<xsl:value-of select="$value"/>
								</Data>
							</Cell>
						</xsl:when>
						<xsl:otherwise>
							<Cell ss:StyleID="AbMdx_MeasureCellData">
								<Data>
									<xsl:attribute name="ss:Type">
										<xsl:choose>
											<xsl:when test="contains(name(.),'.min') or contains(name(.),'.max') or contains(name(.),'count-percent') or contains(name(.),'sum-percent')">String</xsl:when>
											<xsl:otherwise>Number</xsl:otherwise>
										</xsl:choose>
									</xsl:attribute>
									<xsl:value-of select="$value"/>
								</Data>
							</Cell>	
						</xsl:otherwise>
					</xsl:choose>
				</xsl:for-each>
			</Row>
		</xsl:for-each>
	</xsl:template>

	<!-- For Two Dimensional Views -->
	<xsl:template name="get2DReport">
		<xsl:param name="afmTableGroup"/>	
		<xsl:variable name="rowDimension_counter" select="count($afmTableGroup/dataSource/data/rowDimension/member)"/>
		<!--Title Row -->
		<Row ss:Height="15">
			<Cell ss:MergeAcross="1" ss:StyleID="AbMdx_DimensionNames">
				<Data ss:Type="String"> </Data>
			</Cell>

			<Cell ss:StyleID="AbMdx_DimensionNames">
				<xsl:attribute name="ss:MergeAcross">
					<xsl:choose>
						<xsl:when test="$rowDimension_counter>=1">
							<xsl:value-of select="($rowDimension_counter)-1"/>
						</xsl:when>
						<xsl:otherwise><xsl:value-of select="$rowDimension_counter"/></xsl:otherwise>
					</xsl:choose>
				</xsl:attribute>					        					       
				<Data ss:Type="String"> 
					<xsl:call-template name="getTitle">
						<xsl:with-param name="element" select="$afmTableGroup/dataSource/data/rowDimension"/>
					</xsl:call-template>
				</Data>
			</Cell>
		</Row>

		<!--Field Headings -->
		<Row ss:Height="25.5">
			<Cell ss:StyleID="AbMdx_DimensionNames">
				<Data ss:Type="String">
					<xsl:call-template name="getTitle">
						<xsl:with-param name="element" select="$afmTableGroup/dataSource/data/columnDimension"/>
					</xsl:call-template>
				</Data> 
			</Cell>
			<Cell ss:StyleID="AbMdx_DimensionNames">
				<Data ss:Type="String"></Data>
			</Cell>
			<xsl:for-each select="$afmTableGroup/dataSource/data/rowDimension/member">
				<Cell>
					<xsl:attribute name="ss:StyleID">
						<xsl:choose>
							<xsl:when test="@isAll='true'">AbMdx_TotalCellHeader</xsl:when>
							<xsl:otherwise>AbMdx_DimensionColumnHeader</xsl:otherwise>
						</xsl:choose>
					</xsl:attribute>					         					         	
					<Data ss:Type="String">
						<xsl:value-of select="normalize-space(@name)"/>
					</Data>
				</Cell>
			</xsl:for-each>
		</Row>
		<xsl:variable name="fields_counter" select="count($afmTableGroup/dataSource/data/fields/field)"/>
		<xsl:for-each select="$afmTableGroup/dataSource/data/columnDimension/member">
			<xsl:variable name="columnDimensionName" select="@name"/>
			<xsl:variable name="classForMeasure">
				<xsl:choose>
					<xsl:when test="@isAll='true'">AbMdx_MeasureName</xsl:when>
					<xsl:otherwise>AbMdx_MeasureColumn</xsl:otherwise>
				</xsl:choose>
			</xsl:variable>
			<!--Total Row -->
			<Row>
				<Cell>
					<xsl:attribute name="ss:StyleID">
						<xsl:choose>
							<xsl:when test="@isAll='true'">AbMdx_TotalCellHeader</xsl:when>
							<xsl:otherwise>AbMdx_DimensionRowHeader</xsl:otherwise>
						</xsl:choose>
					</xsl:attribute>
					<xsl:attribute name="ss:MergeDown">
						<xsl:choose>
							<xsl:when test="$fields_counter>=1">
								<xsl:value-of select="($fields_counter)-1"/>
							</xsl:when>
							<xsl:otherwise><xsl:value-of select="$fields_counter"/></xsl:otherwise>
						</xsl:choose>
					</xsl:attribute>
					<Data ss:Type="String">
						<xsl:value-of select="normalize-space(@name)"/>
					</Data>
				</Cell>
				<Cell ss:Index="2" ss:StyleID="{$classForMeasure}">
					<Data ss:Type="String">
						<xsl:call-template name="getTitle">
							<xsl:with-param name="element" select="$afmTableGroup/dataSource/mdx/preferences/measures/measure[position()=1]"/>
						</xsl:call-template>
					</Data>
				</Cell>
				<xsl:for-each select="$afmTableGroup/dataSource/data/rowDimension/member">
					<xsl:variable name="rowDimensionName" select="@name"/>
					<xsl:variable name="recordIndex" select="$afmTableGroup/dataSource/data/recordIndices/recordIndex[@columnDimensionName=$columnDimensionName and @rowDimensionName=$rowDimensionName]/@recordIndex"/>
					<xsl:variable name="rowDimensionIsAll" select="$afmTableGroup/dataSource/data/recordIndices/recordIndex[@columnDimensionName=$columnDimensionName and @rowDimensionName=$rowDimensionName]/@rowDimensionIsAll"/>
					<xsl:variable name="columnDimensionIsAll" select="$afmTableGroup/dataSource/data/recordIndices/recordIndex[@columnDimensionName=$columnDimensionName and @rowDimensionName=$rowDimensionName]/@columnDimensionIsAll"/>
					<xsl:for-each select="$afmTableGroup/dataSource/data/records/record[position()=$recordIndex]/@*">
						<xsl:if test="position()=1">
							<xsl:variable name="value" select="."/>
							<Cell>
								<xsl:attribute name="ss:StyleID">
								<xsl:choose>
									<xsl:when test="$rowDimensionIsAll='true' and $columnDimensionIsAll='true'">AbMdx_TotalCellData</xsl:when>
									<xsl:when test="$rowDimensionIsAll='true' and $columnDimensionIsAll='false'">AbMdx_SubTotalRowData</xsl:when>
									<xsl:when test="$rowDimensionIsAll='false' and $columnDimensionIsAll='true'">AbMdx_SubTotalColumnData</xsl:when>
									<xsl:otherwise>AbMdx_MeasureCellData</xsl:otherwise>
								</xsl:choose>
								</xsl:attribute>
								<Data>
									<xsl:attribute name="ss:Type">
										<xsl:choose>
											<xsl:when test="contains(name(.),'.min') or contains(name(.),'.max') or contains(name(.),'count-percent') or contains(name(.),'sum-percent')">String</xsl:when>
											<xsl:otherwise>Number</xsl:otherwise>
										</xsl:choose>
									</xsl:attribute>
									<xsl:value-of select="normalize-space($value)"/>
								</Data>
							</Cell>
						</xsl:if>
					</xsl:for-each>
				</xsl:for-each>
			</Row>
			<xsl:for-each select="$afmTableGroup/dataSource/data/fields/field[position() &gt; 1]">
				<xsl:variable name="fieldName" select="concat(@table, '.', @name)"/>
				<xsl:variable name="fieldIndex" select="position()"/>
				<!--Data Rows-->
				<Row>
					<Cell ss:Index="2" ss:StyleID="AbMdx_MeasureName">
						<Data ss:Type="String">
							<xsl:call-template name="getTitle">
								<xsl:with-param name="element" select="$afmTableGroup/dataSource/mdx/preferences/measures/measure[position()=$fieldIndex+1]"/>
							</xsl:call-template>
						</Data>
					</Cell>
					<xsl:for-each select="$afmTableGroup/dataSource/data/rowDimension/member">
						<xsl:variable name="rowDimensionName" select="@name"/>
						<xsl:variable name="recordIndices" select="$afmTableGroup/dataSource/data/recordIndices/recordIndex[@columnDimensionName=$columnDimensionName and @rowDimensionName=$rowDimensionName]/@recordIndex"/>
						<xsl:variable name="rowDimensionIsAll" select="$afmTableGroup/dataSource/data/recordIndices/recordIndex[@columnDimensionName=$columnDimensionName and @rowDimensionName=$rowDimensionName]/@rowDimensionIsAll"/>
						<xsl:variable name="columnDimensionIsAll" select="$afmTableGroup/dataSource/data/recordIndices/recordIndex[@columnDimensionName=$columnDimensionName and @rowDimensionName=$rowDimensionName]/@columnDimensionIsAll"/>
						<xsl:for-each select="$afmTableGroup/dataSource/data/records/record[position()=$recordIndices]/@*">
							<xsl:if test="name(.)=$fieldName">
								<xsl:variable name="value" select="."/>
								<Cell>
									<xsl:attribute name="ss:StyleID">
										<xsl:choose>
											<xsl:when test="$rowDimensionIsAll='true' and $columnDimensionIsAll='true'">AbMdx_TotalCellData</xsl:when>
											<xsl:when test="$rowDimensionIsAll='true' and $columnDimensionIsAll='false'">AbMdx_SubTotalRowData</xsl:when>
											<xsl:when test="$rowDimensionIsAll='false' and $columnDimensionIsAll='true'">AbMdx_SubTotalColumnData</xsl:when>
											<xsl:otherwise>AbMdx_MeasureCellData</xsl:otherwise>
										</xsl:choose>
									</xsl:attribute>
									<Data>
										<xsl:attribute name="ss:Type">
											<xsl:choose>
												<xsl:when test="contains(name(.),'.min') or contains(name(.),'.max') or contains(name(.),'count-percent') or contains(name(.),'sum-percent')">String</xsl:when>
												<xsl:otherwise>Number</xsl:otherwise>
											</xsl:choose>
										</xsl:attribute>
										<xsl:value-of select="normalize-space($value)"/>
									</Data>
								</Cell>
							</xsl:if>
						</xsl:for-each>
					</xsl:for-each>
				</Row>
			</xsl:for-each>
		</xsl:for-each>
	</xsl:template>

  
	<!-- /*/afmTableGroup/dataSource/data[1]/fields/field/@decimals -->
	<!-- Populate cell data -->
	<xsl:template name="popRecordData">
		<xsl:param name="value"/>
		<xsl:variable name="fieldNodes" select="/*/afmTableGroup[1]/dataSource/mdx/preferences/measures/measure"/>
		<xsl:variable name="recordValue" select="$value"/>
		<xsl:variable name="index" select="position()"/>
		<xsl:variable name="currentField" select="$fieldNodes[position()=$index]"/>
		<xsl:choose>
			<xsl:when test="$currentField/@datatype='time' or $currentField/@datatype='date'">
				<Cell ss:StyleID="AbMdx_MeasureCellData">
					<Data ss:Type="String"><xsl:value-of select="."></xsl:value-of></Data>
				</Cell>
			</xsl:when>  
			<xsl:otherwise>
				<Cell ss:StyleID="AbMdx_MeasureCellData2">                     
					<Data ss:Type="Number"><xsl:value-of select="$recordValue"></xsl:value-of></Data>              
				</Cell>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>
  
	<xsl:template name="numberData">
		<Data ss:Type="Number"><xsl:value-of select="."/></Data>
	</xsl:template>

	<xsl:template name="getTitle">
		<xsl:param name="element"/>
		<xsl:choose>
			<xsl:when test="$element/title">
				<xsl:value-of select="normalize-space($element/title/text())"/>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="normalize-space($element/@name)"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>
</xsl:stylesheet>
