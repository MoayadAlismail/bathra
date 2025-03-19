
import axiosInstance from '@/lib/axios';

export const api = {
  get: async (url: string) => {
    try {
      console.log(`API request: GET ${url}`);
      
      // For now, return mock data since we don't have a backend yet
      if (url === '/startups') {
        console.log('Returning mock startup data');
        return {
          data: [
            {
              id: '1',
              name: 'TechVision AI',
              description: 'Revolutionary AI solutions for enterprises',
              image: '/placeholder.svg',
              valuation: 5000000,
              raised: 2000000,
              roi: 25,
            },
            {
              id: '2',
              name: 'GreenEnergy Solutions',
              description: 'Sustainable energy technologies',
              image: '/placeholder.svg',
              valuation: 3000000,
              raised: 1500000,
              roi: 20,
            },
            {
              id: '3',
              name: 'HealthTech Innovators',
              description: 'Digital health platform for remote care',
              image: '/placeholder.svg',
              valuation: 4000000,
              raised: 1800000,
              roi: 30,
            },
          ],
        };
      }
      
      const response = await axiosInstance.get(url);
      console.log(`API response success:`, response);
      return response;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
  // Add other methods (post, put, delete) as needed
};
