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

    struct Relic {
        uint8 part;
        uint8 set;
        uint8 mainOpType;
        uint256 mainOpValue;
        uint8[4] subOpType;
        uint256[4] subOpValue;
        uint8 level;
        uint256 exp;
    }

    uint256 nextId = 0;

    mapping(uint256 => Relic) private _tokenDetails;

    constructor(string memory name, string memory symbol, string memory uri) ERC1155(uri) {

    }

    function getTokenDetails(uint256 tokenId) public view returns (Relic memory) {
        return _tokenDetails[tokenId];
    }

    function mint(uint256 location) public onlyOwner {
        uint8 level = 0;
        uint256 exp = 0;

        uint8 set = getRandomSet(location);
        uint8 part = getRandomPart();
        uint8 mainOpType = getMainOpType(part);
        uint256 mainOpValue = getMainOpValue(mainOpType);
        uint8[4] memory subOpType = getSubOpType(mainOpType);
        uint256[4] memory subOpValue = getSubOpValue(subOpType);

        _tokenDetails[nextId] = Relic(part, set, mainOpType, mainOpValue, subOpType, subOpValue, level, exp);
        _mint(msg.sender, nextId, 1, "");
        nextId++;
    }

    function getRandomPart() public returns (uint8) {
        uint8 part = uint8(createRandom(6));
        return part;
    }

    function getRandomSet(uint256 location) public returns (uint8) {
        uint8 part = uint8(createRandom(3));
        return part;
    }

    function getMainOpType(uint8 part) public returns (uint8) {
        uint8 mainOpType = 0;
        if (part == 1) {
            mainOpType = 2;
        }
        else if (part == 2) {
            mainOpType = 1;
        }     
        else if (part == 3) {
            uint8[5] memory typeArray;
            typeArray = [4, 5, 6, 9, 10];
            mainOpType = typeArray[createRandom(6) - 1];
        }
        else if (part == 4) {
            uint8[11] memory typeArray;
            typeArray = [4, 5, 6, 9, 11, 12, 13, 14, 15, 16, 17];
            mainOpType = typeArray[createRandom(12) - 1];
        }
        else if (part == 5) {
            uint8[7] memory typeArray;
            typeArray = [4, 5, 6, 7, 8, 9, 18];
            mainOpType = typeArray[createRandom(8) - 1];
        }
        return mainOpType;
    }

    function getMainOpValue(uint8 mainOpType) public returns (uint256) {
        uint16[18] memory valueArray = [470, 7170, 0, 70, 70, 87, 47, 93, 280, 78, 87, 70, 70, 70, 70, 70, 70, 54];
        uint256 mainOpValue = valueArray[mainOpType-1];
        return mainOpValue;
    }

    function getSubOpType(uint8 mainOpType) public returns (uint8[4] memory) {
        uint8[4] memory subOpType = [0, 0, 0, 0];
        uint8 isFourLine = uint8(createRandom(3) - 1);
        uint8[10] memory typeArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

        if (typeArray.indexOf(mainOpType) != -1) {
            typeArray.splice(typeArray.indexOf(mainOpType), 1);
        }

        for (uint8 i = 0; i < 4; i++) {
            subOpType[i] = typeArray.splice(Math.floor(Math.random() * typeArray.length), 1)[0];
        }

        if (!isFourLine) {
            subOpType[3] = 0;
        }

        return subOpType;
    }

    function getSubOpValue(uint8[4] memory subOpType) public returns (uint256[4] memory) {

    }

    function createRandom(uint number) public view returns(uint){
        return uint(blockhash(block.number-1)) % number; // 1 to number-1;
    }

    function enhance(uint256 tokenId, uint8 targetIndex, uint256 targetValue, uint8 targetType) public {
        Relic storage relic = _tokenDetails[tokenId];
        relic.level += 1;
        if (targetIndex != 0 && targetValue != 0) {
            if (relic.subOpType[3] == 0) {
                relic.subOpType[3] = targetType;
            }
            relic.subOpValue[targetIndex-1] += targetValue;
        }
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

    function _beforeTokenTransfer(address operator, address from, address to, uint256[] memory ids, uint256[] memory amounts, string memory data) public view onlyOwner {
        Relic storage relic = _tokenDetails[ids[0]];
    }

    function _ownerOf(uint256 tokenId) internal view returns (bool) {
        return balanceOf(msg.sender, tokenId) != 0;
    }
}


