/** Connect to Moralis server */
const appId = "EjcDukADsV10FGicVvelchdxyQNCOSNVcJSYCl3S";
const serverUrl = "https://lxawa30bwsfh.usemoralis.com:2053/server";
//Moralis.start({serverUrl, appId});
Moralis.initialize(appId);
Moralis.serverURL = serverUrl;
const CONTRACT_ADDRESS = "0x84417Ed9dD86b004496A23cC0B3Ebf3B7b0B9684";

const MAIN_TAB = 0;
const RELIC_TAB = 1;
const BREED_TAB = 2;

var user;
var provider;
var web3;
var abi;
var contract;
var relic_array;

var partNameArray = ["Flower of Life", "Plume of Death", "Sands of Eon", "Goblet of Eonothem", "Circlet of Logos"]
var optionNameArray = ["ATK", "HP", "DEF", "ATK%", "HP%", "DEF%", "Crit Rate%", "Crit DMG%", "Elemental Mastery", 
                            "Energy Recharge%", "Physical DMG Bonus", "Pyro DMG Bonus", "Hydro DMG Bonus", "Electro DMG Bonus", 
                            "Cryo DMG Bonus", "Anemo DMG Bonus", "Geo DMG Bonus", "Healing Bonus"];

var valueArray = [[140, 160, 180, 190], [2090, 2390, 2690, 2990], 
                        [160, 190, 210, 230], [41, 47, 53, 58], 
                        [41, 47, 53, 58], [51, 58, 66, 73], 
                        [27, 31, 35, 39], [54, 62, 70, 78], 
                        [160, 190, 210, 230], [45, 52, 58, 65]];

var intervalArray = new Array();

async function init() {
    initEventHandler();
    $("#breed").hide();
    try {
        user = Moralis.User.current();
        console.log(user);
        if(!user) {
            $("#btn-logout").hide();
        }
        else {
            $("#btn-logout").show();
            renderGame();
        }
    } catch (error) {
        console.log(error);
    }
}

async function initEventHandler() {
    $("#btn-login").click( async () => { login(); })
    $("#btn-logout").click( async () => { logout(); })
    $("#relic-tab").click( () => { changeTab(RELIC_TAB); })
    $("#breed-tab").click( () => { changeTab(BREED_TAB); })
    $("#main-tab").click( () => { changeTab(MAIN_TAB); })
    $("#breeding").click( async () => { getNewRelic(); })
}

async function login() {
    if(!user) {
        user = await Moralis.Web3.authenticate();
        if(!user) {
            console.log("Failed to log in!");
        }
        else {
            console.log("Successfully logged in!");
            $("#btn-logout").show();
            renderGame();
        }
    }
    else {
        $("#btn-logout").show();
        renderGame();
    }
}

async function logout() {
    await Moralis.User.logOut();

    console.log("Logged out");

    changeTab(MAIN_TAB);
    $("#btn-logout").hide();
    user = null;
}

async function renderGame() {
    $("#relic-row").html("");
    provider = await Moralis.enableWeb3();
    web3 = new Web3(provider.provider);
    abi = await getAbi();
    contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);

    relic_array = await contract.methods.getAllTokensForUser(ethereum.selectedAddress).call({from: ethereum.selectedAddress});

    if(relic_array.length == 0) return;

    console.log(relic_array);

    relic_array.forEach(async (relicId) => {
        let details = await contract.methods.getTokenDetails(relicId).call({from: ethereum.selectedAddress});
        renderRelic(relicId, details);
    });

    changeTab(RELIC_TAB);
}

async function rerenderEnhanced(relicId) {
    relic_array = await contract.methods.getAllTokensForUser(ethereum.selectedAddress).call({from: ethereum.selectedAddress});

    if(relic_array.length == 0) return;

    let details = await contract.methods.getTokenDetails(relicId).call({from: ethereum.selectedAddress});
    renderRelic(relicId, details, true);
}

function renderRelic(id, data, rerender=false){
    let percentageString = 0 + '%';

    if(rerender) {
        $(`#relic-${id} .relic_level`).html(`+${data.level}`);
        $(`#relic-${id} .sub_op_field`).html(`<div><span class="relic_sub_op"> - ${optionNameArray[data.subOpType[0]-1]}: ${data.subOpValue[0]/10}</span></div>
        <div><span class="relic_sub_op"> - ${optionNameArray[data.subOpType[1]-1]}: ${data.subOpValue[1]/10}</span></div>
        <div><span class="relic_sub_op"> - ${optionNameArray[data.subOpType[2]-1]}: ${data.subOpValue[2]/10}</span></div>
        <div><span class="relic_sub_op"> ${data.subOpType[3] != 0 ? '- ' + optionNameArray[data.subOpType[3]-1] + ':' : " "} ${data.subOpType[3] != 0 ? data.subOpValue[3]/10 : " "}</span></div>`)
    }

    if(!rerender) {
        let htmlString = `
        <div class="col-md-3 card mx-1" id="relic-${id}">
            <div class="card-header">
                <div><span class="relic_part">Name</span></div>
                <div><span class="relic_part">${partNameArray[data.part-1]}</span></div>
            </div>
            <img class="card-img-top" src="slime.png" id="relic_img">
            <div class="card-body">
                <div><span class="relic_main_op">${optionNameArray[data.mainOpType-1]}: ${data.mainOpValue/10}</span></div>
                <div><span class="relic_level">+${data.level} </span></div>
                <div class="sub_op_field">
                    <div><span class="relic_sub_op"> - ${optionNameArray[data.subOpType[0]-1]}: ${data.subOpValue[0]/10}</span></div>
                    <div><span class="relic_sub_op"> - ${optionNameArray[data.subOpType[1]-1]}: ${data.subOpValue[1]/10}</span></div>
                    <div><span class="relic_sub_op"> - ${optionNameArray[data.subOpType[2]-1]}: ${data.subOpValue[2]/10}</span></div>
                    <div><span class="relic_sub_op"> ${data.subOpType[3] != 0 ? '- ' + optionNameArray[data.subOpType[3]-1] + ':' : " "} ${data.subOpType[3] != 0 ? data.subOpValue[3]/10 : " "}</span></div>
                </div>
                <div>Set: <span class="relic_set">${data.set}</span></div>
                <div class="progress">
                    <div class="progress-bar" style="width: ${percentageString};">
                    
                    </div>
                </div>
                <button data-relic-id="${id}" class="enhance_btn btn btn-primary btn-block">Enhance</button>
            </div>
        </div>`;
        let element = $.parseHTML(htmlString);
        $("#relic-row").append(element);
        $(`#relic-${id} .enhance_btn`).click( () => {
            enhancing(id);
        });
    }
}

function getAbi() {
    return new Promise( (res) => {
        $.getJSON("Token.json", ( (json) => {
            res(json.abi);
        }))
    })
}

async function enhancing(relicId) {
    relic_array = await contract.methods.getAllTokensForUser(ethereum.selectedAddress).call({from: ethereum.selectedAddress});

    let details = await contract.methods.getTokenDetails(relicId).call({from: ethereum.selectedAddress});

    if (details.level % 4 == 3) {
        let targetIndex = getRandomInt(1, 4);
        let offsetIndex = getRandomInt(1, 4);
        
        let targetType;
        let targetValue;
        if (details.subOpType[3] == 0) {
            let typeArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
            for (let i = 0; i < 3; i++) {
                console.log(Number(details.subOpType[i]))
                console.log(typeArray);
                typeArray.splice(typeArray.indexOf(Number(details.subOpType[i])), 1);
            }
            console.log(typeArray);
            targetIndex = 4;
            targetType = typeArray.splice(Math.floor(Math.random() * typeArray.length), 1)[0];
            targetValue = valueArray[targetType-1][offsetIndex-1];
        }
        else {
            targetType = details.subOpType[targetIndex-1];
            targetValue = valueArray[targetType-1][offsetIndex-1];
        }
        
        contract.methods.enhance(relicId, targetIndex, targetValue, targetType).send({from: ethereum.selectedAddress}).on("receipt", ( () => {
            console.log("done");
            
            rerenderEnhanced(relicId);
        }))        
    }
    else {
        console.log("not 4");
        contract.methods.enhance(relicId, 0, 0, 0).send({from: ethereum.selectedAddress}).on("receipt", ( () => {
            console.log("done");
            
            rerenderEnhanced(relicId);
        }))
    }
}

function changeTab(tabNumber) {
    if(tabNumber == 0) {
        $("#main").show();
        $("#game").hide();
        $("#breed").hide();
    }
    else if(tabNumber == 1) {
        $("#game").show();
        $("#main").hide();
        $("#breed").hide();
    }
    else if (tabNumber == 2) {
        $("#breed").show();
        $("#main").hide();
        $("#game").hide();
    }
}

async function getNewRelic(Location) {
    let part = getRandomInt(1, 5);
    let set = getRandomInt(1, 2);
    let mainOpType = getMainOpType(part);
    let mainOpValue = getMainOpValue(mainOpType);
    let subOpType = getSubOpType(mainOpType);
    console.log(subOpType);
    let subOpValue = getSubOpValue(subOpType);
    console.log(subOpValue);
    contract.methods.mint(part, set, mainOpType, mainOpValue, subOpType, subOpValue).send({from: ethereum.selectedAddress}).on("receipt", ( async () => {
        relic_array = await contract.methods.getAllTokensForUser(ethereum.selectedAddress).call({from: ethereum.selectedAddress});
        let details = await contract.methods.getTokenDetails(relic_array.length-1).call({from: ethereum.selectedAddress});
        renderRelic(relic_array.length-1, details);
    }));
}

function getMainOpType(part) {
    let typeArray = 0;
    switch (part) {
        case 1:
            mainOpType = 2;
            break;
        case 2:
            mainOpType = 1;
            break;
        case 3:
            typeArray = [4, 5, 6, 9, 10];
            mainOpType = typeArray[getRandomInt(0, 4)];
            break;
        case 4:
            typeArray = [4, 5, 6, 9, 11, 12, 13, 14, 15, 16, 17];
            mainOpType = typeArray[getRandomInt(0, 10)];
            break;
        case 5:
            typeArray = [4, 5, 6, 7, 8, 9, 18];
            mainOpType = typeArray[getRandomInt(0, 6)];
            break;
    }
    return mainOpType;
}

function getMainOpValue(mainOpType) {
    let valueArray = [470, 7170, 0, 70, 70, 87, 47, 93, 280, 78, 87, 70, 70, 70, 70, 70, 70, 54];
    let mainOpValue = valueArray[mainOpType-1];
    return mainOpValue;
}

function getSubOpType(mainOpType) {
    let subOpType = [0, 0, 0, 0];
    let isFourLine = getRandomInt(0, 1);
    let typeArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

    if (typeArray.indexOf(mainOpType) != -1) {
        typeArray.splice(typeArray.indexOf(mainOpType), 1);
    }

    for (let i = 0; i < 4; i++) {
        subOpType[i] = typeArray.splice(Math.floor(Math.random() * typeArray.length), 1)[0];
    }

    if (!isFourLine) {
        subOpType[3] = 0;
    }

    console.log(subOpType);
    return subOpType;
}

function getSubOpValue(subOpType) {
    let subOpValue = [0, 0, 0, 0];
    for (let i = 0; i < 4; i++) {
        if (subOpType[i] == 0) { continue; }
        let offset = getRandomInt(0,3);
        console.log(subOpType);
        console.log(valueArray[subOpType[i]-1]);
        subOpValue[i] = valueArray[subOpType[i]-1][offset];
    }
    return subOpValue;
}

function getPercentage(data) {
    let now = new Date();
    let maxTime = data.endurance;
    let currentUnix= Math.floor(now.getTime() / 1000);
    let secondsLeft = ( parseInt(data.lastMeal) + parseInt(data.endurance) ) - currentUnix;
    let percentageLeft = secondsLeft / maxTime;
    return percentageLeft;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

init();

/** Useful Resources  */

// https://docs.moralis.io/moralis-server/users/crypto-login
// https://docs.moralis.io/moralis-server/getting-started/quick-start#user
// https://docs.moralis.io/moralis-server/users/crypto-login#metamask

/** Moralis Forum */

// https://forum.moralis.io/