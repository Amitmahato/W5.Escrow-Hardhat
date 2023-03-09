import { Contract, ethers } from "ethers";
import { useCallback, useEffect, useState } from "react";
import deploy from "./deploy";
import Escrow from "./Escrow";
import {
  getStoredContractAddresses,
  storeContractAddress,
} from "./localStorage";
import ContractJSON from "./artifacts/contracts/Escrow.sol/Escrow.json";

const abi = ContractJSON.abi;
const provider = new ethers.providers.Web3Provider(window.ethereum);

export async function approve(escrowContract, signer) {
  const approveTxn = await escrowContract.connect(signer).approve();
  await approveTxn.wait();
}

function App() {
  const [escrows, setEscrows] = useState([]);
  const [account, setAccount] = useState();
  const [signer, setSigner] = useState();

  useEffect(() => {
    async function getAccounts() {
      const accounts = await provider.send("eth_requestAccounts", []);

      setAccount(accounts[0]);
      setSigner(provider.getSigner());
    }

    getAccounts();
  }, [account]);

  useEffect(() => {
    const getContracts = async () => {
      const _escrows = [];
      const contractAddresses = getStoredContractAddresses();
      const escrowContracts = contractAddresses.map(
        (address) => new Contract(address, abi, signer)
      );
      escrowContracts.forEach(async (contract, index) => {
        const [arbiter, beneficiary, depositor, balance, approved] =
          await Promise.all([
            contract.arbiter(),
            contract.beneficiary(),
            contract.depositor(),
            provider.getBalance(contract.address),
            contract.isApproved(),
          ]);

        _escrows.push({
          address: contract.address,
          value: ethers.utils.formatEther(balance).toString(),
          arbiter,
          beneficiary,
          depositor,
          approved,
        });

        if (index + 1 === escrowContracts.length) {
          setEscrows(_escrows);
        }
      });
    };

    getContracts();
  }, [signer]);

  const handleApprove = useCallback(
    async (address) => {
      const contract = new Contract(address, abi, signer);
      contract.on("Approved", async () => {
        const approvedContractIndex = escrows.findIndex(
          (escrow) => escrow.address === address
        );

        setEscrows(() => {
          const contracts = [...escrows];
          contracts[approvedContractIndex].approved = true;
          return contracts;
        });
      });

      await approve(contract, signer);
    },
    [escrows, signer]
  );

  async function newContract() {
    const beneficiary = document.getElementById("beneficiary").value;
    const arbiter = document.getElementById("arbiter").value;
    const value = ethers.utils.parseEther(document.getElementById("eth").value);
    const escrowContract = await deploy(signer, arbiter, beneficiary, value);
    storeContractAddress(escrowContract.address);

    const escrow = {
      address: escrowContract.address,
      arbiter,
      beneficiary,
      value: value.toString(),
    };

    setEscrows([...escrows, escrow]);
  }

  return (
    <div className="wrapper">
      <div className="contract">
        <h1> New Contract </h1>
        <label>
          Arbiter Address
          <input type="text" id="arbiter" />
        </label>

        <label>
          Beneficiary Address
          <input type="text" id="beneficiary" />
        </label>

        <label>
          Deposit Amount (in ETH)
          <input type="text" id="eth" />
        </label>

        <div
          className="button"
          id="deploy"
          onClick={(e) => {
            e.preventDefault();

            newContract();
          }}
        >
          Deploy
        </div>

        <i className="count">
          Total Existing Contracts: <b>{escrows.length}</b>
        </i>
      </div>

      <div className="existing-contracts">
        <h1> Existing Contracts </h1>

        <div id="container">
          {escrows.map((escrow) => {
            return (
              <Escrow
                key={escrow.address}
                {...escrow}
                disabled={
                  escrow.approved ||
                  account !== escrow.arbiter.toLocaleLowerCase()
                }
                handleApprove={() => handleApprove(escrow.address)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default App;
