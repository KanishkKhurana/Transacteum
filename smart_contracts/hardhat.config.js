require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: "0.8.4",
  networks: {
    local:{
      url: "HTTP://127.0.0.1:7545",
      accounts: ['6148b73ff8da0bd4be9d0b60d8f4e3955192c8c8262e4468fe73cff18ce583f3']
    }
}


};