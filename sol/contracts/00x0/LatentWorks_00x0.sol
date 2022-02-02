//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import './../77x7/ILW77x7.sol';
import './base64.sol';
import './Rando.sol';
import 'hardhat/console.sol';

/**

          ___  ___      ___        __   __        __  
|     /\   |  |__  |\ |  |   |  | /  \ |__) |__/ /__` 
|___ /~~\  |  |___ | \|  |  .|/\| \__/ |  \ |  \ .__/ 
                                                      
"00x0", troels_a, 2021


*/

contract LatentWorks_00x0 is ERC1155, ERC1155Supply, Ownable {

    using Counters for Counters.Counter;

    struct CompInfo {
        string seed;
        string seed0;
        string seed1;
        string seed2;
        string seed3;
        uint[] works;
        string id;
        bytes defs;
        bytes ani_elements;
        bytes elements;
        uint left;
        uint right;
        uint orientation; /// @dev 0 = landscape, 1 = portrait
        string[2] pos;
        uint start;
        uint last_left;
        uint last_right;
        bytes begin_t;
        bytes translate;
        bytes scale;
    }

    string public constant NAME = "Latent Works \xc2\xb7 00x0";
    string public constant DESCRIPTION = "latent.works";
    uint public constant MAX_WORK_USE = 7;
    
    ILW77x7 _77x7;

    Counters.Counter private _comp_ids;
    mapping(uint => uint[]) private _comp_works;
    mapping(uint => address) private _comp_creators;
    mapping(uint => uint) private _comp_seeds;

    mapping(uint => uint) private _work_used_count;

    string private _easing = 'keyTimes="0; 0.33; 0.66; 1" keySplines="0.5 0 0.5 1; 0.5 0 0.5 1; 0.5 0 0.5 1; 0.5 0 0.5 1;"';    

    constructor() ERC1155("") {
        _77x7 = ILW77x7(0xEF7c89F051ac48885b240eb53934B04fcF3339ab);
    }

    
    uint private _price = 0.1 ether;

    
    function create(uint[] memory works_) public {

        require((works_.length >= 2 && works_.length <= 7), "WRONG_WORK_COUNT");
        // require(canCreate(msg.sender, works_), "NOT_ELIGIBLE");

        _comp_ids.increment();
        uint comp_id_ = _comp_ids.current();
        _comp_works[comp_id_] = works_;
        _comp_seeds[comp_id_] = block.timestamp+works_[0]+works_[1];

        _mintFor(msg.sender, comp_id_);

    }

    function canCreate(address test_, uint[] memory works_) public view returns(bool){
        uint last_work_;
        for (uint256 i = 0; i < works_.length; i++) {
            if((_77x7.balanceOf(test_, works_[i])) < 1)
                return false;
            if(_work_used_count[works_[i]] > MAX_WORK_USE)
                return false;
            if(last_work_ == works_[i])
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
        uint each_ = msg.value / 2;
        (bool creator_sent_, bytes memory data_creator_) =  _comp_creators[comp_id_].call{value: each_}("");
        (bool owner_sent_, bytes memory data_owner_) =  owner_.call{value: each_}("");
        require((creator_sent_ && owner_sent_), "INTERNAL_ETHER_TX_FAILED");

        _mintFor(msg.sender, comp_id_);

    }

    function getAvailable(uint comp_id_) public view returns(uint){
        return _comp_works[comp_id_].length - totalSupply(comp_id_);
    }

    
    /// @notice Explain to an end user what this does
    /// @dev Explain to a developer any extra details
    /// @param comp_id_ a parameter just like in doxygen (must be followed by parameter name)
    /// @return Documents the return variables of a contract’s function state variable
    function getSeed(uint comp_id_, string memory append_) public view returns(string memory){
        return string(abi.encodePacked(Strings.toString(_comp_seeds[comp_id_]), append_));
    }

    function getSVG(uint comp_id_, bool mark_, bool encode_) public view returns(string memory){

        // TODO: Do not reveal before mint!

        CompInfo memory comp_ = CompInfo(
            getSeed(comp_id_, ''),
            '',
            getSeed(comp_id_, 'left'),
            getSeed(comp_id_, 'right'),
            getSeed(comp_id_, 'rand'),
            _comp_works[comp_id_],
            Strings.toString(comp_id_),
            '',
            '',
            '',
            0,
            0,
            0,
            ['', ''],
            0,
            0,
            0,
            '',
            '',
            ''
        );

        comp_.orientation = Rando.number(comp_.seed, 0, 100);
        comp_.start = (700/comp_.works.length);
        comp_.last_left = Rando.number(comp_.seed1, comp_.start-100, comp_.start);
        comp_.last_right = Rando.number(comp_.seed2, comp_.start-100, comp_.start);
        

        for(uint i = 0; i < comp_.works.length; i++) {
            
            comp_.seed0 = getSeed(comp_id_, Strings.toString(i));
            comp_.seed1 = getSeed(comp_id_, string(abi.encodePacked(comp_.seed0, 'left')));
            comp_.seed2 = getSeed(comp_id_, string(abi.encodePacked(comp_.seed0, 'right')));

            comp_.id = Strings.toString(i+1);

            // comp_.left = Rando.number(comp_.seed1, 0, 1000); //(i+1 == comp_.works.length) ? 100 : Rando.number(comp_.seed1, comp_.last_left+(min), comp_.last_left+max);
            // comp_.right = Rando.number(comp_.seed2, 0, 1000);//(i+1 == comp_.works.length) ? 100 : Rando.number(comp_.seed2, comp_.last_right+(min), comp_.last_right+max);
            
            comp_.left = Rando.number(comp_.seed1, comp_.last_left/10, 1000); //(i+1 == comp_.works.length) ? 100 : Rando.number(comp_.seed1, comp_.last_left+(min), comp_.last_left+max);
            comp_.right = Rando.number(comp_.seed2, comp_.last_right/2, 1000);//(i+1 == comp_.works.length) ? 100 : Rando.number(comp_.seed2, comp_.last_right+(min), comp_.last_right+max);
            
            comp_.defs = abi.encodePacked(comp_.defs,
            '<clipPath id="clip',comp_.id,'"><polygon points="0,',Strings.toString(comp_.last_left),' 0,',Strings.toString(comp_.left),' 1000,',Strings.toString(comp_.right),' 1000,',Strings.toString(comp_.last_right),'">',
            '</polygon></clipPath>');

            
            comp_.elements = abi.encodePacked(comp_.elements,
            '<rect fill="',_77x7.getColor(comp_.works[i], Rando.number(comp_.seed0, 1, 7)),'" y="0" x="0" height="1000" width="1000" clip-path="url(#clip',comp_.id,')">',
            '</rect>'
            );

            comp_.begin_t = abi.encodePacked(Strings.toString(Rando.number(comp_.seed1, 100, 700)),' ',Strings.toString(Rando.number(comp_.seed2, 100, 700)));
            comp_.translate = abi.encodePacked(comp_.begin_t, ';', Strings.toString(Rando.number(comp_.seed1, 10, 800)),' ', Strings.toString(Rando.number(comp_.seed2, 10, 800)),';', Strings.toString(Rando.number(comp_.seed2, 100, 1000)),' ', Strings.toString(Rando.number(comp_.seed1, 400, 800)),';',comp_.begin_t);
            comp_.scale = abi.encodePacked('1; 0.', Strings.toString(Rando.number(comp_.seed1, 1, 9)),'; 0.',Strings.toString(Rando.number(comp_.seed2, 1, 9)),'; 1');

            comp_.ani_elements = abi.encodePacked(comp_.ani_elements,
            '<rect fill="',_77x7.getColor(comp_.works[i], Rando.number(comp_.seed0, 1, 7)),'" y="0" x="0" height="1000" width="1000" clip-path="url(#clip',comp_.id,')">',
            // '<animateTransform ',_easing,' attributeName="transform" type="translate" values="',comp_.translate,'" begin="0s" dur="',Strings.toString(Rando.number(comp_.seed1, 5, 10)),'s" repeatCount="indefinite"/>',
            '<animateTransform ',_easing,' attributeName="transform" type="scale" values="',comp_.scale,'" begin="0s" dur="',Strings.toString(Rando.number(comp_.seed2, 50, 100)),'s" repeatCount="indefinite"/>',
            '</rect>'
            );

            // comp_.ani_elements = abi.encodePacked(comp_.elements,
            // '<image href="',_77x7.getSVG(comp_.works[i], 1, false),'" y="0" x="0" height="1000" width="1000" clip-path="url(#clip',comp_.id,')">',
            // '<animateTransform ',_easing,' attributeName="transform" type="translate" values="',comp_.translate,'" begin="0s" dur="',Strings.toString(Rando.number(comp_.seed1, 10, 20)),'s" repeatCount="indefinite"/>',
            // '<animateTransform ',_easing,' attributeName="transform" type="scale" values="',comp_.scale,'" begin="0s" dur="',Strings.toString(Rando.number(comp_.seed2, 10, 20)),'s" repeatCount="indefinite"/>',
            // '</image>'
            // );


            comp_.last_left = comp_.left;
            comp_.last_right = comp_.right;

        }

        comp_.pos[0] = Strings.toString(Rando.number(comp_.seed, 100, comp_.orientation < 50 ? 500 : 800));
        comp_.pos[1] = Strings.toString(Rando.number(comp_.seed1, 100, comp_.orientation < 50 ? 800 : 500));

        bytes memory output_ = abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ',comp_.orientation < 50 ? '700 1000' : '1000 700','" preserveAspectRatio="xMinYMin meet">',
            '<defs>',
            '<g id="main" transform="translate(-5 -5) scale(1.2)" opacity="0.8">',
            comp_.elements,
            '</g>',
            '<g id="main-ani" transform="translate(-5 -5) scale(1.2)" opacity="0.8">',
            comp_.ani_elements,
            '</g>',
            '<filter id="blur" x="0" y="0"><feGaussianBlur in="SourceGraphic" stdDeviation="100"/></filter>',
            '<rect id="bg" height="1000" width="1000" x="0" y="0"/><clipPath id="clip"><use href="url(#bg)"/></clipPath>',
            comp_.defs,
            '</defs>',
            '<g clip-path="#clip">',
            '<use href="#bg" fill="white"/>',
            '<use href="#main" filter="url(#blur)" transform="rotate(90, 500, 500)"/>',
            '<use href="#main-ani" filter="url(#blur)" transform="scale(0.',Strings.toString(Rando.number(comp_.seed0, 5, 9)),') rotate(90, 500, 500)"/>',
            '<use href="#main-ani" filter="url(#blur)" transform="scale(0.',Strings.toString(Rando.number(comp_.seed0, 3, 6)),') translate(',comp_.pos[0],', ',comp_.pos[1],')"/>',
            mark_ ? '' : '',
            '</g>',
            '</svg>'
        );

        if(encode_)
            return Base64.encode(output_);

        return string(output_);

    }


    function uri(uint comp_id_) public view override returns(string memory){
        string memory image_ = getSVG(comp_id_, true, true);
        return image_;
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

