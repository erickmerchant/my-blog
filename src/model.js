const fetch = async (url, options = {}) => {
  const res = await window.fetch(url, {
    ...options,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`);
  }

  return res;
};

export const createModel = () => {
  return {
    getBySlug(id = '_latest') {
      return fetch(`/assets/content/${id}.json`).then((res) => res.json());
    },
  };
};
