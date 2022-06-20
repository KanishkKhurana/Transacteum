//singular place where frontend and blockchain talk to each other
import React, { useEffect, useState } from 'react';
import {ethers} from 'ethers';
import { contractABI, contractAddress } from '../utils/constants';
export const TransactionContext = React.createContext();
const {ethereum} = window; // we have this because we have metamask  

const getEthereumContract = () => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const transactionContract = new ethers.Contract(contractAddress, contractABI, signer);

    // console.log(
    //     provider, 
    //     signer,
    //     transactionContract
    // )

    return transactionContract;
}

export const TransactionProvider = ({children}) => {

    const [currentAccount, setcurrentAccount] = useState("");
    const [formData, setFormData] = useState({addressTo: "", amount: "", keyword: "", message: ""});
    const [isLoading, setIsLoading] = useState(false);
    const [transactionCount, settransactionCount] = useState(localStorage.getItem("transactionCount") || 0);
    const [transactions, setTransactions] = useState([]);

    const handleChange = (e, name) => {
        setFormData((prevState) => ({...prevState, [name]:e.target.value}));
    }

    const getAllTransactions = async () => {
        try {
            if (ethereum) {
                const transactionsContract = getEthereumContract();
        
                const availableTransactions = await transactionsContract.getAllTransactions();
                // console.log(availableTransactions);
                const structuredTransactions = availableTransactions.map((transaction) => ({
                  addressTo: transaction.receiver,
                  addressFrom: transaction.sender,
                  timestamp: new Date(transaction.timestamp.toNumber() * 1000).toLocaleString(),
                  message: transaction.message,
                  keyword: transaction.keyword,
                  amount: parseInt(transaction.amount._hex) / (10 ** 18)
                }));
        
                // console.log(structuredTransactions);
        
                setTransactions(structuredTransactions);
              } else {
                console.log("Ethereum is not present");
              }
            
        } catch (error) {
            console.log(error);
        }
    };


    const checkIfWalletIsConnected = async () => {
        try {
            if(!ethereum) return alert('Please connect to a metamask wallet');

        const accounts = await ethereum.request({method:'eth_accounts'})

        if(accounts.length){
            setcurrentAccount(accounts[0]);
            getAllTransactions();
        }else{
            console.log('no accounts found')
        }

            
        } catch (error) {
            console.log(error);
            throw new error('No ethereum object');
        }  
    };

    const checkIfTransactionsExists = async () => {
        try {
          if (ethereum) {
            const transactionsContract = getEthereumContract();
            const currentTransactionCount = await transactionsContract.getTransactionCount();
            
    
            window.localStorage.setItem("transactionCount", currentTransactionCount);
          }
        } catch (error) {
          console.log(error);
    
          throw new Error("No ethereum object");
        }
      };



    const connectWallet = async () => {
        try {
            if(!ethereum) return alert('Please connect to a metamask wallet');

            const accounts = await ethereum.request({method:'eth_requestAccounts',}) 
            setcurrentAccount(accounts[0]);
            window.location.reload();
        } catch (error) {
            console.log(error);
            throw new error('No ethereum object');
        }
    };

    const sendTransaction = async () => {
        try{
            if(!ethereum) return alert('Please connect to a metamask wallet');
            const { addressTo, amount, keyword, message } = formData;
            const transactionContract= getEthereumContract();
            const parsedAmount = ethers.utils.parseEther(amount);

            await ethereum.request({ //used to send ethereum from one address to another
                method: 'eth_sendTransaction',
                params: [{
                    from: currentAccount,
                    to: addressTo,
                    gas:'0x5208', //values in ETH network are in hexadecimal
                    value:parsedAmount._hex
                }]
            })

            const transactionHash = await transactionContract.addToBlockchain(addressTo, parsedAmount, message, keyword );
            setIsLoading(true);
            console.log('Loading - ${transactionHash.hash}');
            setIsLoading(false);
            console.log('Successfully Loaded - ${transactionHash.hash}');
            
            const transactionCount = await transactionContract.getTransactionCount();
            settransactionCount(transactionCount.toNumber());


        }catch(error){
            console.log(error);
            throw new error('No ethereum object');
        }
    }


    useEffect(() => {
        checkIfWalletIsConnected();
        checkIfTransactionsExists();
    },[])



    return(
        <TransactionContext.Provider value={{connectWallet, currentAccount, formData, setFormData, handleChange, sendTransaction, isLoading, transactions }}>
            {children}
        </TransactionContext.Provider>
    )
}