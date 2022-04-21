let walletArray = [];
let holdingArray = [];
let g;
let userInput, submitButton;
const provider = new ethers.providers.JsonRpcProvider("https://mainnet.infura.io/v3/3c150c5748bc48dbbf5d72d334f450e9"); 
const etherScanProvider = new ethers.providers.EtherscanProvider("homestead","CUXFCIY5K2KX2QN2XZAG1U17HMH7EC4HBB");


function setup() {
    createCanvas(windowWidth,windowHeight);
    colorMode(RGB);

    userInput = createInput();
    userInput.position(10,10);

    submitButton = createButton("Submit address");
    submitButton.position(userInput.x + userInput.width,10);
    submitButton.mousePressed(setArray);

    g = new Graph();
}

function draw(){
    background(255);
    
    g.run();

    if(g.nodes.length >= 1){
        mousedOver();
    }
    
}

function mousedOver() {

    for(let i = 0; i < g.nodes.length;i++) {
        if(g.nodes[i].isMousedOver() === true) {
            g.nodes[i].mouseoverInformation();
        }
    }

}

function setArray() {
    let address = userInput.value();
    g.addNodes(new Wallet(address));
    console.log(`This address was entered: ${address}`);
    userInput.value("");
}

function keyPressed() {
    if(keyCode === LEFT_ARROW) {   
        console.table(g.nodes);
    }
    else if(keyCode === RIGHT_ARROW) {
        for(let i = 0; i < holdingArray.length; i++) {
            let firstInstance = holdingArray[0];
            firstInstance.connections.push(holdingArray[1]);
            holdingArray = [];
        }
    }
    else if (keyCode === UP_ARROW) {
        holdingArray = [];
        console.log(`Holding array is cleared, it now has a value of ${holdingArray.length}`);
    }
}

function mouseDragged() {
    if(g.nodes.length >= 1) {
        for(let i = 0; i < g.nodes.length;i++) {
            if(dist(mouseX,mouseY,g.nodes[i].location.x,g.nodes[i].location.y) <= g.nodes[i].balance*3/2) {
                g.nodes[i].location = createVector(mouseX,mouseY);
            }

        }
    }
}

function mouseClicked() {
    selectNode();
}

function selectNode() {
    if(g.nodes.length >= 1) {
        for(let i = 0; i < g.nodes.length; i++) {
            if(dist(mouseX,mouseY,g.nodes[i].location.x,g.nodes[i].location.y) <= g.nodes[i].balance*3/2+10) {
                let selected = g.nodes[i];
                holdingArray.push(selected);
                console.log(g.nodes[i]);
            }
        } 
    }  
}

class Graph {

    constructor() {
        this.nodes = [];
    }

    addNodes(_wallet) {
        let wallet = _wallet;
        this.nodes.push(wallet);
    }

    run() {

        if(this.nodes.length >= 1) {
            for(let i = 0; i < this.nodes.length;i++){
                this.nodes[i].displayWallet();
                this.nodes[i].connect();
                this.nodes[i].mouseoverInformation();
               
            }
        }
    }

}

class Wallet {

    constructor(_address) {
        this.address = _address;
        this.location = createVector(random(100,width-100),random(100,height-100));
        this.balance;
        this.baseSize = 20;
        if(this.address == "0x0000000000000000000000000000000000000000") {
            this.balance = this.baseSize
        }
        this.transactionCount;
        this.ens;
        this.col = color(random(255),random(255),random(255),60);
        this.transactions = [];
        this.connections = [];
        
        this.initData();

    }

    displayWallet() {
    
        push();
            push();
            fill(0);
            let front = this.address.slice(0,4);
            let end = this.address.slice(this.address.length-4,this.address.length);
            text(`${front}...${end}`, this.location.x-this.balance/2,this.location.y);
            pop();
        strokeWeight(5);
        fill(this.col);
        stroke(this.col,)
        circle(this.location.x,this.location.y,this.baseSize+this.balance*3);
        pop();
        
    }

    mouseoverInformation() {
       
    }

    isMousedOver() {

        if(dist(mouseX,mouseY,this.location.x,this.location.y) <= this.balance*3/2+this.baseSize) {
            return true;
        } else {
            false;
        }
       
    }

    connect() {

        if(this.connections.length >= 1) {
            for(let i = 0; i < this.connections.length;i++) {
                push();
                strokeWeight(5);
                stroke(this.col);
                line(this.location.x,this.location.y,this.connections[i].location.x,this.connections[i].location.y);
                pop();
            }
        } 
        
    }

    async setBalance() {
        if(this.address == "0x0000000000000000000000000000000000000000") {
            return;
        } else {
            const bal = await provider.getBalance(this.address);
            let formatBal = ethers.utils.formatEther(bal);
            this.balance = formatBal;
        }
       
    }

    async setTransactionCount() {
        const count = await provider.getTransactionCount(this.address);
        this.transactionCount = count;
    }

    async setENSName() {
        const name = await provider.lookupAddress(this.address);
        this.ens = name;
    }

    async initData() {
        this.setTransactionCount();
        this.setBalance();
        this.setENSName();
        //this.getTransactions();
    }

    async getTransactions() {

        const getBlockNumber = await provider.getBlockNumber();
        const transactionHistory = await etherScanProvider.getHistory(this.address,0,getBlockNumber);
        console.log(transactionHistory);
    

    }


}
