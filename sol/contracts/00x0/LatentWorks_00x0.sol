//SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import './../77x7/ILW_77x7.sol';
import './base64.sol';
import './Rando.sol';
import './IMeta_00x0.sol';
import './Meta_00x0.sol';
import 'hardhat/console.sol';
import './ILW_00x0.sol';
import './../LTNT.sol';

/**

          ___  ___      ___        __   __        __  
|     /\   |  |__  |\ |  |   |  | /  \ |__) |__/ /__` 
|___ /~~\  |  |___ | \|  |  .|/\| \__/ |  \ |  \ .__/ 
                                                      
"00x0", troels_a, 2022


*/


contract LatentWorks_00x0 is ERC1155, ERC1155Supply, ERC1155Holder, Ownable, ReentrancyGuard, LTNTProject {

    using Counters for Counters.Counter;

    string public constant NAME = "Latent Works \xc2\xb7 00x0";
    string public constant DESCRIPTION = "latent.works";
    uint public constant MAX_WORK_USE = 7;
    address public constant LW77X7 = 0xEF7c89F051ac48885b240eb53934B04fcF3339ab;
    
    ILW_77x7 private _LW77x7;
    IMeta_00x0 private _Meta00X0;

    Counters.Counter private _comp_ids;
    mapping(uint => uint[]) private _comp_works;
    mapping(uint => address) private _comp_creators;
    mapping(uint => uint) private _comp_seeds;

    uint private _price = 0.07 ether;

    modifier onlyInternal(){
        require((msg.sender == address(_Meta00X0) || msg.sender == address(this)), 'ONLY_INTERNAL');
        _;
    }

    constructor() ERC1155("") {

        _LW77x7 = ILW_77x7(LW77X7);

        Meta_00x0 meta_ = new Meta_00x0(address(this), LW77X7);
        _Meta00X0 = IMeta_00x0(address(meta_));

    }

    function info() public pure override returns(string memory){
        return '00x0';
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC1155, ERC1155Receiver) returns (bool) {
        return super.supportsInterface(interfaceId);
    }


    function onERC1155BatchReceived(address operator_, address from_, uint256[] calldata ids_, uint256[] calldata values_, bytes calldata data_) public override returns(bytes4){
        _create(from_, ids_);
        return bytes4(keccak256("onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)"));
    }

    function onERC1155Received(address operator_, address from_, uint256 id_, uint256 value_, bytes calldata data_) public pure override returns(bytes4){
        revert('ONLY BATCH TRANSFER');
    }


    function get77x7() public view onlyInternal returns(ILW_77x7) {
        return ILW_77x7(LW77X7);
    }

    
    function _create(address for_, uint[] memory works_) private {

        require((works_.length >= 1 && works_.length <= 7), "MIN_2_MAX_7_WORKS");

        _comp_ids.increment();
        uint comp_id_ = _comp_ids.current();
        _comp_works[comp_id_] = works_;
        _comp_seeds[comp_id_] = block.timestamp*(works_[0]+works_[1]);
        _comp_creators[comp_id_] = for_;

        _mintFor(for_, comp_id_);

    }

    function _noDuplicates(uint[] memory works_) private pure returns(bool){

        uint[] memory works_used_ = new uint[](works_.length);

        for(uint i = 0; i < works_.length; i++){

            for(uint ii = 0; ii < works_used_.length; ii++) {
                if(works_used_[ii] == works_[i])
                    return false;
            }

            works_used_[i] = works_[i];
 
        }

        return true;

    }

    function _mintFor(address for_, uint comp_id_) private {
        _mint(for_, comp_id_, 1, "");
    }

    function getPrice(uint comp_id_) public view returns(uint){
        uint editions_ = getEditions(comp_id_);
        return _price/editions_;
    }

    function getEditions(uint comp_id_) public view returns(uint) {
        return _comp_works[comp_id_].length;
    }

    function getOrientation(uint comp_id_) public view returns(ILW_00x0.Orientation){
        return Rando.number(getSeed(comp_id_, ''), 0, 99) > 50 ? ILW_00x0.Orientation.LANDSCAPE : ILW_00x0.Orientation.PORTRAIT;
    }


    function mint(uint comp_id_) public payable nonReentrant {

        require(msg.value == getPrice(comp_id_), "INVALID_VALUE");
        require(getAvailable(comp_id_) > 0, "UNAVAILABLE");
        
        address owner_ = owner();
        uint each_ = msg.value / 2;
        (bool creator_sent_, bytes memory data_creator_) =  _comp_creators[comp_id_].call{value: each_}("");
        (bool owner_sent_, bytes memory data_owner_) =  owner_.call{value: each_}("");
        require((creator_sent_ && owner_sent_), "INTERNAL_ETHER_TX_FAILED");

        _mintFor(msg.sender, comp_id_);

    }


    function getAvailable(uint comp_id_) public view returns(uint){
        return _comp_works[comp_id_].length - totalSupply(comp_id_);
    }


    function getSeed(uint comp_id_, string memory append_) public view returns(string memory){
        return string(abi.encodePacked(Strings.toString(_comp_seeds[comp_id_]), append_));
    }

    function getArtwork(uint comp_id_, bool mark_, bool encode_) public view returns(string memory output_){

        require(totalSupply(comp_id_) > 0, 'DOES_NOT_EXIST');

        ILW_00x0.CompInfo memory comp_ = ILW_00x0.CompInfo(
            Strings.toString(comp_id_),
            mark_,
            getSeed(comp_id_, ''),
            '',
            '',
            '',
            getSeed(comp_id_, 'rand'),
            _comp_works[comp_id_],
            '',
            '',
            '',
            0,
            0,
            getOrientation(comp_id_),
            '',
            '',
            ['', ''],
            0,
            0,
            0,
            '',
            '',
            ''
        );

        comp_.start = (700/comp_.works.length);
        comp_.last_left = Rando.number(comp_.seed1, comp_.start-100, comp_.start);
        comp_.last_right = Rando.number(comp_.seed2, comp_.start-100, comp_.start);
        
        comp_.pos[0] = Strings.toString(Rando.number(comp_.seed, 100, comp_.orientation == ILW_00x0.Orientation.LANDSCAPE ? 500 : 800));
        comp_.pos[1] = Strings.toString(Rando.number(comp_.seed1, 100, comp_.orientation == ILW_00x0.Orientation.LANDSCAPE ? 800 : 500));

        comp_.width_string = comp_.orientation == ILW_00x0.Orientation.LANDSCAPE ? '700' : '1000';
        comp_.height_string = comp_.orientation == ILW_00x0.Orientation.LANDSCAPE ? '1000' : '700';

        output_ = _Meta00X0.getArtwork(comp_id_, comp_);

        if(encode_)
            return Base64.encode(bytes(output_));

        return string(output_);

    }


    function getComps(uint limit_, uint page_) public view returns(ILW_00x0.Comp[] memory){

        uint max_ = _comp_ids.current();

        if(limit_ < 1 && page_ < 1){
            limit_ = max_;
            page_ = 1;
        }

        ILW_00x0.Comp[] memory comps_ = new ILW_00x0.Comp[](limit_);
        uint i = 0;
        uint index;
        uint offset = page_ == 1 ? 0 : (page_-1)*limit_;
        while(i < limit_ && i < max_){
            index = i+(offset);
            if(max_ > index){
                comps_[i] = getComp(index+1);
            }
            i++;
        }

        return comps_;


    }


    function getComp(uint comp_id_) public view returns(ILW_00x0.Comp memory){

        return ILW_00x0.Comp(
            comp_id_,
            _comp_creators[comp_id_],
            _comp_seeds[comp_id_],
            string(abi.encodePacked('data:image/svg+xml;base64,', getArtwork(comp_id_, true, true))),
            getOrientation(comp_id_),
            getPrice(comp_id_),
            getEditions(comp_id_),
            getAvailable(comp_id_)
        );

    }


    function uri(uint comp_id_) public view override returns(string memory){
        
        string memory image_ = getArtwork(comp_id_, true, true);
        bytes memory meta_ = abi.encodePacked('{',
            '"name": "00x0 #',Strings.toString(comp_id_),'", ',
            '"description": "latent.works", ',
            '"image": "data:image/svg+xml;base64,',image_,'"}'
        );

        return string(abi.encodePacked('data:application/json;base64,', Base64.encode(meta_)));

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

