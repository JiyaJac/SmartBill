export const getActiveHousehold = () =>
  JSON.parse(localStorage.getItem("activeHousehold"));

export const getUser = () =>
  JSON.parse(localStorage.getItem("user"));