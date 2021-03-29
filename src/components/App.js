import React, { Component } from 'react'
import Web3 from 'web3'
import Navbar from './Navbar'
import Main from './Main'
import Token from '../abis/Token.json'
import EthSwap from '../abis/EthSwap.json'
import './App.css'

class App extends Component {

    async componentWillMount() { // this works in virual DOM and will work before render()
        await this.loadWeb3()
        await this.loadBlockchainData()
    }

    async loadBlockchainData() {
        // const web3 = window.web3
        const web3 = new Web3(window.web3.currentProvider); // If you are using metamask then initialize web3 like so

        const accounts = await web3.eth.getAccounts()
        this.setState({ account: accounts[0] })

        const ethBalance = await web3.eth.getBalance(this.state.account)
        this.setState({ ethBalance: ethBalance })
        // console.log(this.state.ethBalance)

        // Load Token
        // const abi = Token.abi
        const networkId = await web3.eth.net.getId() // making the code more dynamic
        const tokenData = Token.networks[networkId]
        if (tokenData) {
            // const address = tokenData.address
            const token = new web3.eth.Contract(Token.abi, tokenData.address)
            this.setState({ token: token })
            let tokenBalance = await token.methods.balanceOf(this.state.account).call() // call() helps to fetch information from the blockchain
            // console.log('tokenBalance: ', tokenBalance.toString())
            this.setState({ tokenBalance: tokenBalance.toString() })

        } else {
            window.alert('Token contract not deployed to detected network')
        }

        // Load EthSwap
        const ethSwapData = EthSwap.networks[networkId]
        if (ethSwapData) {
            const ethSwap = new web3.eth.Contract(EthSwap.abi, ethSwapData.address)
            this.setState({ ethSwap: ethSwap })
        } else {
            window.alert('EthSwap contract not deployed to detected network')
        }

        // console.log(this.state.ethSwap)
        this.setState({ loading: false })
    }

    async loadWeb3() {
        // window.addEventListener('load', async () => {
            // Modern dapp browsers...
            if (window.ethereum) {
                window.web3 = new Web3(window.ethereum);
                // try {
                // Request account access if needed
                await window.ethereum.enable();
                // Acccounts now exposed
                // web3.eth.sendTransaction({/* ... */});
                // } catch (error) {
                //     // User denied account access...
                // }
            }
            // Legacy dapp browsers...
            else if (window.web3) {
                window.web3 = new Web3(window.web3.currentProvider);
                // Acccounts always exposed
                // web3.eth.sendTransaction({/* ... */});
            }
            // Non-dapp browsers...
            else {
                window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
            }
        // });
    }

    buyTokens = (etherAmount) => {
        this.setState({ loading: true })
        this.state.ethSwap.methods.buyTokens().send({ value: etherAmount, from: this.state.account }).on('transactionHash', (hash) => {
            this.setState({ loading: false })
        })
    }

    sellTokens = (tokenAmount) => {
        this.setState({ loading: true })
        this.state.token.methods.approve(this.state.ethSwap.address, tokenAmount).send({ from: this.state.account }).on('transactionHash', (hash) => {
            this.state.ethSwap.methods.sellTokens(tokenAmount).send({ from: this.state.account }).on('transactionHash', (hash) => {
                this.setState({ loading: false })
            })
        })
    }

    constructor(props) {
        super(props)
        this.state = {
            account: '',
            token: {},
            ethSwap: {},
            ethBalance: '0',
            tokenBalance: '0',
            loading: true
        }
    }

    render() {
        // console.log(this.state.account) // this was earlier not possible because account was not loaded in state

        let content
        if (this.state.loading) {
            content = <p id="loader" className="text-center">Loading...</p>
        } else {
            content = <Main
                ethBalance={this.state.ethBalance}
                tokenBalance={this.state.tokenBalance}
                buyTokens={this.buyTokens}
                sellTokens={this.sellTokens}
            />
        }

        return (
            <div>
                <Navbar account={this.state.account} />
                <div className="container-fluid mt-5">
                    <div className="row">
                        <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '600px' }}>
                            <div className="content mr-auto ml-auto">
                                {content}
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        );
    }
}

export default App;
