import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '../services/apiClient';
import type { LineaAcademica } from '../types/models';

interface AcademicState {
  lineas: LineaAcademica[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

const initialState: AcademicState = {
  lineas: [],
  loading: false,
  error: null,
  lastFetched: null,
};

export const fetchLineas = createAsyncThunk(
  'academic/fetchLineas',
  async () => {
    const { data } = await apiClient.get('/lineas-academicas/menu');

    const lineas = Array.isArray(data) ? data : data.data || [];

    return lineas.filter((l: LineaAcademica) => l.estado === 'Publicado');
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as { academic: AcademicState };

      // Ya hay una petición en curso.
      if (state.academic.loading) {
        return false;
      }

      // Los datos todavía están vigentes (5 minutos).
      if (
        state.academic.lineas.length > 0 &&
        state.academic.lastFetched &&
        Date.now() - state.academic.lastFetched < 300000
      ) {
        return false;
      }

      return true;
    },
  },
);

const academicSlice = createSlice({
  name: 'academic',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLineas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLineas.fulfilled, (state, action) => {
        state.loading = false;
        state.lineas = action.payload;
        state.lastFetched = Date.now();
      })
      .addCase(fetchLineas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al cargar líneas';
      });
  },
});

export default academicSlice.reducer;
