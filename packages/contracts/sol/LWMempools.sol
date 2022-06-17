//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import './LTNT.sol';
import './lib/Rando.sol';
import 'hardhat/console.sol';

contract LWMempools is ERC721, LTNTIssuer, Ownable {

    struct Pool {
        bytes items;
        string base;
        string seed;
        string seed1;
        string seed2;
        uint epoch;
        uint max;
    }

    uint public constant PRICE = 0.1 ether;

    uint private _pool_ids;
    mapping(uint => uint) private _pool_timestamps;
    mapping(uint => address) private _pool_minters;
    mapping(uint => uint) private _pool_fixed_epochs;


    LTNT immutable _ltnt;
    LWMempools_Bases immutable _bases;

    constructor(address ltnt_, LWMempools_Bases.Base[] memory init_bases_) ERC721("Mempools", "MEMPOOLS"){
        _ltnt = LTNT(ltnt_);
        LWMempools_Bases bases_ = new LWMempools_Bases(init_bases_);
        _bases = bases_;
    }

    function issuerInfo(uint, LTNT.Param memory param_) public view override returns(LTNT.IssuerInfo memory){
        return LTNT.IssuerInfo('mempools', getImage(param_._uint, true));
    }


    function mintWithLTNT(uint ltnt_id_) public payable {
        require(msg.value == PRICE/4, 'INVALID_PRICE');
        require(_ltnt.ownerOf(ltnt_id_) == msg.sender, 'NOT_LTNT_HOLDER');
        require(!_ltnt.hasStamp(ltnt_id_, address(this)), 'ALREADY_STAMPED');
        uint id_ = _mintFor(msg.sender);
        _ltnt.stamp(ltnt_id_, LTNT.Param(id_, address(0), '', false));
    }


    function mint() public payable {
        require(msg.value == PRICE, 'INVALID_PRICE');
        _mintFor(msg.sender);
    }


    function _mintFor(address for_) private returns(uint) {

        _pool_ids++;

        _mint(for_, _pool_ids);

        _pool_timestamps[_pool_ids] = block.timestamp;
        _pool_minters[_pool_ids] = for_;

        return _pool_ids;

    }


    function getBase(uint pool_id_) public view returns(LWMempools_Bases.Base memory){
        string memory seed_base_ = getSeed(pool_id_, '');
        uint base_index_ = Rando.number(seed_base_, 1, _bases.getBaseCount());
        return _bases.getBase(base_index_);
    }


    function getBaseIndex(uint pool_id_) public view returns(uint){
        string memory seed_part_ = getSeed(pool_id_, 'part');
        return Rando.number(seed_part_, 0, 3);
    }

    function getBasePart(uint pool_id_) public view returns(string memory){
        LWMempools_Bases.Base memory base_ = getBase(pool_id_);
        return base_.parts[getBaseIndex(pool_id_)];
    }


    function getSeed(uint pool_id_, string memory append_) public view returns(string memory){
        return string(abi.encodePacked(Strings.toString(_pool_timestamps[pool_id_]), append_));
    }

    function getEpochLength(uint pool_id_) public view returns(uint){
        return Rando.number(getSeed(pool_id_, ''), 1, 6)*7776000;
    }

    function getCurrentEpoch(uint pool_id_) public view returns(uint){
        uint epoch = (((block.timestamp - _pool_timestamps[pool_id_]) / getEpochLength(pool_id_))+1);
        return epoch;
    }

    function getEpochImage(uint pool_id_, uint epoch_, bool encode_) public view returns(string memory){

        Pool memory pool_;
        pool_.epoch = getCurrentEpoch(pool_id_); // Advances in different increments for each

        require(epoch_ <= pool_.epoch, 'EPOCH_NOT_REACHED');

        pool_.seed = getSeed(pool_id_, 'base_seed');
        pool_.base = getBasePart(pool_id_);
        pool_.max = pool_.epoch;

        uint i;
        while(i < pool_.max){
            pool_.seed1 = getSeed(pool_id_, string(abi.encodePacked('1x', Strings.toString(i))));
            pool_.seed2 = getSeed(pool_id_, string(abi.encodePacked('1y', Strings.toString(i))));
            pool_.items = abi.encodePacked(
                pool_.items,
                '<use href="#shape',Strings.toString(Rando.number(pool_.seed1, 1, 3)),'" x="',Strings.toString(Rando.number(pool_.seed1, 1, 990)),'" y="',Strings.toString(Rando.number(pool_.seed2, 1, 900)),'" fill="url(#base',Strings.toString(Rando.number(pool_.seed2, 1, 5)),')"/>'
            );

            ++i;
        }

        i = 0;
        while(i < pool_.max){
            pool_.seed1 = getSeed(pool_id_, string(abi.encodePacked('2x', Strings.toString(i))));
            pool_.seed2 = getSeed(pool_id_, string(abi.encodePacked('2y', Strings.toString(i))));
            pool_.items = abi.encodePacked(
                pool_.items,
                '<use href="#shape',Strings.toString(Rando.number(pool_.seed1, 1, 3)),'" x="',Strings.toString(Rando.number(pool_.seed1, 1, 990)),'" y="',Strings.toString(Rando.number(pool_.seed2, 1, 900)),'" fill="url(#base',Strings.toString(Rando.number(pool_.seed2, 1, 5)),')"/>'
            );

            ++i;
        }

        i = 0;
        while(i < pool_.max){
            pool_.seed1 = getSeed(pool_id_, string(abi.encodePacked('3x', Strings.toString(i))));
            pool_.seed2 = getSeed(pool_id_, string(abi.encodePacked('3y', Strings.toString(i))));
            pool_.items = abi.encodePacked(
                pool_.items,
                '<use href="#shape',Strings.toString(Rando.number(pool_.seed1, 1, 3)),'" x="',Strings.toString(Rando.number(pool_.seed1, 1, 990)),'" y="',Strings.toString(Rando.number(pool_.seed2, 1, 900)),'" fill="url(#base',Strings.toString(Rando.number(pool_.seed2, 1, 5)),')"/>'
            );

            ++i;
        }

        bytes memory svg_ = abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" preserveAspectRatio="xMinYMin meet">',
                '<defs>',
                    '<style></style><circle cx="500" cy="500" r="500" id="bg"/>',
                    '<clipPath id="clip"><use href="#bg"/></clipPath>',
                    '<rect id="shape1" width="',Strings.toString(Rando.number(getSeed(pool_id_, 'shape1width'), 1, 50)),'" height="',Strings.toString(Rando.number(getSeed(pool_id_, 'shape1height'), 20, 300)),'"/>',
                    '<rect id="shape2" width="30" height="',Strings.toString(Rando.number(getSeed(pool_id_, 'shape2width'), 20, 200)),'"/>',
                    '<rect id="shape3" width="20" height="',Strings.toString(Rando.number(getSeed(pool_id_, 'shape3width'), 20, 100)),'"/>',
                    '<image id="base" width="1000" height="1000" href="',pool_.base,'"/>',
                    '<pattern id="base1" x="0" y="0" width="1" height="1" viewBox="0 0 200 200"><use href="#base"/></pattern>',
                    '<pattern id="base2" x="0" y="0" width="1" height="1" viewBox="200 200 200 200" preserveAspectRatio="xMidYMid slice"><use href="#base"/></pattern>',
                    '<pattern id="base3" x="0" y="0" width="1" height="1" viewBox="400 400 200 200" preserveAspectRatio="xMidYMid slice"><use href="#base"/></pattern>',
                    '<pattern id="base4" x="0" y="0" width="1" height="1" viewBox="600 600 200 200" preserveAspectRatio="xMidYMid slice"><use href="#base"/></pattern>',
                    '<pattern id="base5" x="0" y="0" width="1" height="1" viewBox="800 800 200 200" preserveAspectRatio="xMidYMid slice"><use href="#base"/></pattern>',
                    '<filter id="blur" x="0" y="0"><feGaussianBlur in="SourceGraphic" stdDeviation="4" /></filter>',
                '</defs>',
                '<rect width="1000" height="1000" fill="white"/>',
                '<rect width="1000" height="1000" fill-opacity="0.7" fill="url(#base',Strings.toString(Rando.number(getSeed(pool_id_, 'bg0'), 2, 5)),')"/>',
                '<g clip-path="url(#clip)">',
                // '<use href="#bg" fill="white"/>',
                '<use href="#bg" fill-opacity="1" fill="url(#base',Strings.toString(Rando.number(getSeed(pool_id_, 'bg1'), 2, 5)),')"/>',
                // '<use href="#bg" fill-opacity="0.8" fill="url(#base',Strings.toString(Rando.number(getSeed(pool_id_, 'bg2'), 2, 5)),')"/>',
                '<g filter="url(#blur)" transform="translate(0, -100)" id="pool">',
                pool_.items,
                '</g>',
                '<use href="#pool" transform="scale(.5, 0.5)"/>',
                '<use href="#pool" transform="scale(.5, 0.5) translate(',Strings.toString(Rando.number(pool_.seed, 0, 100)),', 1000)"/>'
                '<use href="#pool" transform="scale(0.8, 0.8) translate(1000, 0)"/>'
                '<use href="#pool"  transform="scale(1, 1.5) translate(',Strings.toString(Rando.number(pool_.seed, 0, 500)),', ',Strings.toString(Rando.number(pool_.seed, 0, 500)),')"/>',
                '</g>',
            '</svg>'
        );

        if(encode_)
            return Base64.encode(svg_);

        return string(svg_);

    }

    function fixEpoch(uint pool_id_, uint epoch_) public {
        require(ownerOf(pool_id_) == msg.sender, 'NOT_OWNER');
        require(getCurrentEpoch(pool_id_) <= epoch_, 'EPOCH_NOT_REACHED');
        _pool_fixed_epochs[pool_id_] = epoch_;
    }

    function getImage(uint pool_id_, bool encode_) public view returns(string memory){

        uint epoch_ = _pool_fixed_epochs[pool_id_];
        if(epoch_ < 1) // Fixed epoch is 
            epoch_ = getCurrentEpoch(pool_id_);

        return getEpochImage(pool_id_, epoch_, encode_);

    }

    function tokenURI(uint pool_id_) override public view returns(string memory) {
        
        LWMempools_Bases.Base memory base_ = getBase(pool_id_);

        bytes memory json_ = abi.encodePacked(
            '{',
                '"name":"mempool #',Strings.toString(pool_id_),'", ',
                '"image": "', getImage(pool_id_, true),'", ',
                '"description": "infinitly evolving mempools",',
                '"attributes": [',
                    '{"trait_type": "base", "value": "',base_.name,'"},',
                    '{"trait_type": "base_part", "value": "',base_.name,'-',Strings.toString(getBaseIndex(pool_id_)),'"},',
                    '{"trait_type": "epoch", "value": ', Strings.toString(getCurrentEpoch(pool_id_)), '},',
                    '{"trait_type": "fixed_epoch", "value": ', Strings.toString(_pool_fixed_epochs[pool_id_]), '},',
                    '{"trait_type": "epoch_length", "value": ', Strings.toString(getEpochLength(pool_id_)), '}',
                ']',
            '}'
        );

        json_ = abi.encodePacked('data:application/json;base64,', Base64.encode(json_));
        
        return string(json_);

    }

}


contract LWMempools_Bases is Ownable {

    struct Base {
        string name;
        string[4] parts;
    }

    uint private _bases_count;
    mapping(uint => Base) private _bases;

    constructor(Base[] memory bases_){
        for (uint256 i = 0; i < bases_.length; i++) {
            _addBase(bases_[i]);
        }
    }

    function getBaseCount() public view returns(uint){
        return _bases_count;
    }

    function getBase(uint index_) public view returns(Base memory) {
        return _bases[index_];
    }

    function _addBase(Base memory base_) private {
        _bases_count++;
        _bases[_bases_count] = base_;
    }


}