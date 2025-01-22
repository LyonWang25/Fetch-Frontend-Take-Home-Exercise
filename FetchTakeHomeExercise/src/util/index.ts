export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
) {
  let timeout: NodeJS.Timeout;

  const debouncedFunc = (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };

  // Add cancel method
  debouncedFunc.cancel = () => {
    clearTimeout(timeout);
  };

  return debouncedFunc;
}