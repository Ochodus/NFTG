// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

import "../node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract Token is ERC1155, Ownable {

    uint8 constant FLOWER = 1;
    uint8 constant FEATHER = 2;
    uint8 constant SANDS = 3;
    uint8 constant GOBLET = 4;
    uint8 constant CIRCLET = 5;
    uint256[20] EXP_DEMAND = [uint256(3000), 3725, 4425, 5150, 5900, 6675, 7500, 8350, 9225, 10125, 11050, 12025, 13025, 15150, 17600, 20375, 23500, 27050, 31050, 35575];
    uint256[20] EXP_ACC = [uint256(3000), 6725, 11150, 16300, 22200, 28875, 36375, 44725, 53950, 64075, 75125, 87150, 100175, 115325, 132925, 153300, 176800, 203850, 234900, 270475];
    uint256[40] valueArray = 
            [uint256(140), 160, 180, 190, 
                2090, 2390, 2690, 2990, 
                160, 190, 210, 230, 
                41, 47, 53, 58,
                41, 47, 53, 58, 
                51, 58, 66, 73, 
                27, 31, 35, 39, 
                54, 62, 70, 78, 
                160, 190, 210, 230, 
                45, 52, 58, 65];
    uint256[18] mainOpValueArray = [uint256(470), 7170, 0, 70, 70, 87, 47, 93, 280, 78, 87, 70, 70, 70, 70, 70, 70, 54];
    uint256[18] mainOpInc = [uint256(132), 2031, 0, 20, 20, 24, 13, 26, 79, 22, 25, 20, 20, 20, 20, 20, 20, 15];

    struct MainOp {
        uint256 id;
        uint256 value;
    }

    struct SubOp {
        uint256[4] id;
        uint256[4] value;
        uint256[10] cdd;
        uint cddLen;
    }

    struct Exp {
        uint256 level;
        uint256 total;
        uint256 current;
        uint256 next;
        uint256 nextTotal;
    }

    struct Relic {
        uint256 part;
        uint256 set;
        uint256 stars;
        MainOp main;
        SubOp sub;
        Exp exp;
    }

    

    uint256 nextId = 0;

    mapping(uint256 => Relic) private _tokenDetails;

    constructor(string memory name, string memory symbol, string memory uri) ERC1155(uri) {

    }

    function getTokenDetails(uint256 tokenId) public view returns (Relic memory) {
        return _tokenDetails[tokenId];
    }

    function indexOf(uint256[10] memory arr, uint256 searchFor) public pure returns (int256) {
        for (int256 i = 0; i < int256(arr.length); i++) {
            if (arr[uint256(i)] == searchFor) {
                return i;
            }
        }
        return -1;
    }

    function mint(uint256 location, uint256 difficulty) public onlyOwner {
        uint256 set = getRandomSet(location);
        uint256 part = getRandomPart();
        uint256 stars = getStars(difficulty);

        MainOp memory main = getMainStats(part);
        SubOp memory sub = getSubStats(main.id);
        Exp memory exp = getExpStats();

        _tokenDetails[nextId] = Relic(part, set, stars, main, sub, exp);
        _mint(msg.sender, nextId, 1, "");
        nextId++;
    }  

    function getRandomPart() public view returns (uint256) {
        uint256 part = uint256(createRandom(5, 0));
        return part;
    }

    function getRandomSet(uint256 location) public view returns (uint256) {
        uint256 set = (location * 2) + uint256(createRandom(2, 0));
        return set;
    }

    function getStars(uint256 diff) public pure returns (uint256) {
        uint256 stars = 5;
        return stars;
    }

    function getMainStats(uint256 part) public view returns (MainOp memory) {
        uint256 mainOpType = getMainOpType(part);
        uint256 mainOpValue = getMainOpValue(mainOpType);
        MainOp memory main = MainOp(mainOpType, mainOpValue);
        return main;
    }

    function getMainOpType(uint256 part) public view returns (uint256) {
        uint256 mainOpType = 0;
        if (part == 1) {
            mainOpType = 2;
        }
        else if (part == 2) {
            mainOpType = 1;
        }     
        else if (part == 3) {
            uint256[5] memory typeArray;
            typeArray = [uint256(4), 5, 6, 9, 10];
            mainOpType = typeArray[createRandom(typeArray.length, 0)];
        }
        else if (part == 4) {
            uint256[11] memory typeArray;
            typeArray = [uint256(4), 5, 6, 9, 11, 12, 13, 14, 15, 16, 17];
            mainOpType = typeArray[createRandom(typeArray.length, 0)];
        }
        else if (part == 5) {
            uint256[7] memory typeArray = [uint256(4), 5, 6, 7, 8, 9, 18];
            mainOpType = typeArray[createRandom(typeArray.length, 0)];
        }
        return mainOpType;
    }

    function getMainOpValue(uint256 mainOpType) public view returns (uint256) {
        uint256 mainOpValue = mainOpValueArray[mainOpType-1];
        return mainOpValue;
    }

    function getSubStats(uint256 mainOpType) public view returns (SubOp memory) {
        (uint256[4] memory subOpType, uint256[10] memory subOpCdd, uint length) = getSubOpType(mainOpType);
        uint256[4] memory subOpValue = getSubOpValue(subOpType);
        SubOp memory subStats = SubOp(subOpType, subOpValue, subOpCdd, length);
        return subStats;
    }

    function getSubOpType(uint256 mainOpType) public view returns (uint256[4] memory, uint256[10] memory, uint) {
        uint256[4] memory subOpType = [uint256(0), 0, 0, 0];
        uint256[10] memory subOpCdd = [uint256(1), 2, 3, 4, 5, 6, 7, 8, 9, 10];
        uint256 isFourLine = uint256(createRandom(2, 0));
        uint length = 10;

        if (indexOf(subOpCdd, mainOpType) != -1) {
            subOpCdd = removeElement(mainOpType, subOpCdd);
            length -= 1;
        }

        for (uint256 i = 0; i < 4; i++) {
            subOpType[i] = subOpCdd[createRandom(length, i)];
            subOpCdd = removeElement(subOpType[i], subOpCdd);
            length -= 1;
        }

        if (isFourLine == 0) {
            subOpType[3] = 0;
        }

        return (subOpType, subOpCdd, length);
    }

    function getSubOpValue(uint256[4] memory subOpType) public view returns (uint256[4] memory) {
        uint256[4] memory subOpValue = [uint256(0), 0, 0, 0];
        
        uint256 offset;
        for (uint256 i = 0; i < 4; i++) {
            if (subOpType[i] == 0) { continue; }

            offset = uint256(createRandom(4, i));
            subOpValue[i] = valueArray[(subOpType[i]-1) * 4 + offset];
        }

        return subOpValue;
    }

    function getExpStats() public view returns (Exp memory) {
        uint256 level = 0;
        uint256 curExp = 0;
        uint256 totalExp = 0;
        uint256 nextExp = EXP_DEMAND[level];
        uint256 nextExpAcc = EXP_ACC[level];
        Exp memory expStats = Exp(level, totalExp, curExp, nextExp, nextExpAcc);
        return expStats;
    }

    function enhance(uint256 tokenId, uint256 add) public {
        Relic storage relic = _tokenDetails[tokenId];
        MainOp storage main = relic.main;
        SubOp storage sub = relic.sub;
        Exp storage exp = relic.exp;

        uint256 targetIndex = createRandom(4, 0);
        uint256 offsetIndex = createRandom(4, 1);
        uint256 targetType = 0;
        uint256 targetValue = 0;

        if (exp.level < 20) {
            exp.total += add;
            exp.current += add;
            
            if(exp.current >= exp.next) {
                for (uint256 k = exp.level; k < 20; k++) {
                    if (EXP_ACC[k] <= exp.total) {
                        exp.level += 1;
                        if (exp.level % 4 == 0) {
                            if (sub.id[3] == 0) {
                                targetIndex = 3;
                                targetType = sub.cdd[createRandom(sub.cddLen, 2)];
                                sub.id[3] = targetType;
                            }
                            else {
                                targetType = sub.id[targetIndex];
                            }
                            targetValue = valueArray[(targetType-1) * 4 + offsetIndex];
                            sub.value[targetIndex] += targetValue;
                        }
                        continue;
                    }
                    else {
                        exp.current = exp.total - EXP_ACC[k-1];
                        main.value += k * mainOpInc[main.id-1];
                        exp.next = EXP_DEMAND[exp.level];
                        break;
                    }
                }
            }
        }
    }

    function createRandom(uint number, uint randNonce) public view returns(uint) {
        return uint(keccak256(abi.encodePacked(block.timestamp, msg.sender, randNonce))) % number;
    }

    function getAllTokensForUser(address user) public view returns (uint256[] memory) {
        uint256 tokenCount = 0;
        uint256 j;
        for(j = 0; j < nextId; j++) {
            tokenCount = tokenCount + balanceOf(user, j);
        }
        if(tokenCount == 0) {
            return new uint256[](0);
        }
        else {
            uint[] memory result = new uint256[](tokenCount);
            uint256 totalPets = nextId;
            uint256 resultIndex = 0;
            uint256 i;
            for(i = 0; i < totalPets; i++) {
                if(_ownerOf(i)) {
                    result[resultIndex] = i;
                    resultIndex++; 
                }
            }
            return result;
        }
    }

    function remove(uint256 index, uint256[10] memory array) public pure returns (uint256[10] memory){
        for(uint i = index; i < array.length-1; i++) {
            array[i] = array[i+1];
        }
        return array;
    }

    function removeElement(uint256 element, uint256[10] memory array) public pure returns (uint256[10] memory) {
        array = remove(uint256(indexOf(array, element)), array);
        return array;
    }

    function _beforeTokenTransfer(address operator, address from, address to, uint256[] memory ids, uint256[] memory amounts, string memory data) public view onlyOwner {
        Relic storage relic = _tokenDetails[ids[0]];
    }

    function _ownerOf(uint256 tokenId) internal view returns (bool) {
        return balanceOf(msg.sender, tokenId) != 0;
    }
}


