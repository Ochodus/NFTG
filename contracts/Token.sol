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
        uint256 part;
        uint256 set;
        uint256 mainOpType;
        uint256 mainOpValue;
        uint256[4] subOpType;
        uint256[4] subOpValue;
        uint256 level;
        uint256 exp;
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

    function mint(uint256 location) public onlyOwner {
        uint256 level = 0;
        uint256 exp = 0;

        uint256 set = getRandomSet(location);
        uint256 part = getRandomPart();
        uint256 mainOpType = getMainOpType(part);
        uint256 mainOpValue = getMainOpValue(mainOpType);
        uint256[4] memory subOpType = getSubOpType(mainOpType);
        uint256[4] memory subOpValue = getSubOpValue(subOpType);

        _tokenDetails[nextId] = Relic(part, set, mainOpType, mainOpValue, subOpType, subOpValue, level, exp);
        _mint(msg.sender, nextId, 1, "");
        nextId++;
    }

    function getRandomPart() public view returns (uint256) {
        uint256 part = uint256(createRandom(5, 0));
        return part;
    }

    function getRandomSet(uint256 location) public view returns (uint256) {
        uint256 part = uint256(createRandom(2, 0));
        return part;
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

    function getMainOpValue(uint256 mainOpType) public pure returns (uint256) {
        uint256[18] memory valueArray = [uint256(470), 7170, 0, 70, 70, 87, 47, 93, 280, 78, 87, 70, 70, 70, 70, 70, 70, 54];
        uint256 mainOpValue = valueArray[mainOpType-1];
        return mainOpValue;
    }

    function getSubOpType(uint256 mainOpType) public view returns (uint256[4] memory) {
        uint256[4] memory subOpType = [uint256(0), 0, 0, 0];
        uint256 isFourLine = uint256(createRandom(2, 0));
        uint256[10] memory typeArray = [uint256(1), 2, 3, 4, 5, 6, 7, 8, 9, 10];

        if (indexOf(typeArray, mainOpType) != -1) {
            delete typeArray[uint256(indexOf(typeArray, mainOpType))];
        }

        for (uint256 i = 0; i < 4; i++) {
            subOpType[i] = typeArray[createRandom(typeArray.length, i)];
            delete typeArray[uint256(indexOf(typeArray, subOpType[i]))];
        }

        if (isFourLine == 0) {
            subOpType[3] = 0;
        }

        return subOpType;
    }

    function getSubOpValue(uint256[4] memory subOpType) public view returns (uint256[4] memory) {
        uint256[44] memory valueArray = 
            [uint256(140), 160, 180, 190, 2090, 2390, 2690, 2990, 160, 190, 210, 230, 140, 160, 180, 190, 41, 47, 53, 58,
                41, 47, 53, 58, 51, 58, 66, 73, 27, 31, 35, 39, 54, 62, 70, 78, 160, 190, 210, 230, 45, 52, 58, 65];
        uint256[4] memory subOpValue = [uint256(0), 0, 0, 0];
        
        uint256 offset;
        for (uint256 i = 0; i < 4; i++) {
            if (subOpType[i] == 0) { continue; }
            offset = uint256(createRandom(4, i));

            subOpValue[i] = valueArray[(subOpType[i]-1) * 4 + offset];
        }

        return subOpValue;
    }

    function createRandom(uint number, uint randNonce) public view returns(uint) {
        return uint(keccak256(abi.encodePacked(block.timestamp, msg.sender, randNonce))) % number;
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


