// src/utils/errorUtils.js
export const firstError = (errObj, key) =>
    (errObj && (errObj[key] || errObj[`errors.${key}`])) || '';