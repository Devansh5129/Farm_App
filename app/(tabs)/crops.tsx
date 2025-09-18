import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  Modal,
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Filter, Sprout, MapPin, Thermometer, Droplets, Sun, Calendar, Bug, Leaf, X } from 'lucide-react-native';
import cropsData from '@/assets/data/crops.json';

interface Crop {
  crop_name: string;
  region: string[];
  climate: {
    optimal_temp_c: string;
    rainfall_mm_per_year: string;
    soil_type: string;
    soil_moisture_percent: string;
    humidity_percent: string;
  };
  irrigation: {
    frequency: string;
    method: string[];
  };
  fertilizer: {
    recommendation: string;
  };
  pests_diseases: string[];
  market_info: {
    states: string[];
    season: string[];
  };
}

export default function CropsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const categories = ['All', 'Cereals', 'Fruits', 'Vegetables', 'Spices', 'Cash Crops'];

  const filteredCrops = useMemo(() => {
    let filtered = cropsData as Crop[];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(crop =>
        crop.crop_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        crop.region.some(region => region.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(crop => {
        const cropName = crop.crop_name.toLowerCase();
        switch (selectedCategory) {
          case 'Cereals':
            return ['paddy', 'rice', 'wheat', 'maize', 'millet', 'barley'].some(cereal => 
              cropName.includes(cereal)
            );
          case 'Fruits':
            return ['banana', 'mango', 'orange', 'apple', 'grapes', 'papaya', 'pineapple', 'guava', 'litchi', 'pomegranate', 'peach'].some(fruit => 
              cropName.includes(fruit)
            );
          case 'Vegetables':
            return ['potato', 'tomato', 'onion', 'cabbage', 'cauliflower', 'brinjal', 'okra', 'chili'].some(vegetable => 
              cropName.includes(vegetable)
            );
          case 'Spices':
            return ['turmeric', 'ginger', 'cardamom', 'coriander', 'cumin', 'black pepper'].some(spice => 
              cropName.includes(spice)
            );
          case 'Cash Crops':
            return ['sugarcane', 'cotton', 'groundnut', 'soybean', 'mustard', 'tea', 'coffee', 'jute', 'tobacco'].some(cash => 
              cropName.includes(cash)
            );
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [searchQuery, selectedCategory]);

  const openCropDetails = (crop: Crop) => {
    setSelectedCrop(crop);
    setModalVisible(true);
  };

  const renderCropCard = ({ item }: { item: Crop }) => (
    <TouchableOpacity
      style={styles.cropCard}
      onPress={() => openCropDetails(item)}
    >
      <View style={styles.cropHeader}>
        <View style={styles.cropIcon}>
          <Sprout size={24} color="#16A34A" />
        </View>
        <View style={styles.cropInfo}>
          <Text style={styles.cropName}>{item.crop_name}</Text>
          <View style={styles.regionContainer}>
            <MapPin size={14} color="#6B7280" />
            <Text style={styles.regionText}>
              {item.region.slice(0, 2).join(', ')}
              {item.region.length > 2 && ` +${item.region.length - 2} more`}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.cropDetails}>
        <View style={styles.detailRow}>
          <Thermometer size={16} color="#EF4444" />
          <Text style={styles.detailText}>{item.climate.optimal_temp_c}°C</Text>
        </View>
        <View style={styles.detailRow}>
          <Droplets size={16} color="#3B82F6" />
          <Text style={styles.detailText}>{item.climate.soil_moisture_percent}%</Text>
        </View>
        <View style={styles.detailRow}>
          <Calendar size={16} color="#F59E0B" />
          <Text style={styles.detailText}>{item.market_info.season.join(', ')}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Crop Database</Text>
        <Text style={styles.headerSubtitle}>Comprehensive agricultural information</Text>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search crops or regions..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      {/* Category Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryContainer}
        contentContainerStyle={styles.categoryContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === category && styles.categoryTextActive
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results Count */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          {filteredCrops.length} crop{filteredCrops.length !== 1 ? 's' : ''} found
        </Text>
      </View>

      {/* Crops List */}
      <FlatList
        data={filteredCrops}
        renderItem={renderCropCard}
        keyExtractor={(item) => item.crop_name}
        style={styles.cropsList}
        contentContainerStyle={styles.cropsListContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Crop Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedCrop && (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.modalTitleContainer}>
                    <Sprout size={24} color="#16A34A" />
                    <Text style={styles.modalTitle}>{selectedCrop.crop_name}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <X size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                  {/* Climate Requirements */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🌡️ Climate Requirements</Text>
                    <View style={styles.sectionContent}>
                      <View style={styles.infoRow}>
                        <Thermometer size={16} color="#EF4444" />
                        <Text style={styles.infoLabel}>Temperature:</Text>
                        <Text style={styles.infoValue}>{selectedCrop.climate.optimal_temp_c}°C</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Droplets size={16} color="#3B82F6" />
                        <Text style={styles.infoLabel}>Rainfall:</Text>
                        <Text style={styles.infoValue}>{selectedCrop.climate.rainfall_mm_per_year} mm/year</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Sun size={16} color="#F59E0B" />
                        <Text style={styles.infoLabel}>Humidity:</Text>
                        <Text style={styles.infoValue}>{selectedCrop.climate.humidity_percent}%</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Leaf size={16} color="#10B981" />
                        <Text style={styles.infoLabel}>Soil Type:</Text>
                        <Text style={styles.infoValue}>{selectedCrop.climate.soil_type}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Growing Regions */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📍 Growing Regions</Text>
                    <View style={styles.regionGrid}>
                      {selectedCrop.region.map((region, index) => (
                        <View key={index} style={styles.regionTag}>
                          <Text style={styles.regionTagText}>{region}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Irrigation */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>💧 Irrigation</Text>
                    <View style={styles.sectionContent}>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Frequency:</Text>
                        <Text style={styles.infoValue}>{selectedCrop.irrigation.frequency}</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Methods:</Text>
                        <Text style={styles.infoValue}>{selectedCrop.irrigation.method.join(', ')}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Fertilizer */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🌱 Fertilizer</Text>
                    <View style={styles.sectionContent}>
                      <Text style={styles.infoValue}>{selectedCrop.fertilizer.recommendation}</Text>
                    </View>
                  </View>

                  {/* Pests & Diseases */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🐛 Common Pests & Diseases</Text>
                    <View style={styles.pestGrid}>
                      {selectedCrop.pests_diseases.map((pest, index) => (
                        <View key={index} style={styles.pestTag}>
                          <Bug size={14} color="#DC2626" />
                          <Text style={styles.pestTagText}>{pest}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Market Info */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📈 Market Information</Text>
                    <View style={styles.sectionContent}>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Major States:</Text>
                        <Text style={styles.infoValue}>{selectedCrop.market_info.states.join(', ')}</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Season:</Text>
                        <Text style={styles.infoValue}>{selectedCrop.market_info.season.join(', ')}</Text>
                      </View>
                    </View>
                  </View>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  categoryContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categoryContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 12,
  },
  categoryButtonActive: {
    backgroundColor: '#16A34A',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  resultsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  resultsText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  cropsList: {
    flex: 1,
  },
  cropsListContent: {
    padding: 20,
  },
  cropCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cropHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cropIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cropInfo: {
    flex: 1,
  },
  cropName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  regionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  regionText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  cropDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginLeft: 12,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  sectionContent: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginLeft: 8,
    minWidth: 80,
  },
  infoValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
    flex: 1,
  },
  regionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  regionTag: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  regionTagText: {
    fontSize: 12,
    color: '#1E40AF',
    fontWeight: '500',
  },
  pestGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pestTag: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pestTagText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '500',
    marginLeft: 4,
  },
});