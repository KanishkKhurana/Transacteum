export const shortenAddress = (address) => `${address.slice(0, 5)}...${address.slice(address.length - 4)}`;
//both values are inclusive in the slice fn