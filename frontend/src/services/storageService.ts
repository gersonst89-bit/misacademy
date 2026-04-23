export const storageService = {
  set(key: string, value: any) {
    sessionStorage.setItem(key, JSON.stringify(value));
  },
  get(key: string) {
    const val = sessionStorage.getItem(key);
    try {
      return val ? JSON.parse(val) : null;
    } catch {
      return null;
    }
  },
  remove(key: string) {
    sessionStorage.removeItem(key);
  },
  clear() {
    sessionStorage.clear();
  },
};
