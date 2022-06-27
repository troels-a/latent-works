//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import './LTNT.sol';
import './lib/Rando.sol';
import 'hardhat/console.sol';

contract LWMempools is ERC721, LTNTIssuer, Ownable {

    uint public constant PRICE = 0.1 ether;

    uint private _pool_ids;
    mapping(uint => uint) private _pool_timestamps;
    mapping(uint => address) private _pool_minters;
    mapping(uint => uint) private _pool_fixed_epochs;


    LTNT public immutable _ltnt;
    LWMempools_Meta public immutable _meta;

    constructor(address ltnt_, LWMempools_Meta.Base[] memory init_bases_) ERC721("Mempools", "MEMPOOLS"){
        _ltnt = LTNT(ltnt_);
        LWMempools_Meta meta_ = new LWMempools_Meta(init_bases_);
        _meta = meta_;
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


    function exists(uint pool_id_) public view returns(bool){
        return _exists(pool_id_);
    }


    function getBase(uint pool_id_) public view returns(LWMempools_Meta.Base memory){
        string memory seed_base_ = getSeed(pool_id_, '');
        uint base_index_ = Rando.number(seed_base_, 1, _meta.getBaseCount());
        return _meta.getBase(base_index_);
    }


    function getBaseIndex(uint pool_id_) public view returns(uint){
        string memory seed_part_ = getSeed(pool_id_, 'part');
        return Rando.number(seed_part_, 0, 3);
    }

    function getBasePart(uint pool_id_) public view returns(string memory){
        LWMempools_Meta.Base memory base_ = getBase(pool_id_);
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

    function fixEpoch(uint pool_id_, uint epoch_) public {
        require(ownerOf(pool_id_) == msg.sender, 'NOT_OWNER');
        require(getCurrentEpoch(pool_id_) <= epoch_, 'EPOCH_NOT_REACHED');
        _pool_fixed_epochs[pool_id_] = epoch_;
    }

    function getImage(uint pool_id_, bool encode_) public view returns(string memory){

        require(exists(pool_id_), 'POOL_DOES_NOT_EXIST');

        uint epoch_ = _pool_fixed_epochs[pool_id_];
        if(epoch_ < 1) // Fixed epoch is 
            epoch_ = getCurrentEpoch(pool_id_);

        return _meta.getEpochImage(pool_id_, epoch_, encode_);

    }

    function tokenURI(uint pool_id_) override public view returns(string memory) {
        
        require(exists(pool_id_), 'POOL_DOES_NOT_EXIST');

        LWMempools_Meta.Base memory base_ = getBase(pool_id_);

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

    // Balance
    function withdrawAll() public payable onlyOwner {
      require(payable(msg.sender).send(address(this).balance));
    }

}


contract LWMempools_Meta is Ownable {
    
    struct Pool {
        uint id;
        bytes items;
        string base;
        string seed;
        string seed1;
        string seed2;
        uint epoch;
        uint max;
        string shape1_width;
        string shape1_height;
        string shape2_width;
        string shape2_height;
        string shape3_width;
        string shape3_height;
    }

    struct Base {
        string name;
        string[4] parts;
    }

    uint private _bases_count;
    mapping(uint => Base) private _bases;
    LWMempools public immutable _pools;

    constructor(Base[] memory bases_){
        _pools = LWMempools(msg.sender);
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



    function getEpochImage(uint pool_id_, uint epoch_, bool encode_) public view returns(string memory){

        require(_pools.exists(pool_id_), 'POOL_DOES_NOT_EXIST');

        Pool memory pool_;
        pool_.epoch = _pools.getCurrentEpoch(pool_id_); // Advances in different increments for each

        require(epoch_ <= pool_.epoch, 'EPOCH_NOT_REACHED');

        pool_.id = pool_id_;
        pool_.seed = _pools.getSeed(pool_id_, 'base_seed');
        pool_.base = _pools.getBasePart(pool_id_);
        pool_.max = pool_.epoch;

        uint i;
        while(i < pool_.max){
            pool_.seed1 =_pools.getSeed(pool_id_, string(abi.encodePacked('1x', Strings.toString(i))));
            pool_.seed2 = _pools.getSeed(pool_id_, string(abi.encodePacked('1y', Strings.toString(i))));
            pool_.items = abi.encodePacked(
                pool_.items,
                '<use href="#shape',Strings.toString(Rando.number(pool_.seed1, 1, 3)),'" x="',Strings.toString(Rando.number(pool_.seed1, 1, 990)),'" y="',Strings.toString(Rando.number(pool_.seed2, 1, 900)),'" fill="url(#base',Strings.toString(Rando.number(pool_.seed2, 1, 5)),')"/>'
            );

            ++i;
        }

        i = 0;
        while(i < pool_.max){
            pool_.seed1 = _pools.getSeed(pool_id_, string(abi.encodePacked('2x', Strings.toString(i))));
            pool_.seed2 = _pools.getSeed(pool_id_, string(abi.encodePacked('2y', Strings.toString(i))));
            pool_.items = abi.encodePacked(
                pool_.items,
                '<use href="#shape',Strings.toString(Rando.number(pool_.seed1, 1, 3)),'" x="',Strings.toString(Rando.number(pool_.seed1, 1, 990)),'" y="',Strings.toString(Rando.number(pool_.seed2, 1, 900)),'" fill="url(#base',Strings.toString(Rando.number(pool_.seed2, 1, 5)),')"/>'
            );

            ++i;
        }

        i = 0;
        while(i < pool_.max){
            pool_.seed1 = _pools.getSeed(pool_id_, string(abi.encodePacked('3x', Strings.toString(i))));
            pool_.seed2 = _pools.getSeed(pool_id_, string(abi.encodePacked('3y', Strings.toString(i))));
            pool_.items = abi.encodePacked(
                pool_.items,
                '<use href="#shape',Strings.toString(Rando.number(pool_.seed1, 1, 3)),'" x="',Strings.toString(Rando.number(pool_.seed1, 1, 990)),'" y="',Strings.toString(Rando.number(pool_.seed2, 1, 900)),'" fill="url(#base',Strings.toString(Rando.number(pool_.seed2, 1, 5)),')"/>'
            );

            ++i;
        }

        pool_.shape1_width = Strings.toString(Rando.number(_pools.getSeed(pool_.id, 'shape1width'), 1, 50));
        pool_.shape1_height = Strings.toString(Rando.number(_pools.getSeed(pool_.id, 'shape1height'), 20, 300));
        pool_.shape2_width = Strings.toString(Rando.number(_pools.getSeed(pool_.id, 'shape2width'), 20, 30));
        pool_.shape2_height = Strings.toString(Rando.number(_pools.getSeed(pool_.id, 'shape2height'), 20, 200));
        pool_.shape3_width = Strings.toString(Rando.number(_pools.getSeed(pool_.id, 'shape2height'), 10, 30));
        pool_.shape3_height = Strings.toString(Rando.number(_pools.getSeed(pool_.id, 'shape3width'), 20, 100));

        bytes memory svg_ = abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" preserveAspectRatio="xMinYMin meet">',
                '<defs>',
                    '<circle cx="500" cy="500" r="500" id="bg"/>',
                    '<filter id="bw"><feColorMatrix type="matrix" values="0.491 1.650 0.166 0.000 -0.464 0.491 1.650 0.166 0.000 -0.464 0.491 1.650 0.166 0.000 -0.464 0.000 0.000 0.000 1.000 0.000"></feColorMatrix></filter>',
                    '<filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="10" stitchTiles="stitch" /></filter>',
                    '<filter id="blur" x="0" y="0"><feGaussianBlur in="SourceGraphic" stdDeviation="4" /></filter>',
                    '<clipPath id="clip"><use href="#bg"/></clipPath>',
                    '<rect id="shape1" width="',pool_.shape1_width,'" height="',pool_.shape1_height,'"/>',
                    '<rect id="shape2" width="30" height="',pool_.shape2_height,'"/>',
                    '<rect id="shape3" width="20" height="',pool_.shape3_height,'"/>',
                    '<image id="base" width="1000" height="1000" href="',pool_.base,'"/>',
                    '<pattern id="base1" x="0" y="0" width="1" height="1" viewBox="0 0 200 200"><use href="#base"/></pattern>',
                    '<pattern id="base2" x="0" y="0" width="1" height="1" viewBox="200 200 200 200" preserveAspectRatio="xMidYMid slice"><use href="#base"/></pattern>',
                    '<pattern id="base3" x="0" y="0" width="1" height="1" viewBox="400 400 200 200" preserveAspectRatio="xMidYMid slice"><use href="#base"/></pattern>',
                    '<pattern id="base4" x="0" y="0" width="1" height="1" viewBox="600 600 200 200" preserveAspectRatio="xMidYMid slice"><use href="#base"/></pattern>',
                    '<pattern id="base5" x="0" y="0" width="1" height="1" viewBox="800 800 200 200" preserveAspectRatio="xMidYMid slice"><use href="#base"/></pattern>',
                '</defs>',
                '<g filter="url(#bw)">',
                    '<rect width="1000" height="1000" fill="black"/>',
                    '<rect width="1000" height="1000" fill-opacity="0.5" fill="url(#base',Strings.toString(Rando.number(_pools.getSeed(pool_.id, 'bg0'), 2, 5)),')" filter="url(#bw)"/>',
                    '<g clip-path="url(#clip)">',
                        '<use href="#bg" fill-opacity="1" fill="url(#base',Strings.toString(Rando.number(_pools.getSeed(pool_.id, 'bg1'), 2, 5)),')"/>',
                        // '<use href="#bg" fill-opacity="0.8" fill="url(#base',Strings.toString(Rando.number(getSeed(pool_.id, 'bg2'), 2, 5)),')"/>',
                    '<g filter="url(#blur)" transform="translate(0, -100)" id="pool">',
                    pool_.items,
                    '</g>',
                    '<use href="#pool" transform="scale(.5, 0.5)"/>',
                    '<use href="#pool" transform="scale(.5, 0.5) translate(',Strings.toString(Rando.number(pool_.seed, 0, 100)),', 1000)"/>'
                    '<use href="#pool" transform="scale(0.8, 0.8) translate(1000, 0)"/>'
                    '<use href="#pool"  transform="scale(1, 1.5) translate(',Strings.toString(Rando.number(pool_.seed, 0, 500)),', ',Strings.toString(Rando.number(pool_.seed, 0, 500)),')"/>',
                    '</g>',
                    '<g filter="url(#bw)">',
                        '<rect width="1000" height="1000" fill="white" filter="url(#noise)" opacity="0.1"/>',
                    '</g>',
                '</g>',
            '</svg>'
        );

        if(encode_)
            return string(abi.encodePacked('data:image/svg+xml;base64,', Base64.encode(svg_)));

        return string(svg_);

    }


}