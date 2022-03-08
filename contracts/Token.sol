// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

import "../node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract Token is ERC1155, Ownable {

    struct Pet {
        uint8 damage;
        uint8 magic;
        uint256 lastMeal;
        uint256 endurance;
    }

    uint256 nextId = 0;

    mapping(uint256 => Pet) private _tokenDetails;

    constructor(string memory name, string memory symbol, string memory uri) ERC1155(uri) {

    }

    function getTokenDetails(uint256 tokenId) public view returns (Pet memory) {
        return _tokenDetails[tokenId];
    }

    function mint(uint8 damage, uint8 magic, uint256 endurance) public onlyOwner {
        _tokenDetails[nextId] = Pet(damage, magic, block.timestamp, endurance);
        _mint(msg.sender, nextId, 1, "");
        nextId++;
    }

    function feed(uint256 tokenId) public {
        Pet storage pet = _tokenDetails[tokenId];
        require(pet.lastMeal + pet.endurance > block.timestamp);
        pet.lastMeal = block.timestamp;
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
        Pet storage pet = _tokenDetails[ids[0]];
        require(pet.lastMeal + pet.endurance > block.timestamp);
    }

    function _ownerOf(uint256 tokenId) internal view returns (bool) {
        return balanceOf(msg.sender, tokenId) != 0;
    }
}


