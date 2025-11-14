import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { Query } from '../types/query';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const useQueries = () => {
  return useQuery({
    queryKey: ['queries'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Query[]>>('/queries');
      return res.data.data;
    },
  });
};
