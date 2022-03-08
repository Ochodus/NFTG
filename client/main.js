/** Connect to Moralis server */
const appId = "EjcDukADsV10FGicVvelchdxyQNCOSNVcJSYCl3S";
const serverUrl = "https://lxawa30bwsfh.usemoralis.com:2053/server";
//Moralis.start({serverUrl, appId});
Moralis.initialize(appId);
Moralis.serverURL = serverUrl
const CONTRACT_ADDRESS = "0x2B6EB6fb1116c5db0d7720628584B54C32226e69";

var intervalArray = new Array();

async function init() {
    $("#btn-login").click( async () => { login(); })
    $("#btn-logout").click( async () => { logout(); })
    try {
        let user = Moralis.User.current();
        console.log(user);
        if(!user) {
            $("#btn-logout").hide();
        }
        else {
            $(".promo").hide();
            $("#btn-logout").show();
            renderGame();
        }
    } catch (error) {
        console.log(error);
    }
}

async function login() {
    user = await Moralis.Web3.authenticate();
    if(!user) {
        console.log("Logging in failed!");
    }
    else {
        console.log("Successfully logged in!");
        $(".promo").hide();
        $("#btn-logout").show();
        renderGame();
    }
}

async function logout() {
    console.log(Moralis.User.current());
    await Moralis.User.logOut();
    console.log("Logged out");
    $(".promo").show();
    $("#game").hide();
    $("#btn-logout").hide();
}

async function renderGame() {
    $("#pet-row").html("");
    var provider = await Moralis.enableWeb3();

    var web3 = new Web3(provider.provider);
    
    let abi = await getAbi();
    let contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);
    let array = await contract.methods.getAllTokensForUser(ethereum.selectedAddress).call({from: ethereum.selectedAddress});
    console.log(array)
    if(array.length == 0) return;

    array.forEach(async (petId) => {
        let details = await contract.methods.getTokenDetails(petId).call({from: ethereum.selectedAddress});
        renderPet(petId, details);
    });

    $("#game").show();
}

async function rerenderFeeded(petId) {
    window.web3 = await Moralis.enableWeb3();
    let abi = await getAbi();
    let contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);
    let array = await contract.methods.getAllTokensForUser(ethereum.selectedAddress).call({from: ethereum.request({ method: 'eth_accounts' })});

    if(array.length == 0) return;

    let details = await contract.methods.getTokenDetails(petId).call({from: ethereum.selectedAddress});
    renderPet(petId, details, true);
}

function renderPet(id, data, rerender=false){
    let now = new Date();
    let maxTime = data.endurance;
    let currentUnix= Math.floor(now.getTime() / 1000);
    let secondsLeft = ( parseInt(data.lastMeal) + parseInt(data.endurance) ) - currentUnix;
    let percentageLeft = secondsLeft / maxTime;
    let percentageString = percentageLeft * 100 + '%';

    console.log("percentage Left: " + percentageLeft);

    let deathTime = new Date((parseInt(data.lastMeal) + parseInt(data.endurance)) * 1000);
    
    if(now > deathTime) {
        //NFT DEAD
    }

    if(rerender) {
        clearInterval(intervalArray[id]);
        $(`#pet-${id} .progress-bar`).css("width", percentageString);
    }

    intervalArray[id] = setInterval(() => {
        let now = new Date();
        let maxTime = data.endurance;
        let currentUnix= Math.floor(now.getTime() / 1000);
        let secondsLeft = ( parseInt(data.lastMeal) + parseInt(data.endurance) ) - currentUnix;
        let percentageLeft = secondsLeft / maxTime;
        let percentageString = (percentageLeft * 100) + '%';
        $(`#pet-${id} .progress-bar`).css("width", percentageString);
        
        console.log(percentageString);

        if(percentageLeft < 0) {
            clearInterval(intervalArray[id]);
        }

    }, 5000)

    if(!rerender) {
        let htmlString = `
        <div class="col-md-3 card mx-1" id="pet-${id}">
            <img class="card-img-top" src="slime.png" id="pet_img">
            <div class="card-body">
                <div>Id: <span class="pet_id">${id}</span></div>
                <div>Damage: <span class="pet_damage">${data.damage}</span></div>
                <div>Magic: <span class="pet_magic">${data.magic}</span></div>
                <div>Endurance: <span class="pet_endurance">${data.endurance}</span></div>
                <div class="progress">
                    <div class="progress-bar" style="width: ${percentageString};">
                    
                    </div>
                </div>
                <button data-pet-id="${id}" class="feed_btn btn btn-primary btn-block">Feed</button>
            </div>
        </div>`;
        let element = $.parseHTML(htmlString);
        $("#pet-row").append(element);
        $(`#pet-${id} .feed_btn`).click( () => {
            feed(id);
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

async function feed(petId) {
    let abi = await getAbi();
    let contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);
        contract.methods.feed(petId).send({from: ethereum.selectedAddress}).on("receipt", ( () => {
            console.log("done");
            rerenderFeeded(petId);
        }))
}

init();

/** Useful Resources  */

// https://docs.moralis.io/moralis-server/users/crypto-login
// https://docs.moralis.io/moralis-server/getting-started/quick-start#user
// https://docs.moralis.io/moralis-server/users/crypto-login#metamask

/** Moralis Forum */

// https://forum.moralis.io/