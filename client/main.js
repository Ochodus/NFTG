/** Connect to Moralis server */
const appId = "EjcDukADsV10FGicVvelchdxyQNCOSNVcJSYCl3S";
const serverUrl = "https://lxawa30bwsfh.usemoralis.com:2053/server";
//Moralis.start({serverUrl, appId});
Moralis.initialize(appId);
Moralis.serverURL = serverUrl;
const CONTRACT_ADDRESS = "0x0F6F85D3d798308EDCe2fbB824e05CEf92a52aF2";

const MAIN_TAB = 0;
const RELIC_TAB = 1;
const DOMAIN_TAB = 2;
const ENHANCE_TAB = 3;

var user;
var provider;
var web3;
var abi;
var contract;
var relic_array;

var setNameArray = ["Gladiator's Finale", "Wanderer's Troupe", 
                    "Thundering Fury", "Thundersoother", 
                    "Viridescent Venerer", "Maiden Beloved",
                    "Archaic Petra", "Retracing Bolide",
                    "Crimson Witch of Flames", "Lavawalker",
                    "Bloodstained Chivalry", "Noblesse Oblige",
                    "Blizzard Strayer", "Heart of Depth",
                    "Tenacity of the Millelith", "Pale Flame", 
                    "Shimenawa's Reminiscence", "Emblem of Severed Fate",
                    "Ocean-Hued Clam", "Husk of Opulent Dreams",
                    "Vermillion Hereafter", "Echoes of an Offering"]
var setPartNameArray = [
    ["Gladiator's Nostalgia", "Gladiator's Destiny", "Gladiator's Longing", "Gladiator's Intoxication", "Gladiator's Triumphus"],["Troupe's Dawnlight", "Bard's Arrow Feather", "Concert's Final Hour", "Wanderer's String-Kettle", "Conductor's Top Hat"],
    ["Thunderbird's Mercy", "Survivor of Catastrophe", "Hourglass of Thunder", "Omen of Thunderstorm", "Thunder Summoner's Crown"],["Thundersoother's Heart", "Thundersoother's Plume", "Hour of Soothing Thunder", "Thundersoother's Goblet", "Thundersoother's Diadem"],
    ["In Remembrance of Viridescent Fields", "Viridescent Arrow Feather", "Viridescent Venerer's Determination", "Viridescent Venerer's Vessel", "Viridescent Venerer's Diadem"],["Maiden's Distant Love", "Maiden's Heart-stricken Infatuation", "Maiden's Passing Youth", "Maiden's Fleeting Leisure", "Maiden's Fading Beauty"],
    ["Flower of Creviced Cliff", "Feather of Jagged Peaks", "Sundial of Enduring Jade", "Goblet of Chiseled Crag", "Mask of Solitude Basalt"],["Summer Night's Bloom", "Summer Night's Finale", "Summer Night's Moment", "Summer Night's Waterballoon", "Summer Night's Mask"],
    ["Witch's Flower of Blaze", "Witch's Ever-Burning Plume", "Witch's End Time", "Witch's Heart Flames", "Witch's Scorching Hat"],["Lavawalker's Resolution", "Lavawalker's Salvation", "Lavawalker's Torment", "Lavawalker's Epiphany", "Lavawalker's Wisdom"],
    ["Bloodstained Flower of Iron", "Bloodstained Black Plume", "Bloodstained Final Hour", "Bloodstained Chevalier's Goblet", "Bloodstained Iron Mask"],["Royal Flora", "Royal Plume", "Royal Pocket Watch", "Royal Silver Urn", "Royal Masque"],
    ["Snowswept Memory", "Icebreaker's Resolve", "Frozen Homeland's Demise", "Frost-Weaved Dignity", "Broken Rime's Echo"],["Gilded Corsage", "Gust of Nostalgia", "Copper Compass", "Goblet of Thundering Deep", "Wine-Stained Tricorne"],
    ["Flower of Accolades", "Ceremonial War-Plume", "Orichalceous Time-Dial", "Noble's Pledging Vessel", "General's Ancient Helm"],["Stainless Bloom", "Wise Doctor's Pinion", "Moment of Cessation", "Surpassing Cup", "Mocking Mask"],
    ["Entangling Bloom", "Shaft of Remembrance", "Morning Dew's Moment", "Hopeful Heart", "Capricious Visage"],["Magnificent Tsuba", "Sundered Feather", "Storm Cage", "Scarlet Vessel", "Ornate Kabuto"],
    ["Sea-Dyed Blossom", "Deep Palace's Plume", "Cowry of Parting", "Pearl Cage", "Crown of Watatsumi"],["Bloom Times", "Plume of Luxury", "Song of Life", "Calabash of Awakening", "Skeletal Hat"],
    ["Flowering Life", "Feather of Nascent Light", "Solar Relic", "Moment of the Pact", "Thundering Poise"],["Soulscent Bloom", "Jade Leaf", "Symbol of Felicitation", "Chalice of the Font", "Flowing Rings"]
]
var partNameArray = ["Flower of Life", "Plume of Death", "Sands of Eon", "Goblet of Eonothem", "Circlet of Logos"]
var optionNameArray = ["ATK", "HP", "DEF", "ATK", "HP", "DEF", "Crit Rate", "Crit DMG", "Elemental Mastery", 
                            "Energy Recharge", "Physical DMG Bonus", "Pyro DMG Bonus", "Hydro DMG Bonus", "Electro DMG Bonus", 
                            "Cryo DMG Bonus", "Anemo DMG Bonus", "Geo DMG Bonus", "Healing Bonus"];
var nonPercentType = [1, 2, 3, 9]

var intervalArray = new Array();
var EXP_ACC = [3000, 6725, 11150, 16300, 22200, 28875, 36375, 44725, 53950, 64075, 75125, 87150, 100175, 115325, 132925, 153300, 176800, 203850, 234900, 270475];
var selectedMatID = [];

async function init() {
    initEventHandler();
    $("#domain").hide();
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
    $("#domain-tab").click( () => { changeTab(DOMAIN_TAB); })
    $("#main-tab").click( () => { changeTab(MAIN_TAB); })
    for (let i = 0; i < 11; i++) {
        $(`#domain-${i}`).click( async () => { getNewRelic(i, 5); })
    }
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

    relic_array.forEach(async (relicId) => {
        let details = await contract.methods.getTokenDetails(relicId).call({from: ethereum.selectedAddress});
        renderRelic(relicId, details);
    });

    renderSelected(0);

    changeTab(RELIC_TAB);
}

async function rerenderEnhanced(relicId) {
    relic_array = await contract.methods.getAllTokensForUser(ethereum.selectedAddress).call({from: ethereum.selectedAddress});

    if(relic_array.length == 0) return;

    let details = await contract.methods.getTokenDetails(relicId).call({from: ethereum.selectedAddress});

    renderRelic(relicId, details, true);
    setEnhancingPage(relicId, details);
}

function renderRelic(id, data, rerender=false){
    if(rerender) {
    }

    if(!rerender) {
        let htmlString = `
            <div class="col-md-3 card mx-1" id="artifact-${id}">
                <div class="mat-img">
                    <img class="card-img-top mater" src="assets/artifacts/${data.set}/${data.part}.png" id="relic_img">
                </div>
                <div class="card-body mat">
                    <div><span class="relic_level">+${data.exp.level}</span></div>
                </div>
            </div>`;

        let element = $.parseHTML(htmlString);
        $("#artifact-row").append(element);

        $(`#artifact-${id}`).click( () => {
            selectCard(id);
            renderSelected(id);
        });
    }
}

async function selectCard(id) {
    artifact_array = await contract.methods.getAllTokensForUser(ethereum.selectedAddress).call({from: ethereum.selectedAddress});
    
    artifact_array.forEach(async (artifactId) => {
        if (id == artifactId) {$(`#artifact-${artifactId}`).addClass('selected');}
        else {$(`#artifact-${artifactId}`).removeClass('selected');}
    });
}

async function renderSelected(id) {
    let data = await contract.methods.getTokenDetails(id).call({from: ethereum.selectedAddress});

    let htmlString = `
        <div class="artifact-selected" id="relic-${id}">
            <div class="card-top">
                <div class="card-text top"><span>${setPartNameArray[data.set][data.part-1]}</span></div>
            </div>
            <div class="card-header">
                <div class="card-header-left">
                    <div class="card-text part-name"><span>${partNameArray[data.part-1]}</span></div>
                    <div><span class="card-text main-op-name">${optionNameArray[data.main.id-1]}</span></div>
                    <div><span class="card-text main-op-value">${parseInt(data.main.value/10)}</span></div>
                    <div class="stars"></div>
                </div>
                <div class="card-header-right">
                    <img class="card-img-top" src="assets/Artifacts/${data.set}/${data.part}.png" id="relic_img">
                </div>
            </div>
            <div class="card-body">
                <div class="body-header">
                    <div><span class="artifact-lv">+${data.exp.level} </span></div>
                    <div><span class="lock"></div>
                </div>
                <div class="text-field">
                    <div class="sub-op-field">
                        <div><span class="artifact-sub-op"> - ${parseString(data, 0)}</span></div>
                        <div><span class="artifact-sub-op"> - ${parseString(data, 1)}</span></div>
                        <div><span class="artifact-sub-op"> - ${parseString(data, 2)}</span></div>
                        <div><span class="artifact-sub-op">${data.sub.id[3] != 0 ? ' - ' + parseString(data, 3) : ""}</span></div>
                    </div>
                    <div class="set-details">
                        <div><span class="artifact_set">${setNameArray[data.set]}:</span></div>
                        <div><span class="effect_two"></span></div>
                        <div><span class="effect_four"></span></div>
                        <div><span class="story"></span></div>
                    </div>
                </div>
                <button data-relic-id="${id}" class="enhance_btn btn btn-primary btn-block">Enhance</button>
            </div>
        </div>`;

    $(".detail").html(htmlString);

    $(`#relic-${id} .enhance_btn`).click( () => {
        setEnhancingPage(id, data);
        changeTab(ENHANCE_TAB);
    });
    if (data.exp.level == 20) {
        $(`#relic-${id} .enhance_btn`).remove();
    }
}

function getAbi() {
    return new Promise( (res) => {
        $.getJSON("Token.json", ( (json) => {
            res(json.abi);
        }))
    })
}

async function enhancing(relicId, exp) {
    let details = await contract.methods.getTokenDetails(relic_array.length-1).call({from: ethereum.selectedAddress});
    contract.methods.enhance(relicId, exp).send({from: ethereum.selectedAddress}).on("receipt", ( () => {
        rerenderEnhanced(relicId);
        selectedMatID = [];
    }))
}

function changeTab(tabNumber) {
    if(tabNumber == 0) {
        $("#main").show();
        $("#game").hide();
        $("#domain").hide();
        $('#enhancing-page').hide();
    }
    else if(tabNumber == 1) {
        $("#game").css('display', 'flex');
        $("#main").hide();
        $("#domain").hide();
        $('#enhancing-page').hide();
    }
    else if (tabNumber == 2) {
        $("#domain").show();
        $("#main").hide();
        $("#game").hide();
        $('#enhancing-page').hide();
    }
    else if (tabNumber == 3) {
        $("#domain").hide();
        $("#main").hide();
        $("#game").hide();
        $('#enhancing-page').show();
    }
}

async function getNewRelic(location, diff) {
    //contract.methods.sendTransaction({from: ethereum.selectedAddress[0], to: CONTRACT_ADDRESS, value: web3.utils.toWei("5", "ether"), gas: 100000});
    contract.methods.mint(location, diff).send({from: ethereum.selectedAddress}).on("receipt", ( async () => {
        relic_array = await contract.methods.getAllTokensForUser(ethereum.selectedAddress).call({from: ethereum.selectedAddress});
        let details = await contract.methods.getTokenDetails(relic_array.length-1).call({from: ethereum.selectedAddress});
        console.log(details.sub.id);
        renderRelic(relic_array.length-1, details);
    }));
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

function setEnhancingPage(id, data) {
    let curExp = data.exp.current;
    let nextExp = data.exp.next;
    let percentageString = (curExp/nextExp)*100 + '%';
    let htmlString = `
            <div class="enhance-prev">
                <div><span class="relic_name">${setNameArray[data.set]}</span></div>
                <div><span class="relic_part">${partNameArray[data.part-1]}</span></div>
                <img class="enhance-img" src="assets/Artifacts/${data.set}/${data.part}.png" id="relic_img">
            </div>
            <div class="enhance-details">
                <div class="progress-text">
                    <div class="artifact-level"><span>+${data.exp.level} </span></div>
                    <div class="adding-level"><span></span></div>
                    <div><span class="adding-exp"></span></div>
                    <div class="artifact-exp"><span> ${data.exp.current}/${data.exp.next} </span></div> 
                </div>
                <div class="progress">
                    <div class="progress-bar" style="width: ${percentageString};">
                    
                    </div>
                    <div class="progress-bar expected">
                    
                    </div>
                </div>
                <div><span class="relic_main_op">${parseString(data)}</span></div>
                <div class="sub_op_field">
                    <div><span class="relic_sub_op"> - ${parseString(data, 0)}</span></div>
                    <div><span class="relic_sub_op"> - ${parseString(data, 1)}</span></div>
                    <div><span class="relic_sub_op"> - ${parseString(data, 2)}</span></div>
                    <div><span class="relic_sub_op">${data.sub.id[3] != 0 ? ' - ' + parseString(data, 3) : ""}</span></div>
                </div>
                <div class="relic-enhance">
                    <div><span>장비 강화 소모</span></div>
                    <div class="enhance-materials row">
                        <div class="mater-li col-md-1 card mx-auto" id="mat-li-1">+</div>
                        <div class="mater-li col-md-1 card mx-auto" id="mat-li-2">+</div>
                        <div class="mater-li col-md-1 card mx-auto" id="mat-li-3">+</div>
                        <div class="mater-li col-md-1 card mx-auto" id="mat-li-4">+</div>
                        <div class="mater-li col-md-1 card mx-auto" id="mat-li-5">+</div>
                        <div class="mater-li col-md-1 card mx-auto" id="mat-li-6">+</div>
                    </div>
                    <button id="enhance-${id}" class="enhance_page_btn btn btn-primary btn-block">Enhance</button>
                </div>
            </div>
        `;
    
    $(`#enhancing-page`).html(htmlString);
    $(`.mater-li`).click( async () => {
        $('#myModal').modal('show');
        $(`#mater-row`).html("");
        relic_array = await contract.methods.getAllTokensForUser(ethereum.selectedAddress).call({from: ethereum.selectedAddress});
        relic_array.forEach(async (relicId) => {
            let details = await contract.methods.getTokenDetails(relicId).call({from: ethereum.selectedAddress});
            renderMaters(relicId, details, id, data);
        });
        
    });
    $(`#enhance-${id}`).click( async () => {
        enhancing(id, evalMatExp());
    });
}

function renderMaters(matId, matData, targetId, targetData) {
    let modalContents = `
        <div class="col-md-3 card mx-1" id="mater-${matId}">
            <img class="card-img-top mater" src="assets/artifacts/${matData.set}/${matData.part}.png" id="relic_img">
            <div class="card-body mat">
                <div><span class="relic_level"> ${matData.exp.level} </span></div>
            </div>
        </div>`
    ;

    let listContents = `
        <div class="m-0 card mx-auto inlist" id="inlist-${matId}">
            <img class="card-img-top mater" src="assets/artifacts/${matData.set}/${matData.part}.png" id="relic_img">
            <div class="card-body mat">
                <div><span class="relic_level"> ${matData.exp.level} </span></div>
            </div>
        </div>`
    ;

    let element = $.parseHTML(modalContents);
    $(`#mater-row`).append(element);

    let card = $(`#mater-${matId}`);
    if (selectedMatID.indexOf(matData) != -1) {
        card.addClass('selected');
    }

    card.click( async () => {
        if (card.hasClass('selected')) {
            card.removeClass('selected');
            let targetIndex = selectedMatID.indexOf(matData) + 1;
            while (targetIndex < 6) {
                let copy = $($(`#mat-li-${targetIndex+1}`).html())
                $(`#mat-li-${targetIndex}`).html(copy);
                targetIndex++;
            }
            selectedMatID = selectedMatID.filter((element) => element !== matData);
            console.log(selectedMatID);
        }
        else {
            card.addClass('selected');
            selectedMatID.push(matData);
            $(`#mat-li-${selectedMatID.length}`).html(listContents);
            console.log(selectedMatID);
        }
        renewProgressBar(targetData.exp.level, targetData.exp.next, targetData.exp.total);
    })

}

function evalMatExp() {
    let total = 0;
    for (let i = 0; i < selectedMatID.length; i++) {
        if (selectedMatID[i].stars == 5) {total += 3750;}
    }

    return total;
}

function renewProgressBar(level, nextExp, totalExp) {
    console.log('renew')
    let plusExp = (totalExp*1) + evalMatExp();
    console.log("total:" + totalExp*1);
    console.log(evalMatExp());
    console.log(plusExp);

    let i = 0
    while (plusExp >= EXP_ACC[i]) {
        console.log(i);
        i++;
    }

    let plusLv = (i - level) > 0 ? (i - level) : 0;

    let ratio = evalMatExp()/nextExp;
    if (ratio >= 1) {ratio = 1;}

    let expected = ratio * 100 + '%';
    console.log(expected)
    $(`.progress-bar.expected`).width(expected);
    if (evalMatExp() > 0) $(`.adding-exp`).html(`+${evalMatExp()}`);
    else $(`.adding-exp`).html(``);
    if (plusLv > 0) $(`.adding-level`).html(`+${plusLv}`);
    else $(`.adding-level`).html(``);
}

function parseString(data, subIndex=-1) {
    let string;
    let id;
    let value;

    if (subIndex == -1) {id = data.main.id; value = data.main.value/10;}
    else {id = data.sub.id[subIndex]; value = data.sub.value[subIndex]/10;}

    string = (optionNameArray[id-1]) + "+" + value;
    if (nonPercentType.indexOf(Number(id)) == -1) { string = string + "%"; }

    return string
}

init();

/** Useful Resources  */

// https://docs.moralis.io/moralis-server/users/crypto-login
// https://docs.moralis.io/moralis-server/getting-started/quick-start#user
// https://docs.moralis.io/moralis-server/users/crypto-login#metamask

/** Moralis Forum */

// https://forum.moralis.io/