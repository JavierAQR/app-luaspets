import { Dimensions, StyleSheet } from "react-native";

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f5f5f5',
    },
    mainTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: '#333',
      textAlign: 'center',
      marginTop: 20,
      marginBottom: 15,
      paddingHorizontal: 20,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#f0f0f0',
      marginHorizontal: 20,
      borderRadius: 25,
      paddingHorizontal: 15,
      marginBottom: 20,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      paddingVertical: 12,
      fontSize: 15,
      color: '#333',
    },
    categoriesContainer: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      marginBottom: 20,
      gap: 10,
    },
    categoryTab: {
      paddingVertical: 8,
      paddingHorizontal: 20,
      borderBottomWidth: 3,
      borderBottomColor: 'transparent',
    },
    activeCategoryTab: {
      borderBottomColor: '#c568f2',
    },
    categoryText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#666',
    },
    activeCategoryText: {
      color: '#c568f2',
    },
    servicesScroll: {
      flex: 1,
    },
    servicesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: 20,
      paddingBottom: 100,
      gap: 20,
    },
    serviceCard: {
      width: CARD_WIDTH,
      backgroundColor: '#fff',
      borderRadius: 20,
      padding: 15,
      alignItems: 'center',
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    serviceCardSelected: {
      borderWidth: 3,
      borderColor: '#c568f2',
    },
    serviceCardDisabled: {
      opacity: 0.6,
      backgroundColor: '#fafafa',
    },
    imageContainer: {
      position: 'relative',
      marginBottom: 10,
    },
    serviceImage: {
      width: CARD_WIDTH - 30,
      height: CARD_WIDTH - 30,
      borderRadius: 100,
    },
    imageDisabled: {
      opacity: 0.5,
    },
    checkBadge: {
      position: 'absolute',
      top: 5,
      right: 5,
      backgroundColor: '#c568f2',
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 3,
      borderColor: '#fff',
    },
    outOfStockBadge: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: [{ translateX: -40 }, { translateY: -15 }],
      backgroundColor: 'rgba(0,0,0,0.7)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },
    outOfStockText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '700',
    },
    serviceName: {
      fontSize: 16,
      fontWeight: '700',
      color: '#333',
      textAlign: 'center',
      marginBottom: 5,
    },
    servicePrice: {
      fontSize: 18,
      fontWeight: '700',
      color: '#c568f2',
      marginBottom: 5,
    },
    stockContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      marginTop: 5,
    },
    stockText: {
      fontSize: 13,
      color: '#666',
      fontWeight: '600',
    },
    stockLow: {
      color: '#e74c3c',
    },
    textDisabled: {
      color: '#999',
    },
    floatingButtonContainer: {
      position: 'absolute',
      bottom: 20,
      left: 20,
      right: 20,
    },
    floatingButton: {
      backgroundColor: '#c568f2',
      borderRadius: 50,
      paddingVertical: 16,
      alignItems: 'center',
      elevation: 5,
      shadowColor: '#c568f2',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    floatingButtonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: '700',
    },
  });

  export default styles;