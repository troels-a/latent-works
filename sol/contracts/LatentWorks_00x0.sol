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
    uint public constant MAX_WORK_USE = 7;
    
    address public _77x7_address;
    LW_77x7_Interface _77x7_contract;

    Counters.Counter private _comp_ids;
    mapping(uint => uint[]) private _comp_works;
    mapping(uint => address) private _comp_creators;
    mapping(uint => uint) private _work_used_count;

    constructor(address lw77x7_) ERC1155("") {
        _77x7_address = lw77x7_;
        _77x7_contract = LW_77x7_Interface(lw77x7_);
    }

    
    uint private _price = 0.1 ether;

    
    function create(uint[] memory works_) public {

        require((works_.length >= 2 && works_.length >= 7), "WRONG_WORK_COUNT");
        require(canCreate(msg.sender, works_), "NOT_ELIGIBLE");

        _comp_ids.increment();
        uint comp_id_ = _comp_ids.current();
        _mintFor(msg.sender, comp_id_);

        _comp_works[comp_id_] = works_;

    }

    function canCreate(address test_, uint[] memory works_) public view returns(bool){
        for (uint256 i = 0; i < works_.length; i++) {
            if((_77x7_contract.balanceOf(test_, works_[i])) < 1)
                return false;
            if(_work_used_count[works_[i]] > MAX_WORK_USE)
                return false;
        }
        return true;
    }


    function _mintFor(address for_, uint comp_id_) private {
        _mint(for_, comp_id_, 1, "");
    }


    function mint(uint comp_id_) public payable {

        require(msg.value >= _price, "VALUE_TOO_LOW");
        require(getAvailable(comp_id_) > 0, "UNAVAILABLE");
        
        address owner_ = owner();
        (bool creator_sent_, bytes memory data_creator_) =  _comp_creators[comp_id_].call{value: msg.value}("");
        (bool owner_sent_, bytes memory data_owner_) =  owner_.call{value: msg.value}("");
        require(creator_sent_, "INTERNAL_ETHER_TX_FAILED");

        _mintFor(msg.sender, comp_id_);

    }

    function getAvailable(uint comp_id_) public view returns(uint){
        return _comp_works[comp_id_].length - totalSupply(comp_id_);
    }

    function getSVG(uint comp_id_, bool mark_, bool encode_) public pure returns(string memory){

        string memory output_ = '';

        if(encode_)
            return Base64.encode(bytes(output_));

        return output_;

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

