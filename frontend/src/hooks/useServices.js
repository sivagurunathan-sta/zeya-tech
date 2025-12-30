// Complete useServices.js hook
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { servicesAPI } from '../services/api';
import toast from 'react-hot-toast';

export const useServices = (options = {}) => {
  const queryClient = useQueryClient();

  // Query for fetching services
  const servicesQuery = useQuery(
    'services',
    async () => {
      try {
        console.log('🔍 Fetching services...');
        const response = await servicesAPI.getAll();
        console.log('✅ Services API response:', response);
        return response;
      } catch (error) {
        console.error('❌ Services fetch error:', error);
        throw error;
      }
    },
    {
      refetchOnWindowFocus: false,
      staleTime: 2 * 60 * 1000, // 2 minutes
      cacheTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error) => {
        // Don't retry on auth errors or client errors
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
      onError: (error) => {
        if (options.showErrorToast !== false) {
          const message = error?.response?.data?.message || 'Failed to load services';
          console.error('Services query error:', message);
          toast.error(message);
        }
      },
      onSuccess: (response) => {
        console.log('Services loaded successfully:', response?.data);
      },
      ...options
    }
  );

  // Create service mutation
  const createService = useMutation(
    async (serviceData) => {
      console.log('🔨 Creating service:', serviceData);
      try {
        const response = await servicesAPI.create(serviceData);
        console.log('✅ Service created:', response);
        return response;
      } catch (error) {
        console.error('❌ Service creation error:', error);
        throw error;
      }
    },
    {
      onSuccess: (response) => {
        console.log('Service creation success:', response);
        queryClient.invalidateQueries('services');
        // Force refetch
        setTimeout(() => {
          queryClient.refetchQueries('services');
        }, 100);
      },
      onError: (error) => {
        const message = error?.response?.data?.message || 'Failed to create service';
        console.error('Create service error:', error);
        toast.error(message);
      }
    }
  );

  // Update service mutation
  const updateService = useMutation(
    async ({ id, data }) => {
      console.log('🔧 Updating service:', id, data);
      try {
        const response = await servicesAPI.update(id, data);
        console.log('✅ Service updated:', response);
        return response;
      } catch (error) {
        console.error('❌ Service update error:', error);
        throw error;
      }
    },
    {
      onSuccess: (response) => {
        console.log('Service update success:', response);
        queryClient.invalidateQueries('services');
        // Force refetch
        setTimeout(() => {
          queryClient.refetchQueries('services');
        }, 100);
      },
      onError: (error) => {
        const message = error?.response?.data?.message || 'Failed to update service';
        console.error('Update service error:', error);
        toast.error(message);
      }
    }
  );

  // Delete service mutation
  const deleteService = useMutation(
    async (id) => {
      console.log('🗑️ Deleting service:', id);
      try {
        const response = await servicesAPI.delete(id);
        console.log('✅ Service deleted:', response);
        return response;
      } catch (error) {
        console.error('❌ Service deletion error:', error);
        throw error;
      }
    },
    {
      onSuccess: (response) => {
        console.log('Service deletion success:', response);
        queryClient.invalidateQueries('services');
        // Force refetch
        setTimeout(() => {
          queryClient.refetchQueries('services');
        }, 100);
      },
      onError: (error) => {
        const message = error?.response?.data?.message || 'Failed to delete service';
        console.error('Delete service error:', error);
        toast.error(message);
      }
    }
  );

  // Toggle service status mutation
  const toggleServiceStatus = useMutation(
    async (id) => {
      console.log('🔄 Toggling service status:', id);
      try {
        const response = await servicesAPI.toggleStatus(id);
        console.log('✅ Service status toggled:', response);
        return response;
      } catch (error) {
        console.error('❌ Service toggle error:', error);
        throw error;
      }
    },
    {
      onSuccess: (response) => {
        console.log('Service toggle success:', response);
        queryClient.invalidateQueries('services');
        // Force refetch
        setTimeout(() => {
          queryClient.refetchQueries('services');
        }, 100);
      },
      onError: (error) => {
        const message = error?.response?.data?.message || 'Failed to update service status';
        console.error('Toggle service error:', error);
        toast.error(message);
      }
    }
  );

  // Helper function to refresh services
  const refreshServices = async () => {
    console.log('🔄 Refreshing services...');
    queryClient.invalidateQueries('services');
    return servicesQuery.refetch();
  };

  // Helper function to get services data with proper fallback
  const getServicesData = () => {
    const rawData = servicesQuery.data;
    console.log('Raw services data:', rawData);

    // Handle different possible response structures
    if (rawData?.data?.data && Array.isArray(rawData.data.data)) {
      return rawData.data.data;
    }
    if (rawData?.data && Array.isArray(rawData.data)) {
      return rawData.data;
    }
    if (Array.isArray(rawData)) {
      return rawData;
    }

    console.log('No services data found, returning empty array');
    return [];
  };

  const services = getServicesData();

  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('useServices hook state:', {
      isLoading: servicesQuery.isLoading,
      error: servicesQuery.error,
      servicesCount: services.length,
      rawData: servicesQuery.data
    });
  }

  return {
    // Query data
    services,
    isLoading: servicesQuery.isLoading,
    error: servicesQuery.error,
    isError: servicesQuery.isError,
    
    // Mutations
    createService,
    updateService,
    deleteService,
    toggleServiceStatus,
    
    // Loading states
    isCreating: createService.isLoading,
    isUpdating: updateService.isLoading,
    isDeleting: deleteService.isLoading,
    isToggling: toggleServiceStatus.isLoading,
    
    // Mutation results
    createError: createService.error,
    updateError: updateService.error,
    deleteError: deleteService.error,
    toggleError: toggleServiceStatus.error,
    
    // Helper functions
    refreshServices,
    refetch: servicesQuery.refetch,
    
    // Clear cache function
    clearCache: () => {
      queryClient.removeQueries('services');
    },
    
    // Force refresh function
    forceRefresh: () => {
      queryClient.invalidateQueries('services');
      queryClient.refetchQueries('services');
    },
    
    // Raw query object for advanced usage
    query: servicesQuery,
    
    // Additional helper functions
    getServiceById: (id) => services.find(service => service._id === id),
    getServicesByCategory: (category) => services.filter(service => service.category === category),
    getActiveServices: () => services.filter(service => service.active !== false),
    getPopularServices: () => services.filter(service => service.popular === true),
    
    // Statistics
    totalServices: services.length,
    activeServicesCount: services.filter(service => service.active !== false).length,
    popularServicesCount: services.filter(service => service.popular === true).length,
    
    // Categories
    categories: [...new Set(services.map(service => service.category).filter(Boolean))],
  };
};

export default useServices;