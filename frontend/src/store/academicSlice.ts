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

// Acción asíncrona para cargar las líneas
export const fetchLineas = createAsyncThunk(
  'academic/fetchLineas',
  async (_, { getState }) => {
    const state = getState() as { academic: AcademicState };
    // Si se cargaron hace menos de 5 minutos, no volver a pedir
    if (state.academic.lineas.length > 0 && state.academic.lastFetched && Date.now() - state.academic.lastFetched < 300000) {
      return state.academic.lineas;
    }

    // Usa apiClient (axios) en lugar de fetch nativo para heredar interceptores globales
    const { data } = await apiClient.get('/lineas-academicas');
    return (data.data || []).filter((l: LineaAcademica) => l.estado === 'Publicado');
  }
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
