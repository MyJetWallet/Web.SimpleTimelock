// Source code to interact with smart contract
//const { lib: Web3} = require('web3');
var account;
var contract;
// web3 provider with fallback for old version
window.addEventListener('load', async () => {
    // New web3 provider
    if (window.ethereum) {
        window.web3 = new Web3(ethereum);
        console.log(window.web3);
        try {
            // ask user for permission
            await ethereum.enable();
            // user approved permission
        } catch (error) {
            // user rejected permission
            console.log('user rejected permission');
        }
    }
    // Old web3 provider
    else if (window.web3) {
        window.web3 = new Web3(web3.currentProvider);
        // no need to ask for permission
    }
    // No web3 provider
    else {
        console.log('No web3 provider detected');
    }

    // contractAddress and abi are setted after contract deploy
    var contractAddress = '0x42ca190eF9A342E650E7d13F465e6D134bF97C07';
    var abi = [
      {
        "inputs": [
          {
            "internalType": "contract IERC20",
            "name": "token_",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "owner_",
            "type": "address"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "beneficiaryAddress_",
            "type": "address"
          }
        ],
        "name": "beneficiaryRecord",
        "outputs": [
          {
            "components": [
              {
                "internalType": "uint256",
                "name": "lastUnlockTime",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "tokenAmount",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "releaseTime",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "unlockInterval",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "unlockAmount",
                "type": "uint256"
              }
            ],
            "internalType": "struct SimpleTimelock.BeneficiaryRecord",
            "name": "",
            "type": "tuple"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "beneficiaryAddress_",
            "type": "address"
          }
        ],
        "name": "expectedRelease",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "lockedTokens",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "release",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "beneficiaryAddress_",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "tokenAmount_",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "releaseTime_",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "unlockInterval_",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "unlockAmount_",
            "type": "uint256"
          }
        ],
        "name": "setBeneficiary",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "newOwner_",
            "type": "address"
          }
        ],
        "name": "setNewOwner",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "token",
        "outputs": [
          {
            "internalType": "contract IERC20",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ];

    contract = new web3.eth.Contract(abi, contractAddress);

    web3.eth.getAccounts(function (err, accounts) {
        if (err != null) {
            alert("Error retrieving accounts.");
            return;
        }
        if (accounts.length == 0) {
            alert("No account found! Make sure the Ethereum client is configured properly.");
            return;
        }
        account = accounts[0];
        console.log('Account: ' + account);
        web3.eth.defaultAccount = account;
    });

});

//Smart contract functions
function release() {
    
    contract.methods.release().send({ from: account }).then(function (tx) {
        console.log("Transaction: ", tx);
        document.getElementById('transaction').innerHTML = tx;
    });
}

function loadInfo() {
    getBlock()
    .then(x =>getBeneficiaryRecord())
    .then(x =>getLockedTokens())
    .then(x =>getExpectedRelease());
}

function getBlock() {
    return web3.eth.getBlockNumber().then(latestBlockNumber => {
        document.getElementById('blockNumber').innerHTML = latestBlockNumber;
        web3.eth.getBlock(latestBlockNumber).then(data => {
            document.getElementById('timestamp').innerHTML = data.timestamp;
        })
      });
}

/*struct BeneficiaryRecord {
        uint256 lastUnlockTime;
        uint256 tokenAmount;
        uint256 releaseTime;
        uint256 unlockInterval;
        uint256 unlockAmount;
    }*/
function getBeneficiaryRecord() {
    return contract.methods.beneficiaryRecord(account).call().then(
        function (info) {
            console.log("beneficiaryRecord: ", info);
            document.getElementById('beneficiaryRecord').innerHTML = info;
            document.getElementById('unlockInterval').innerHTML = info[3];
            document.getElementById('unlockAmount').innerHTML = info[4];
            var date = new Date(info[2] * 1000);
            document.getElementById('releaseTime').innerHTML = date;
            document.getElementById('tokenAmount').innerHTML = info[1];
        });
}

function getExpectedRelease() {
    return contract.methods.expectedRelease(account).call({from: account}, "pending").then(
        function (info) {
            console.log("expectedRelease: ", info);
            document.getElementById('expectedRelease').innerHTML = info;
        });
}

function getLockedTokens() {
    return contract.methods.lockedTokens().call({from: account}, "pending").then(
        function (info) {
            console.log("lockedTokens: ", info);
            document.getElementById('lockedTokens').innerHTML = info;
        });
}

function getExpectedReleaseLast() {
    return contract.methods.expectedRelease(account).call().then(
        function (info) {
            console.log("expectedReleaseLast: ", info);
            //document.getElementById('expectedRelease').innerHTML = info;
        });
}

