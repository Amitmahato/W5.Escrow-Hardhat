export const getStoredContractAddresses = () => {
  let contractAddresses = localStorage.getItem("contractAddresses");
  if (!contractAddresses) {
    contractAddresses = JSON.stringify([]);
  }

  return JSON.parse(contractAddresses);
};

export const storeContractAddress = async (contractAddress) => {
  let storedAddresses = getStoredContractAddresses();
  storedAddresses = [...storedAddresses, contractAddress];
  const storeContractAddresses = JSON.stringify(storedAddresses);

  return Promise.resolve().then(function () {
    localStorage.setItem("contractAddresses", storeContractAddresses);
  });
};
