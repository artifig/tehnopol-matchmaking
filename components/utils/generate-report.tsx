import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 5,
  },
  section: {
    margin: 10,
    padding: 10,
  },
  metricsContainer: {
    marginVertical: 15,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  metricLabel: {
    flex: 1,
    fontSize: 12,
    color: '#4B5563',
  },
  metricValue: {
    fontSize: 12,
    color: '#1F2937',
    marginLeft: 10,
  },
  metricBar: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    marginTop: 4,
  },
  metricFill: {
    height: '100%',
    backgroundColor: '#F97316',
    borderRadius: 3,
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
});

interface Metric {
  category: string;
  value: number;
}

interface Provider {
  name: string;
  logo: string;
  shortDescription: string;
  details: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  contactRole: string;
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

export const AssessmentReport = ({ metrics, overallScore, providers, userInfo }: AssessmentReportProps) => (
  <Document>
    {/* Page 1: Assessment Results */}
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Assessment Report</Text>
        <Text style={styles.subtitle}>{userInfo.company}</Text>
        <Text style={styles.subtitle}>{`${userInfo.firstName} ${userInfo.lastName}`}</Text>
        <Text style={styles.subtitle}>{userInfo.email}</Text>
      </View>

      {/* Overall Score */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>Overall Score</Text>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Total Performance</Text>
          <Text style={styles.metricValue}>{overallScore}%</Text>
        </View>
        <View style={styles.metricBar}>
          <View style={[styles.metricFill, { width: `${overallScore}%` }]} />
        </View>
      </View>

      {/* Detailed Metrics */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>Detailed Metrics</Text>
        <View style={styles.metricsContainer}>
          {metrics.map((metric, index) => (
            <View key={index} style={styles.metricRow}>
              <Text style={styles.metricLabel}>{metric.category}</Text>
              <Text style={styles.metricValue}>{metric.value}%</Text>
              <View style={styles.metricBar}>
                <View style={[styles.metricFill, { width: `${metric.value}%` }]} />
              </View>
            </View>
          ))}
        </View>
      </View>

      <Text style={styles.pageNumber}>1/2</Text>
    </Page>

    {/* Page 2: Solution Providers */}
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Matched Solution Providers</Text>
        <Text style={styles.subtitle}>Based on your assessment results</Text>
      </View>

      {providers.map((provider, index) => (
        <View key={index} style={styles.providerCard}>
          <Image 
            src={provider.logo}
            style={styles.logo}
          />
          <Text style={styles.providerName}>{provider.name}</Text>
          <Text style={styles.providerDetails}>{provider.shortDescription}</Text>
          <Text style={styles.providerDetails}>{provider.details}</Text>
          <View style={styles.contactInfo}>
            <Text>{provider.contactName} - {provider.contactRole}</Text>
            <Text>Email: {provider.contactEmail}</Text>
            <Text>Phone: {provider.contactPhone}</Text>
          </View>
        </View>
      ))}

      <Text style={styles.pageNumber}>2/2</Text>
    </Page>
  </Document>
); 