export const storageService = {
  set(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  get(key: string) {
    const val = localStorage.getItem(key);
    try {
      return val ? JSON.parse(val) : null;
    } catch {
      return null;
    }
  },
  remove(key: string) {
    localStorage.removeItem(key);
  },
  clear() {
    localStorage.clear();
  },
};
