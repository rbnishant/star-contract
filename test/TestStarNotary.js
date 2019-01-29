const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async() => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    await instance.createStar("Awesome Star!", "symbol", tokenId, {from: accounts[0]})
    let star = await instance.tokenIdToStarInfo.call(tokenId)
    assert.equal(star["name"], "Awesome Star!")
});

it('lets user1 put up their star for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar("awesome star", "symbol", starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', "symbol", starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, {from: user2, value: balance});
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', 'symbol', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', 'symbol', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance, gasPrice:0});
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
});

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async() => {
    //1. Create a star
    //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
    let instance = await StarNotary.deployed();
    const tokenId = 10;
    const tokenName = "ROSHI"
    const tokenSymbol = "ROSHI"
    await instance.createStar(tokenName, tokenSymbol, tokenId, {from: accounts[1]})
    let star = await instance.tokenIdToStarInfo.call(tokenId);
    assert.equal(star[0], tokenName)
    assert.equal(star[1], tokenSymbol)
});

it('lets 2 users exchange stars', async() => {
    // 1. Create 2 Stars
    // 2. Call the exchangeStars functions implemented in the Smart Contract
    // 3. Verify that the owners changed

    let instance = await StarNotary.deployed();
    let tokenId1 = 11
    let tokenId2 = 12
    let tokenName1 = "Roshi1"
    let tokenName2 = "Roshi2"
    let account1 = accounts[1]
    let account2 = accounts[2]
    let tokenSymbol1 = "Roshi1"
    let tokenSymbol2 = "Roshi2"

    await instance.createStar(tokenName1, tokenSymbol1, tokenId1, {from: account1})
    await instance.createStar(tokenName2, tokenSymbol2, tokenId2, {from: account2})

    // Before exchange
    let address1 = await instance.ownerOf.call(tokenId1)
    let address2 = await instance.ownerOf.call(tokenId2)

    await instance.exchangeStars(tokenId1, tokenId2, {from: accounts[1]})
    
    // After exchange
    let newAddress1 = await instance.ownerOf.call(tokenId1)
    let newAddress2 = await instance.ownerOf.call(tokenId2)

    assert.equal(newAddress2, address1)
    assert.equal(newAddress1, address2)
});

it('lets a user transfer a star', async() => {
    // 1. create a Star
    // 2. use the transferStar function implemented in the Smart Contract
    // 3. Verify the star owner changed.

    let instance = await StarNotary.deployed();
    let tokenId = 13;
    let tokenName = 'Roshi'
    let tokenSymbol = "Roshi"
    let fromAddress = accounts[0]
    let toAddress = accounts[1]
    await instance.createStar(tokenName, tokenSymbol, tokenId, {from: fromAddress})
    await instance.transferStar(toAddress, tokenId, {from: fromAddress})
    let newOwner = await instance.ownerOf.call(tokenId)
    assert.equal(newOwner, toAddress);
});

