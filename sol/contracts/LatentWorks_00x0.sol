//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import './base64.sol';
import './Rando.sol';
import './ILW77x7.sol';

/**

          ___  ___      ___        __   __        __  
|     /\   |  |__  |\ |  |   |  | /  \ |__) |__/ /__` 
|___ /~~\  |  |___ | \|  |  .|/\| \__/ |  \ |  \ .__/ 
                                                      
"00x0", troels_a, 2021


*/

contract LatentWorks_00x0 is ERC1155, ERC1155Supply, Ownable {

    using Counters for Counters.Counter;

    string public constant NAME = "Latent Works \xc2\xb7 00x0";
    string public constant DESCRIPTION = "latent.works";
    uint public constant MAX_WORKS = 77;
    uint public constant MAX_EDITIONS = 7;
    
    address public _77x7_address;
    LW_77x7_Interface _77x7_contract;

    Counters.Counter private _comp_ids;
    mapping(uint => uint[]) private _comp_works;

    constructor(address lw77x7_) ERC1155("") {
        _77x7_address = lw77x7_;
        _77x7_contract = LW_77x7_Interface(lw77x7_);
    }
    


    function canMintFromWorks(address test_, uint[] memory works_) public view returns(bool){
        for (uint256 i = 0; i < works_.length; i++) {
            if((_77x7_contract.balanceOf(test_, works_[i])) == 0)
                return false;
        }
        return true;
    }


    function _mintFor(address for_, uint[] memory works_) public {

        _comp_ids.increment();
        _mint(for_, _comp_ids.current(), 1, "");
        
        _comp_works[_comp_ids.current()] = works_;

    }

    function mint(uint[] memory works_) public {
        
        require(works_.length >= 2, "INSUFFICIENT_WORKS");
        require(canMintFromWorks(msg.sender, works_), "NOT_ELIGIBLE");

        _mintFor(msg.sender, works_);

    }


    function uri(uint token_id_) public view override returns(string memory){

    }


    // Required overrides
    function _mint(address account, uint256 id, uint256 amount, bytes memory data) internal override (ERC1155, ERC1155Supply) {
        super._mint(account, id, amount, data);
    }


    function _mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data) internal override (ERC1155, ERC1155Supply) {
        super._mintBatch(to, ids, amounts, data);
    }


    function _burn(address account, uint256 id, uint256 amount) internal override (ERC1155, ERC1155Supply) {
        super._burn(account, id, amount);
    }


    function _burnBatch(address to, uint256[] memory ids, uint256[] memory amounts) internal override (ERC1155, ERC1155Supply) {
        super._burnBatch(to, ids, amounts);
    }


}

