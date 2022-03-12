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

    function mint(uint8 part, uint8 set, uint8 mainOpType, uint256 mainOpValue, uint8[4] memory subOpType, uint256[4] memory subOpValue) public onlyOwner {
        uint8 level = 0;
        uint256 exp = 0;
        _tokenDetails[nextId] = Relic(part, set, mainOpType, mainOpValue, subOpType, subOpValue, level, exp);
        _mint(msg.sender, nextId, 1, "");
        nextId++;
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


