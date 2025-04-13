import { Document, Page, Text, View, StyleSheet, Image, Svg, Path, G, Circle, Line } from '@react-pdf/renderer';
import { pdf } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
  },
  pageColumnContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pageColumn: {
    width: '48%',
  },
  header: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerContent: {
    flex: 1,
  },
  headerLogo: {
    width: 120,
    height: 40,
    objectFit: 'contain',
    marginLeft: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 8,
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 4,
  },
  section: {
    margin: 8,
    padding: 8,
  },
  metricsContainer: {
    marginVertical: 10,
  },
  metricItemContainer: {
    marginBottom: 8,
    height: 60,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 8,
    color: '#4B5563',
  },
  metricValue: {
    fontSize: 8,
    color: '#1F2937',
  },
  metricBar: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
  },
  metricFill: {
    height: '100%',
    backgroundColor: '#F97316',
    borderRadius: 3,
  },
  metricDescription: {
    fontSize: 7,
    color: '#6B7280',
    marginTop: 4,
  },
  providerSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  providerCard: {
    marginVertical: 10,
    padding: 15,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  providerName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 5,
  },
  providerDetails: {
    fontSize: 12,
    color: '#4B5563',
    marginBottom: 3,
  },
  logo: {
    width: 50,
    height: 50,
    marginBottom: 10,
    objectFit: 'contain',
  },
  contactInfo: {
    marginTop: 10,
    fontSize: 10,
    color: '#6B7280',
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 10,
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#6B7280',
  },
  radarChartContainer: {
    width: '100%',
    height: 450,
    marginVertical: 10,
    alignItems: 'center',
    padding: 10,
  },
});

// Helper function to manually wrap long labels - NOW RETURNS string[]
const formatLabel = (label: string, maxLineLength: number): string[] => {
  const words = label.split(' ');
  let currentLine = '';
  const lines: string[] = []; // Explicitly type as string[]

  words.forEach(word => {
    if (currentLine.length === 0) {
      currentLine = word;
    } else if (currentLine.length + word.length + 1 <= maxLineLength) {
      currentLine += ` ${word}`;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  });
  lines.push(currentLine);

  // return lines.join('\n'); // Don't join, return array
  return lines;
};

// Helper functions for radar chart
const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
};

const createRadarPath = (centerX: number, centerY: number, radius: number, points: number[], numPoints: number) => {
  let path = '';
  points.forEach((value, index) => {
    const angle = (360 / numPoints) * index;
    const point = polarToCartesian(centerX, centerY, (radius * value) / 100, angle);
    path += index === 0 ? `M ${point.x} ${point.y}` : ` L ${point.x} ${point.y}`;
  });
  path += ' Z';
  return path;
};

const RadarChartPDF = ({ data }: { data: { category: string; value: number }[] }) => {
  const centerX = 300;
  const centerY = 225;
  const radius = 180;
  const numPoints = data.length;
  const values = data.map(d => d.value);
  const labelFontSize = 6;
  const labelLineHeight = labelFontSize * 1.2;

  // Create grid lines
  const gridLines = Array.from({ length: 5 }, (_, i) => {
    const gridRadius = radius * ((i + 1) / 5);
    const points: string[] = [];
    
    for (let j = 0; j < numPoints; j++) {
      const angle = (360 / numPoints) * j;
      const point = polarToCartesian(centerX, centerY, gridRadius, angle);
      points.push(`${point.x},${point.y}`);
    }
    
    return points.join(' ');
  });

  // Create axis lines
  const axisLines = data.map((_, i) => {
    const angle = (360 / numPoints) * i;
    const point = polarToCartesian(centerX, centerY, radius, angle);
    return `M ${centerX} ${centerY} L ${point.x} ${point.y}`;
  });

  return (
    <View style={styles.radarChartContainer}>
      <Svg width="600" height="450">
        {/* Grid circles */}
        {gridLines.map((points, i) => (
          <G key={`grid-${i}`}>
            <Circle
              cx={centerX}
              cy={centerY}
              r={radius * ((i + 1) / 5)}
              stroke="#E5E7EB"
              strokeWidth={0.5}
              fill="none"
            />
          </G>
        ))}

        {/* Axis lines */}
        {axisLines.map((d, i) => (
          <Path
            key={`axis-${i}`}
            d={d}
            stroke="#E5E7EB"
            strokeWidth={0.5}
          />
        ))}

        {/* Data path */}
        <Path
          d={createRadarPath(centerX, centerY, radius, values, numPoints)}
          fill="#F97316"
          fillOpacity={0.3}
          stroke="#F97316"
          strokeWidth={1}
        />

        {/* Category labels - Render multiple Text elements per label */}
        {data.map((d, i) => {
          const angle = (360 / numPoints) * i;
          const point = polarToCartesian(centerX, centerY, radius + 15, angle); 
          const maxCharsPerLine = 20; 
          const labelLines = formatLabel(d.category, maxCharsPerLine);
          // Calculate initial Y offset to center the block of text vertically
          const initialY = point.y - ((labelLines.length - 1) * labelLineHeight) / 2;
          
          return (
            // Use a G (group) element for each multi-line label if needed, though Text might suffice
            <G key={`label-group-${i}`}>
              {labelLines.map((line, lineIndex) => (
                  <Text
                    key={`label-${i}-line-${lineIndex}`}
                    x={point.x}
                    // Position each line vertically
                    y={initialY + lineIndex * labelLineHeight}
                    style={{
                      fontSize: labelFontSize,
                      fill: '#4B5563',
                      textAnchor: angle > 180 ? 'end' : (angle === 0 || angle === 180 ? 'middle' : 'start'),
                      // dominantBaseline might be less predictable with multi-line, remove or adjust
                      // dominantBaseline: 'middle', 
                    }}
                  >
                    {line} 
                  </Text>
              ))}
            </G>
          );
        })}

        {/* Value indicators */}
        {data.map((d, i) => {
          const angle = (360 / numPoints) * i;
          const point = polarToCartesian(centerX, centerY, (radius * d.value) / 100, angle);
          
          return (
            <G key={`value-${i}`}>
              <Circle
                cx={point.x}
                cy={point.y}
                r={2}
                fill="#F97316"
              />
            </G>
          );
        })}
      </Svg>
    </View>
  );
};

interface Metric {
  category: string;
  score: number;
  description?: string;
}

interface Provider {
  name: string;
  logo: string;
  shortDescription: string;
  providerUrl: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
}

interface AssessmentReportProps {
  metrics: Metric[];
  overallScore: number;
  providers: Provider[];
  userInfo: {
    firstName: string;
    lastName: string;
    company: string;
    email: string;
  };
}

export const AssessmentReport = ({ metrics, overallScore, providers, userInfo }: AssessmentReportProps) => {
  const radarData = metrics.map(m => ({
    category: m.category,
    value: m.score
  }));

  // Calculate midpoint for column split
  const midpoint = Math.ceil(metrics.length / 2);
  const firstColumnMetrics = metrics.slice(0, midpoint);
  const secondColumnMetrics = metrics.slice(midpoint);

  return (
    <Document>
      {/* Page 1: Assessment Results */}
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Assessment Report</Text>
            <Text style={styles.subtitle}>{userInfo.company}</Text>
            <Text style={styles.subtitle}>{`${userInfo.firstName} ${userInfo.lastName}`}</Text>
            <Text style={styles.subtitle}>{userInfo.email}</Text>
          </View>
          <Image 
            src="/logo/logo-Tehnopol.png"
            style={styles.headerLogo}
          />
        </View>

        {/* Radar Chart */}
        <View style={[styles.section, { marginBottom: 0 }]}>
          <Text style={styles.subtitle}>Performance Overview</Text>
          <RadarChartPDF data={radarData} />
        </View>

        {/* Overall Score */}
        <View style={[styles.section, { marginTop: 0 }]}>
          <Text style={styles.subtitle}>Overall Score</Text>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Total Performance</Text>
            <Text style={styles.metricValue}>{overallScore}%</Text>
          </View>
          <View style={styles.metricBar}>
            <View style={[styles.metricFill, { width: `${overallScore}%` }]} />
          </View>
        </View>

        {/* Page Number for Page 1 */}
        <Text style={styles.pageNumber}>1 / 3</Text>
      </Page>

      {/* Page 2: Detailed Metrics (Two Columns) */}
      <Page size="A4" style={styles.page}> 
         {/* Add the full header structure including the logo */}
         <View style={styles.header}>
             {/* Keep Title */} 
             <View style={styles.headerContent}>
                <Text style={styles.title}>Detailed Metrics</Text>
             </View>
             {/* Add Logo */}
             <Image 
                src="/logo/logo-Tehnopol.png"
                style={styles.headerLogo}
            />
         </View>

         {/* Section containing the two columns */}
         <View style={styles.section}>
          <View style={styles.pageColumnContainer}>
            {/* First Column */}
            <View style={styles.pageColumn}>
              {firstColumnMetrics.map((metric, index) => (
                <View key={`col1-${index}`} style={styles.metricItemContainer}>
                  <View style={styles.metricRow}>
                    <Text style={styles.metricLabel}>{metric.category}</Text>
                    <Text style={styles.metricValue}>{metric.score}%</Text>
                  </View>
                  <View style={styles.metricBar}>
                    <View style={[styles.metricFill, { width: `${metric.score}%` }]} />
                  </View>
                  {metric.description && (
                    <Text style={styles.metricDescription}>
                      {metric.description}
                    </Text>
                  )}
                </View>
              ))}
            </View>

            {/* Second Column */}
            <View style={styles.pageColumn}>
              {secondColumnMetrics.map((metric, index) => (
                <View key={`col2-${index}`} style={styles.metricItemContainer}>
                  <View style={styles.metricRow}>
                    <Text style={styles.metricLabel}>{metric.category}</Text>
                    <Text style={styles.metricValue}>{metric.score}%</Text>
                  </View>
                  <View style={styles.metricBar}>
                    <View style={[styles.metricFill, { width: `${metric.score}%` }]} />
                  </View>
                  {metric.description && (
                    <Text style={styles.metricDescription}>
                      {metric.description}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        </View>

         {/* Page Number for Page 2 */}
         <Text style={styles.pageNumber}>2 / 3</Text> 
      </Page>

      {/* Page 3: Solution Providers */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Matched Solution Providers</Text>
            <Text style={styles.subtitle}>Based on your assessment results</Text>
          </View>
          <Image 
            src="/logo/logo-Tehnopol.png"
            style={styles.headerLogo}
          />
        </View>

        {providers.map((provider, index) => (
          <View key={index} style={styles.providerCard}>
            <Image 
              src={provider.logo}
              style={styles.logo}
            />
            <Text style={styles.providerName}>{provider.name}</Text>
            <Text style={styles.providerDetails}>{provider.shortDescription}</Text>
            <Text style={styles.providerDetails}>{provider.providerUrl}</Text>
            <View style={styles.contactInfo}>
              <Text>{provider.contactName}</Text>
              <Text>Email: {provider.contactEmail}</Text>
              <Text>Phone: {provider.contactPhone}</Text>
            </View>
          </View>
        ))}

        {/* Page Number for Page 3 */}
        <Text style={styles.pageNumber}>3 / 3</Text>
      </Page>
    </Document>
  );
};

export const downloadReport = async ({ metrics, overallScore, providers, userInfo }: {
  metrics: Metric[];
  overallScore: any;
  providers: any;
  userInfo: any;
}) => {
  console.log('Generating PDF report with userInfo:', userInfo);
  const report = (
    <AssessmentReport
      metrics={metrics}
      overallScore={overallScore}
      providers={providers}
      userInfo={userInfo}
    />
  );
  try {
    console.log('Calling pdf(report).toBlob()');
    const blob = await pdf(report).toBlob();
    console.log('PDF blob created:', blob, 'size:', blob.size, 'type:', blob.type);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'assessment-report.pdf';
    console.log('Triggering download via dispatchEvent...');
    document.body.appendChild(link);
    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true, view: window });
    link.dispatchEvent(clickEvent);
    // Fallback: if dispatchEvent didn't trigger the download, attempt window.open after 500ms
    setTimeout(() => {
      console.log('Fallback: attempting window.open');
      window.open(url, '_blank');
      if(document.body.contains(link)) {
        document.body.removeChild(link);
      }
      window.URL.revokeObjectURL(url);
    }, 500);
    console.log('Download process initiated.');
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}; 