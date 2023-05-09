let observer;

export default {
  mounted(el, binding) {
    observer = new ResizeObserver((entries) => {
      const rect = {};
      for (const entry of entries) {
        if (entry.contentBoxSize) {
          const contentBoxSize = Array.isArray(entry.contentBoxSize)
            ? entry.contentBoxSize[0]
            : entry.contentBoxSize;
          rect.width = contentBoxSize.inlineSize;
          rect.height = contentBoxSize.blockSize;
        } else {
          rect.width = entry.contentRect.width;
          rect.height = entry.contentRect.height;
        }
      }
      if (binding.value != null) {
        binding.value(rect);
      }
    });
    observer.observe(el);
  },
  unmounted(el) {
    observer.unobserve(el);
  },
};
