export const USER_ROLES = {
  ADMINISTRADOR: 1,
  DOCENTE: 2,
  ESTUDIANTE: 3,
} as const;

export const isAdminOrDocente = (role: unknown): boolean => {
  const numericRole = Number(role);

  return numericRole === USER_ROLES.ADMINISTRADOR || numericRole === USER_ROLES.DOCENTE;
};
