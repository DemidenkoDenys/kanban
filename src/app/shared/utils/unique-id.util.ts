export const uniqueId = crypto.randomUUID();
export const getUniqueId = () => crypto.getRandomValues(new Uint32Array(1))[0];
